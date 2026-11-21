import React, { useState } from 'react';
import {
  Shield,
  ChevronDown,
  Menu,
  X,
  Cpu,
  Megaphone,
  Truck,
  IceCream,
  Building2,
  Sprout,
  GraduationCap,
  Briefcase,
  ArrowUpRight
} from 'lucide-react';
import { ActiveTab, Division } from '../types/ecosystem';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  divisions: Division[];
  onSelectDivision: (divisionId: string) => void;
  onOpenQuoteModal: (defaultDivision?: string, defaultService?: string) => void;
  inquiryCount?: number;
}

export const getDivisionIcon = (iconName: string, className = 'w-5 h-5') => {
  switch (iconName) {
    case 'Cpu':
      return <Cpu className={className} />;
    case 'Megaphone':
      return <Megaphone className={className} />;
    case 'Truck':
      return <Truck className={className} />;
    case 'IceCream':
      return <IceCream className={className} />;
    case 'Building2':
      return <Building2 className={className} />;
    case 'Sprout':
      return <Sprout className={className} />;
    case 'GraduationCap':
      return <GraduationCap className={className} />;
    case 'Briefcase':
      return <Briefcase className={className} />;
    default:
      return <Shield className={className} />;
  }
};

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  divisions,
  onSelectDivision,
  onOpenQuoteModal
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [businessesMenuOpen, setBusinessesMenuOpen] = useState(false);

  // Minimal Serein Wealth style navigation with Partners & Investors right after Home
  const navItems: { id: ActiveTab; label: string; hasDropdown?: boolean }[] = [
    { id: 'home', label: 'Home' },
    { id: 'partnerships', label: 'Partners & Investors' },
    { id: 'businesses', label: 'How We Help', hasDropdown: true },
    { id: 'products', label: 'Products' },
    { id: 'about', label: 'About Us' }
  ];

  const handleNavClick = (tab: ActiveTab) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
    setBusinessesMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="fixed top-5 left-0 right-0 z-50 px-4 sm:px-8 pointer-events-none">
      {/* Serein Wealth Floating Pill Header */}
      <div className="max-w-5xl mx-auto bg-[#F4F1EA]/95 backdrop-blur-md border border-[#E2DCD0] rounded-full px-4 sm:px-7 h-16 flex items-center justify-between shadow-[0_12px_35px_-10px_rgba(0,0,0,0.14)] pointer-events-auto">
        {/* Brand Logo & Name */}
        <button
          onClick={() => handleNavClick('home')}
          className="flex items-center gap-3 text-left group focus:outline-none shrink-0 cursor-pointer"
        >
          <img
            src="/crest-logo.jpg"
            alt="CREST GROUP"
            className="w-10 h-10 rounded-full object-contain bg-white p-0.5 border border-[#E2DCD0]"
          />
          <span className="font-serif tracking-[0.22em] text-lg sm:text-xl font-normal uppercase text-[#1A1A19]">
            CREST
          </span>
        </button>

        {/* Minimal Center Links (Exact Serein Wealth Feel) */}
        <nav className="hidden md:flex items-center gap-8">
          {navItems.map((item) => {
            if (item.hasDropdown) {
              return (
                <div
                  key={item.id}
                  className="relative"
                  onMouseEnter={() => setBusinessesMenuOpen(true)}
                  onMouseLeave={() => setBusinessesMenuOpen(false)}
                >
                  <button
                    onClick={() => handleNavClick('businesses')}
                    className={`py-2 text-xs sm:text-sm inline-flex items-center gap-1 transition cursor-pointer ${
                      activeTab === 'businesses'
                        ? 'text-[#1A1A19] font-medium'
                        : 'text-[#3D3B37] hover:text-[#1A1A19] font-normal'
                    }`}
                  >
                    <span>{item.label}</span>
                    <ChevronDown className="w-3.5 h-3.5 opacity-70" />
                  </button>

                  {/* Clean Dropdown for the 8 Business Divisions & Quick Pages */}
                  {businessesMenuOpen && (
                    <div className="absolute left-1/2 -translate-x-1/2 top-full pt-3 w-[640px] z-50">
                      <div className="bg-white border border-[#E8DFD1] rounded-3xl shadow-2xl p-6">
                        <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#F4EFE6]">
                          <div>
                            <span className="text-[10px] uppercase tracking-[0.25em] text-[#856B49] block">
                              OUR ECOSYSTEM
                            </span>
                            <h4 className="font-serif text-lg font-medium text-[#222826]">
                              Our Business Areas
                            </h4>
                          </div>
                          <div className="flex items-center gap-4 text-xs">
                            <button
                              onClick={() => handleNavClick('projects')}
                              className="text-[#68746F] hover:text-[#1A1A19] cursor-pointer"
                            >
                              Projects
                            </button>
                            <button
                              onClick={() => handleNavClick('mobile-apps')}
                              className="text-[#68746F] hover:text-[#1A1A19] cursor-pointer"
                            >
                              Mobile Apps
                            </button>
                            <button
                              onClick={() => handleNavClick('partnerships')}
                              className="text-[#68746F] hover:text-[#1A1A19] cursor-pointer"
                            >
                              Partnerships
                            </button>
                            <button
                              onClick={() => handleNavClick('businesses')}
                              className="text-[#856B49] font-medium inline-flex items-center gap-1 cursor-pointer"
                            >
                              <span>All Divisions</span>
                              <ArrowUpRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2.5">
                          {divisions.map((div) => (
                            <button
                              key={div.id}
                              onClick={() => {
                                onSelectDivision(div.id);
                                setBusinessesMenuOpen(false);
                              }}
                              className="flex items-start gap-3 p-2.5 rounded-xl bg-[#FAF8F5] hover:bg-[#F5F0E6] border border-[#EFEAE1] hover:border-[#C5A880] text-left transition group cursor-pointer"
                            >
                              <div className="p-2 rounded-lg bg-white text-[#856B49] border border-[#E8DFD1] shrink-0">
                                {getDivisionIcon(div.iconName, 'w-4 h-4')}
                              </div>
                              <div className="min-w-0">
                                <div className="font-serif text-xs font-semibold uppercase text-[#222826] truncate">
                                  {div.name}
                                </div>
                                <p className="text-[11px] text-[#68746F] font-light line-clamp-1">
                                  {div.tagline}
                                </p>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            }

            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`py-2 text-xs sm:text-sm transition cursor-pointer ${
                  activeTab === item.id
                    ? 'text-[#1A1A19] font-medium'
                    : 'text-[#3D3B37] hover:text-[#1A1A19] font-normal'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Right Pill CTA Button (Direct Call to 255779304500) */}
        <div className="hidden md:flex items-center shrink-0">
          <a
            href="tel:+255779304500"
            className="px-6 py-2.5 rounded-full bg-[#8B5E4B] hover:bg-[#774E3D] text-white text-xs sm:text-sm font-medium transition cursor-pointer shadow-xs inline-flex items-center gap-1.5"
            title="Call +255 779 304 500"
          >
            <span>Book a Call</span>
          </a>
        </div>

        {/* Mobile Menu Button */}
        <div className="flex md:hidden items-center">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-full bg-white text-[#222826] border border-[#E8DFD1]"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-2 max-w-md mx-auto bg-white border border-[#E8DFD1] rounded-3xl p-5 shadow-2xl pointer-events-auto">
          <div className="flex flex-col gap-2">
            {[
              { id: 'home', label: 'Home' },
              { id: 'businesses', label: 'How We Help (8 Divisions)' },
              { id: 'products', label: 'Products & Solutions' },
              { id: 'about', label: 'About Us' },
              { id: 'projects', label: 'Projects' },
              { id: 'contact', label: 'Contact Us' }
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id as ActiveTab)}
                className="px-4 py-2.5 rounded-xl text-left text-sm text-[#222826] hover:bg-[#FAF8F5]"
              >
                {item.label}
              </button>
            ))}
            <a
              href="tel:+255779304500"
              onClick={() => setMobileMenuOpen(false)}
              className="mt-2 w-full py-3 rounded-full bg-[#8B5E4B] hover:bg-[#774E3D] text-white text-sm font-medium text-center block"
            >
              Book a Call
            </a>
          </div>
        </div>
      )}
    </header>
  );
};
