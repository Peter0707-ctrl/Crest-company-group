import React from 'react';
import {
  ArrowUpRight,
  Mail,
  Phone,
  MapPin,
  MessageCircle
} from 'lucide-react';
import { ActiveTab, Division } from '../types/ecosystem';

interface FooterProps {
  divisions: Division[];
  setActiveTab: (tab: ActiveTab) => void;
  onSelectDivision: (divisionId: string) => void;
  onOpenQuoteModal: (defaultDivision?: string, defaultService?: string) => void;
}

export const Footer: React.FC<FooterProps> = ({
  divisions,
  setActiveTab,
  onSelectDivision,
  onOpenQuoteModal
}) => {
  const navTo = (tab: ActiveTab) => {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <footer className="relative bg-[#000000] text-white overflow-hidden pt-20 pb-0 border-t border-neutral-900">
        <div className="max-w-7xl mx-auto px-6 md:px-12 space-y-16">
          
          {/* Top Brand Identity & Brief Company Explanation */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-white/10">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-white p-1 flex items-center justify-center shrink-0 shadow-xs">
                <img src="/crest-logo.jpg" alt="CREST GROUP Logo" className="w-full h-full object-contain rounded-lg" />
              </div>
              <div>
                <span className="font-bold text-lg tracking-[0.22em] uppercase text-white block">
                  CREST GROUP
                </span>
                <span className="text-[10px] tracking-[0.3em] uppercase text-[#C5A880] font-semibold block">
                  PREMIUM SERVICES • EST. 2026
                </span>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-neutral-400 font-light max-w-xl leading-relaxed">
              A diversified, technology-driven corporate enterprise operating across proprietary software, Artificial Intelligence, modern freight logistics, agro-processing, and strategic real estate ventures.
            </p>
          </div>

          {/* 3 Main Typographical Columns (Exact Image 2 Dribbble Format) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-16">
            
            {/* Column 1: Pages */}
            <div className="lg:col-span-3 space-y-5">
              <h4 className="text-xs text-neutral-400 font-medium">Pages</h4>
              <ul className="space-y-3 text-xs tracking-[0.16em] uppercase font-medium">
                {[
                  { id: 'home', label: 'Home' },
                  { id: 'about', label: 'About' },
                  { id: 'businesses', label: 'Divisions' },
                  { id: 'products', label: 'Products' },
                  { id: 'projects', label: 'Projects' },
                  { id: 'partnerships', label: 'Partners & Investors' },
                  { id: 'contact', label: 'Contact' }
                ].map((item) => (
                  <li key={item.id}>
                    <button
                      onClick={() => navTo(item.id as ActiveTab)}
                      className="text-white hover:text-[#C5A880] transition cursor-pointer text-left block"
                    >
                      {item.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 2: Ecosystem & Solutions */}
            <div className="lg:col-span-4 space-y-5">
              <h4 className="text-xs text-neutral-400 font-medium">Ecosystem</h4>
              <ul className="space-y-3 text-xs tracking-[0.16em] uppercase font-medium">
                {[
                  { label: 'Crest Technologies', tab: 'businesses' },
                  { label: 'Copetra AI Engine', tab: 'products' },
                  { label: 'Cargoo Freight Marketplace', tab: 'products' },
                  { label: 'Crest Creamery Foods', tab: 'businesses' },
                  { label: 'Commercial Real Estate', tab: 'businesses' },
                  { label: 'Agribusiness Hubs', tab: 'businesses' }
                ].map((item, idx) => (
                  <li key={idx}>
                    <button
                      onClick={() => navTo(item.tab as ActiveTab)}
                      className="text-white hover:text-[#C5A880] transition cursor-pointer text-left block"
                    >
                      {item.label}
                    </button>
                  </li>
                ))}
                <li>
                  <button
                    onClick={() => onOpenQuoteModal()}
                    className="text-[#C5A880] hover:text-white transition cursor-pointer text-left block pt-1"
                  >
                    Request a Quotation →
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 3: Opening Hours & Corporate Desk (Exact Key-Value Format as Image 2) */}
            <div className="lg:col-span-5 space-y-5">
              <h4 className="text-xs text-neutral-400 font-medium">Opening hours & Desk</h4>
              <div className="space-y-3.5 text-xs">
                <div className="flex items-center justify-between border-b border-neutral-900 pb-2">
                  <span className="text-white uppercase tracking-[0.16em] font-medium">Monday — Friday</span>
                  <span className="text-neutral-400 font-mono tracking-wider">8 AM – 6 PM</span>
                </div>
                <div className="flex items-center justify-between border-b border-neutral-900 pb-2">
                  <span className="text-white uppercase tracking-[0.16em] font-medium">Saturday</span>
                  <span className="text-neutral-400 font-mono tracking-wider">9 AM – 2 PM</span>
                </div>
                <div className="flex items-center justify-between border-b border-neutral-900 pb-2">
                  <span className="text-white uppercase tracking-[0.16em] font-medium">Sunday</span>
                  <span className="text-neutral-500 uppercase tracking-widest font-semibold">Closed</span>
                </div>
                <div className="flex items-center justify-between border-b border-neutral-900 pb-2 pt-1">
                  <span className="text-white uppercase tracking-[0.16em] font-medium">Hotline & Call</span>
                  <a href="tel:+255779304500" className="text-[#C5A880] hover:text-white font-mono tracking-wider transition">
                    +255 779 304 500
                  </a>
                </div>
                <div className="flex items-center justify-between border-b border-neutral-900 pb-2">
                  <span className="text-white uppercase tracking-[0.16em] font-medium">Corporate Email</span>
                  <span className="text-neutral-400 font-mono text-[11px]">info@crestgroup.co.tz</span>
                </div>
                <div className="flex items-center justify-between pt-0.5">
                  <span className="text-white uppercase tracking-[0.16em] font-medium">Headquarters</span>
                  <span className="text-neutral-400">Dar es Salaam, TZ</span>
                </div>
              </div>
            </div>

          </div>

          {/* Sub-Footer Row: Copyright & Social Links (Exact Image 2 Divider Row) */}
          <div className="pt-8 pb-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
            <div className="text-neutral-400 flex items-center gap-3 flex-wrap">
              <span>© CREST GROUP — 2026. All rights reserved.</span>
              <button
                onClick={() => navTo('admin')}
                className="text-neutral-600 hover:text-[#C5A880] transition text-[10px] tracking-wider uppercase font-mono cursor-pointer"
                title="Executive Cryptographic Gateway"
              >
                • SOC Gateway
              </button>
            </div>
            <div className="flex items-center gap-6 text-[11px] uppercase tracking-[0.2em] font-medium">
              <a
                href="https://wa.me/255779304500?text=Hello%20CREST%20GROUP%2C%20I%20am%20visiting%20your%20official%20website%20and%20would%20like%20to%20speak%20with%20your%20team."
                target="_blank"
                rel="noreferrer"
                className="text-white hover:text-[#C5A880] transition"
              >
                WhatsApp
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="text-neutral-400 hover:text-white transition">
                LinkedIn
              </a>
              <a href="https://instagram.com" target="_blank" rel="noreferrer" className="text-neutral-400 hover:text-white transition">
                Instagram
              </a>
              <a href="tel:+255779304500" className="text-neutral-400 hover:text-white transition">
                Direct Call
              </a>
            </div>
          </div>

        </div>

        {/* Giant Iconic Bottom Typography: "CREST" (Exact as ASCENT in Image 2) */}
        <div className="w-full overflow-hidden select-none pointer-events-none text-center -mb-2 sm:-mb-4 md:-mb-6">
          <div className="text-[17vw] font-bold tracking-tighter text-white leading-none uppercase inline-block">
            CREST
          </div>
        </div>

      </footer>

      {/* Floating WhatsApp Button in Clean Cream & Charcoal */}
      <a
        href="https://wa.me/255779304500?text=Hello%20CREST%20GROUP%2C%20I%20am%20visiting%20your%20official%20website%20and%20would%20like%20to%20speak%20with%20your%20team."
        target="_blank"
        rel="noreferrer"
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 px-5 py-3 rounded-full bg-[#222826] hover:bg-[#353E3B] text-white shadow-lg border border-[#C5A880]/60 hover:scale-105 transition group"
        title="Chat with CREST GROUP on WhatsApp"
      >
        <MessageCircle className="w-4 h-4 text-[#C5A880]" />
        <span className="text-[11px] uppercase tracking-[0.18em] font-light hidden sm:inline">
          WhatsApp Desk
        </span>
      </a>
    </>
  );
};
