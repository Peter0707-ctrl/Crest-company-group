import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  ActiveTab,
  Division,
  ProductItem,
  ProjectItem,
  NewsArticle,
  CareerOpening,
  CustomerInquiry,
  PartnershipRequest,
  CareerApplication
} from './types/ecosystem';
import {
  INITIAL_DIVISIONS,
  INITIAL_PRODUCTS,
  INITIAL_PROJECTS,
  INITIAL_NEWS,
  INITIAL_CAREERS
} from './data/crestData';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomeView, AboutView } from './components/HomeAndAboutViews';
import {
  BusinessesView,
  ProductsView,
  MobileAppsView,
  ProjectsView,
  NewsView,
  PartnershipsView,
  CareersView,
  ContactView
} from './components/EcosystemViews';
import {
  ProductDetailModal,
  CareerApplicationModal,
  NewsArticleModal
} from './components/Modals';
import { AdminDashboard } from './components/AdminDashboard';
import { deepSanitizePayload } from './utils/sanitizer';
import {
  CmsAdditions,
  fetchPublicCatalog,
  submitPublicInquiry,
  submitPublicPartnership,
  submitPublicApplication
} from './utils/apiClient';

const EMPTY_ADDITIONS: CmsAdditions = {
  divisionActivities: {},
  products: [],
  projects: [],
  news: []
};

export function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [selectedDivisionId, setSelectedDivisionId] = useState<string>('crest-technologies');

  // Public CMS additions fetched from the hardened backend API (zero PII, zero unsafe localStorage)
  const [cmsAdditions, setCmsAdditions] = useState<CmsAdditions>(EMPTY_ADDITIONS);
  const [careers] = useState<CareerOpening[]>(INITIAL_CAREERS);

  // Modals & Navigation State
  const [selectedProduct, setSelectedProduct] = useState<ProductItem | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);
  const [selectedJob, setSelectedJob] = useState<CareerOpening | null>(null);
  const [quoteDefaults, setQuoteDefaults] = useState<{ division?: string; service?: string }>({});

  const refreshPublicCatalog = useCallback(async () => {
    try {
      const additions = await fetchPublicCatalog();
      setCmsAdditions(deepSanitizePayload(additions));
    } catch {
      // Public site continues rendering baseline corporate catalog if backend is offline
    }
  }, []);

  useEffect(() => {
    // Purge any legacy unencrypted PII left in localStorage from pre-hardening builds
    try {
      localStorage.removeItem('crest_inquiries_v1');
      localStorage.removeItem('crest_partnerships_v1');
      localStorage.removeItem('crest_applications_v1');
      localStorage.removeItem('crest_divisions_v1');
      localStorage.removeItem('crest_products_v1');
      localStorage.removeItem('crest_projects_v1');
      localStorage.removeItem('crest_news_v1');
    } catch {
      // Ignore storage access errors
    }
    refreshPublicCatalog();
  }, [refreshPublicCatalog]);

  // Listen for #admin URL hash route
  useEffect(() => {
    const handleHash = () => {
      if (window.location.hash === '#admin') {
        setActiveTab('admin');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    };
    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  // Merge baseline catalog with authenticated CMS additions
  const divisions: Division[] = useMemo(
    () =>
      INITIAL_DIVISIONS.map((div) => {
        const extra = cmsAdditions.divisionActivities[div.id];
        return extra && extra.length > 0
          ? { ...div, activities: [...div.activities, ...extra] }
          : div;
      }),
    [cmsAdditions.divisionActivities]
  );

  const products: ProductItem[] = useMemo(
    () => [...cmsAdditions.products, ...INITIAL_PRODUCTS],
    [cmsAdditions.products]
  );

  const projects: ProjectItem[] = useMemo(
    () => [...cmsAdditions.projects, ...INITIAL_PROJECTS],
    [cmsAdditions.projects]
  );

  const news: NewsArticle[] = useMemo(
    () => [...cmsAdditions.news, ...INITIAL_NEWS],
    [cmsAdditions.news]
  );

  const handleSelectDivision = (divisionId: string) => {
    setSelectedDivisionId(divisionId);
    setActiveTab('businesses');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOpenQuoteModal = (defaultDivision?: string, defaultService?: string) => {
    setQuoteDefaults({ division: defaultDivision, service: defaultService });
    setActiveTab('contact');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Public Write-Only Form Handlers -> Validated, Rate-Limited & AES-256-GCM Encrypted on Server
  const handleSubmitInquiry = async (
    newInq: Omit<CustomerInquiry, 'id' | 'createdAt' | 'status'> & { website_hp?: string }
  ): Promise<void> => {
    await submitPublicInquiry(deepSanitizePayload(newInq));
  };

  const handleSubmitPartnership = async (
    newPrt: Omit<PartnershipRequest, 'id' | 'createdAt' | 'status'> & { website_hp?: string }
  ): Promise<void> => {
    await submitPublicPartnership(deepSanitizePayload(newPrt));
  };

  const handleSubmitApplication = async (
    newApp: Omit<CareerApplication, 'id' | 'createdAt' | 'status'> & { website_hp?: string }
  ): Promise<void> => {
    await submitPublicApplication(deepSanitizePayload(newApp));
  };

  if (activeTab === 'admin') {
    return (
      <AdminDashboard
        divisions={divisions}
        products={products}
        projects={projects}
        news={news}
        onCatalogSynced={(additions) => setCmsAdditions(deepSanitizePayload(additions))}
        onBackToSite={(tab) => {
          window.location.hash = '';
          setActiveTab(tab || 'home');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-cream-50 text-crest-950">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        divisions={divisions}
        onSelectDivision={handleSelectDivision}
        onOpenQuoteModal={handleOpenQuoteModal}
      />

      <main className="flex-1">
        {activeTab === 'home' && (
          <HomeView
            divisions={divisions}
            products={products}
            projects={projects}
            news={news}
            setActiveTab={setActiveTab}
            onSelectDivision={handleSelectDivision}
            onSelectProduct={setSelectedProduct}
            onSelectArticle={setSelectedArticle}
            onOpenQuoteModal={handleOpenQuoteModal}
          />
        )}

        {activeTab === 'about' && (
          <AboutView
            divisions={divisions}
            onSelectDivision={handleSelectDivision}
            onOpenQuoteModal={handleOpenQuoteModal}
          />
        )}

        {activeTab === 'businesses' && (
          <BusinessesView
            divisions={divisions}
            products={products}
            projects={projects}
            selectedDivisionId={selectedDivisionId}
            onSelectDivision={handleSelectDivision}
            onSelectProduct={setSelectedProduct}
            onOpenQuoteModal={handleOpenQuoteModal}
            onNavigatePartnerships={() => {
              setActiveTab('partnerships');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {activeTab === 'products' && (
          <ProductsView
            products={products}
            onSelectProduct={setSelectedProduct}
            onOpenQuoteModal={handleOpenQuoteModal}
          />
        )}

        {activeTab === 'mobile-apps' && (
          <MobileAppsView onOpenQuoteModal={handleOpenQuoteModal} />
        )}

        {activeTab === 'projects' && (
          <ProjectsView projects={projects} onOpenQuoteModal={handleOpenQuoteModal} />
        )}

        {activeTab === 'news' && (
          <NewsView news={news} onSelectArticle={setSelectedArticle} />
        )}

        {activeTab === 'partnerships' && (
          <PartnershipsView
            divisions={divisions}
            onSubmitPartnership={handleSubmitPartnership}
          />
        )}

        {activeTab === 'careers' && (
          <CareersView careers={careers} onSelectJob={setSelectedJob} />
        )}

        {activeTab === 'contact' && (
          <ContactView
            divisions={divisions}
            defaultDivision={quoteDefaults.division}
            defaultService={quoteDefaults.service}
            onSubmitInquiry={handleSubmitInquiry}
          />
        )}
      </main>

      <Footer
        divisions={divisions}
        setActiveTab={setActiveTab}
        onSelectDivision={handleSelectDivision}
        onOpenQuoteModal={handleOpenQuoteModal}
      />

      {/* Interactive Modals */}
      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onRequestQuote={(divName, prodName) => handleOpenQuoteModal(divName, prodName)}
      />

      <CareerApplicationModal
        job={selectedJob}
        onClose={() => setSelectedJob(null)}
        onSubmitApplication={handleSubmitApplication}
      />

      <NewsArticleModal
        article={selectedArticle}
        onClose={() => setSelectedArticle(null)}
      />
    </div>
  );
}

export default App;
