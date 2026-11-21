import React, { useState, useEffect } from 'react';
import {
  X,
  CheckCircle2,
  ArrowUpRight,
  Sparkles,
  ShieldCheck,
  Layers,
  Cpu,
  Send,
  MessageSquare,
  Building2,
  UserCheck,
  Calendar,
  Clock
} from 'lucide-react';
import {
  ProductItem,
  Division,
  CustomerInquiry,
  CareerOpening,
  CareerApplication,
  NewsArticle
} from '../types/ecosystem';
import {
  sanitizeText,
  validateAndSanitizeEmail,
  validateAndSanitizePhone,
  sanitizeSafeUrl
} from '../utils/sanitizer';
import { isHttpsTransport } from '../utils/cryptoSecurity';

interface ProductModalProps {
  product: ProductItem | null;
  onClose: () => void;
  onRequestQuote: (divisionName: string, productName: string) => void;
}

export const ProductDetailModal: React.FC<ProductModalProps> = ({
  product,
  onClose,
  onRequestQuote
}) => {
  if (!product) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fadeIn">
      <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white border border-[#E8DFD1] rounded-3xl shadow-2xl text-[#222826]">
        {/* Top White & Cream Header */}
        <div className="bg-[#FAF8F5] p-6 sm:p-8 border-b border-[#EAE3D5] relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full bg-white text-[#525D58] hover:bg-[#222826] hover:text-white border border-[#E8DFD1] transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex flex-wrap items-center gap-2 mb-3 text-[10px] uppercase tracking-[0.2em]">
            <span className="px-3 py-1 rounded-full bg-white border border-[#E8DFD1] text-[#856B49]">
              {product.badge}
            </span>
            <span className="px-3 py-1 rounded-full bg-[#F5F0E6] text-[#222826]">
              {product.divisionName}
            </span>
            <span className="px-3 py-1 rounded-full bg-white border border-[#E8DFD1] text-[#525D58]">
              ● {product.status}
            </span>
          </div>

          <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-[#222826]">
            {product.name}
          </h2>
          <p className="text-[#856B49] text-sm sm:text-base mt-1 font-light">
            {product.tagline}
          </p>
        </div>

        {/* Body */}
        <div className="p-6 sm:p-8 space-y-8 bg-white">
          {/* Interactive Live System Telemetry Preview in Cream */}
          <div className="bg-[#FAF8F5] rounded-2xl p-5 sm:p-6 border border-[#EAE3D5]">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-4 mb-4 border-b border-[#EFEAE1]">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#C5A880]" />
                <span className="text-[11px] uppercase tracking-[0.2em] text-[#222826] font-medium">
                  {product.demoPreview.title}
                </span>
              </div>
              <span className="text-xs text-[#856B49] bg-white px-3 py-1 rounded-full border border-[#E8DFD1] font-light">
                {product.metrics}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
              {product.demoPreview.kpis.map((kpi, i) => (
                <div
                  key={i}
                  className="bg-white border border-[#EFEAE1] rounded-xl p-3.5"
                >
                  <div className="text-[11px] text-[#68746F] font-light">{kpi.label}</div>
                  <div className="flex items-baseline justify-between mt-1">
                    <span className="font-serif text-xl font-semibold text-[#222826]">
                      {kpi.value}
                    </span>
                    <span className="text-[10px] uppercase tracking-wider text-[#856B49] bg-[#FAF8F5] px-2 py-0.5 rounded border border-[#EFEAE1]">
                      {kpi.trend}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-[#856B49] mb-2">
                Included Core System Modules:
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {product.demoPreview.modules.map((mod, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 text-xs bg-white px-3 py-2 rounded-lg border border-[#EFEAE1] text-[#222826] font-light"
                  >
                    <Layers className="w-3.5 h-3.5 text-[#C5A880] shrink-0" />
                    <span>{mod}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Executive Description */}
          <div>
            <h4 className="font-serif text-2xl font-semibold text-[#222826] mb-2">
              Product Overview
            </h4>
            <p className="text-[#525D58] font-light leading-relaxed text-sm sm:text-base">
              {product.description}
            </p>
          </div>

          {/* Key Features & Target Industries */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-[#FAF8F5] p-5 rounded-2xl border border-[#EAE3D5]">
              <h5 className="font-serif text-lg font-semibold text-[#222826] mb-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#856B49]" />
                <span>Key Capabilities & Features</span>
              </h5>
              <ul className="space-y-2.5">
                {product.keyFeatures.map((feat, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-[#525D58] font-light">
                    <CheckCircle2 className="w-4 h-4 text-[#C5A880] shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-4">
              <div className="bg-[#FAF8F5] p-5 rounded-2xl border border-[#EAE3D5]">
                <h5 className="font-serif text-lg font-semibold text-[#222826] mb-3 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-[#856B49]" />
                  <span>Designed For</span>
                </h5>
                <div className="flex flex-wrap gap-2">
                  {product.targetUsers.map((u, i) => (
                    <span
                      key={i}
                      className="px-3 py-1.5 rounded-lg bg-white border border-[#E8DFD1] text-xs font-light text-[#222826]"
                    >
                      {u}
                    </span>
                  ))}
                </div>
              </div>

              <div className="bg-[#FAF8F5] p-5 rounded-2xl border border-[#EAE3D5]">
                <h5 className="font-serif text-lg font-semibold text-[#222826] mb-3 flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-[#856B49]" />
                  <span>Architecture & Specifications</span>
                </h5>
                <ul className="space-y-1.5">
                  {product.techSpecs.map((spec, i) => (
                    <li key={i} className="text-xs text-[#525D58] font-light flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#C5A880]" />
                      <span>{spec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* CTA Footer */}
          <div className="bg-[#F5F0E6] p-5 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 border border-[#D8CBB8]">
            <div>
              <h5 className="font-serif text-xl font-semibold text-[#222826]">
                Ready to deploy {product.name}?
              </h5>
              <p className="text-xs text-[#525D58] font-light">
                Schedule a live executive walkthrough or request a tailored licensing quotation.
              </p>
            </div>
            <button
              onClick={() => {
                onClose();
                onRequestQuote(product.divisionName, product.name);
              }}
              className="w-full sm:w-auto px-6 py-3 rounded-lg bg-[#222826] hover:bg-[#353E3B] text-white text-xs uppercase tracking-[0.2em] font-medium transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Request Demo & Quotation</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

interface QuoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  divisions: Division[];
  defaultDivision?: string;
  defaultService?: string;
  onSubmitInquiry: (
    inquiry: Omit<CustomerInquiry, 'id' | 'createdAt' | 'status'> & { website_hp?: string }
  ) => Promise<void> | void;
}

export const QuoteInquiryModal: React.FC<QuoteModalProps> = ({
  isOpen,
  onClose,
  divisions,
  defaultDivision,
  defaultService,
  onSubmitInquiry
}) => {
  const [fullName, setFullName] = useState('');
  const [organization, setOrganization] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [division, setDivision] = useState(defaultDivision || 'CREST Technologies');
  const [serviceOrProduct, setServiceOrProduct] = useState(defaultService || '');
  const [budgetRange, setBudgetRange] = useState('$2,500 – $10,000');
  const [message, setMessage] = useState('');
  const [websiteHp, setWebsiteHp] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (defaultDivision) setDivision(defaultDivision);
    if (defaultService) setServiceOrProduct(defaultService);
  }, [defaultDivision, defaultService, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    try {
      const cleanEmail = validateAndSanitizeEmail(email);
      const cleanPhone = validateAndSanitizePhone(phone);
      const cleanMessage = sanitizeText(message, 2500);
      if (cleanMessage.length < 5) {
        throw new Error('Please provide at least 5 characters in your inquiry details.');
      }
      setSubmitting(true);
      await onSubmitInquiry({
        fullName: sanitizeText(fullName, 120),
        organization: sanitizeText(organization, 160) || 'Individual / Private Client',
        email: cleanEmail,
        phone: cleanPhone,
        division,
        serviceOrProduct: sanitizeText(serviceOrProduct, 180) || 'General Corporate Consultation',
        budgetRange,
        message: cleanMessage,
        website_hp: websiteHp
      });
      setSubmitted(true);
    } catch (err: any) {
      setFormError(err?.message || 'Unable to submit inquiry. Please verify your inputs.');
    } finally {
      setSubmitting(false);
    }
  };

  const resetAndClose = () => {
    setSubmitted(false);
    setFullName('');
    setOrganization('');
    setEmail('');
    setPhone('');
    setServiceOrProduct('');
    setMessage('');
    onClose();
  };

  const whatsappUrl = `https://wa.me/255779304500?text=${encodeURIComponent(
    `Hello CREST GROUP,\nName: ${fullName || 'Client'}\nOrganization: ${organization || 'N/A'}\nDivision: ${division}\nService/Product: ${serviceOrProduct || 'Inquiry'}\nDetails: ${message}`
  )}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto bg-white border border-[#E8DFD1] rounded-3xl shadow-2xl text-[#222826]">
        <div className="bg-[#FAF8F5] p-6 border-b border-[#EAE3D5] relative">
          <button
            onClick={resetAndClose}
            className="absolute top-5 right-5 p-2 rounded-full bg-white text-[#525D58] hover:bg-[#222826] hover:text-white border border-[#E8DFD1] transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
          <span className="text-[10px] uppercase tracking-[0.25em] text-[#856B49] font-light">
            CREST GROUP • CENTRAL DIGITAL GATEWAY
          </span>
          <h3 className="font-serif text-2xl sm:text-3xl font-semibold text-[#222826] mt-1">
            Request a Quotation
          </h3>
          <p className="text-xs text-[#525D58] font-light mt-1">
            Direct routing to our specialized division directors and executive desk.
          </p>
        </div>

        {submitted ? (
          <div className="p-8 text-center space-y-4 bg-white">
            <div className="w-14 h-14 rounded-full bg-[#FAF8F5] text-[#856B49] flex items-center justify-center mx-auto border border-[#D8CBB8]">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="font-serif text-3xl font-semibold text-[#222826]">
              Inquiry Logged Successfully
            </h4>
            <p className="text-sm text-[#525D58] font-light max-w-md mx-auto">
              Thank you, <strong>{fullName}</strong>. Your inquiry for <strong>{division}</strong> has been recorded in the CREST Administrative System.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="px-5 py-3 rounded-lg bg-[#222826] text-white text-xs uppercase tracking-[0.2em] font-medium flex items-center gap-2 transition"
              >
                <MessageSquare className="w-4 h-4 text-[#C5A880]" />
                <span>Send Instant Copy via WhatsApp</span>
              </a>
              <button
                onClick={resetAndClose}
                className="px-5 py-3 rounded-lg bg-[#FAF8F5] text-[#222826] border border-[#D8CBB8] text-xs uppercase tracking-[0.2em] font-medium"
              >
                Done & Return
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4 bg-white">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] uppercase tracking-[0.18em] text-[#525D58] mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Eng. John Mwakasege"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#E8DFD1] text-sm focus:outline-none focus:border-[#C5A880]"
                />
              </div>
              <div>
                <label className="block text-[11px] uppercase tracking-[0.18em] text-[#525D58] mb-1">
                  Company / Institution
                </label>
                <input
                  type="text"
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                  placeholder="e.g. Apex Enterprises Ltd"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#E8DFD1] text-sm focus:outline-none focus:border-[#C5A880]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] uppercase tracking-[0.18em] text-[#525D58] mb-1">
                  Official Email *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#E8DFD1] text-sm focus:outline-none focus:border-[#C5A880]"
                />
              </div>
              <div>
                <label className="block text-[11px] uppercase tracking-[0.18em] text-[#525D58] mb-1">
                  Phone / WhatsApp Number *
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+255 7XX XXX XXX"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#E8DFD1] text-sm focus:outline-none focus:border-[#C5A880]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] uppercase tracking-[0.18em] text-[#525D58] mb-1">
                  Target Business Division *
                </label>
                <select
                  value={division}
                  onChange={(e) => setDivision(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#E8DFD1] text-sm focus:outline-none focus:border-[#C5A880]"
                >
                  {divisions.map((d) => (
                    <option key={d.id} value={d.name}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[11px] uppercase tracking-[0.18em] text-[#525D58] mb-1">
                  Estimated Budget / Scope
                </label>
                <select
                  value={budgetRange}
                  onChange={(e) => setBudgetRange(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#E8DFD1] text-sm focus:outline-none focus:border-[#C5A880]"
                >
                  <option value="Under $1,000 / Standard Package">Under $1,000 / Standard Package</option>
                  <option value="$1,000 – $5,000">$1,000 – $5,000</option>
                  <option value="$5,000 – $15,000">$5,000 – $15,000</option>
                  <option value="$15,000 – $50,000">$15,000 – $50,000</option>
                  <option value="$50,000+ Enterprise / Custom Contract">$50,000+ Enterprise / Custom Contract</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[11px] uppercase tracking-[0.18em] text-[#525D58] mb-1">
                Specific Product, Software, or Service
              </label>
              <input
                type="text"
                value={serviceOrProduct}
                onChange={(e) => setServiceOrProduct(e.target.value)}
                placeholder="e.g. Copetra AI, CREST School Portal, TradePOS, Cargoo..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#E8DFD1] text-sm focus:outline-none focus:border-[#C5A880]"
              />
            </div>

            <div>
              <label className="block text-[11px] uppercase tracking-[0.18em] text-[#525D58] mb-1">
                Project Requirements / Inquiry Details *
              </label>
              <textarea
                rows={3}
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Tell us about your project goals, timeline, or specific requirements..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#E8DFD1] text-sm focus:outline-none focus:border-[#C5A880]"
              />
            </div>

            <input
              type="text"
              name="website_hp"
              tabIndex={-1}
              autoComplete="off"
              value={websiteHp}
              onChange={(e) => setWebsiteHp(e.target.value)}
              className="hidden"
              aria-hidden="true"
            />

            {formError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
                {formError}
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <span className="text-[11px] text-[#68746F] font-light flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#856B49]" />
                {isHttpsTransport()
                  ? 'TLS Encrypted • AES-256-GCM Encrypted Vault'
                  : 'AES-256-GCM Encrypted Vault • Direct to Division Desk'}
              </span>
              <button
                type="submit"
                disabled={submitting}
                className="w-full sm:w-auto px-6 py-3 rounded-lg bg-[#222826] hover:bg-[#353E3B] disabled:opacity-50 text-white text-xs uppercase tracking-[0.2em] font-medium transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{submitting ? 'Encrypting...' : 'Submit Quotation Request'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

interface CareerModalProps {
  job: CareerOpening | null;
  onClose: () => void;
  onSubmitApplication: (
    app: Omit<CareerApplication, 'id' | 'createdAt' | 'status'> & { website_hp?: string }
  ) => Promise<void> | void;
}

export const CareerApplicationModal: React.FC<CareerModalProps> = ({
  job,
  onClose,
  onSubmitApplication
}) => {
  const [applicantName, setApplicantName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [portfolioOrLinkedin, setPortfolioOrLinkedin] = useState('');
  const [experienceYears, setExperienceYears] = useState('2–4 Years');
  const [coverNote, setCoverNote] = useState('');
  const [websiteHp, setWebsiteHp] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!job) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    try {
      const cleanEmail = validateAndSanitizeEmail(email);
      const cleanPhone = validateAndSanitizePhone(phone);
      const safePortfolio = sanitizeSafeUrl(portfolioOrLinkedin);
      const cleanNote = sanitizeText(coverNote, 3000);
      if (cleanNote.length < 10) {
        throw new Error('Please provide at least 10 characters in your cover note.');
      }
      setSubmitting(true);
      await onSubmitApplication({
        jobId: job.id,
        jobTitle: job.title,
        applicantName: sanitizeText(applicantName, 120),
        email: cleanEmail,
        phone: cleanPhone,
        portfolioOrLinkedin: safePortfolio,
        experienceYears,
        coverNote: cleanNote,
        website_hp: websiteHp
      });
      setSubmitted(true);
    } catch (err: any) {
      setFormError(err?.message || 'Unable to submit application. Please check your details.');
    } finally {
      setSubmitting(false);
    }
  };

  const resetClose = () => {
    setSubmitted(false);
    setApplicantName('');
    setEmail('');
    setPhone('');
    setPortfolioOrLinkedin('');
    setCoverNote('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto bg-white border border-[#E8DFD1] rounded-3xl shadow-2xl text-[#222826]">
        <div className="bg-[#FAF8F5] p-6 border-b border-[#EAE3D5] relative">
          <button
            onClick={resetClose}
            className="absolute top-5 right-5 p-2 rounded-full bg-white text-[#525D58] hover:bg-[#222826] hover:text-white border border-[#E8DFD1] transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
          <span className="text-[10px] uppercase tracking-[0.25em] text-[#856B49] font-light">
            CREST GROUP TALENT & CAREERS
          </span>
          <h3 className="font-serif text-2xl font-semibold text-[#222826] mt-1">
            Apply: {job.title}
          </h3>
          <p className="text-xs text-[#856B49] font-light mt-1">
            {job.division} • {job.location} ({job.type})
          </p>
        </div>

        {submitted ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-[#FAF8F5] text-[#856B49] flex items-center justify-center mx-auto border border-[#D8CBB8]">
              <UserCheck className="w-7 h-7" />
            </div>
            <h4 className="font-serif text-2xl font-semibold text-[#222826]">
              Application Received
            </h4>
            <p className="text-sm text-[#525D58] font-light">
              Thank you, <strong>{applicantName}</strong>. Your application for <strong>{job.title}</strong> is now in the CREST HR Portal.
            </p>
            <button
              onClick={resetClose}
              className="px-6 py-2.5 rounded-lg bg-[#222826] text-white text-xs uppercase tracking-[0.2em]"
            >
              Close Window
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-[11px] uppercase tracking-[0.18em] text-[#525D58] mb-1">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={applicantName}
                onChange={(e) => setApplicantName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#E8DFD1] text-sm"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] uppercase tracking-[0.18em] text-[#525D58] mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#E8DFD1] text-sm"
                />
              </div>
              <div>
                <label className="block text-[11px] uppercase tracking-[0.18em] text-[#525D58] mb-1">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#E8DFD1] text-sm"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] uppercase tracking-[0.18em] text-[#525D58] mb-1">
                  Portfolio / LinkedIn / GitHub
                </label>
                <input
                  type="text"
                  value={portfolioOrLinkedin}
                  onChange={(e) => setPortfolioOrLinkedin(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#E8DFD1] text-sm"
                />
              </div>
              <div>
                <label className="block text-[11px] uppercase tracking-[0.18em] text-[#525D58] mb-1">
                  Experience
                </label>
                <select
                  value={experienceYears}
                  onChange={(e) => setExperienceYears(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#E8DFD1] text-sm"
                >
                  <option value="Fresh Graduate / Intern">Fresh Graduate / Intern</option>
                  <option value="1–2 Years">1–2 Years</option>
                  <option value="2–4 Years">2–4 Years</option>
                  <option value="5+ Years Senior">5+ Years Senior</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-[11px] uppercase tracking-[0.18em] text-[#525D58] mb-1">
                Executive Summary / Cover Note *
              </label>
              <textarea
                rows={3}
                required
                value={coverNote}
                onChange={(e) => setCoverNote(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#E8DFD1] text-sm"
              />
            </div>
            <input
              type="text"
              name="website_hp"
              tabIndex={-1}
              autoComplete="off"
              value={websiteHp}
              onChange={(e) => setWebsiteHp(e.target.value)}
              className="hidden"
              aria-hidden="true"
            />
            {formError && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
                {formError}
              </div>
            )}
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 rounded-lg bg-[#222826] hover:bg-[#353E3B] disabled:opacity-50 text-white text-xs uppercase tracking-[0.2em] font-medium cursor-pointer"
            >
              {submitting ? 'Encrypting & Submitting...' : 'Submit Application'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

interface ArticleModalProps {
  article: NewsArticle | null;
  onClose: () => void;
}

export const NewsArticleModal: React.FC<ArticleModalProps> = ({ article, onClose }) => {
  if (!article) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-white border border-[#E8DFD1] rounded-3xl shadow-2xl text-[#222826]">
        <div className="bg-[#FAF8F5] p-6 sm:p-8 border-b border-[#EAE3D5] relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full bg-white text-[#525D58] hover:bg-[#222826] hover:text-white border border-[#E8DFD1] transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex flex-wrap items-center gap-2 mb-3 text-[10px] uppercase tracking-[0.2em]">
            <span className="px-3 py-1 rounded-full bg-white border border-[#E8DFD1] text-[#856B49]">
              {article.category}
            </span>
            <span className="px-3 py-1 rounded-full bg-[#F5F0E6] text-[#222826]">
              {article.divisionTag}
            </span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-[#222826] leading-tight">
            {article.title}
          </h2>
          <div className="flex items-center gap-4 text-xs text-[#68746F] font-light mt-4">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-[#856B49]" />
              {article.date}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-[#856B49]" />
              {article.readTime}
            </span>
            <span>By {article.author}</span>
          </div>
        </div>
        <div className="p-6 sm:p-8 space-y-4 bg-white">
          <p className="text-base sm:text-lg font-serif italic text-[#222826] border-l-2 border-[#C5A880] pl-4">
            {article.excerpt}
          </p>
          <div className="space-y-4 text-[#525D58] font-light leading-relaxed text-sm sm:text-base pt-2">
            {article.content.map((para, idx) => (
              <p key={idx}>{para}</p>
            ))}
          </div>
          <div className="pt-6 border-t border-[#F4EFE6] flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-lg bg-[#222826] text-white text-xs uppercase tracking-[0.2em] cursor-pointer"
            >
              Close Article
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
