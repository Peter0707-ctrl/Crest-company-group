import React, { useState, useEffect, useCallback } from 'react';
import {
  LayoutDashboard,
  Layers,
  Package,
  FolderKanban,
  Newspaper,
  MessageSquare,
  Handshake,
  Users,
  Plus,
  CheckCircle2,
  TrendingUp,
  ShieldCheck,
  Database,
  Server,
  RotateCcw,
  ArrowLeft,
  ExternalLink,
  Lock,
  KeyRound,
  ShieldAlert,
  LogOut,
  Eye,
  EyeOff,
  FileCheck2,
  RefreshCw,
  AlertTriangle
} from 'lucide-react';
import {
  Division,
  ProductItem,
  ProjectItem,
  NewsArticle,
  CustomerInquiry,
  PartnershipRequest,
  CareerApplication,
  ActiveTab
} from '../types/ecosystem';
import { sanitizeText, validateStrongPassword } from '../utils/sanitizer';
import { isHttpsTransport } from '../utils/cryptoSecurity';
import {
  ApiError,
  CmsAdditions,
  AuditLogEntry,
  AuditVerificationResult,
  ActiveSessionEntry,
  BackupManifestEntry,
  SecurityPostureInfo,
  checkAuthSession,
  loginExecutive,
  logoutExecutive,
  changeExecutivePassword,
  initiateMfaSetup,
  enableMfaTotp,
  disableMfaTotp,
  revokeOtherSessions,
  fetchAdminDashboard,
  verifyAuditChain,
  createEncryptedVaultBackup,
  adminUpdateInquiryStatus,
  adminUpdatePartnershipStatus,
  adminAddDivisionActivity,
  adminCreateProduct,
  adminCreateProject,
  adminCreateNews,
  adminResetCatalog
} from '../utils/apiClient';

interface AdminDashboardProps {
  divisions: Division[];
  products: ProductItem[];
  projects: ProjectItem[];
  news: NewsArticle[];
  onCatalogSynced: (additions: CmsAdditions) => void;
  onBackToSite: (tab?: ActiveTab) => void;
}

type AdminSection =
  | 'overview'
  | 'divisions'
  | 'products'
  | 'projects'
  | 'news'
  | 'inquiries'
  | 'partnerships'
  | 'careers'
  | 'settings';

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  divisions,
  products,
  projects,
  news,
  onCatalogSynced,
  onBackToSite
}) => {
  // Server-Enforced Authentication State (NO client-side password hashes or storage trust flags!)
  const [checkingSession, setCheckingSession] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [adminUser, setAdminUser] = useState<{
    username: string;
    role: string;
    mustChangePassword: boolean;
    totpEnabled?: boolean;
  } | null>(null);
  const [idleExpiresAt, setIdleExpiresAt] = useState<number | null>(null);

  // Login Form State (supports RFC 6238 TOTP 2FA)
  const [username, setUsername] = useState('admin');
  const [authPassword, setAuthPassword] = useState('');
  const [loginTotp, setLoginTotp] = useState('');
  const [mfaPrompted, setMfaPrompted] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [lockoutRemaining, setLockoutRemaining] = useState(0);

  // Protected Server Data (decrypted ONLY after authenticated session verified)
  const [inquiries, setInquiries] = useState<CustomerInquiry[]>([]);
  const [partnerships, setPartnerships] = useState<PartnershipRequest[]>([]);
  const [applications, setApplications] = useState<CareerApplication[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [auditVerification, setAuditVerification] = useState<AuditVerificationResult | null>(null);
  const [activeSessions, setActiveSessions] = useState<ActiveSessionEntry[]>([]);
  const [backups, setBackups] = useState<BackupManifestEntry[]>([]);
  const [creatingBackup, setCreatingBackup] = useState(false);
  const [securityPosture, setSecurityPosture] = useState<SecurityPostureInfo | null>(null);
  const [loadingDashboard, setLoadingDashboard] = useState(false);

  // TOTP 2FA Management State
  const [mfaSetupSecret, setMfaSetupSecret] = useState<{ secretBase32: string; otpauthUri: string } | null>(null);
  const [mfaConfirmPwd, setMfaConfirmPwd] = useState('');
  const [mfaConfirmCode, setMfaConfirmCode] = useState('');
  const [mfaMsg, setMfaMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  // Password Rotation Form State
  const [currentPwd, setCurrentPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [pwdMessage, setPwdMessage] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const [rotatingPwd, setRotatingPwd] = useState(false);

  const [section, setSection] = useState<AdminSection>('overview');
  const [selectedDivId, setSelectedDivId] = useState(divisions[0]?.id || 'crest-technologies');
  const [newActivityText, setNewActivityText] = useState('');

  const [prodName, setProdName] = useState('');
  const [prodDivId, setProdDivId] = useState('crest-technologies');
  const [prodCategory, setProdCategory] = useState<ProductItem['category']>('Enterprise & POS');
  const [prodTagline, setProdTagline] = useState('');
  const [prodDesc, setProdDesc] = useState('');
  const [prodFeatures, setProdFeatures] = useState('');

  const [projTitle, setProjTitle] = useState('');
  const [projDivId, setProjDivId] = useState('crest-technologies');
  const [projCategory, setProjCategory] = useState<ProjectItem['category']>('Technology & AI');
  const [projSummary, setProjSummary] = useState('');
  const [projImpact, setProjImpact] = useState('');

  const [newsTitle, setNewsTitle] = useState('');
  const [newsCat, setNewsCat] = useState<NewsArticle['category']>('Corporate Announcement');
  const [newsDivTag, setNewsDivTag] = useState('CREST GROUP Corporate');
  const [newsExcerpt, setNewsExcerpt] = useState('');
  const [newsBody, setNewsBody] = useState('');

  const [toast, setToast] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  };

  // Clear all sensitive decrypted PII from React memory immediately on lock/logout
  const wipeClientMemory = useCallback(() => {
    setIsAuthenticated(false);
    setAdminUser(null);
    setIdleExpiresAt(null);
    setInquiries([]);
    setPartnerships([]);
    setApplications([]);
    setAuditLogs([]);
    setAuditVerification(null);
    setSecurityPosture(null);
    setAuthPassword('');
  }, []);

  const loadProtectedDashboard = useCallback(async () => {
    setLoadingDashboard(true);
    try {
      const data = await fetchAdminDashboard();
      setInquiries(data.inquiries);
      setPartnerships(data.partnerships);
      setApplications(data.applications);
      setAuditLogs(data.auditLogs);
      setAuditVerification(data.auditVerification);
      setActiveSessions(data.activeSessions || []);
      setBackups(data.backups || []);
      setSecurityPosture(data.securityPosture);
      setAdminUser(data.user);
      onCatalogSynced(data.additions);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        wipeClientMemory();
        setAuthError('Session expired. Please re-authenticate.');
      } else {
        showNotification(err instanceof Error ? err.message : 'Failed to load executive data.');
      }
    } finally {
      setLoadingDashboard(false);
    }
  }, [onCatalogSynced, wipeClientMemory]);

  // Initial server session check via HttpOnly cookie
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const session = await checkAuthSession();
        if (!active) return;
        if (session.authenticated && session.user) {
          setIsAuthenticated(true);
          setAdminUser(session.user);
          setIdleExpiresAt(session.idleExpiresAt || null);
          await loadProtectedDashboard();
        }
      } catch (err) {
        if (active && err instanceof ApiError && err.status === 0) {
          setAuthError(err.message);
        }
      } finally {
        if (active) setCheckingSession(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [loadProtectedDashboard]);

  // Server IP Rate-Limit Countdown Timer
  useEffect(() => {
    if (lockoutRemaining <= 0) return;
    const interval = setInterval(() => {
      setLockoutRemaining((prev) => {
        if (prev <= 1) {
          setAuthError(null);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [lockoutRemaining]);

  // Active Idle Auto-Logout Enforcement (checks server expiry continuously)
  useEffect(() => {
    if (!isAuthenticated) return;
    const interval = setInterval(async () => {
      if (idleExpiresAt && Date.now() >= idleExpiresAt) {
        wipeClientMemory();
        setAuthError('Session automatically locked after 30 minutes of inactivity.');
        return;
      }
      try {
        const session = await checkAuthSession();
        if (!session.authenticated) {
          wipeClientMemory();
          setAuthError('Server session expired. Please authenticate again.');
        } else if (session.idleExpiresAt) {
          setIdleExpiresAt(session.idleExpiresAt);
        }
      } catch {
        // Keep current check cycle on transient hiccup
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [isAuthenticated, idleExpiresAt, wipeClientMemory]);

  const handleExecutiveAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authPassword || lockoutRemaining > 0) return;

    setIsVerifying(true);
    setAuthError(null);

    try {
      const res = await loginExecutive(
        username.trim().toLowerCase(),
        authPassword,
        mfaPrompted ? loginTotp.trim() : undefined
      );
      if (res.mfaRequired && !res.authenticated) {
        setMfaPrompted(true);
        setAuthError(null);
        return;
      }
      setIsAuthenticated(true);
      setAdminUser(res.user || null);
      setIdleExpiresAt(res.idleExpiresAt || null);
      setAuthPassword('');
      setLoginTotp('');
      setMfaPrompted(false);
      setAuthError(null);
      if (res.user?.mustChangePassword) {
        setSection('settings');
      }
      await loadProtectedDashboard();
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.locked && err.retryAfterSec) {
          setLockoutRemaining(err.retryAfterSec);
        }
        setAuthError(err.message);
      } else {
        setAuthError('Authentication request failed.');
      }
    } finally {
      setIsVerifying(false);
    }
  };

  const handleStartMfaSetup = async () => {
    setMfaMsg(null);
    try {
      const setup = await initiateMfaSetup();
      setMfaSetupSecret(setup);
    } catch (err) {
      setMfaMsg({ type: 'err', text: err instanceof Error ? err.message : 'Unable to start 2FA setup.' });
    }
  };

  const handleConfirmEnableMfa = async (e: React.FormEvent) => {
    e.preventDefault();
    setMfaMsg(null);
    try {
      await enableMfaTotp(mfaConfirmPwd, mfaConfirmCode);
      setMfaSetupSecret(null);
      setMfaConfirmPwd('');
      setMfaConfirmCode('');
      setMfaMsg({ type: 'ok', text: 'RFC 6238 TOTP 2FA enabled and secret encrypted with AES-256-GCM.' });
      await loadProtectedDashboard();
    } catch (err) {
      setMfaMsg({ type: 'err', text: err instanceof Error ? err.message : 'Failed to enable 2FA.' });
    }
  };

  const handleDisableMfa = async (e: React.FormEvent) => {
    e.preventDefault();
    setMfaMsg(null);
    try {
      await disableMfaTotp(mfaConfirmPwd, mfaConfirmCode);
      setMfaConfirmPwd('');
      setMfaConfirmCode('');
      setMfaMsg({ type: 'ok', text: '2FA disabled and audit-logged.' });
      await loadProtectedDashboard();
    } catch (err) {
      setMfaMsg({ type: 'err', text: err instanceof Error ? err.message : 'Failed to disable 2FA.' });
    }
  };

  const handleRevokeOtherSessions = async () => {
    try {
      const res = await revokeOtherSessions();
      showNotification(`Revoked ${res.revokedCount} other executive session(s).`);
      await loadProtectedDashboard();
    } catch (err) {
      handleAdminError(err);
    }
  };

  const handleCreateEncryptedBackup = async () => {
    setCreatingBackup(true);
    try {
      const res = await createEncryptedVaultBackup();
      setBackups(res.backups);
      showNotification(
        `Encrypted backup "${res.manifest.fileName}" created & AEAD-verified (${res.verification.valid ? 'OK' : 'FAIL'}).`
      );
      await loadProtectedDashboard();
    } catch (err) {
      handleAdminError(err);
    } finally {
      setCreatingBackup(false);
    }
  };

  const handleLogout = async () => {
    await logoutExecutive();
    wipeClientMemory();
    onBackToSite('home');
  };

  const handleRotatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdMessage(null);
    if (newPwd !== confirmPwd) {
      setPwdMessage({ type: 'err', text: 'New password and confirmation do not match.' });
      return;
    }
    const policy = validateStrongPassword(newPwd);
    if (!policy.valid) {
      setPwdMessage({ type: 'err', text: policy.reason || 'Password does not meet security policy.' });
      return;
    }

    setRotatingPwd(true);
    try {
      const res = await changeExecutivePassword(currentPwd, newPwd);
      setIdleExpiresAt(res.idleExpiresAt);
      setAdminUser((prev) => (prev ? { ...prev, mustChangePassword: false } : prev));
      setCurrentPwd('');
      setNewPwd('');
      setConfirmPwd('');
      setPwdMessage({
        type: 'ok',
        text: 'Executive password rotated with Argon2id+Pepper. All other sessions revoked.'
      });
      await loadProtectedDashboard();
    } catch (err) {
      setPwdMessage({
        type: 'err',
        text: err instanceof Error ? err.message : 'Password rotation failed.'
      });
    } finally {
      setRotatingPwd(false);
    }
  };

  const handleVerifyAuditChain = async () => {
    try {
      const result = await verifyAuditChain();
      setAuditVerification(result);
      await loadProtectedDashboard();
      showNotification(
        result.valid
          ? `Cryptographic audit chain verified: ${result.totalEntries} entries intact.`
          : `ALERT: Audit chain verification failed (${result.reason})`
      );
    } catch (err) {
      showNotification(err instanceof Error ? err.message : 'Audit verification error.');
    }
  };

  const handleAdminError = (err: unknown) => {
    if (err instanceof ApiError && err.status === 401) {
      wipeClientMemory();
      setAuthError('Session expired. Please sign in again.');
    } else {
      showNotification(err instanceof Error ? err.message : 'Operation failed.');
    }
  };

  const handleAddActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanText = sanitizeText(newActivityText.trim(), 240);
    if (!cleanText) return;
    try {
      const additions = await adminAddDivisionActivity(selectedDivId, cleanText);
      onCatalogSynced(additions);
      setNewActivityText('');
      showNotification('New activity/service persisted & audit-logged!');
      await loadProtectedDashboard();
    } catch (err) {
      handleAdminError(err);
    }
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const divObj = divisions.find((d) => d.id === prodDivId);
    try {
      const additions = await adminCreateProduct({
        name: sanitizeText(prodName, 120),
        divisionId: prodDivId,
        divisionName: divObj ? divObj.name : 'CREST Technologies',
        category: prodCategory,
        tagline: sanitizeText(prodTagline, 180),
        description: sanitizeText(prodDesc, 1500),
        keyFeatures: prodFeatures
          .split('\n')
          .map((s) => sanitizeText(s.trim(), 160))
          .filter(Boolean)
      });
      onCatalogSynced(additions);
      setProdName('');
      setProdTagline('');
      setProdDesc('');
      setProdFeatures('');
      showNotification('Product published securely to catalog!');
      await loadProtectedDashboard();
    } catch (err) {
      handleAdminError(err);
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    const divObj = divisions.find((d) => d.id === projDivId);
    try {
      const additions = await adminCreateProject({
        title: sanitizeText(projTitle, 160),
        divisionId: projDivId,
        divisionName: divObj ? divObj.name : 'CREST Technologies',
        category: projCategory,
        summary: sanitizeText(projSummary, 1500),
        impact:
          sanitizeText(projImpact, 400) ||
          'Delivering measurable cross-industry operational transformation.'
      });
      onCatalogSynced(additions);
      setProjTitle('');
      setProjSummary('');
      setProjImpact('');
      showNotification('Project added to portfolio & audit-logged!');
      await loadProtectedDashboard();
    } catch (err) {
      handleAdminError(err);
    }
  };

  const handleCreateNews = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const additions = await adminCreateNews({
        title: sanitizeText(newsTitle, 180),
        category: newsCat,
        divisionTag: sanitizeText(newsDivTag, 80),
        excerpt: sanitizeText(newsExcerpt, 400),
        content: newsBody
          .split('\n')
          .map((line) => sanitizeText(line, 1500))
          .filter(Boolean)
      });
      onCatalogSynced(additions);
      setNewsTitle('');
      setNewsExcerpt('');
      setNewsBody('');
      showNotification('Corporate news article published live!');
      await loadProtectedDashboard();
    } catch (err) {
      handleAdminError(err);
    }
  };

  const handleUpdateInquiryStatus = async (id: string, status: CustomerInquiry['status']) => {
    try {
      await adminUpdateInquiryStatus(id, status);
      setInquiries((prev) => prev.map((i) => (i.id === id ? { ...i, status } : i)));
      showNotification(`Inquiry ${id} updated to "${status}".`);
    } catch (err) {
      handleAdminError(err);
    }
  };

  const handleUpdatePartnershipStatus = async (
    id: string,
    status: PartnershipRequest['status']
  ) => {
    try {
      await adminUpdatePartnershipStatus(id, status);
      setPartnerships((prev) => prev.map((p) => (p.id === id ? { ...p, status } : p)));
      showNotification(`Partnership ${id} updated to "${status}".`);
    } catch (err) {
      handleAdminError(err);
    }
  };

  const handleResetCatalog = async () => {
    try {
      const additions = await adminResetCatalog();
      onCatalogSynced(additions);
      showNotification('Custom CMS catalog additions reset. Encrypted PII & Audit Logs preserved.');
      await loadProtectedDashboard();
    } catch (err) {
      handleAdminError(err);
    }
  };

  const sidebarItems: { id: AdminSection; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'overview', label: 'Executive Analytics', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'inquiries', label: 'Customer Inquiries', icon: <MessageSquare className="w-4 h-4" />, badge: inquiries.length },
    { id: 'partnerships', label: 'Partnership Requests', icon: <Handshake className="w-4 h-4" />, badge: partnerships.length },
    { id: 'careers', label: 'Career Applications', icon: <Users className="w-4 h-4" />, badge: applications.length },
    { id: 'divisions', label: 'Manage 8 Divisions', icon: <Layers className="w-4 h-4" />, badge: divisions.length },
    { id: 'products', label: 'Publish Products', icon: <Package className="w-4 h-4" />, badge: products.length },
    { id: 'projects', label: 'Project Portfolio', icon: <FolderKanban className="w-4 h-4" />, badge: projects.length },
    { id: 'news', label: 'Publish News & PR', icon: <Newspaper className="w-4 h-4" />, badge: news.length },
    { id: 'settings', label: 'Security & Audit (SOC)', icon: <Server className="w-4 h-4" /> }
  ];

  // =========================================================================
  // SERVER-ENFORCED CRYPTOGRAPHIC ACCESS GATEWAY (UNAUTHENTICATED VIEW)
  // =========================================================================
  if (checkingSession) {
    return (
      <div className="min-h-screen bg-[#0E1110] text-[#E8DFD1] flex items-center justify-center font-mono text-xs">
        Verifying server-side cryptographic session...
      </div>
    );
  }

  if (!isAuthenticated) {
    const httpsActive = isHttpsTransport();
    return (
      <div className="min-h-screen bg-[#0E1110] text-[#E8DFD1] flex flex-col justify-center items-center px-4 sm:px-6 py-12 relative overflow-hidden font-sans">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#C5A880]/5 rounded-full blur-[140px] pointer-events-none" />

        <div className="w-full max-w-md relative z-10 space-y-8">
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#1A1F1D] border border-[#C5A880]/30 text-[#C5A880] text-[10px] tracking-[0.22em] uppercase font-mono">
              <Lock className="w-3.5 h-3.5 text-[#C5A880]" />
              <span>SERVER-ENFORCED • ARGON2ID + HTTPONLY</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold tracking-wider uppercase text-white font-serif">
              Executive Security Gateway
            </h1>

            <p className="text-xs text-neutral-400 font-light leading-relaxed">
              Authenticated strictly on the backend server via Argon2id (64 MiB + RFC 9106 pepper), HttpOnly SameSite=Strict cookies, and persistent SQLite IP rate limiting.
            </p>
          </div>

          <div className="bg-[#151918] border border-neutral-800 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
            {!httpsActive && (
              <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-500/30 text-amber-200 text-[11px] flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
                <span>
                  Local HTTP mode detected. In production, terminate TLS 1.3 via{' '}
                  <code className="font-mono text-amber-100">deploy/nginx.security.conf</code>.
                </span>
              </div>
            )}

            {authError && (
              <div className="p-4 rounded-xl bg-red-950/40 border border-red-500/40 text-red-300 text-xs flex items-start gap-3">
                <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
                <div className="space-y-1">
                  <span className="font-semibold block uppercase tracking-wider text-[10px]">
                    Security Alert
                  </span>
                  <p className="leading-relaxed font-light">{authError}</p>
                </div>
              </div>
            )}

            {lockoutRemaining > 0 ? (
              <div className="text-center p-6 rounded-xl bg-red-950/30 border border-red-900/50 space-y-3">
                <ShieldAlert className="w-8 h-8 text-red-400 mx-auto animate-pulse" />
                <h3 className="text-sm font-semibold text-red-300 uppercase tracking-widest">
                  Server-Side IP Lockout Engaged
                </h3>
                <p className="text-xs text-neutral-400">
                  Persistent rate-limiting is active on the backend database to block brute-force attempts.
                </p>
                <div className="text-3xl font-mono font-bold text-red-400">
                  {Math.floor(lockoutRemaining / 60)}:
                  {String(lockoutRemaining % 60).padStart(2, '0')}
                </div>
              </div>
            ) : (
              <form onSubmit={handleExecutiveAuth} className="space-y-4">
                <div>
                  <label className="text-[11px] uppercase tracking-[0.16em] text-neutral-300 font-medium block mb-1.5">
                    Executive Username
                  </label>
                  <input
                    type="text"
                    required
                    autoComplete="username"
                    disabled={isVerifying}
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-[#0E1110] border border-neutral-700 focus:border-[#C5A880] text-sm text-white outline-none font-mono"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[11px] uppercase tracking-[0.16em] text-neutral-300 font-medium flex items-center gap-1.5">
                      <KeyRound className="w-3.5 h-3.5 text-[#C5A880]" />
                      <span>Executive Access Key</span>
                    </label>
                    <span className="text-[10px] text-neutral-500 font-mono">Argon2id + Pepper</span>
                  </div>

                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      autoFocus
                      autoComplete="current-password"
                      disabled={isVerifying}
                      value={authPassword}
                      onChange={(e) => setAuthPassword(e.target.value)}
                      placeholder="Enter server executive key..."
                      className="w-full px-4 py-3 rounded-xl bg-[#0E1110] border border-neutral-700 focus:border-[#C5A880] focus:ring-1 focus:ring-[#C5A880] text-sm text-white placeholder-neutral-600 transition outline-none pr-10 font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white transition cursor-pointer p-1"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {mfaPrompted && (
                  <div>
                    <label className="text-[11px] uppercase tracking-[0.16em] text-[#C5A880] font-medium block mb-1.5">
                      6-Digit Authenticator App (TOTP 2FA) Code
                    </label>
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]{6}"
                      maxLength={6}
                      required
                      autoFocus
                      value={loginTotp}
                      onChange={(e) => setLoginTotp(e.target.value.replace(/[^0-9]/g, ''))}
                      placeholder="000000"
                      className="w-full px-4 py-3 rounded-xl bg-[#0E1110] border border-[#C5A880] text-center tracking-[0.4em] text-base text-white font-mono outline-none"
                    />
                  </div>
                )}

                <div className="p-3 rounded-xl bg-[#0E1110] border border-neutral-800 text-[10px] text-neutral-400 space-y-1.5 font-mono">
                  <div className="flex justify-between">
                    <span>Password KDF:</span>
                    <span className="text-[#C5A880]">Argon2id (64 MiB, t=3)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Session Cookie:</span>
                    <span className="text-emerald-400">HttpOnly • SameSite=Strict</span>
                  </div>
                  <div className="flex justify-between">
                    <span>PII Vault at Rest:</span>
                    <span className="text-white">AES-256-GCM AEAD</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isVerifying || !authPassword}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#C5A880] to-[#A38257] hover:from-[#D8BC94] hover:to-[#B59367] text-black font-semibold text-xs uppercase tracking-[0.2em] transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shadow-lg flex items-center justify-center gap-2"
                >
                  {isVerifying ? (
                    <>
                      <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                      <span>Verifying on Security Server...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4 text-black" />
                      <span>Authenticate Executive Session</span>
                    </>
                  )}
                </button>
              </form>
            )}

            <div className="pt-2 text-center border-t border-neutral-800/80">
              <button
                type="button"
                onClick={() => onBackToSite('home')}
                className="text-xs text-neutral-400 hover:text-[#C5A880] transition inline-flex items-center gap-1.5 cursor-pointer font-light"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Return to Public Corporate Portal</span>
              </button>
            </div>
          </div>

          <div className="text-center text-[10px] text-neutral-500 font-mono space-y-1">
            <p>CREST GROUP SECURITY OPERATIONS CENTER (SOC) • 2026</p>
            <p>All authentication attempts are recorded in an HMAC-SHA256 tamper-evident audit chain.</p>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // AUTHENTICATED EXECUTIVE DASHBOARD
  // =========================================================================
  const httpsActive = isHttpsTransport();

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#222826] py-8 px-4 sm:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Mandatory Bootstrap Password Rotation Warning */}
        {adminUser?.mustChangePassword && (
          <div className="mb-6 p-4 rounded-2xl bg-amber-50 border border-amber-300 text-amber-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <div className="font-semibold uppercase tracking-wider text-[11px]">
                  Mandatory First-Login Password Rotation Required
                </div>
                <p className="text-amber-900 mt-0.5">
                  You authenticated with the one-time bootstrap password. Rotate it immediately in the Security &amp; Audit (SOC) panel and delete{' '}
                  <code className="font-mono">server/data/BOOTSTRAP_CREDENTIALS.txt</code>.
                </p>
              </div>
            </div>
            <button
              onClick={() => setSection('settings')}
              className="px-4 py-2 rounded-lg bg-amber-900 text-white text-[11px] uppercase tracking-wider shrink-0 cursor-pointer"
            >
              Rotate Key Now
            </button>
          </div>
        )}

        {/* Top Admin Header */}
        <div className="bg-white border border-[#EAE3D5] rounded-2xl p-6 mb-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4 shadow-2xs">
          <div>
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.25em] text-[#856B49]">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>
                SIGNED IN AS {adminUser?.username?.toUpperCase()} ({adminUser?.role}) • HTTPONLY + CSRF ACTIVE
              </span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-semibold text-[#222826] mt-1">
              Executive Command &amp; Content Portal
            </h1>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div
              className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[10px] font-mono ${
                httpsActive
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-amber-50 border-amber-200 text-amber-900'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  httpsActive ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                }`}
              />
              <span>
                {httpsActive
                  ? 'HTTPS / TLS Active • AES-256-GCM Vault'
                  : 'Local HTTP Dev • AES-256-GCM Vault Active'}
              </span>
            </div>
            <button
              onClick={handleResetCatalog}
              className="px-4 py-2.5 rounded-lg bg-[#FAF8F5] hover:bg-[#F5F0E6] text-[#525D58] border border-[#E8DFD1] text-[11px] uppercase tracking-[0.18em] flex items-center gap-1.5 transition cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-[#856B49]" />
              <span>Reset Catalog</span>
            </button>
            <button
              onClick={() => onBackToSite('home')}
              className="px-4 py-2.5 rounded-lg bg-[#FAF8F5] hover:bg-[#F5F0E6] text-[#222826] border border-[#E8DFD1] text-[11px] uppercase tracking-[0.18em] flex items-center gap-1.5 transition cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Live Website</span>
            </button>
            <button
              onClick={handleLogout}
              className="px-5 py-2.5 rounded-lg bg-[#222826] hover:bg-red-700 text-white text-[11px] uppercase tracking-[0.2em] font-medium flex items-center gap-1.5 cursor-pointer transition shadow-xs"
              title="Revoke Server Session & Wipe Decrypted Memory"
            >
              <LogOut className="w-3.5 h-3.5 text-red-300" />
              <span>Lock &amp; Sign Out</span>
            </button>
          </div>
        </div>

        {toast && (
          <div className="mb-6 p-4 rounded-xl bg-white border border-[#C5A880] text-[#222826] flex items-center justify-between text-xs shadow-sm">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#856B49]" />
              <span>{toast}</span>
            </div>
            <button onClick={() => setToast(null)} className="text-[11px] underline text-[#856B49]">
              Dismiss
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Navigation Sidebar */}
          <div className="lg:col-span-3 space-y-3">
            <div className="bg-white border border-[#EAE3D5] rounded-2xl p-3 space-y-1">
              {sidebarItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setSection(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs transition cursor-pointer ${
                    section === item.id
                      ? 'bg-[#F5F0E6] text-[#222826] font-medium border border-[#D8CBB8]'
                      : 'text-[#525D58] hover:bg-[#FAF8F5] hover:text-[#222826] font-light'
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    <span className="text-[#856B49]">{item.icon}</span>
                    <span>{item.label}</span>
                  </span>
                  {item.badge !== undefined && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-white text-[#856B49] border border-[#E8DFD1]">
                      {item.badge}
                    </span>
                  )}
                </button>
              ))}
            </div>

            <div className="bg-white border border-[#EAE3D5] rounded-2xl p-4 text-xs space-y-2">
              <div className="uppercase tracking-[0.2em] text-[#856B49] text-[10px] flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5" />
                <span>Verified Security Stack</span>
              </div>
              <div className="flex justify-between text-[#525D58] font-light">
                <span>Password KDF:</span>
                <span className="font-medium text-[#222826]">Argon2id + Pepper</span>
              </div>
              <div className="flex justify-between text-[#525D58] font-light">
                <span>PII Vault:</span>
                <span className="font-medium text-[#222826]">AES-256-GCM</span>
              </div>
              <div className="flex justify-between text-[#525D58] font-light">
                <span>Database:</span>
                <span className="font-medium text-[#856B49]">SQLite WAL (Prepared)</span>
              </div>
              <div className="flex justify-between text-[#525D58] font-light">
                <span>Audit Chain:</span>
                <span
                  className={`font-medium ${
                    auditVerification?.valid ? 'text-emerald-700' : 'text-red-600'
                  }`}
                >
                  {auditVerification?.valid ? 'HMAC Verified' : 'Check Pending'}
                </span>
              </div>
            </div>
          </div>

          {/* Right Content Area */}
          <div className="lg:col-span-9">
            {loadingDashboard && inquiries.length === 0 ? (
              <div className="bg-white border border-[#EAE3D5] rounded-2xl p-10 text-center text-xs text-[#525D58]">
                Decrypting executive records via AES-256-GCM...
              </div>
            ) : null}

            {section === 'overview' && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="bg-white border border-[#EAE3D5] rounded-2xl p-5">
                    <span className="text-xs text-[#68746F] font-light">Active Divisions</span>
                    <div className="font-serif text-3xl font-semibold text-[#222826] mt-1">
                      {divisions.length}
                    </div>
                    <span className="text-[10px] uppercase tracking-wider text-[#856B49]">
                      Phases 1–3 Mapped
                    </span>
                  </div>
                  <div className="bg-white border border-[#EAE3D5] rounded-2xl p-5">
                    <span className="text-xs text-[#68746F] font-light">Proprietary Products</span>
                    <div className="font-serif text-3xl font-semibold text-[#222826] mt-1">
                      {products.length}
                    </div>
                    <span className="text-[10px] uppercase tracking-wider text-[#856B49]">
                      Copetra, TradePOS+
                    </span>
                  </div>
                  <div className="bg-white border border-[#EAE3D5] rounded-2xl p-5">
                    <span className="text-xs text-[#68746F] font-light">Encrypted Inquiries</span>
                    <div className="font-serif text-3xl font-semibold text-[#222826] mt-1">
                      {inquiries.length}
                    </div>
                    <span className="text-[10px] uppercase tracking-wider text-[#856B49]">
                      {inquiries.filter((i) => i.status === 'New').length} Pending
                    </span>
                  </div>
                  <div className="bg-white border border-[#EAE3D5] rounded-2xl p-5">
                    <span className="text-xs text-[#68746F] font-light">Partner Proposals</span>
                    <div className="font-serif text-3xl font-semibold text-[#222826] mt-1">
                      {partnerships.length}
                    </div>
                    <span className="text-[10px] uppercase tracking-wider text-[#856B49]">
                      {applications.length} Career Applicants
                    </span>
                  </div>
                </div>

                <div className="bg-white border border-[#EAE3D5] rounded-2xl p-6">
                  <h3 className="font-serif text-xl font-semibold text-[#222826] flex items-center gap-2 mb-4">
                    <TrendingUp className="w-5 h-5 text-[#856B49]" />
                    <span>Ecosystem Engagement by Division</span>
                  </h3>
                  <div className="space-y-3">
                    {[
                      { name: 'CREST Technologies (Copetra AI, School Portal, TradePOS)', pct: 44 },
                      { name: 'CREST Digital Marketing & Media', pct: 22 },
                      { name: 'CREST Logistics & Transport (Cargoo Marketplace)', pct: 16 },
                      { name: 'CREST Foods & Beverages (Crest Creamery)', pct: 9 },
                      { name: 'Properties, Agribusiness, Education & Investments', pct: 9 }
                    ].map((row, idx) => (
                      <div key={idx}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-[#222826] font-light">{row.name}</span>
                          <span className="text-[#856B49] font-medium">{row.pct}%</span>
                        </div>
                        <div className="w-full h-2 bg-[#FAF8F5] rounded-full overflow-hidden border border-[#EAE3D5]">
                          <div className="h-full bg-[#C5A880] rounded-full" style={{ width: `${row.pct}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white border border-[#EAE3D5] rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-serif text-xl font-semibold text-[#222826]">
                      Latest Decrypted Customer Inquiries
                    </h3>
                    <button
                      onClick={() => setSection('inquiries')}
                      className="text-xs uppercase tracking-wider text-[#856B49] hover:underline cursor-pointer"
                    >
                      Manage All →
                    </button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-[#EAE3D5] text-[#856B49] uppercase tracking-wider text-[10px]">
                          <th className="py-2.5 pr-3">ID</th>
                          <th className="py-2.5 px-3">Client</th>
                          <th className="py-2.5 px-3">Division &amp; Service</th>
                          <th className="py-2.5 px-3">Budget</th>
                          <th className="py-2.5 pl-3">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#F4EFE6]">
                        {inquiries.slice(0, 4).map((inq) => (
                          <tr key={inq.id}>
                            <td className="py-3 pr-3 text-[#856B49] font-medium">{inq.id}</td>
                            <td className="py-3 px-3">
                              <div className="font-medium text-[#222826]">{inq.fullName}</div>
                              <div className="text-[#68746F] font-light">{inq.organization}</div>
                            </td>
                            <td className="py-3 px-3">
                              <div className="text-[#222826]">{inq.division}</div>
                              <div className="text-[#68746F] font-light">{inq.serviceOrProduct}</div>
                            </td>
                            <td className="py-3 px-3 text-[#856B49]">{inq.budgetRange}</td>
                            <td className="py-3 pl-3">
                              <span className="px-2.5 py-1 rounded-full bg-[#FAF8F5] text-[#222826] border border-[#E8DFD1] text-[10px]">
                                {inq.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {section === 'inquiries' && (
              <div className="bg-white border border-[#EAE3D5] rounded-2xl p-6 space-y-4">
                <h3 className="font-serif text-2xl font-semibold text-[#222826]">
                  Customer Inquiries &amp; Quotations (AES-256-GCM Decrypted)
                </h3>
                <div className="space-y-4">
                  {inquiries.map((inq) => (
                    <div
                      key={inq.id}
                      className="p-4 rounded-xl bg-[#FAF8F5] border border-[#EAE3D5] flex flex-col md:flex-row justify-between gap-4"
                    >
                      <div className="space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs text-[#856B49] font-medium">{inq.id}</span>
                          <span className="text-sm font-semibold text-[#222826]">{inq.fullName}</span>
                          <span className="text-xs text-[#68746F]">({inq.organization})</span>
                          <span className="px-2.5 py-0.5 rounded bg-white border border-[#E8DFD1] text-[#856B49] text-[10px]">
                            {inq.division}
                          </span>
                        </div>
                        <div className="text-xs text-[#856B49]">
                          Service: {inq.serviceOrProduct} • Budget: {inq.budgetRange}
                        </div>
                        <p className="text-xs text-[#525D58] font-light bg-white p-3 rounded-lg border border-[#EFEAE1]">
                          &ldquo;{inq.message}&rdquo;
                        </p>
                        <div className="text-[11px] text-[#68746F] font-light">
                          {inq.email} • {inq.phone} • {inq.createdAt}
                        </div>
                      </div>
                      <div className="flex md:flex-col justify-between items-end gap-2 shrink-0">
                        <select
                          value={inq.status}
                          onChange={(e) =>
                            handleUpdateInquiryStatus(inq.id, e.target.value as CustomerInquiry['status'])
                          }
                          className="px-3 py-1.5 rounded-lg bg-white border border-[#D8CBB8] text-xs text-[#222826]"
                        >
                          <option value="New">New</option>
                          <option value="In Review">In Review</option>
                          <option value="Quoted">Quoted</option>
                          <option value="Resolved">Resolved</option>
                        </select>
                        <a
                          href={`https://wa.me/${inq.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                            `Hello ${inq.fullName}, this is the CREST GROUP Executive Desk regarding your inquiry (${inq.id}) for ${inq.serviceOrProduct}.`
                          )}`}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1.5 rounded-lg bg-[#222826] text-white text-[11px] uppercase tracking-wider inline-flex items-center gap-1"
                        >
                          <span>Reply WhatsApp</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {section === 'partnerships' && (
              <div className="bg-white border border-[#EAE3D5] rounded-2xl p-6 space-y-4">
                <h3 className="font-serif text-2xl font-semibold text-[#222826]">
                  Strategic Partnership Proposals
                </h3>
                <div className="space-y-4">
                  {partnerships.map((prt) => (
                    <div
                      key={prt.id}
                      className="p-4 rounded-xl bg-[#FAF8F5] border border-[#EAE3D5] flex flex-col md:flex-row justify-between gap-4"
                    >
                      <div className="space-y-1.5">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-xs text-[#856B49]">{prt.id}</span>
                          <span className="text-base font-semibold text-[#222826]">
                            {prt.organizationName}
                          </span>
                          <span className="px-2.5 py-0.5 rounded-full bg-white border border-[#E8DFD1] text-[#856B49] text-[10px]">
                            {prt.partnershipType}
                          </span>
                        </div>
                        <div className="text-xs text-[#856B49]">
                          Division: <strong>{prt.targetDivision}</strong> • Capacity:{' '}
                          <strong>{prt.investmentCapacity}</strong>
                        </div>
                        <p className="text-xs text-[#525D58] font-light bg-white p-3 rounded-lg border border-[#EFEAE1]">
                          {prt.proposalSummary}
                        </p>
                        <div className="text-[11px] text-[#68746F] font-light">
                          {prt.contactPerson} • {prt.email} • {prt.phone} • {prt.createdAt}
                        </div>
                      </div>
                      <div className="shrink-0">
                        <select
                          value={prt.status}
                          onChange={(e) =>
                            handleUpdatePartnershipStatus(
                              prt.id,
                              e.target.value as PartnershipRequest['status']
                            )
                          }
                          className="px-3 py-1.5 rounded-lg bg-white border border-[#D8CBB8] text-xs text-[#222826]"
                        >
                          <option value="Pending Review">Pending Review</option>
                          <option value="Executive Committee">Executive Committee</option>
                          <option value="Approved">Approved</option>
                          <option value="Archived">Archived</option>
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {section === 'careers' && (
              <div className="bg-white border border-[#EAE3D5] rounded-2xl p-6 space-y-4">
                <h3 className="font-serif text-2xl font-semibold text-[#222826]">
                  Career &amp; Internship Applications
                </h3>
                <div className="space-y-3">
                  {applications.map((app) => (
                    <div
                      key={app.id}
                      className="p-4 rounded-xl bg-[#FAF8F5] border border-[#EAE3D5] space-y-1.5"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <span className="text-xs text-[#856B49] mr-2">{app.id}</span>
                          <span className="font-semibold text-sm text-[#222826]">
                            {app.applicantName}
                          </span>
                          <span className="text-xs text-[#856B49] ml-2">→ {app.jobTitle}</span>
                        </div>
                        <span className="px-2.5 py-0.5 rounded-full bg-white border border-[#E8DFD1] text-[#222826] text-xs">
                          {app.status}
                        </span>
                      </div>
                      <p className="text-xs text-[#525D58] font-light">{app.coverNote}</p>
                      <div className="text-[11px] text-[#68746F] font-light">
                        {app.email} • {app.phone} • {app.experienceYears}
                        {app.portfolioOrLinkedin ? ` • ${app.portfolioOrLinkedin}` : ''}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {section === 'divisions' && (
              <div className="bg-white border border-[#EAE3D5] rounded-2xl p-6 space-y-6">
                <div>
                  <h3 className="font-serif text-2xl font-semibold text-[#222826]">
                    Manage 8 Business Divisions
                  </h3>
                  <p className="text-xs text-[#525D58] font-light">
                    Add new activities or services to any CREST GROUP business division in real time.
                  </p>
                </div>

                <form
                  onSubmit={handleAddActivity}
                  className="p-4 rounded-xl bg-[#FAF8F5] border border-[#EAE3D5] grid grid-cols-1 md:grid-cols-12 gap-3 items-end"
                >
                  <div className="md:col-span-4">
                    <label className="block text-[10px] uppercase tracking-wider text-[#856B49] mb-1">
                      Select Division
                    </label>
                    <select
                      value={selectedDivId}
                      onChange={(e) => setSelectedDivId(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-white border border-[#E8DFD1] text-xs text-[#222826]"
                    >
                      {divisions.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="md:col-span-5">
                    <label className="block text-[10px] uppercase tracking-wider text-[#856B49] mb-1">
                      New Activity / Service Name
                    </label>
                    <input
                      type="text"
                      required
                      value={newActivityText}
                      onChange={(e) => setNewActivityText(e.target.value)}
                      placeholder="e.g. Cybersecurity Audit & ISO Compliance"
                      className="w-full px-3 py-2 rounded-lg bg-white border border-[#E8DFD1] text-xs text-[#222826]"
                    />
                  </div>
                  <div className="md:col-span-3">
                    <button
                      type="submit"
                      className="w-full py-2 px-4 rounded-lg bg-[#222826] text-white text-xs uppercase tracking-wider flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Add Service</span>
                    </button>
                  </div>
                </form>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {divisions.map((div) => (
                    <div
                      key={div.id}
                      className="p-4 rounded-xl bg-[#FAF8F5] border border-[#EFEAE1] space-y-1.5"
                    >
                      <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-[#856B49]">
                        <span>{div.code}</span>
                        <span>{div.phase}</span>
                      </div>
                      <h4 className="font-serif text-lg font-semibold text-[#222826]">{div.name}</h4>
                      <div className="text-xs text-[#525D58] font-light">
                        {div.activities.length} Active Services • {div.flagshipProducts.length}{' '}
                        Flagship Products
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {section === 'products' && (
              <div className="bg-white border border-[#EAE3D5] rounded-2xl p-6 space-y-6">
                <h3 className="font-serif text-2xl font-semibold text-[#222826]">
                  Publish New Proprietary Product
                </h3>
                <form
                  onSubmit={handleCreateProduct}
                  className="space-y-4 bg-[#FAF8F5] p-5 rounded-xl border border-[#EAE3D5]"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[10px] uppercase tracking-wider text-[#856B49] mb-1">
                        Product Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={prodName}
                        onChange={(e) => setProdName(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-white border border-[#E8DFD1] text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase tracking-wider text-[#856B49] mb-1">
                        Division
                      </label>
                      <select
                        value={prodDivId}
                        onChange={(e) => setProdDivId(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-white border border-[#E8DFD1] text-xs"
                      >
                        {divisions.map((d) => (
                          <option key={d.id} value={d.id}>
                            {d.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase tracking-wider text-[#856B49] mb-1">
                        Category
                      </label>
                      <select
                        value={prodCategory}
                        onChange={(e) => setProdCategory(e.target.value as ProductItem['category'])}
                        className="w-full px-3 py-2 rounded-lg bg-white border border-[#E8DFD1] text-xs"
                      >
                        <option value="AI & Automation">AI &amp; Automation</option>
                        <option value="Enterprise & POS">Enterprise &amp; POS</option>
                        <option value="EdTech">EdTech</option>
                        <option value="Logistics Marketplace">Logistics Marketplace</option>
                        <option value="Cloud & Infrastructure">Cloud &amp; Infrastructure</option>
                        <option value="Consumer Goods">Consumer Goods</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider text-[#856B49] mb-1">
                      Tagline *
                    </label>
                    <input
                      type="text"
                      required
                      value={prodTagline}
                      onChange={(e) => setProdTagline(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-white border border-[#E8DFD1] text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider text-[#856B49] mb-1">
                      Product Description *
                    </label>
                    <textarea
                      rows={2}
                      required
                      value={prodDesc}
                      onChange={(e) => setProdDesc(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-white border border-[#E8DFD1] text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider text-[#856B49] mb-1">
                      Key Features (one per line)
                    </label>
                    <textarea
                      rows={3}
                      value={prodFeatures}
                      onChange={(e) => setProdFeatures(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-white border border-[#E8DFD1] text-xs"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-lg bg-[#222826] text-white text-xs uppercase tracking-wider cursor-pointer"
                  >
                    Publish Product Live
                  </button>
                </form>
              </div>
            )}

            {section === 'projects' && (
              <div className="bg-white border border-[#EAE3D5] rounded-2xl p-6 space-y-6">
                <h3 className="font-serif text-2xl font-semibold text-[#222826]">
                  Add Portfolio Project
                </h3>
                <form
                  onSubmit={handleCreateProject}
                  className="space-y-4 bg-[#FAF8F5] p-5 rounded-xl border border-[#EAE3D5]"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[10px] uppercase tracking-wider text-[#856B49] mb-1">
                        Project Title *
                      </label>
                      <input
                        type="text"
                        required
                        value={projTitle}
                        onChange={(e) => setProjTitle(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-white border border-[#E8DFD1] text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase tracking-wider text-[#856B49] mb-1">
                        Division
                      </label>
                      <select
                        value={projDivId}
                        onChange={(e) => setProjDivId(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-white border border-[#E8DFD1] text-xs"
                      >
                        {divisions.map((d) => (
                          <option key={d.id} value={d.id}>
                            {d.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase tracking-wider text-[#856B49] mb-1">
                        Sector
                      </label>
                      <select
                        value={projCategory}
                        onChange={(e) => setProjCategory(e.target.value as ProjectItem['category'])}
                        className="w-full px-3 py-2 rounded-lg bg-white border border-[#E8DFD1] text-xs"
                      >
                        <option value="Technology & AI">Technology &amp; AI</option>
                        <option value="Logistics & Mobility">Logistics &amp; Mobility</option>
                        <option value="Foods & Beverages">Foods &amp; Beverages</option>
                        <option value="Real Estate">Real Estate</option>
                        <option value="Agribusiness & Education">Agribusiness &amp; Education</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider text-[#856B49] mb-1">
                      Project Summary *
                    </label>
                    <textarea
                      rows={2}
                      required
                      value={projSummary}
                      onChange={(e) => setProjSummary(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-white border border-[#E8DFD1] text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider text-[#856B49] mb-1">
                      Measurable Impact
                    </label>
                    <input
                      type="text"
                      value={projImpact}
                      onChange={(e) => setProjImpact(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-white border border-[#E8DFD1] text-xs"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-lg bg-[#222826] text-white text-xs uppercase tracking-wider cursor-pointer"
                  >
                    Publish Project
                  </button>
                </form>
              </div>
            )}

            {section === 'news' && (
              <div className="bg-white border border-[#EAE3D5] rounded-2xl p-6 space-y-6">
                <h3 className="font-serif text-2xl font-semibold text-[#222826]">
                  Publish Corporate News &amp; Insights
                </h3>
                <form
                  onSubmit={handleCreateNews}
                  className="space-y-4 bg-[#FAF8F5] p-5 rounded-xl border border-[#EAE3D5]"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block text-[10px] uppercase tracking-wider text-[#856B49] mb-1">
                        Headline Title *
                      </label>
                      <input
                        type="text"
                        required
                        value={newsTitle}
                        onChange={(e) => setNewsTitle(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-white border border-[#E8DFD1] text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase tracking-wider text-[#856B49] mb-1">
                        Category
                      </label>
                      <select
                        value={newsCat}
                        onChange={(e) => setNewsCat(e.target.value as NewsArticle['category'])}
                        className="w-full px-3 py-2 rounded-lg bg-white border border-[#E8DFD1] text-xs"
                      >
                        <option value="Corporate Announcement">Corporate Announcement</option>
                        <option value="Product Launch">Product Launch</option>
                        <option value="Technology & AI">Technology &amp; AI</option>
                        <option value="Strategic Partnership">Strategic Partnership</option>
                        <option value="Industry Insight">Industry Insight</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider text-[#856B49] mb-1">
                      Division Tag
                    </label>
                    <input
                      type="text"
                      value={newsDivTag}
                      onChange={(e) => setNewsDivTag(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-white border border-[#E8DFD1] text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider text-[#856B49] mb-1">
                      Excerpt *
                    </label>
                    <input
                      type="text"
                      required
                      value={newsExcerpt}
                      onChange={(e) => setNewsExcerpt(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-white border border-[#E8DFD1] text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider text-[#856B49] mb-1">
                      Full Article Paragraphs *
                    </label>
                    <textarea
                      rows={4}
                      required
                      value={newsBody}
                      onChange={(e) => setNewsBody(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-white border border-[#E8DFD1] text-xs"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-lg bg-[#222826] text-white text-xs uppercase tracking-wider cursor-pointer"
                  >
                    Publish Article Live
                  </button>
                </form>
              </div>
            )}

            {section === 'settings' && (
              <div className="space-y-6">
                {/* Live Server Security Posture Matrix */}
                <div className="bg-white border border-[#EAE3D5] rounded-2xl p-6 space-y-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h3 className="font-serif text-2xl font-semibold text-[#222826]">
                        Security Operations Center (SOC) &amp; Cryptographic Controls
                      </h3>
                      <p className="text-xs text-[#525D58] font-light">
                        Live telemetry verified directly from the backend security server.
                      </p>
                    </div>
                    <button
                      onClick={handleVerifyAuditChain}
                      className="px-4 py-2 rounded-lg bg-[#222826] hover:bg-[#353E3B] text-white text-[11px] uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
                    >
                      <FileCheck2 className="w-4 h-4 text-[#C5A880]" />
                      <span>Verify Audit Chain</span>
                    </button>
                  </div>

                  {securityPosture && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                      {[
                        { label: 'Password Hashing (Server)', val: securityPosture.passwordKdf },
                        { label: 'Multi-Factor Auth (RFC 6238)', val: securityPosture.mfaStatus || 'Available' },
                        { label: 'PII Encryption at Rest', val: securityPosture.piiAtRest },
                        { label: 'Session Management', val: securityPosture.sessionControl },
                        { label: 'CSRF & Fetch Metadata', val: securityPosture.csrfProtection },
                        { label: 'Brute-Force Rate Limiting', val: securityPosture.rateLimiting },
                        { label: 'Audit Trail Integrity', val: securityPosture.auditLog },
                        { label: 'Zero Third-Party Fonts', val: securityPosture.zeroThirdPartyFonts || 'Self-Hosted Local WOFF2' }
                      ].map((row, idx) => (
                        <div
                          key={idx}
                          className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#EAE3D5] space-y-1"
                        >
                          <div className="text-[10px] uppercase tracking-wider text-[#856B49] font-medium">
                            {row.label}
                          </div>
                          <div className="font-mono text-[11px] text-[#222826]">{row.val}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* RFC 6238 TOTP Two-Factor Authentication & Active Sessions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white border border-[#EAE3D5] rounded-2xl p-6 space-y-4">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="font-serif text-xl font-semibold text-[#222826]">
                        Two-Factor Auth (TOTP 2FA)
                      </h4>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase ${
                          adminUser?.totpEnabled
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-amber-50 text-amber-800 border border-amber-200'
                        }`}
                      >
                        {adminUser?.totpEnabled ? 'Enabled' : 'Not Enabled'}
                      </span>
                    </div>
                    <p className="text-xs text-[#525D58] font-light">
                      Works with Google Authenticator, Authy, 1Password, or Bitwarden. Secret is encrypted at rest with AES-256-GCM and protected against code replay.
                    </p>

                    {mfaMsg && (
                      <div
                        className={`p-3 rounded-xl text-xs border ${
                          mfaMsg.type === 'ok'
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                            : 'bg-red-50 border-red-200 text-red-700'
                        }`}
                      >
                        {mfaMsg.text}
                      </div>
                    )}

                    {!adminUser?.totpEnabled ? (
                      !mfaSetupSecret ? (
                        <button
                          onClick={handleStartMfaSetup}
                          className="px-4 py-2.5 rounded-lg bg-[#222826] text-white text-xs uppercase tracking-wider cursor-pointer"
                        >
                          Generate 2FA Authenticator Secret
                        </button>
                      ) : (
                        <form onSubmit={handleConfirmEnableMfa} className="space-y-3">
                          <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#EAE3D5] space-y-1.5 text-[11px] font-mono break-all">
                            <div className="text-[10px] uppercase text-[#856B49]">
                              Add this Base32 Secret in your Authenticator App:
                            </div>
                            <div className="font-bold text-[#222826] select-all">
                              {mfaSetupSecret.secretBase32}
                            </div>
                            <div className="text-[10px] text-[#68746F] select-all">
                              {mfaSetupSecret.otpauthUri}
                            </div>
                          </div>
                          <input
                            type="password"
                            required
                            placeholder="Confirm current executive password"
                            value={mfaConfirmPwd}
                            onChange={(e) => setMfaConfirmPwd(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg bg-[#FAF8F5] border border-[#E8DFD1] text-xs font-mono"
                          />
                          <input
                            type="text"
                            required
                            maxLength={6}
                            placeholder="Enter 6-digit code from app"
                            value={mfaConfirmCode}
                            onChange={(e) => setMfaConfirmCode(e.target.value.replace(/[^0-9]/g, ''))}
                            className="w-full px-3 py-2 rounded-lg bg-[#FAF8F5] border border-[#E8DFD1] text-xs font-mono"
                          />
                          <button
                            type="submit"
                            className="px-4 py-2 rounded-lg bg-emerald-700 text-white text-xs uppercase tracking-wider cursor-pointer"
                          >
                            Verify &amp; Activate 2FA
                          </button>
                        </form>
                      )
                    ) : (
                      <form onSubmit={handleDisableMfa} className="space-y-3">
                        <input
                          type="password"
                          required
                          placeholder="Current executive password"
                          value={mfaConfirmPwd}
                          onChange={(e) => setMfaConfirmPwd(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg bg-[#FAF8F5] border border-[#E8DFD1] text-xs font-mono"
                        />
                        <input
                          type="text"
                          required
                          maxLength={6}
                          placeholder="Current 6-digit TOTP code"
                          value={mfaConfirmCode}
                          onChange={(e) => setMfaConfirmCode(e.target.value.replace(/[^0-9]/g, ''))}
                          className="w-full px-3 py-2 rounded-lg bg-[#FAF8F5] border border-[#E8DFD1] text-xs font-mono"
                        />
                        <button
                          type="submit"
                          className="px-4 py-2 rounded-lg bg-red-700 text-white text-xs uppercase tracking-wider cursor-pointer"
                        >
                          Disable 2FA
                        </button>
                      </form>
                    )}
                  </div>

                  <div className="bg-white border border-[#EAE3D5] rounded-2xl p-6 space-y-4">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="font-serif text-xl font-semibold text-[#222826]">
                        Active Executive Sessions ({activeSessions.length})
                      </h4>
                      <button
                        onClick={handleRevokeOtherSessions}
                        className="px-3 py-1.5 rounded-lg bg-[#FAF8F5] hover:bg-red-50 border border-[#E8DFD1] text-[10px] uppercase tracking-wider text-[#222826] cursor-pointer"
                      >
                        Revoke Others
                      </button>
                    </div>
                    <div className="space-y-2 max-h-52 overflow-y-auto">
                      {activeSessions.map((s) => (
                        <div
                          key={s.idPrefix}
                          className="p-3 rounded-xl bg-[#FAF8F5] border border-[#EAE3D5] text-[11px] font-mono space-y-0.5"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-[#222826]">
                              {s.ip} {s.current ? '(Current)' : ''}
                            </span>
                            <span className="text-[#856B49]">{s.idPrefix}…</span>
                          </div>
                          <div className="text-[10px] text-[#68746F] truncate">{s.userAgent}</div>
                        </div>
                      ))}
                    </div>

                    <div className="pt-3 border-t border-[#EAE3D5] space-y-2.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[11px] uppercase tracking-wider text-[#856B49] font-medium">
                          Encrypted Vault Backups ({backups.length})
                        </span>
                        <button
                          onClick={handleCreateEncryptedBackup}
                          disabled={creatingBackup}
                          className="px-3 py-1.5 rounded-lg bg-[#222826] hover:bg-[#353E3B] disabled:opacity-50 text-white text-[10px] uppercase tracking-wider cursor-pointer"
                        >
                          {creatingBackup ? 'Encrypting...' : 'Create AES-256-GCM Backup'}
                        </button>
                      </div>
                      {backups.slice(0, 3).map((b) => (
                        <div
                          key={b.fileName}
                          className="p-2.5 rounded-lg bg-[#FAF8F5] border border-[#EAE3D5] text-[10px] font-mono flex items-center justify-between gap-2"
                        >
                          <span className="truncate text-[#222826]">{b.fileName}</span>
                          <span className="text-[#856B49] shrink-0">
                            {(b.encryptedBytes / 1024).toFixed(1)} KB
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Executive Key Rotation */}
                <div className="bg-white border border-[#EAE3D5] rounded-2xl p-6 space-y-4">
                  <div>
                    <h4 className="font-serif text-xl font-semibold text-[#222826] flex items-center gap-2">
                      <KeyRound className="w-5 h-5 text-[#856B49]" />
                      <span>Rotate Executive Master Password</span>
                    </h4>
                    <p className="text-xs text-[#525D58] font-light mt-0.5">
                      Minimum 12 characters with uppercase, lowercase, number, and symbol. Re-hashes with Argon2id + RFC 9106 pepper and revokes all other sessions.
                    </p>
                  </div>

                  {pwdMessage && (
                    <div
                      className={`p-3 rounded-xl text-xs border ${
                        pwdMessage.type === 'ok'
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                          : 'bg-red-50 border-red-200 text-red-700'
                      }`}
                    >
                      {pwdMessage.text}
                    </div>
                  )}

                  <form onSubmit={handleRotatePassword} className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
                    <div>
                      <label className="block text-[10px] uppercase tracking-wider text-[#856B49] mb-1">
                        Current Password
                      </label>
                      <input
                        type="password"
                        required
                        autoComplete="current-password"
                        value={currentPwd}
                        onChange={(e) => setCurrentPwd(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-[#FAF8F5] border border-[#E8DFD1] text-xs font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase tracking-wider text-[#856B49] mb-1">
                        New Strong Password (12+ chars)
                      </label>
                      <input
                        type="password"
                        required
                        autoComplete="new-password"
                        value={newPwd}
                        onChange={(e) => setNewPwd(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-[#FAF8F5] border border-[#E8DFD1] text-xs font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase tracking-wider text-[#856B49] mb-1">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        required
                        autoComplete="new-password"
                        value={confirmPwd}
                        onChange={(e) => setConfirmPwd(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-[#FAF8F5] border border-[#E8DFD1] text-xs font-mono"
                      />
                    </div>
                    <div className="sm:col-span-3">
                      <button
                        type="submit"
                        disabled={rotatingPwd}
                        className="px-5 py-2.5 rounded-lg bg-[#222826] hover:bg-[#353E3B] disabled:opacity-50 text-white text-xs uppercase tracking-wider cursor-pointer"
                      >
                        {rotatingPwd ? 'Hashing with Argon2id...' : 'Rotate Password & Revoke Old Sessions'}
                      </button>
                    </div>
                  </form>
                </div>

                {/* Tamper-Evident Cryptographic Audit Trail */}
                <div className="bg-white border border-[#EAE3D5] rounded-2xl p-6 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <h4 className="font-serif text-xl font-semibold text-[#222826]">
                        Tamper-Evident Audit Log (HMAC-SHA256 Hash Chain)
                      </h4>
                      {auditVerification && (
                        <p
                          className={`text-[11px] font-mono mt-0.5 ${
                            auditVerification.valid ? 'text-emerald-700' : 'text-red-600'
                          }`}
                        >
                          {auditVerification.valid
                            ? `CHAIN INTACT (${auditVerification.totalEntries} records) • Head: ${auditVerification.headHash?.slice(0, 20)}...`
                            : `CHAIN BROKEN: ${auditVerification.reason}`}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={loadProtectedDashboard}
                      className="px-3 py-1.5 rounded-lg bg-[#FAF8F5] border border-[#E8DFD1] text-[11px] text-[#525D58] flex items-center gap-1 cursor-pointer"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Refresh</span>
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-[11px] font-mono">
                      <thead>
                        <tr className="border-b border-[#EAE3D5] text-[#856B49] uppercase text-[10px]">
                          <th className="py-2 pr-2">#</th>
                          <th className="py-2 px-2">Timestamp (UTC)</th>
                          <th className="py-2 px-2">Actor</th>
                          <th className="py-2 px-2">Action</th>
                          <th className="py-2 px-2">IP</th>
                          <th className="py-2 pl-2">HMAC Prefix</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#F4EFE6]">
                        {auditLogs.slice(0, 15).map((entry) => (
                          <tr key={entry.id}>
                            <td className="py-2 pr-2 text-[#856B49]">{entry.id}</td>
                            <td className="py-2 px-2 text-[#525D58]">{entry.timestamp.slice(0, 19)}</td>
                            <td className="py-2 px-2 font-semibold text-[#222826]">{entry.actor}</td>
                            <td className="py-2 px-2 text-[#222826]">{entry.action}</td>
                            <td className="py-2 px-2 text-[#68746F]">{entry.ip}</td>
                            <td className="py-2 pl-2 text-[#856B49]">{entry.entryHash.slice(0, 14)}…</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
