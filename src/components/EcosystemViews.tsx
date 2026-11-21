import React, { useState, useEffect } from 'react';
import {
  ArrowUpRight,
  CheckCircle2,
  Sparkles,
  Smartphone,
  Handshake,
  Search,
  Send,
  ShieldAlert,
  PhoneCall,
  Mail,
  MapPin,
  MessageSquare
} from 'lucide-react';
import {
  Division,
  ProductItem,
  ProjectItem,
  NewsArticle,
  CareerOpening,
  PartnershipRequest,
  CustomerInquiry
} from '../types/ecosystem';
import { getDivisionIcon } from './Navbar';
import { MOBILE_APP_CAPABILITIES } from '../data/crestData';
import {
  sanitizeText,
  validateAndSanitizeEmail,
  validateAndSanitizePhone
} from '../utils/sanitizer';

/* ============================================================================
   C. OUR BUSINESSES VIEW (WHITE & CREAM LALA SALAMA AESTHETIC)
============================================================================ */
interface BusinessesViewProps {
  divisions: Division[];
  products: ProductItem[];
  projects: ProjectItem[];
  selectedDivisionId: string;
  onSelectDivision: (divisionId: string) => void;
  onSelectProduct: (product: ProductItem) => void;
  onOpenQuoteModal: (defaultDivision?: string, defaultService?: string) => void;
  onNavigatePartnerships: () => void;
}

export const BusinessesView: React.FC<BusinessesViewProps> = ({
  divisions,
  products,
  projects,
  selectedDivisionId,
  onSelectDivision,
  onSelectProduct,
  onOpenQuoteModal,
  onNavigatePartnerships
}) => {
  const activeDiv =
    divisions.find((d) => d.id === selectedDivisionId) || divisions[0];

  const divProducts = products.filter((p) => p.divisionId === activeDiv.id);
  const divProjects = projects.filter((p) => p.divisionId === activeDiv.id);

  return (
    <div className="space-y-12 pb-20 bg-[#FAF8F5] text-[#222826]">
      {/* Header in Pure White & Cream */}
      <section className="bg-white pt-28 pb-14 border-b border-[#EAE3D5]">
        <div className="max-w-4xl mx-auto px-6 md:px-12 text-center space-y-4">
          <span className="text-xs uppercase tracking-[0.28em] text-[#856B49] font-light block">
            OUR BUSINESS AREAS • 8 SECTORS
          </span>
          <h1 className="font-signature text-6xl sm:text-7xl text-[#222826] font-normal">
            Business Ecosystem
          </h1>
          <p className="text-sm sm:text-base text-[#525D58] font-light max-w-2xl mx-auto">
            Select any of our 8 core sectors below to explore complete mandate, activities and services, proprietary products, active projects, and partnership pathways.
          </p>

          {/* 8 Sector Selector Tabs in White & Cream */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5 pt-4 text-left">
            {divisions.map((div, idx) => {
              const isSelected = div.id === activeDiv.id;
              const numberTag = div.code.replace(/DIV-?/i, '').trim() || String(idx + 1).padStart(2, '0');
              return (
                <button
                  key={div.id}
                  onClick={() => onSelectDivision(div.id)}
                  className={`p-3 rounded-xl border text-left transition flex flex-col justify-between gap-2 cursor-pointer ${
                    isSelected
                      ? 'bg-[#F5F0E6] text-[#222826] border-[#C5A880] font-medium shadow-xs'
                      : 'bg-[#FAF8F5] text-[#525D58] border-[#EFEAE1] hover:border-[#D8CBB8] font-light'
                  }`}
                >
                  <div className="flex items-center justify-between text-[#856B49]">
                    {getDivisionIcon(div.iconName, 'w-4 h-4')}
                    <span className="text-[9px] tracking-widest font-mono font-medium">{numberTag}</span>
                  </div>
                  <div className="text-xs leading-tight line-clamp-2">{div.shortName}</div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Active Sector Deep-Dive Showcase */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 space-y-10">
        <div className="bg-white rounded-3xl border border-[#EAE3D5] shadow-xs overflow-hidden grid grid-cols-1 lg:grid-cols-12">
          <div className="lg:col-span-7 p-6 sm:p-10 space-y-5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-[#FAF8F5] text-[#222826] border border-[#E8DFD1] text-[10px] uppercase tracking-wider font-semibold">
                {activeDiv.code.replace(/DIV-?/i, '').trim()}
              </span>
              <span className="px-3 py-1 rounded-full bg-[#F5F0E6] text-[#856B49] border border-[#E2D6C3] text-[10px] uppercase tracking-[0.2em]">
                {activeDiv.phase}
              </span>
            </div>

            <h2 className="font-serif text-3xl sm:text-4xl font-semibold uppercase tracking-wide text-[#222826]">
              {activeDiv.name}
            </h2>
            <p className="text-xs sm:text-sm uppercase tracking-[0.22em] text-[#856B49] font-light">
              {activeDiv.tagline}
            </p>
            <p className="text-sm sm:text-base text-[#525D58] font-light leading-relaxed">
              {activeDiv.description}
            </p>

            {/* Division Metrics */}
            <div className="grid grid-cols-3 gap-3 pt-2">
              {activeDiv.metrics.map((m, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#EAE3D5]"
                >
                  <div className="font-serif text-xl sm:text-2xl font-semibold text-[#222826]">
                    {m.value}
                  </div>
                  <div className="text-[10px] uppercase tracking-[0.18em] text-[#68746F] font-light mt-0.5">
                    {m.label}
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-3 flex flex-wrap gap-3">
              <button
                onClick={() => onOpenQuoteModal(activeDiv.name)}
                className="px-6 py-3 rounded-lg bg-[#222826] hover:bg-[#353E3B] text-white text-xs uppercase tracking-[0.2em] font-medium flex items-center gap-2 cursor-pointer"
              >
                <span>Inquire with {activeDiv.shortName}</span>
                <ArrowUpRight className="w-4 h-4" />
              </button>
              <button
                onClick={onNavigatePartnerships}
                className="px-5 py-3 rounded-lg bg-[#FAF8F5] hover:bg-[#F5F0E6] text-[#222826] border border-[#D8CBB8] text-xs uppercase tracking-[0.2em] font-medium cursor-pointer"
              >
                Partner With Division
              </button>
            </div>
          </div>

          <div className="lg:col-span-5 relative min-h-[300px] bg-white border-t lg:border-t-0 lg:border-l border-[#EAE3D5] flex flex-col items-center justify-center p-6">
            {activeDiv.id === 'crest-foods' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4 w-full mb-20">
                <div className="bg-[#FAF8F5] rounded-2xl p-4 border border-[#EFEAE1] flex items-center justify-center h-36">
                  <img
                    src="/crest-food-beverage.jpg"
                    alt="CREST Food & Beverage"
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
                <div className="bg-[#FAF8F5] rounded-2xl p-4 border border-[#EFEAE1] flex items-center justify-center h-36">
                  <img
                    src="/crest-ice-cream.jpg"
                    alt="CREST Ice Cream"
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
              </div>
            ) : (
              <img
                src={activeDiv.heroImage}
                alt={activeDiv.name}
                className={`w-full h-full ${
                  activeDiv.heroImage.startsWith('/crest-')
                    ? 'max-h-64 object-contain p-4 mb-16'
                    : 'absolute inset-0 object-cover'
                }`}
              />
            )}
            <div className="absolute bottom-5 left-5 right-5 bg-white/95 backdrop-blur-md p-4 rounded-2xl border border-[#EAE3D5] text-[#222826] shadow-sm">
              <div className="text-[10px] uppercase tracking-[0.22em] text-[#856B49]">
                PARTNERSHIP & COMMERCIAL MANDATE
              </div>
              <p className="text-xs text-[#525D58] font-light mt-1 leading-relaxed">
                {activeDiv.partnershipModel}
              </p>
            </div>
          </div>
        </div>

        {/* Complete Activities & Services Matrix */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-[#EAE3D5] space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#F4EFE6] pb-4">
            <div>
              <span className="text-[10px] uppercase tracking-[0.25em] text-[#856B49] font-light">
                OFFICIAL ACTIVITIES & SERVICES CATALOGUE
              </span>
              <h3 className="font-serif text-2xl sm:text-3xl font-semibold text-[#222826] mt-1">
                {activeDiv.name} Capabilities ({activeDiv.activities.length})
              </h3>
            </div>
            <span className="text-xs text-[#68746F] font-light">
              Click any service to request a tailored quotation
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {activeDiv.activities.map((activity, i) => (
              <button
                key={i}
                onClick={() => onOpenQuoteModal(activeDiv.name, activity)}
                className="p-4 rounded-xl bg-[#FAF8F5] hover:bg-[#F5F0E6] text-[#222826] border border-[#EFEAE1] hover:border-[#C5A880] transition text-left flex items-start justify-between gap-3 group cursor-pointer"
              >
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#C5A880] shrink-0 mt-0.5" />
                  <span className="text-xs sm:text-sm font-light">{activity}</span>
                </div>
                <ArrowUpRight className="w-4 h-4 text-[#856B49] opacity-50 group-hover:opacity-100 shrink-0" />
              </button>
            ))}
          </div>
        </div>

        {/* Division Flagship Products & Projects */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#EAE3D5] space-y-4">
            <span className="text-[10px] uppercase tracking-[0.25em] text-[#856B49] font-light">
              PROPRIETARY PRODUCTS & PLATFORMS
            </span>
            <h3 className="font-serif text-2xl font-semibold text-[#222826]">
              {activeDiv.shortName} Products & Solutions
            </h3>
            <div className="space-y-3">
              {divProducts.length > 0 ? (
                divProducts.map((prod) => (
                  <div
                    key={prod.id}
                    className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#EFEAE1] flex items-center justify-between gap-4"
                  >
                    <div>
                      <h4 className="font-serif text-lg font-semibold text-[#222826]">{prod.name}</h4>
                      <p className="text-xs text-[#525D58] font-light line-clamp-1">{prod.tagline}</p>
                    </div>
                    <button
                      onClick={() => onSelectProduct(prod)}
                      className="px-4 py-2 rounded-lg bg-white hover:bg-[#F5F0E6] text-[#222826] border border-[#D8CBB8] text-[10px] uppercase tracking-[0.18em] shrink-0 cursor-pointer"
                    >
                      Inspect
                    </button>
                  </div>
                ))
              ) : (
                activeDiv.flagshipProducts.map((fp, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#EFEAE1] flex items-center justify-between"
                  >
                    <span className="font-serif text-sm font-medium text-[#222826]">{fp}</span>
                    <button
                      onClick={() => onOpenQuoteModal(activeDiv.name, fp)}
                      className="text-xs uppercase tracking-[0.18em] text-[#856B49] underline cursor-pointer"
                    >
                      Inquire →
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#EAE3D5] space-y-4">
            <span className="text-[10px] uppercase tracking-[0.25em] text-[#856B49] font-light">
              DIVISION PROJECTS & INITIATIVES
            </span>
            <h3 className="font-serif text-2xl font-semibold text-[#222826]">
              Featured {activeDiv.shortName} Projects
            </h3>
            <div className="space-y-3">
              {divProjects.map((proj) => (
                <div
                  key={proj.id}
                  className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#EFEAE1] space-y-1.5"
                >
                  <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.18em] text-[#856B49]">
                    <span>{proj.status}</span>
                    <span>{proj.year}</span>
                  </div>
                  <h4 className="font-serif text-lg font-semibold text-[#222826]">{proj.title}</h4>
                  <p className="text-xs text-[#525D58] font-light">{proj.summary}</p>
                </div>
              ))}
              {activeDiv.featuredProjects.map((fp, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-[#FAF8F5] border border-[#EFEAE1] text-xs font-light text-[#222826] flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4 text-[#C5A880] shrink-0" />
                  <span>{fp}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

/* ============================================================================
   D. PRODUCTS & SOLUTIONS CATALOGUE VIEW (WHITE & CREAM)
============================================================================ */
interface ProductsViewProps {
  products: ProductItem[];
  onSelectProduct: (product: ProductItem) => void;
  onOpenQuoteModal: (defaultDivision?: string, defaultService?: string) => void;
}

export const ProductsView: React.FC<ProductsViewProps> = ({
  products,
  onSelectProduct,
  onOpenQuoteModal
}) => {
  const [catFilter, setCatFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    'ALL',
    'AI & Automation',
    'Enterprise & POS',
    'EdTech',
    'Logistics Marketplace',
    'Cloud & Infrastructure',
    'Consumer Goods'
  ];

  const filtered = products.filter((p) => {
    const matchesCat = catFilter === 'ALL' || p.category === catFilter;
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.tagline.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-12 pb-20 bg-[#FAF8F5] text-[#222826]">
      <section className="bg-white pt-28 pb-14 border-b border-[#EAE3D5]">
        <div className="max-w-4xl mx-auto px-6 md:px-12 text-center space-y-4">
          <span className="text-xs uppercase tracking-[0.28em] text-[#856B49] font-light block">
            CENTRAL PRODUCTS & SOLUTIONS CATALOGUE
          </span>
          <h1 className="font-signature text-6xl sm:text-7xl text-[#222826] font-normal">
            Products & Solutions
          </h1>
          <p className="text-sm sm:text-base text-[#525D58] font-light max-w-2xl mx-auto">
            Every proprietary platform in the CREST GROUP catalogue features its own dedicated specification page, live highlights, and direct quotation gateway.
          </p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 md:px-12 space-y-8">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-[#EAE3D5]">
          <div className="flex flex-wrap gap-1.5">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCatFilter(cat)}
                className={`px-3.5 py-1.5 rounded-full text-[11px] uppercase tracking-[0.16em] transition cursor-pointer ${
                  catFilter === cat
                    ? 'bg-[#222826] text-white font-medium'
                    : 'bg-[#FAF8F5] text-[#525D58] border border-[#EFEAE1] hover:bg-[#F5F0E6] font-light'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="relative min-w-[260px]">
            <Search className="w-4 h-4 text-[#856B49] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Copetra AI, TradePOS, Cargoo..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#FAF8F5] border border-[#EAE3D5] text-xs focus:outline-none focus:border-[#C5A880]"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((prod) => (
            <div
              key={prod.id}
              className="bg-white rounded-2xl border border-[#EAE3D5] hover:border-[#C5A880] shadow-2xs hover:shadow-md transition flex flex-col justify-between overflow-hidden"
            >
              <div>
                <div className="bg-[#FAF8F5] p-6 border-b border-[#EFEAE1] space-y-2">
                  <h3 className="font-serif text-2xl font-semibold text-[#222826]">{prod.name}</h3>
                  <p className="text-xs text-[#856B49] font-light">{prod.tagline}</p>
                </div>

                <div className="p-6 space-y-4">
                  <p className="text-xs sm:text-sm text-[#525D58] font-light leading-relaxed">
                    {prod.description}
                  </p>

                  <div className="space-y-1.5">
                    <div className="text-[10px] uppercase tracking-[0.2em] text-[#856B49]">
                      Core Capabilities:
                    </div>
                    {prod.keyFeatures.slice(0, 3).map((feat, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-[#222826] font-light">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#C5A880] shrink-0 mt-0.5" />
                        <span className="line-clamp-2">{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="px-6 pb-6 pt-3 border-t border-[#F4EFE6] flex items-center gap-2">
                <button
                  onClick={() => onSelectProduct(prod)}
                  className="flex-1 py-2.5 px-4 rounded-lg bg-[#222826] hover:bg-[#353E3B] text-white text-[10px] uppercase tracking-[0.2em] font-medium flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  <span>Dedicated Page</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onOpenQuoteModal(prod.divisionName, prod.name)}
                  className="py-2.5 px-4 rounded-lg bg-[#FAF8F5] hover:bg-[#F5F0E6] text-[#222826] border border-[#D8CBB8] text-[10px] uppercase tracking-[0.2em] font-medium cursor-pointer"
                >
                  Inquire
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Mobile Application Engineering Showcase (Integrated Within Products) */}
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-[#EAE3D5] shadow-xs grid grid-cols-1 lg:grid-cols-12 gap-10 items-center mt-12">
          <div className="lg:col-span-7 space-y-4">
            <div className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-[#856B49] font-light">
              <Smartphone className="w-4 h-4" />
              <span>Mobile Engineering Capability</span>
            </div>
            <h2 className="font-signature text-5xl sm:text-6xl text-[#222826] font-normal">
              Mobile Applications
            </h2>
            <p className="text-sm text-[#525D58] font-light leading-relaxed">
              CREST Technologies designs and develops bespoke Android, iOS, and Cross-Platform mobile applications for businesses, institutions, e-commerce brands, logistics fleets, and schools.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
              {[
                'Android Apps',
                'iOS & iPadOS',
                'Cross-Platform',
                'Business Apps',
                'E-Commerce',
                'Logistics & Cargoo',
                'Educational Apps',
                'API & Maintenance'
              ].map((item, i) => (
                <div
                  key={i}
                  className="px-3 py-2 rounded-lg bg-[#FAF8F5] border border-[#EFEAE1] text-xs text-[#222826] font-light flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#C5A880] shrink-0" />
                  <span className="truncate">{item}</span>
                </div>
              ))}
            </div>
            <div className="pt-3">
              <button
                onClick={() =>
                  onOpenQuoteModal('CREST Technologies', 'Mobile Application Development')
                }
                className="px-7 py-3.5 rounded-full bg-[#1A1A19] hover:bg-[#333330] text-white text-xs uppercase tracking-[0.2em] font-medium transition cursor-pointer shadow-sm"
              >
                Request Mobile App Proposal
              </button>
            </div>
          </div>

          <div className="lg:col-span-5 flex justify-center">
            <div className="w-72 rounded-[36px] bg-[#FAF8F5] border-2 border-[#D8CBB8] p-4 shadow-md space-y-3">
              <div className="w-16 h-1.5 bg-[#E2D6C3] rounded-full mx-auto" />
              <div className="bg-white rounded-2xl p-4 border border-[#EFEAE1] space-y-2">
                <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.18em] text-[#856B49]">
                  <span>CREST MOBILE</span>
                  <span>ANDROID & iOS</span>
                </div>
                <div className="font-serif text-lg font-semibold text-[#222826]">
                  Cargoo & TradePOS Suite
                </div>
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div className="bg-[#FAF8F5] p-2.5 rounded-xl border border-[#EFEAE1]">
                    <div className="text-[9px] text-[#68746F]">Uptime SLA</div>
                    <div className="font-serif text-xs font-semibold text-[#222826]">99.94%</div>
                  </div>
                  <div className="bg-[#FAF8F5] p-2.5 rounded-xl border border-[#EFEAE1]">
                    <div className="text-[9px] text-[#68746F]">Sync Mode</div>
                    <div className="font-serif text-xs font-semibold text-[#856B49]">Offline + Cloud</div>
                  </div>
                </div>
              </div>
              <div className="space-y-1.5">
                {[
                  { app: 'CREST School Parent App', store: 'iOS & Android' },
                  { app: 'Cargoo Shipper & Driver', store: 'Live GPS' },
                  { app: 'TradePOS Executive App', store: 'Live Sales' }
                ].map((m, idx) => (
                  <div
                    key={idx}
                    className="px-3 py-2 rounded-xl bg-white border border-[#EFEAE1] flex items-center justify-between text-xs"
                  >
                    <span className="font-light text-[#222826]">{m.app}</span>
                    <span className="text-[10px] uppercase tracking-wider text-[#856B49]">
                      {m.store}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

/* ============================================================================
   SECTION 4. MOBILE APPLICATION DEVELOPMENT VIEW (WHITE & CREAM)
============================================================================ */
interface MobileAppsViewProps {
  onOpenQuoteModal: (defaultDivision?: string, defaultService?: string) => void;
}

export const MobileAppsView: React.FC<MobileAppsViewProps> = ({ onOpenQuoteModal }) => {
  const [activeAppDemo, setActiveAppDemo] = useState<'cargoo' | 'school' | 'tradepos'>('cargoo');

  return (
    <div className="space-y-14 pb-20 bg-[#FAF8F5] text-[#222826]">
      <section className="bg-white pt-28 pb-14 border-b border-[#EAE3D5]">
        <div className="max-w-4xl mx-auto px-6 md:px-12 text-center space-y-4">
          <span className="text-xs uppercase tracking-[0.28em] text-[#856B49] font-light block">
            MOBILE APPLICATION DEVELOPMENT & ENGINEERING
          </span>
          <h1 className="font-signature text-6xl sm:text-7xl text-[#222826] font-normal">
            Mobile Engineering
          </h1>
          <p className="text-sm sm:text-base text-[#525D58] font-light max-w-2xl mx-auto">
            CREST Technologies engineers enterprise-grade Android, iOS, and Cross-Platform mobile applications for businesses, financial institutions, schools, logistics operators, and e-commerce brands.
          </p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 md:px-12 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {MOBILE_APP_CAPABILITIES.map((cap) => (
            <div
              key={cap.id}
              className="bg-white rounded-2xl p-6 border border-[#EAE3D5] hover:border-[#C5A880] flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-xl bg-[#FAF8F5] border border-[#E8DFD1] text-[#856B49] flex items-center justify-center">
                  <Smartphone className="w-5 h-5" />
                </div>
                <span className="text-[10px] uppercase tracking-[0.2em] text-[#856B49] block">
                  {cap.platform}
                </span>
                <h3 className="font-serif text-lg font-semibold text-[#222826]">{cap.title}</h3>
                <p className="text-xs text-[#525D58] font-light leading-relaxed">{cap.description}</p>
              </div>

              <div className="pt-3 border-t border-[#F4EFE6] space-y-1.5">
                {cap.highlights.map((h, i) => (
                  <div key={i} className="text-xs text-[#222826] font-light flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#C5A880] shrink-0" />
                    <span>{h}</span>
                  </div>
                ))}
                <button
                  onClick={() => onOpenQuoteModal('CREST Technologies', cap.title)}
                  className="w-full mt-3 py-2.5 rounded-lg bg-[#FAF8F5] hover:bg-[#F5F0E6] text-[#222826] border border-[#D8CBB8] text-[10px] uppercase tracking-[0.2em] font-medium transition cursor-pointer"
                >
                  Request App Proposal
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Interactive Mobile Apps Simulator in White & Cream */}
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-[#EAE3D5] grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-5">
            <span className="text-xs uppercase tracking-[0.25em] text-[#856B49] font-light">
              INTERACTIVE MOBILE ECOSYSTEM SHOWCASE
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-[#222826]">
              Preview Our Flagship Mobile Applications
            </h2>
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'cargoo', label: 'Cargoo Freight & Driver App' },
                { id: 'school', label: 'CREST School Parent App' },
                { id: 'tradepos', label: 'TradePOS Mobile App' }
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setActiveAppDemo(t.id as any)}
                  className={`px-4 py-2.5 rounded-lg text-[11px] uppercase tracking-[0.18em] transition cursor-pointer ${
                    activeAppDemo === t.id
                      ? 'bg-[#222826] text-white font-medium'
                      : 'bg-[#FAF8F5] text-[#525D58] border border-[#E8DFD1] font-light'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <div className="p-5 rounded-2xl bg-[#FAF8F5] border border-[#EAE3D5] space-y-2">
              <h4 className="font-serif text-xl font-semibold text-[#222826]">
                {activeAppDemo === 'cargoo' && 'Cargoo Mobile (Shipper & Driver Editions)'}
                {activeAppDemo === 'school' && 'CREST School Portal Mobile App'}
                {activeAppDemo === 'tradepos' && 'TradePOS Mobile Terminal & Executive Companion'}
              </h4>
              <p className="text-xs sm:text-sm text-[#525D58] font-light leading-relaxed">
                {activeAppDemo === 'cargoo' &&
                  'Allows cargo owners to post loads, compare verified truck quotes, and track GPS corridor movement in real time—while drivers receive instant return-load alerts.'}
                {activeAppDemo === 'school' &&
                  'Gives parents instant access to student attendance, continuous assessment grades, downloadable report cards, and 1-tap Mobile Money fee payment.'}
                {activeAppDemo === 'tradepos' &&
                  'Turns any Android phone or POS device into a barcode-scanning checkout terminal with Bluetooth receipt printing and live multi-branch profit alerts.'}
              </p>
            </div>
          </div>

          <div className="lg:col-span-5 flex justify-center">
            <div className="w-72 rounded-[38px] bg-[#FAF8F5] border-2 border-[#D8CBB8] p-4 shadow-md space-y-3">
              <div className="w-16 h-1.5 bg-[#E2D6C3] rounded-full mx-auto" />
              <div className="bg-white rounded-2xl p-4 border border-[#EFEAE1] space-y-3">
                <div className="flex justify-between items-center text-[10px] uppercase tracking-[0.18em] text-[#856B49]">
                  <span>ANDROID • iOS</span>
                  <span>LIVE PREVIEW</span>
                </div>
                <div className="font-serif text-lg font-semibold text-[#222826]">
                  {activeAppDemo === 'cargoo' && 'Cargoo Dispatch #CG-892'}
                  {activeAppDemo === 'school' && 'CREST Parent Portal'}
                  {activeAppDemo === 'tradepos' && 'TradePOS Live Sales'}
                </div>
                <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#EFEAE1] text-xs space-y-1">
                  <div className="text-[#525D58] font-light">
                    {activeAppDemo === 'cargoo' && 'Route: Dar es Salaam → Lusaka (28T Transit)'}
                    {activeAppDemo === 'school' && 'Term II Fee Status: Paid via M-Pesa (Verified)'}
                    {activeAppDemo === 'tradepos' && 'Today Net Revenue: TZS 14,850,000 (+18%)'}
                  </div>
                  <div className="text-[11px] text-[#856B49] font-medium">
                    {activeAppDemo === 'cargoo' && 'GPS Telemetry: Active • ETA 18 hrs'}
                    {activeAppDemo === 'school' && 'Latest Exam Avg: 89.4% (Grade A)'}
                    {activeAppDemo === 'tradepos' && '3 Branches Synced • 0 Stockouts'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

/* ============================================================================
   E. PROJECTS & PORTFOLIO VIEW (WHITE & CREAM)
============================================================================ */
interface ProjectsViewProps {
  projects: ProjectItem[];
  onOpenQuoteModal: (defaultDivision?: string, defaultService?: string) => void;
}

export const ProjectsView: React.FC<ProjectsViewProps> = ({ projects, onOpenQuoteModal }) => {
  const [cat, setCat] = useState<string>('ALL');
  const categories = [
    'ALL',
    'Technology & AI',
    'Software Systems',
    'Transport & Logistics',
    'Foods & Beverages',
    'Real Estate',
    'Agribusiness & Education'
  ];

  const list = cat === 'ALL' ? projects : projects.filter((p) => p.category === cat);

  return (
    <div className="space-y-12 pb-20 bg-[#FAF8F5] text-[#222826]">
      <section className="bg-white pt-28 pb-14 border-b border-[#EAE3D5]">
        <div className="max-w-4xl mx-auto px-6 md:px-12 text-center space-y-4">
          <span className="text-xs uppercase tracking-[0.28em] text-[#856B49] font-light block">
            CORPORATE PROJECTS & PORTFOLIO
          </span>
          <h1 className="font-signature text-6xl sm:text-7xl text-[#222826] font-normal">
            Projects & Portfolio
          </h1>
          <p className="text-sm sm:text-base text-[#525D58] font-light max-w-2xl mx-auto">
            From proprietary AI and enterprise software systems to the Cargoo logistics marketplace, Crest Creamery food production, real estate developments, and agribusiness value chains.
          </p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 md:px-12 space-y-8">
        <div className="flex flex-wrap gap-2">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={`px-4 py-2 rounded-full text-[11px] uppercase tracking-[0.16em] transition cursor-pointer ${
                cat === c
                  ? 'bg-[#222826] text-white font-medium'
                  : 'bg-white border border-[#EAE3D5] text-[#525D58] hover:bg-[#F5F0E6] font-light'
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {list.map((proj) => (
            <div
              key={proj.id}
              className="bg-white rounded-2xl p-6 sm:p-8 border border-[#EAE3D5] hover:border-[#C5A880] space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] uppercase tracking-[0.18em]">
                  <span className="px-3 py-1 rounded-full bg-[#FAF8F5] border border-[#E8DFD1] text-[#222826]">
                    {proj.divisionName}
                  </span>
                  <span className="px-3 py-1 rounded-full bg-[#F5F0E6] text-[#856B49]">
                    {proj.status} • {proj.year}
                  </span>
                </div>
                <h3 className="font-serif text-2xl font-semibold text-[#222826]">{proj.title}</h3>
                <p className="text-xs sm:text-sm text-[#525D58] font-light leading-relaxed">
                  {proj.summary}
                </p>
                <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#EFEAE1] text-xs text-[#222826] font-light">
                  <strong className="font-medium text-[#856B49]">Strategic Impact:</strong>{' '}
                  {proj.impact}
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {proj.deliverables.map((d, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-lg bg-[#FAF8F5] border border-[#EFEAE1] text-[11px] text-[#525D58] font-light"
                    >
                      ✓ {d}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-[#F4EFE6] flex items-center justify-between">
                <span className="text-[11px] uppercase tracking-[0.15em] text-[#856B49]">
                  {proj.clientOrScope}
                </span>
                <button
                  onClick={() => onOpenQuoteModal(proj.divisionName, proj.title)}
                  className="text-xs uppercase tracking-[0.18em] font-medium text-[#222826] hover:text-[#856B49] inline-flex items-center gap-1 cursor-pointer"
                >
                  <span>Inquire</span>
                  <ArrowUpRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

/* ============================================================================
   F. NEWS & INSIGHTS VIEW (WHITE & CREAM)
============================================================================ */
interface NewsViewProps {
  news: NewsArticle[];
  onSelectArticle: (article: NewsArticle) => void;
}

export const NewsView: React.FC<NewsViewProps> = ({ news, onSelectArticle }) => {
  return (
    <div className="space-y-12 pb-20 bg-[#FAF8F5] text-[#222826]">
      <section className="bg-white pt-28 pb-14 border-b border-[#EAE3D5]">
        <div className="max-w-4xl mx-auto px-6 md:px-12 text-center space-y-4">
          <span className="text-xs uppercase tracking-[0.28em] text-[#856B49] font-light block">
            PRESS RELEASES & INDUSTRY INSIGHTS
          </span>
          <h1 className="font-signature text-6xl sm:text-7xl text-[#222826] font-normal">
            Corporate Journal
          </h1>
          <p className="text-sm sm:text-base text-[#525D58] font-light max-w-2xl mx-auto">
            Stay updated with official CREST GROUP announcements, new product launches, technology breakthroughs, and strategic developments across our 8 business divisions.
          </p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 md:grid-cols-2 gap-6">
        {news.map((art) => (
          <div
            key={art.id}
            onClick={() => onSelectArticle(art)}
            className="cursor-pointer bg-white rounded-2xl p-6 sm:p-8 border border-[#EAE3D5] hover:border-[#C5A880] transition flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] uppercase tracking-[0.18em]">
                <span className="px-3 py-1 rounded-full bg-[#FAF8F5] border border-[#E8DFD1] text-[#856B49]">
                  {art.category}
                </span>
                <span className="text-[#68746F]">
                  {art.date} • {art.readTime}
                </span>
              </div>
              <h3 className="font-serif text-2xl font-semibold text-[#222826] hover:text-[#856B49] transition">
                {art.title}
              </h3>
              <p className="text-xs sm:text-sm text-[#525D58] font-light leading-relaxed">
                {art.excerpt}
              </p>
            </div>
            <div className="pt-4 border-t border-[#F4EFE6] flex items-center justify-between text-xs uppercase tracking-[0.18em] text-[#222826]">
              <span className="text-[#856B49]">{art.divisionTag}</span>
              <span className="inline-flex items-center gap-1 font-medium">
                Read Article <ArrowUpRight className="w-4 h-4" />
              </span>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
};

/* ============================================================================
   G. PARTNERSHIPS & INVESTMENTS VIEW (WHITE & CREAM)
============================================================================ */
interface PartnershipsViewProps {
  divisions: Division[];
  onSubmitPartnership: (
    req: Omit<PartnershipRequest, 'id' | 'createdAt' | 'status'> & { website_hp?: string }
  ) => Promise<void> | void;
}

export const PartnershipsView: React.FC<PartnershipsViewProps> = ({
  divisions,
  onSubmitPartnership
}) => {
  const [organizationName, setOrganizationName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [partnershipType, setPartnershipType] =
    useState<PartnershipRequest['partnershipType']>('Strategic Collaboration');
  const [targetDivision, setTargetDivision] = useState('CREST Logistics & Transport');
  const [investmentCapacity, setInvestmentCapacity] = useState('$25,000 – $100,000');
  const [proposalSummary, setProposalSummary] = useState('');
  const [websiteHp, setWebsiteHp] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    try {
      const cleanEmail = validateAndSanitizeEmail(email);
      const cleanPhone = validateAndSanitizePhone(phone);
      const cleanSummary = sanitizeText(proposalSummary, 3000);
      if (cleanSummary.length < 10) {
        throw new Error('Please provide at least 10 characters in your proposal summary.');
      }
      setSubmitting(true);
      await onSubmitPartnership({
        organizationName: sanitizeText(organizationName, 160),
        contactPerson: sanitizeText(contactPerson, 120),
        email: cleanEmail,
        phone: cleanPhone,
        partnershipType,
        targetDivision,
        investmentCapacity,
        proposalSummary: cleanSummary,
        website_hp: websiteHp
      });
      setSubmitted(true);
    } catch (err: any) {
      setFormError(err?.message || 'Unable to submit proposal. Please verify your details.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-14 pb-20 bg-[#FAF8F5] text-[#222826]">
      <section className="bg-white pt-28 pb-14 border-b border-[#EAE3D5]">
        <div className="max-w-4xl mx-auto px-6 md:px-12 text-center space-y-4">
          <span className="text-xs uppercase tracking-[0.28em] text-[#856B49] font-light block">
            STRATEGIC PARTNERSHIPS & INVESTMENTS
          </span>
          <h1 className="font-signature text-6xl sm:text-7xl text-[#222826] font-normal">
            Partnerships & Investments
          </h1>
          <p className="text-sm sm:text-base text-[#525D58] font-light max-w-2xl mx-auto">
            CREST Investments & Business Development structures strategic collaborations, joint ventures, technology distribution alliances, and project co-investments across our expanding ecosystem.
          </p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-6 space-y-6">
          <h2 className="font-serif text-3xl font-semibold text-[#222826]">
            Strategic Collaboration Pathways
          </h2>
          <div className="space-y-4">
            {[
              {
                title: 'Technology & SaaS Distribution Alliances',
                desc: 'Partner with CREST Technologies to deploy Copetra AI, CREST School Portal, and TradePOS across regional institutions and enterprises.'
              },
              {
                title: 'Cargoo Logistics & Fleet Partnerships',
                desc: 'Onboard commercial truck fleets, establish corridor consolidation hubs, or co-invest in regional freight technology.'
              },
              {
                title: 'Crest Creamery & FMCG Retail Stockists',
                desc: 'Become an authorized regional distributor or retail supermarket stockist for CREST Foods & Beverages.'
              },
              {
                title: 'Real Estate, Agribusiness & Venture Co-Investment',
                desc: 'Participate in structured joint ventures across property development, commercial farming value chains, and new venture incubation.'
              }
            ].map((item, i) => (
              <div
                key={i}
                className="bg-white p-5 rounded-2xl border border-[#EAE3D5] space-y-1.5"
              >
                <h4 className="font-serif text-lg font-semibold text-[#222826] flex items-center gap-2">
                  <Handshake className="w-5 h-5 text-[#856B49]" />
                  <span>{item.title}</span>
                </h4>
                <p className="text-xs sm:text-sm text-[#525D58] font-light leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>

          <div className="p-5 rounded-2xl bg-[#F5F0E6] text-[#222826] border border-[#D8CBB8] flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-[#856B49] shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <div className="uppercase tracking-[0.2em] text-[#856B49] font-medium">
                Regulatory & Governance Notice
              </div>
              <p className="text-[#525D58] font-light leading-relaxed">
                All investment activities, joint ventures, and capital partnerships under CREST Investments & Business Development are undertaken strictly subject to applicable regulatory requirements and approvals.
              </p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#EAE3D5] shadow-xs">
            <span className="text-[10px] uppercase tracking-[0.25em] text-[#856B49] font-light">
              EXECUTIVE PARTNERSHIP DESK
            </span>
            <h3 className="font-serif text-2xl sm:text-3xl font-semibold text-[#222826] mt-1 mb-6">
              Submit a Partnership Proposal
            </h3>

            {submitted ? (
              <div className="p-6 text-center space-y-4 bg-[#FAF8F5] rounded-2xl border border-[#D8CBB8]">
                <CheckCircle2 className="w-12 h-12 text-[#856B49] mx-auto" />
                <h4 className="font-serif text-2xl font-semibold text-[#222826]">
                  Proposal Received
                </h4>
                <p className="text-xs sm:text-sm text-[#525D58] font-light">
                  Thank you, <strong>{contactPerson}</strong> ({organizationName}). Your proposal for{' '}
                  <strong>{targetDivision}</strong> has been logged into the CREST Administrative System.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="px-5 py-2.5 rounded-lg bg-[#222826] text-white text-xs uppercase tracking-[0.2em]"
                >
                  Submit Another Proposal
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] uppercase tracking-[0.18em] text-[#525D58] mb-1">
                      Organization / Investor *
                    </label>
                    <input
                      type="text"
                      required
                      value={organizationName}
                      onChange={(e) => setOrganizationName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#E8DFD1] text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] uppercase tracking-[0.18em] text-[#525D58] mb-1">
                      Contact Person *
                    </label>
                    <input
                      type="text"
                      required
                      value={contactPerson}
                      onChange={(e) => setContactPerson(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#E8DFD1] text-sm"
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
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#E8DFD1] text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] uppercase tracking-[0.18em] text-[#525D58] mb-1">
                      Direct Phone / WhatsApp *
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
                      Partnership Model
                    </label>
                    <select
                      value={partnershipType}
                      onChange={(e) => setPartnershipType(e.target.value as any)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#E8DFD1] text-sm"
                    >
                      <option value="Strategic Collaboration">Strategic Collaboration</option>
                      <option value="Joint Venture">Joint Venture</option>
                      <option value="Equity / Project Investment">Equity / Project Investment</option>
                      <option value="Distribution & Supply Chain">Distribution & Supply Chain</option>
                      <option value="Technology Integration">Technology Integration</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] uppercase tracking-[0.18em] text-[#525D58] mb-1">
                      Target Division
                    </label>
                    <select
                      value={targetDivision}
                      onChange={(e) => setTargetDivision(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#E8DFD1] text-sm"
                    >
                      {divisions.map((d) => (
                        <option key={d.id} value={d.name}>
                          {d.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-[0.18em] text-[#525D58] mb-1">
                    Estimated Capacity
                  </label>
                  <select
                    value={investmentCapacity}
                    onChange={(e) => setInvestmentCapacity(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#E8DFD1] text-sm"
                  >
                    <option value="Commercial / Non-Equity Alliance">Commercial / Non-Equity Alliance</option>
                    <option value="$10,000 – $25,000">$10,000 – $25,000</option>
                    <option value="$25,000 – $100,000">$25,000 – $100,000</option>
                    <option value="$100,000 – $500,000">$100,000 – $500,000</option>
                    <option value="$500,000+ Institutional">$500,000+ Institutional</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-[0.18em] text-[#525D58] mb-1">
                    Proposal Summary *
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={proposalSummary}
                    onChange={(e) => setProposalSummary(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#FAF8F5] border border-[#E8DFD1] text-sm"
                  />
                </div>

                {/* Anti-bot honeypot field (hidden from real users) */}
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
                  className="w-full py-3.5 rounded-lg bg-[#222826] hover:bg-[#353E3B] disabled:opacity-50 text-white text-xs uppercase tracking-[0.22em] font-medium cursor-pointer"
                >
                  {submitting ? 'Encrypting & Transmitting...' : 'Transmit Partnership Proposal'}
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* Opportunity Pipeline 2026 Showcase */}
      <section className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-[#EAE3D5] space-y-8 shadow-xs">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-[10px] uppercase tracking-[0.25em] text-[#856B49] font-semibold block">
              OPPORTUNITY PIPELINE 2026
            </span>
            <h3 className="font-serif text-3xl font-semibold text-[#222826]">
              Active Projects Seeking Capital & Strategic Partners
            </h3>
            <p className="text-xs sm:text-sm text-[#525D58] font-light leading-relaxed">
              Explore our primary business ventures currently open for strategic sponsorship, joint-venture equity, and regional distribution alliances.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              {
                name: 'Copetra AI Engine',
                sector: 'Enterprise AI & SaaS',
                status: 'Seeking Infrastructure & Growth Capital',
                desc: 'Intelligent enterprise decision automation, business process AI, and corporate assistant platform.'
              },
              {
                name: 'Cargoo Marketplace',
                sector: 'Freight & Logistics Tech',
                status: 'Seeking Fleet Co-Founders & Investors',
                desc: 'Digital regional freight corridor connecting verified transport fleets with cargo shippers.'
              },
              {
                name: 'Crest Creamery Foods',
                sector: 'FMCG Food Processing',
                status: 'Seeking Plant Expansion Capital',
                desc: 'Modern artisanal dairy confectionery, signature ice cream, and industrial dairy packaging plant.'
              },
              {
                name: 'Commercial Real Estate',
                sector: 'Property & Agribusiness',
                status: 'Seeking Land & Cold-Chain Partners',
                desc: 'Strategic acquisition of commercial warehousing, prime urban development, and cold-chain hubs.'
              }
            ].map((item, idx) => (
              <div
                key={idx}
                className="bg-[#FAF8F5] rounded-2xl p-6 border border-[#EFEAE1] space-y-3 flex flex-col justify-between hover:border-[#856B49]/40 transition"
              >
                <div className="space-y-2">
                  <span className="text-[9px] uppercase tracking-wider text-[#856B49] font-medium block">
                    {item.sector}
                  </span>
                  <h4 className="font-serif text-lg font-semibold text-[#222826]">{item.name}</h4>
                  <p className="text-xs text-[#525D58] font-light leading-relaxed">{item.desc}</p>
                </div>
                <div className="pt-3 border-t border-[#E8DFD1]/80 text-[11px] text-[#856B49] font-medium">
                  {item.status}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

/* ============================================================================
   H. CAREERS & INTERNSHIPS VIEW (WHITE & CREAM)
============================================================================ */
interface CareersViewProps {
  careers: CareerOpening[];
  onSelectJob: (job: CareerOpening) => void;
}

export const CareersView: React.FC<CareersViewProps> = ({ careers, onSelectJob }) => {
  return (
    <div className="space-y-12 pb-20 bg-[#FAF8F5] text-[#222826]">
      <section className="bg-white pt-28 pb-14 border-b border-[#EAE3D5]">
        <div className="max-w-4xl mx-auto px-6 md:px-12 text-center space-y-4">
          <span className="text-xs uppercase tracking-[0.28em] text-[#856B49] font-light block">
            CAREERS, INTERNSHIPS & TALENT ACQUISITION
          </span>
          <h1 className="font-signature text-6xl sm:text-7xl text-[#222826] font-normal">
            Careers at Crest
          </h1>
          <p className="text-sm sm:text-base text-[#525D58] font-light max-w-2xl mx-auto">
            Join an ambitious team of software engineers, AI researchers, digital strategists, logistics coordinators, and business builders shaping multiple industries.
          </p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 md:px-12 space-y-6">
        {careers.map((job) => (
          <div
            key={job.id}
            className="bg-white rounded-2xl p-6 sm:p-8 border border-[#EAE3D5] hover:border-[#C5A880] flex flex-col lg:flex-row lg:items-center justify-between gap-6"
          >
            <div className="space-y-3 max-w-3xl">
              <div className="flex flex-wrap items-center gap-2 text-[10px] uppercase tracking-[0.18em]">
                <span className="px-3 py-1 rounded-full bg-[#FAF8F5] border border-[#E8DFD1] text-[#222826]">
                  {job.division}
                </span>
                <span className="px-3 py-1 rounded-full bg-[#F5F0E6] text-[#856B49]">
                  {job.type}
                </span>
                <span className="text-[#68746F]">
                  {job.location} • {job.experience}
                </span>
              </div>
              <h3 className="font-serif text-2xl font-semibold text-[#222826]">{job.title}</h3>
              <p className="text-xs sm:text-sm text-[#525D58] font-light">{job.summary}</p>
              <div className="flex flex-wrap gap-2 pt-1">
                {job.requirements.map((r, i) => (
                  <span
                    key={i}
                    className="text-xs bg-[#FAF8F5] px-3 py-1 rounded-lg border border-[#EFEAE1] text-[#525D58] font-light"
                  >
                    • {r}
                  </span>
                ))}
              </div>
            </div>

            <div className="shrink-0">
              <button
                onClick={() => onSelectJob(job)}
                className="w-full lg:w-auto px-6 py-3.5 rounded-lg bg-[#222826] hover:bg-[#353E3B] text-white text-xs uppercase tracking-[0.2em] font-medium flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Apply Now</span>
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
};

/* ============================================================================
   I. CONTACT US & DEDICATED FULL-PAGE QUOTATION / BOOKING VIEW
============================================================================ */
interface ContactViewProps {
  divisions: Division[];
  defaultDivision?: string;
  defaultService?: string;
  onSubmitInquiry: (
    inquiry: Omit<CustomerInquiry, 'id' | 'createdAt' | 'status'> & { website_hp?: string }
  ) => Promise<void> | void;
}

export const ContactView: React.FC<ContactViewProps> = ({
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
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (defaultDivision) setDivision(defaultDivision);
    if (defaultService) setServiceOrProduct(defaultService);
  }, [defaultDivision, defaultService]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    try {
      const cleanEmail = validateAndSanitizeEmail(email);
      const cleanPhone = validateAndSanitizePhone(phone);
      const cleanMessage = sanitizeText(message, 2500);
      if (cleanMessage.length < 5) {
        throw new Error('Please provide at least 5 characters describing your inquiry.');
      }
      setSubmitting(true);
      await onSubmitInquiry({
        fullName: sanitizeText(fullName, 120),
        organization: sanitizeText(organization, 160) || 'Private Client',
        email: cleanEmail,
        phone: cleanPhone,
        division,
        serviceOrProduct: sanitizeText(serviceOrProduct, 180) || 'Department Inquiry & Consultation',
        budgetRange,
        message: cleanMessage,
        website_hp: websiteHp
      });
      setSent(true);
    } catch (err: any) {
      setFormError(err?.message || 'Unable to submit inquiry. Please verify your inputs.');
    } finally {
      setSubmitting(false);
    }
  };

  const whatsappUrl = `https://wa.me/255779304500?text=${encodeURIComponent(
    `Hello CREST GROUP,\nName: ${fullName || 'Client'}\nOrganization: ${organization || 'N/A'}\nDivision: ${division}\nService/Product: ${serviceOrProduct || 'Inquiry'}\nDetails: ${message}`
  )}`;

  return (
    <div className="space-y-14 pb-24 bg-[#FAF8F5] text-[#222826]">
      {/* Editorial Header */}
      <section className="bg-white pt-32 pb-16 border-b border-[#EAE3D5]">
        <div className="max-w-4xl mx-auto px-6 md:px-12 text-center space-y-4">
          <span className="text-xs uppercase tracking-[0.28em] text-[#856B49] font-light block">
            CENTRAL DIGITAL GATEWAY • BOOK AN INTRODUCTION
          </span>
          <h1 className="font-serif text-4xl sm:text-6xl font-normal text-[#222826] tracking-tight">
            Request a Quotation.
          </h1>
          <p className="text-sm sm:text-base text-[#525D58] font-light max-w-2xl mx-auto leading-relaxed">
            Direct routing to our specialized division leadership and executive desk. Tell us about your project requirements or corporate partnership goals.
          </p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 md:px-12 grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Left Side: Corporate Channels & Office Details */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-3xl p-8 border border-[#EAE3D5] shadow-xs space-y-6">
            <div>
              <span className="text-[10px] uppercase tracking-[0.25em] text-[#856B49]">
                OFFICIAL COMMUNICATION CHANNELS
              </span>
              <h3 className="font-serif text-2xl font-semibold text-[#222826] mt-1">
                Corporate Headquarters
              </h3>
            </div>

            <div className="space-y-5 text-xs sm:text-sm font-light text-[#525D58]">
              <div className="flex items-start gap-3.5">
                <MapPin className="w-5 h-5 text-[#856B49] shrink-0 mt-0.5" />
                <div>
                  <div className="font-medium text-[#222826]">Corporate Location</div>
                  <div className="text-xs text-[#525D58] mt-0.5">
                    CREST GROUP Corporate Tower, Dar es Salaam, Tanzania
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <PhoneCall className="w-5 h-5 text-[#856B49] shrink-0 mt-0.5" />
                <div>
                  <div className="font-medium text-[#222826]">Direct Hotline & Concierge</div>
                  <div className="text-xs text-[#525D58] mt-0.5">
                    <a href="tel:+255779304500" className="hover:text-[#856B49] font-medium transition">
                      +255 779 304 500
                    </a>{' '}
                    (Mon–Sat, 08:00 – 19:00 EAT)
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3.5">
                <Mail className="w-5 h-5 text-[#856B49] shrink-0 mt-0.5" />
                <div>
                  <div className="font-medium text-[#222826]">Official Emails</div>
                  <div className="space-y-0.5 text-xs text-[#525D58] mt-0.5 font-mono">
                    <div>info@crestgroup.co.tz</div>
                    <div>tech@crestgroup.co.tz</div>
                    <div>cargoo@crestgroup.co.tz</div>
                    <div>partnerships@crestgroup.co.tz</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-[#F4EFE6]">
              <a
                href="https://wa.me/255779304500?text=Hello%20CREST%20GROUP%2C%20I%20would%20like%20to%20speak%20with%20your%20corporate%20team."
                target="_blank"
                rel="noreferrer"
                className="w-full py-4 px-6 rounded-full bg-[#1A1A19] hover:bg-[#333330] text-white text-xs uppercase tracking-[0.2em] font-medium flex items-center justify-center gap-2 transition"
              >
                <MessageSquare className="w-4 h-4 text-[#C5A880]" />
                <span>Chat Instantly via WhatsApp</span>
              </a>
            </div>
          </div>

          {/* SLA Assurance Card */}
          <div className="p-6 rounded-3xl bg-[#F5F0E6] border border-[#D8CBB8] space-y-2">
            <span className="text-[10px] uppercase tracking-[0.22em] text-[#856B49] font-medium block">
              EXECUTIVE RESPONSE GUARANTEE
            </span>
            <p className="text-xs text-[#525D58] font-light leading-relaxed">
              Every inquiry is reviewed directly by the respective business division leadership. Expect an official project consultation response within 24 business hours.
            </p>
          </div>
        </div>

        {/* Right Side: Full Dedicated Page Form (Not a popup modal!) */}
        <div className="lg:col-span-7">
          <div className="bg-white rounded-3xl p-8 sm:p-12 border border-[#EAE3D5] shadow-xs">
            <div className="mb-8">
              <span className="text-[10px] uppercase tracking-[0.25em] text-[#856B49] block">
                OFFICIAL INQUIRY FORM
              </span>
              <h3 className="font-serif text-3xl font-normal text-[#222826] mt-1">
                Tell us about your requirements
              </h3>
              <p className="text-xs text-[#525D58] font-light mt-1">
                Fill in the details below to receive a formal corporate proposal or quotation.
              </p>
            </div>

            {sent ? (
              <div className="p-10 text-center space-y-5 bg-[#FAF8F5] rounded-3xl border border-[#D8CBB8]">
                <div className="w-16 h-16 rounded-full bg-white text-[#856B49] flex items-center justify-center mx-auto border border-[#E5DEC9] shadow-xs">
                  <CheckCircle2 className="w-8 h-8 text-[#856B49]" />
                </div>
                <h4 className="font-serif text-3xl font-semibold text-[#222826]">
                  Inquiry Transmitted Successfully
                </h4>
                <p className="text-sm text-[#525D58] font-light max-w-md mx-auto leading-relaxed">
                  Thank you, <strong>{fullName}</strong>. Your inquiry for <strong>{division}</strong> has been received by our executive desk.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3">
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-6 py-3.5 rounded-full bg-[#1A1A19] text-white text-xs uppercase tracking-[0.2em] font-medium flex items-center gap-2"
                  >
                    <MessageSquare className="w-4 h-4 text-[#C5A880]" />
                    <span>Send Copy via WhatsApp</span>
                  </a>
                  <button
                    onClick={() => setSent(false)}
                    className="px-6 py-3.5 rounded-full bg-white text-[#222826] border border-[#D8CBB8] text-xs uppercase tracking-[0.2em] font-medium cursor-pointer"
                  >
                    Submit Another Inquiry
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSend} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-[11px] uppercase tracking-[0.18em] text-[#525D58] mb-1.5 font-medium">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Eng. John Mwakasege"
                      className="w-full px-4 py-3 rounded-xl bg-[#FAF8F5] border border-[#E8DFD1] text-sm focus:outline-none focus:border-[#C5A880] focus:bg-white transition"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] uppercase tracking-[0.18em] text-[#525D58] mb-1.5 font-medium">
                      Company / Organization
                    </label>
                    <input
                      type="text"
                      value={organization}
                      onChange={(e) => setOrganization(e.target.value)}
                      placeholder="e.g. Apex Enterprises Ltd"
                      className="w-full px-4 py-3 rounded-xl bg-[#FAF8F5] border border-[#E8DFD1] text-sm focus:outline-none focus:border-[#C5A880] focus:bg-white transition"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-[11px] uppercase tracking-[0.18em] text-[#525D58] mb-1.5 font-medium">
                      Official Email *
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@company.com"
                      className="w-full px-4 py-3 rounded-xl bg-[#FAF8F5] border border-[#E8DFD1] text-sm focus:outline-none focus:border-[#C5A880] focus:bg-white transition"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] uppercase tracking-[0.18em] text-[#525D58] mb-1.5 font-medium">
                      Phone / WhatsApp Number *
                    </label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+255 7XX XXX XXX"
                      className="w-full px-4 py-3 rounded-xl bg-[#FAF8F5] border border-[#E8DFD1] text-sm focus:outline-none focus:border-[#C5A880] focus:bg-white transition"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-[11px] uppercase tracking-[0.18em] text-[#525D58] mb-1.5 font-medium">
                      Target Business Division *
                    </label>
                    <select
                      value={division}
                      onChange={(e) => setDivision(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-[#FAF8F5] border border-[#E8DFD1] text-sm focus:outline-none focus:border-[#C5A880] focus:bg-white transition"
                    >
                      {divisions.map((d) => (
                        <option key={d.id} value={d.name}>
                          {d.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] uppercase tracking-[0.18em] text-[#525D58] mb-1.5 font-medium">
                      Estimated Budget / Scope
                    </label>
                    <select
                      value={budgetRange}
                      onChange={(e) => setBudgetRange(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-[#FAF8F5] border border-[#E8DFD1] text-sm focus:outline-none focus:border-[#C5A880] focus:bg-white transition"
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
                  <label className="block text-[11px] uppercase tracking-[0.18em] text-[#525D58] mb-1.5 font-medium">
                    Specific Product, Software, or Service of Interest
                  </label>
                  <input
                    type="text"
                    value={serviceOrProduct}
                    onChange={(e) => setServiceOrProduct(e.target.value)}
                    placeholder="e.g. Copetra AI, CREST School Portal, TradePOS, Cargoo, Custom Mobile App..."
                    className="w-full px-4 py-3 rounded-xl bg-[#FAF8F5] border border-[#E8DFD1] text-sm focus:outline-none focus:border-[#C5A880] focus:bg-white transition"
                  />
                </div>

                <div>
                  <label className="block text-[11px] uppercase tracking-[0.18em] text-[#525D58] mb-1.5 font-medium">
                    Project Requirements / Message Brief *
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Describe your goals, project scope, timeline, or questions..."
                    className="w-full px-4 py-3 rounded-xl bg-[#FAF8F5] border border-[#E8DFD1] text-sm focus:outline-none focus:border-[#C5A880] focus:bg-white transition"
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

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-4 rounded-full bg-[#1A1A19] hover:bg-[#333330] disabled:opacity-50 text-white text-xs uppercase tracking-[0.22em] font-medium transition flex items-center justify-center gap-2 cursor-pointer shadow-sm"
                  >
                    <Send className="w-4 h-4 text-[#C5A880]" />
                    <span>{submitting ? 'Encrypting & Submitting...' : 'Submit Official Quotation Request'}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};
