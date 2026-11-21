import React, { useState, useEffect } from 'react';
import {
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  Smartphone,
  Eye,
  Target,
  Compass,
  Code2,
  Database,
  Server,
  Lock,
  Handshake,
  TrendingUp,
  Building2
} from 'lucide-react';
import {
  ActiveTab,
  Division,
  ProductItem,
  ProjectItem,
  NewsArticle,
  ExpansionPhase
} from '../types/ecosystem';
import { getDivisionIcon } from './Navbar';
import { DEVELOPMENT_ROADMAP } from '../data/crestData';

interface HomeViewProps {
  divisions: Division[];
  products: ProductItem[];
  projects: ProjectItem[];
  news: NewsArticle[];
  setActiveTab: (tab: ActiveTab) => void;
  onSelectDivision: (divisionId: string) => void;
  onSelectProduct: (product: ProductItem) => void;
  onSelectArticle: (article: NewsArticle) => void;
  onOpenQuoteModal: (defaultDivision?: string, defaultService?: string) => void;
}

const INVESTOR_SHOWCASE_SLIDES = [
  {
    title: 'Copetra AI Engine',
    sector: 'Enterprise AI & Automation',
    status: 'Seeking Infrastructure & Growth Capital',
    desc: 'Proprietary enterprise decision intelligence, localized business LLMs, and institution workflow automation.',
    image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1600&q=85',
    animClass: 'anim-showcase-0'
  },
  {
    title: 'Cargoo Freight Marketplace',
    sector: 'Digital Freight & Logistics Fleet Network',
    status: 'Seeking Fleet Co-Founders & Investors',
    desc: 'Regional digital cargo network linking commercial transport fleets with cargo shippers across major trade corridors.',
    image: 'https://images.unsplash.com/photo-1519003722824-194d4455a60c?auto=format&fit=crop&w=1600&q=85',
    animClass: 'anim-showcase-1'
  },
  {
    title: 'Crest Creamery Foods',
    sector: 'FMCG Dairy & Confectionery Plant',
    status: 'Seeking Plant Expansion Capital',
    desc: 'Modern industrial processing and packaging plant for artisanal confectionery, ice cream, and dairy FMCG products.',
    image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=1600&q=85',
    animClass: 'anim-showcase-2'
  },
  {
    title: 'Commercial Real Estate Hubs',
    sector: 'Warehousing & Agribusiness Logistics Hubs',
    status: 'Seeking Land & Joint-Venture Partners',
    desc: 'Strategic acquisition of cold-chain logistics hubs, prime commercial land, and modern agribusiness warehousing.',
    image: 'https://images.unsplash.com/photo-1486325212027-8081e485255e?auto=format&fit=crop&w=1600&q=85',
    animClass: 'anim-showcase-3'
  }
];

export const HomeView: React.FC<HomeViewProps> = ({
  divisions,
  products,
  news,
  setActiveTab,
  onSelectDivision,
  onSelectProduct,
  onSelectArticle,
  onOpenQuoteModal
}) => {
  const [phaseFilter, setPhaseFilter] = useState<'ALL' | ExpansionPhase>('ALL');
  const [activeSlide, setActiveSlide] = useState(0);

  // Auto rotate investor showcase images every 3 seconds with different animations
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % INVESTOR_SHOWCASE_SLIDES.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  const filteredDivisions =
    phaseFilter === 'ALL'
      ? divisions
      : divisions.filter((d) => d.phase === phaseFilter);

  const navTo = (tab: ActiveTab) => {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="space-y-0 bg-[#FAF8F5] text-[#222826]">
      {/* =====================================================================
          1. EXACT SEREIN WEALTH HERO (FULL SCENIC LANDSCAPE BACKGROUND + MINIMAL COPY)
      ===================================================================== */}
      <section className="relative h-[92vh] min-h-[620px] w-full overflow-hidden flex items-center justify-center bg-[#D6CFC2]">
        {/* Full-bleed Scenic Landscape Video-Motion Reel */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=2400&q=90"
            alt="CREST GROUP Ecosystem Horizon"
            className="w-full h-full object-cover object-center scale-105 animate-video-reel filter brightness-[0.92] contrast-[1.05]"
          />
          {/* Serein Wealth Soft Warm Atmospheric Scrim */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#2E2820]/40 via-[#2E2820]/45 to-[#24201A]/60 z-10 pointer-events-none" />
        </div>

        {/* Minimal Centered Hero Copy (Exact Serein Wealth Layout - Few Words, No Clutter) */}
        <div className="relative z-20 max-w-4xl mx-auto px-6 text-center space-y-6 pt-12">
          {/* Small Uppercase Kicker */}
          <p className="text-[11px] sm:text-xs uppercase tracking-[0.28em] text-white/90 font-medium">
            ONE GROUP • MULTIPLE INDUSTRIES • EST. 2026
          </p>

          {/* Tall Editorial Two-Line Serif Headline */}
          <h1 className="font-serif text-5xl sm:text-7xl md:text-[82px] text-white font-normal leading-[1.04] tracking-tight drop-shadow-xs">
            Multiple industries,
            <br />
            built around you.
          </h1>

          {/* Short Two-Line Centered Subtitle */}
          <p className="text-sm sm:text-base md:text-lg text-white/90 font-light max-w-xl mx-auto leading-relaxed">
            We bring technology, digital media, logistics, food production, and long-term investments into one coordinated ecosystem.
          </p>

          {/* Single Centered Warm Pill Button with Italic Serif Text (Exact Serein Style) */}
          <div className="pt-2">
            <button
              onClick={() => onOpenQuoteModal()}
              className="px-10 py-4 rounded-full bg-[#8B5E4B] hover:bg-[#774E3D] text-white font-serif italic text-lg sm:text-xl tracking-wide shadow-lg hover:scale-[1.02] transition-all cursor-pointer"
            >
              Book an introduction
            </button>
          </div>
        </div>
      </section>

      {/* =====================================================================
          1.5 INVEST WITH US (CLEAN OPEN EDITORIAL LAYOUT — WITHOUT FORM)
      ===================================================================== */}
      <section className="py-14 sm:py-20 md:py-24 px-6 md:px-12 bg-white border-b border-[#EFEAE1]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
          
          {/* Left Column: Clean Open Editorial Typography (Without Form) */}
          <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
            <div className="space-y-2">
              <h2 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-normal text-[#1A1A19] tracking-tight leading-[1.1]">
                Invest With Us.
              </h2>
              <p className="font-serif italic text-xl sm:text-2xl text-[#8B5E4B] font-normal">
                Building High-Impact Ventures Across East Africa
              </p>
            </div>

            <p className="text-sm sm:text-base text-[#525D58] font-light leading-relaxed max-w-xl mx-auto lg:mx-0">
              CREST GROUP is a diversified corporate enterprise operating across proprietary software, Artificial Intelligence, modern freight logistics, agro-processing, and commercial real estate. We invite project sponsors, equity partners, and strategic co-funders to co-build and accelerate our flagship ventures.
            </p>

            {/* Clean Venture Highlights (Pure Typography - No Boxes / No Forms) */}
            <div className="pt-2 pb-2 space-y-3 border-l-2 border-[#8B5E4B]/40 pl-5 text-left max-w-xl mx-auto lg:mx-0">
              <div>
                <span className="font-serif font-semibold text-sm sm:text-base text-[#1A1A19]">Copetra AI Engine</span>
                <span className="text-xs sm:text-sm text-[#525D58] block font-light">Enterprise AI & Decision Workflow Automation</span>
              </div>
              <div>
                <span className="font-serif font-semibold text-sm sm:text-base text-[#1A1A19]">Cargoo Freight Marketplace</span>
                <span className="text-xs sm:text-sm text-[#525D58] block font-light">Logistics Technology & Regional Fleet Network</span>
              </div>
              <div>
                <span className="font-serif font-semibold text-sm sm:text-base text-[#1A1A19]">Crest Creamery Foods</span>
                <span className="text-xs sm:text-sm text-[#525D58] block font-light">Artisanal Dairy & Industrial Confectionery Plant</span>
              </div>
              <div>
                <span className="font-serif font-semibold text-sm sm:text-base text-[#1A1A19]">Commercial Real Estate</span>
                <span className="text-xs sm:text-sm text-[#525D58] block font-light">Strategic Land Acquisition & Cold-Chain Agribusiness Hubs</span>
              </div>
            </div>

            {/* Action Buttons (Button Color #8B5E4B) */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-3">
              <button
                onClick={() => navTo('partnerships')}
                className="px-8 py-4 rounded-full bg-[#8B5E4B] hover:bg-[#774E3D] text-white text-xs uppercase tracking-[0.22em] font-medium transition flex items-center gap-2.5 cursor-pointer shadow-md hover:scale-[1.02]"
              >
                <span>View Full Details</span>
                <ArrowUpRight className="w-4 h-4 text-white" />
              </button>
              <a
                href="https://wa.me/255779304500?text=Hello%20CREST%20GROUP%2C%20I%20am%20interested%20in%20investment%20and%20partnership%20opportunities."
                target="_blank"
                rel="noreferrer"
                className="px-7 py-4 rounded-full bg-transparent hover:bg-[#FAF5EE] text-[#8B5E4B] border border-[#8B5E4B] text-xs uppercase tracking-[0.2em] font-medium transition cursor-pointer flex items-center gap-2"
              >
                <span>Investor WhatsApp Desk</span>
              </a>
            </div>
          </div>

          {/* Right Column: Large Normal Image (Straight Edges, No Words Inside) */}
          <div className="lg:col-span-6 w-full">
            <div className="relative h-[420px] sm:h-[480px] lg:h-[540px] w-full overflow-hidden shadow-lg bg-[#FAF8F5]">
              {INVESTOR_SHOWCASE_SLIDES.map((slide, idx) => {
                const isActive = idx === activeSlide;
                return (
                  <div
                    key={idx}
                    className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${
                      isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
                    }`}
                  >
                    <img
                      src={slide.image}
                      alt={slide.title}
                      className={`w-full h-full object-cover ${isActive ? slide.animClass : ''}`}
                    />
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </section>

      {/* =====================================================================
          2. OUR PURPOSE: VISION, MISSION & OUR IDENTITY (EXACT AS IMAGE 2)
      ===================================================================== */}
      <section className="py-16 md:py-20 px-6 md:px-12 bg-white border-b border-[#EFEAE1]">
        <div className="max-w-7xl mx-auto">
          {/* Center Divider */}
          <div className="relative mb-12 flex items-center justify-center">
            <div className="border-t border-[#E8DFD1] w-full absolute inset-0 my-auto" />
            <div className="relative bg-white px-6 text-center">
              <div className="font-serif tracking-[0.3em] text-base md:text-lg font-bold uppercase text-[#222826]">
                OUR PURPOSE
              </div>
              <div className="tracking-[0.4em] text-[8px] sm:text-[9px] uppercase font-light text-[#856B49] mt-0.5">
                VISION • MISSION • IDENTITY
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-5 space-y-4">
              <span className="text-xs uppercase tracking-[0.25em] text-[#856B49] font-light">
                Corporate Digital Platform
              </span>
              <h2 className="font-signature text-5xl sm:text-6xl text-[#222826] font-normal leading-tight">
                Our Identity
              </h2>
              <p className="text-sm sm:text-base text-[#525D58] font-light leading-relaxed">
                Unlike a conventional company website, this platform represents the entire CREST GROUP ecosystem—serving as a central digital gateway where customers, corporate partners, and investors can discover services, explore proprietary products, request quotations, and establish strategic partnerships.
              </p>
              <div className="pt-2">
                <button
                  onClick={() => navTo('about')}
                  className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-[#222826] hover:text-[#856B49] font-medium border-b border-[#C5A880] pb-1 transition cursor-pointer"
                >
                  <span>Read Full Corporate Story</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div className="bg-[#FAF8F5] p-6 rounded-2xl border border-[#EAE3D5] space-y-3">
                <div className="w-10 h-10 rounded-xl bg-white border border-[#E8DFD1] text-[#856B49] flex items-center justify-center">
                  <Eye className="w-5 h-5" />
                </div>
                <h3 className="font-serif text-lg font-semibold uppercase tracking-wider text-[#222826]">
                  Vision
                </h3>
                <p className="text-xs text-[#525D58] font-light leading-relaxed">
                  To establish a globally respected, diversified corporate ecosystem driving innovation across technology, commerce, logistics, and essential industries.
                </p>
              </div>

              <div className="bg-[#FAF8F5] p-6 rounded-2xl border border-[#EAE3D5] space-y-3">
                <div className="w-10 h-10 rounded-xl bg-white border border-[#E8DFD1] text-[#856B49] flex items-center justify-center">
                  <Target className="w-5 h-5" />
                </div>
                <h3 className="font-serif text-lg font-semibold uppercase tracking-wider text-[#222826]">
                  Mission
                </h3>
                <p className="text-xs text-[#525D58] font-light leading-relaxed">
                  To build scalable digital platforms, high-impact media strategies, efficient freight networks, quality food products, and enduring cross-sector ventures.
                </p>
              </div>

              <div className="bg-[#F5F0E6] p-6 rounded-2xl border border-[#D8CBB8] space-y-3">
                <div className="w-10 h-10 rounded-xl bg-white border border-[#E8DFD1] text-[#856B49] flex items-center justify-center">
                  <Compass className="w-5 h-5" />
                </div>
                <h3 className="font-serif text-lg font-semibold uppercase tracking-wider text-[#222826]">
                  Positioning
                </h3>
                <p className="text-xs text-[#525D58] font-light leading-relaxed">
                  A diversified, technology-driven business group uniting 8 specialized divisions under one seamless digital architecture.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          3. OUR BUSINESS AREAS (COMPACT, SHORT CARDS, NO "DIVISION" WORDING)
      ===================================================================== */}
      <section className="py-14 md:py-16 px-6 md:px-12 bg-[#FAF8F5] border-b border-[#EFEAE1]">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Center Divider */}
          <div className="relative mb-6 flex items-center justify-center">
            <div className="border-t border-[#E5DEC9] w-full absolute inset-0 my-auto" />
            <div className="relative bg-[#FAF8F5] px-6 text-center">
              <div className="font-serif tracking-[0.3em] text-base md:text-lg font-bold uppercase text-[#222826]">
                OUR BUSINESS AREAS
              </div>
              <div className="tracking-[0.4em] text-[8px] sm:text-[9px] uppercase font-light text-[#856B49] mt-0.5">
                STRATEGIC PORTFOLIO
              </div>
            </div>
          </div>

          <div>
            <h2 className="font-signature text-5xl sm:text-6xl text-[#222826] font-normal">
              Our Ecosystem
            </h2>
            <p className="text-sm text-[#525D58] font-light max-w-xl mt-1">
              Explore our core sectors—complete with activities, proprietary solutions, projects, and direct inquiry gateways.
            </p>
          </div>

          {/* Compact, Short Cards (Clean, No Phase Pills, No Number Pills) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {divisions.map((div) => {
              return (
                <div
                  key={div.id}
                  onClick={() => onSelectDivision(div.id)}
                  className="group bg-white rounded-2xl border border-[#EAE3D5] hover:border-[#C5A880] shadow-2xs hover:shadow-md transition-all duration-300 flex flex-col justify-between overflow-hidden cursor-pointer"
                >
                  <div>
                    {/* Compact Photo */}
                    <div className="relative h-36 overflow-hidden bg-white border-b border-[#F4EFE6] flex items-center justify-center">
                      <img
                        src={div.heroImage}
                        alt={div.name}
                        className={`w-full h-full ${
                          div.heroImage.startsWith('/crest-')
                            ? 'object-contain p-4'
                            : 'object-cover'
                        } group-hover:scale-105 transition duration-700`}
                      />
                    </div>

                    {/* Compact Card Body - Short, Clean, No bloated services list */}
                    <div className="p-4 space-y-2">
                      <div className="flex items-center gap-1.5 text-[#856B49]">
                        {getDivisionIcon(div.iconName, 'w-3.5 h-3.5')}
                        <span className="text-[10px] uppercase tracking-[0.2em] font-medium">
                          {div.shortName}
                        </span>
                      </div>

                      <h3 className="font-serif text-base font-semibold uppercase tracking-wide text-[#222826] leading-snug group-hover:text-[#856B49] transition">
                        {div.name}
                      </h3>

                      <p className="text-xs text-[#525D58] font-light line-clamp-2 leading-relaxed">
                        {div.tagline}
                      </p>
                    </div>
                  </div>

                  {/* Compact Bottom Footer */}
                  <div className="px-4 pb-4 pt-2 border-t border-[#F8F5EE] flex items-center justify-between text-xs">
                    <span className="text-[10px] uppercase tracking-[0.18em] font-medium text-[#222826] group-hover:text-[#856B49] inline-flex items-center gap-1 transition">
                      Explore Area
                      <ArrowUpRight className="w-3.5 h-3.5 text-[#856B49]" />
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenQuoteModal(div.name);
                      }}
                      className="text-[10px] uppercase tracking-wider text-[#856B49] hover:underline"
                    >
                      Inquire
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

            {/* =====================================================================
          4. PROPRIETARY PRODUCTS & SOLUTIONS (WHITE SURFACE)
      ===================================================================== */}
      <section className="py-16 md:py-20 px-6 md:px-12 bg-white border-b border-[#EFEAE1]">
        <div className="max-w-7xl mx-auto space-y-10">
          {/* Center Divider */}
          <div className="relative mb-6 flex items-center justify-center">
            <div className="border-t border-[#E8DFD1] w-full absolute inset-0 my-auto" />
            <div className="relative bg-white px-6 text-center">
              <div className="font-serif tracking-[0.3em] text-base md:text-lg font-bold uppercase text-[#222826]">
                PRODUCTS & SOLUTIONS
              </div>
              <div className="tracking-[0.4em] text-[8px] sm:text-[9px] uppercase font-light text-[#856B49] mt-0.5">
                PROPRIETARY PLATFORMS
              </div>
            </div>
          </div>

          {/* Centered Editorial Header (Maneno Machache, Kichwa Katikati) */}
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="font-signature text-5xl sm:text-6xl text-[#222826] font-normal">
              Signature Platforms
            </h2>
            <p className="text-sm text-[#525D58] font-light">
              Proprietary technology solutions built for African enterprise and institutions.
            </p>
          </div>

          {/* Clean Minimal Cards: List Kitu, Mtu Akifungua Ndo Aone Ni Nini */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.slice(0, 4).map((prod) => (
              <div
                key={prod.id}
                onClick={() => onSelectProduct(prod)}
                className="bg-[#FAF8F5] hover:bg-white border border-[#EAE3D5] hover:border-[#C5A880] rounded-2xl p-6 flex flex-col justify-between transition-all duration-300 shadow-2xs hover:shadow-md cursor-pointer group"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-end">
                    <div className="w-8 h-8 rounded-full bg-white border border-[#EAE3D5] flex items-center justify-center text-[#856B49] group-hover:bg-[#1A1A19] group-hover:text-white transition">
                      <ArrowUpRight className="w-4 h-4" />
                    </div>
                  </div>

                  <div>
                    <h3 className="font-serif text-2xl font-semibold text-[#222826] group-hover:text-[#856B49] transition">
                      {prod.name}
                    </h3>
                    <p className="text-xs text-[#856B49] mt-1 font-light">
                      {prod.tagline}
                    </p>
                  </div>
                </div>

                <div className="pt-6 mt-6 border-t border-[#EAE3D5] flex items-center justify-between text-xs text-[#525D58] group-hover:text-[#222826]">
                  <span className="text-[11px] uppercase tracking-[0.18em] font-medium">Explore Details</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform text-[#856B49]" />
                </div>
              </div>
            ))}
          </div>

          {/* Centered Button to View Full Catalogue */}
          <div className="text-center pt-2">
            <button
              onClick={() => navTo('products')}
              className="px-8 py-3.5 rounded-full bg-[#FAF8F5] hover:bg-[#F5F0E6] text-[#222826] border border-[#D8CBB8] text-xs uppercase tracking-[0.2em] font-medium transition cursor-pointer shadow-2xs inline-flex items-center gap-2"
            >
              <span>View Full Product Catalogue</span>
              <ArrowUpRight className="w-4 h-4 text-[#856B49]" />
            </button>
          </div>
        </div>
      </section>

          </div>
  );
};

interface AboutViewProps {
  divisions: Division[];
  onSelectDivision: (divisionId: string) => void;
  onOpenQuoteModal: (defaultDivision?: string, defaultService?: string) => void;
}

export const AboutView: React.FC<AboutViewProps> = ({
  divisions,
  onSelectDivision
}) => {
  return (
    <div className="space-y-16 pb-20 bg-[#FAF8F5] text-[#222826]">
      {/* Top Banner (White & Cream Lala Salama Style) */}
      <section className="bg-white pt-28 pb-16 border-b border-[#EAE3D5]">
        <div className="max-w-4xl mx-auto px-6 md:px-12 text-center space-y-4">
          <span className="text-xs uppercase tracking-[0.28em] text-[#856B49] font-light block">
            ABOUT CREST GROUP • EST. 2026
          </span>
          <h1 className="font-signature text-6xl sm:text-7xl text-[#222826] font-normal">
            Our Corporate Story
          </h1>
          <p className="font-serif text-xl sm:text-2xl text-[#222826] uppercase tracking-wider">
            Building a Diversified, Technology-Driven Business Institution.
          </p>
          <p className="text-sm sm:text-base text-[#525D58] font-light leading-relaxed max-w-2xl mx-auto">
            Established in 2026, CREST GROUP brings together software engineering, Artificial Intelligence, digital communication, smart logistics, consumer products, real estate, agribusiness, education, and strategic investments under one disciplined corporate umbrella.
          </p>
        </div>
      </section>

            {/* Our Philosophy & Core Values */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 space-y-12">
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <span className="text-xs uppercase tracking-[0.25em] text-[#856B49] font-light block">
            CORPORATE PHILOSOPHY
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-semibold text-[#222826]">
            Designed Not Only for Today, But for What CREST GROUP Will Become
          </h2>
          <p className="text-sm sm:text-base text-[#525D58] font-light leading-relaxed">
            CREST GROUP was founded with a clear strategic thesis: in rapidly modernizing economies, the most resilient enterprises are those that combine deep technological capability with real-world industry execution.
          </p>
          <p className="text-sm sm:text-base text-[#525D58] font-light leading-relaxed">
            Our software division builds the proprietary technology that powers retail commerce (<strong>TradePOS</strong>), school administration (<strong>CREST School Portal</strong>), enterprise AI (<strong>Copetra AI</strong>), and regional freight movement (<strong>Cargoo</strong>)—while our media, foods, real estate, agribusiness, and investment divisions expand our commercial footprint across tangible industries.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              title: 'Technological Excellence',
              desc: 'We engineer proprietary platforms using modern, scalable architectures.'
            },
            {
              title: 'Multi-Industry Synergy',
              desc: 'Each CREST division strengthens the others across technology, media, logistics, and commerce.'
            },
            {
              title: 'Integrity & Governance',
              desc: 'All corporate operations and partnerships adhere strictly to regulatory standards.'
            },
            {
              title: 'Client-Centric Impact',
              desc: 'Every product and service is measured by tangible operational value.'
            }
          ].map((val, i) => (
            <div
              key={i}
              className="bg-white p-6 rounded-2xl border border-[#EAE3D5] space-y-2"
            >
              <div className="text-xs font-serif tracking-widest text-[#856B49]">
                0{i + 1}
              </div>
              <h3 className="font-serif text-lg font-semibold text-[#222826]">{val.title}</h3>
              <p className="text-xs text-[#525D58] font-light leading-relaxed">{val.desc}</p>
            </div>
          ))}
        </div>
      </section>

            {/* Phased Expansion Strategy (White Surface) */}
      <section className="bg-white py-16 border-y border-[#EAE3D5]">
        <div className="max-w-7xl mx-auto px-6 md:px-12 space-y-10">
          <div className="max-w-3xl mx-auto text-center space-y-2">
            <span className="text-xs uppercase tracking-[0.25em] text-[#856B49] font-light block">
              LONG-TERM BUSINESS EXPANSION STRATEGY
            </span>
            <h2 className="font-signature text-5xl text-[#222826] font-normal">
              Three-Horizon Expansion
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                horizon: 'Horizon 1 • Immediate Priority',
                title: 'Initial Development Priorities',
                desc: 'Establishing immediate technological leadership and brand authority.',
                divs: divisions.filter((d) => d.phase === 'Phase 1: Initial Priority')
              },
              {
                horizon: 'Horizon 2 • Active Rollout',
                title: 'Subsequent Expansion',
                desc: 'Scaling platform-enabled freight logistics (Cargoo) and consumer food production.',
                divs: divisions.filter((d) => d.phase === 'Phase 2: Subsequent Expansion')
              },
              {
                horizon: 'Horizon 3 • Strategic Horizon',
                title: 'Long-Term Expansion',
                desc: 'Expanding into Real Estate, Agribusiness, Education & Training, and Investments.',
                divs: divisions.filter((d) => d.phase === 'Phase 3: Long-Term Expansion')
              }
            ].map((stage, i) => (
              <div
                key={i}
                className="bg-[#FAF8F5] border border-[#EAE3D5] rounded-2xl p-6 space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <span className="text-[10px] uppercase tracking-[0.2em] text-[#856B49]">
                    {stage.horizon}
                  </span>
                  <h3 className="font-serif text-xl font-semibold text-[#222826]">{stage.title}</h3>
                  <p className="text-xs text-[#525D58] font-light leading-relaxed">{stage.desc}</p>
                </div>

                <div className="space-y-2 pt-3 border-t border-[#EAE3D5]">
                  {stage.divs.map((d) => (
                    <button
                      key={d.id}
                      onClick={() => onSelectDivision(d.id)}
                      className="w-full p-2.5 rounded-xl bg-white hover:bg-[#F5F0E6] border border-[#EFEAE1] flex items-center justify-between text-xs text-left transition cursor-pointer"
                    >
                      <span className="font-medium text-[#222826]">{d.name}</span>
                      <ArrowUpRight className="w-3.5 h-3.5 text-[#856B49]" />
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

            {/* Technology Stack & 6-Phase Roadmap */}
      <section className="max-w-7xl mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-5 bg-white rounded-2xl p-6 sm:p-8 border border-[#EAE3D5] space-y-5">
            <span className="text-xs uppercase tracking-[0.25em] text-[#856B49] font-light">
              TECHNOLOGY ARCHITECTURE
            </span>
            <h3 className="font-serif text-2xl font-semibold text-[#222826]">
              Proposed Technology Stack
            </h3>
            <div className="space-y-3">
              {[
                {
                  icon: <Code2 className="w-4 h-4" />,
                  layer: 'Frontend',
                  tech: 'Vite + React + Tailwind CSS'
                },
                {
                  icon: <Server className="w-4 h-4" />,
                  layer: 'Backend',
                  tech: 'Laravel / PHP API Architecture'
                },
                {
                  icon: <Database className="w-4 h-4" />,
                  layer: 'Database',
                  tech: 'PostgreSQL Relational Engine'
                },
                {
                  icon: <Lock className="w-4 h-4" />,
                  layer: 'Infrastructure',
                  tech: 'Git/GitHub, RBAC Auth & Cloud SSL'
                }
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#EFEAE1] flex items-center gap-3"
                >
                  <div className="p-2 rounded-lg bg-white border border-[#E8DFD1] text-[#856B49]">
                    {item.icon}
                  </div>
                  <div>
                    <div className="text-[10px] uppercase tracking-[0.2em] text-[#68746F]">
                      {item.layer}
                    </div>
                    <div className="text-xs sm:text-sm font-medium text-[#222826]">{item.tech}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-7 bg-white rounded-2xl p-6 sm:p-8 border border-[#EAE3D5] space-y-5">
            <span className="text-xs uppercase tracking-[0.25em] text-[#856B49] font-light">
              DEVELOPMENT ROADMAP
            </span>
            <h3 className="font-serif text-2xl font-semibold text-[#222826]">
              Phases 1 – 6 Implementation
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {DEVELOPMENT_ROADMAP.map((phase, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-[#FAF8F5] border border-[#EFEAE1] space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-serif text-sm font-semibold text-[#222826]">
                      {phase.phase}: {phase.title}
                    </span>
                    <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded bg-white border border-[#E8DFD1] text-[#856B49]">
                      {phase.status}
                    </span>
                  </div>
                  <ul className="space-y-1">
                    {phase.items.map((it, i) => (
                      <li key={i} className="text-xs text-[#525D58] font-light flex items-start gap-1.5">
                        <span className="text-[#C5A880]">•</span>
                        <span>{it}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

          </div>
  );
};
