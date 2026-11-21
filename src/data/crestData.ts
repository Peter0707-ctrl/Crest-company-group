import {
  Division,
  ProductItem,
  ProjectItem,
  NewsArticle,
  CareerOpening
} from '../types/ecosystem';

export const INITIAL_DIVISIONS: Division[] = [
  {
    id: 'crest-technologies',
    code: 'DIV-01',
    name: 'CREST TECHNOLOGIES',
    shortName: 'Technologies',
    tagline: 'Technology, Software Engineering & Digital Infrastructure',
    description:
      'The flagship technological engine of CREST GROUP. We design, architect, and deploy enterprise software, Artificial Intelligence solutions, mobile applications, cloud infrastructure, and proprietary digital platforms for businesses and institutions.',
    phase: 'Phase 1: Initial Priority',
    iconName: 'Cpu',
    accentColor: '#D4AF37',
    activities: [
      'Website design and development',
      'Mobile application development (Android and iOS)',
      'Custom software engineering',
      'Artificial Intelligence (AI) engineering and solutions',
      'AI integration and intelligent automation',
      'Point of Sale (POS) systems',
      'Enterprise Resource Planning (ERP)',
      'School and educational management systems',
      'Business management systems',
      'Inventory and stock management systems',
      'Domain registration and web hosting',
      'IT support and consultancy',
      'System integration and maintenance',
      'Cloud-based business solutions'
    ],
    flagshipProducts: [
      'Copetra AI',
      'CREST School Portal',
      'TradePOS Solutions',
      'CREST Nexus ERP',
      'CREST Host & Cloud'
    ],
    featuredProjects: [
      'Copetra AI Enterprise Automation Suite',
      'CREST Multi-Campus School Portal Deployment',
      'TradePOS Retail & Wholesale Cloud Network'
    ],
    metrics: [
      { label: 'Core Practice Areas', value: '14+' },
      { label: 'Proprietary Platforms', value: '5' },
      { label: 'System Uptime SLA', value: '99.9%' }
    ],
    partnershipModel:
      'Technology joint ventures, institutional software licensing, white-label SaaS distribution, and enterprise digital transformation engagements.',
    heroImage: '/crest-technologies.jpg'
  },
  {
    id: 'crest-digital-marketing',
    code: 'DIV-02',
    name: 'CREST DIGITAL MARKETING & MEDIA',
    shortName: 'Digital Marketing & Media',
    tagline: 'Digital Marketing, Advertising, Communication & Brand Development',
    description:
      'Transforming corporate ambition into commanding market authority. We combine data-driven digital performance campaigns, executive corporate branding, cinematic media production, and search dominance to scale brands rapidly.',
    phase: 'Phase 1: Initial Priority',
    iconName: 'Megaphone',
    accentColor: '#E2C15A',
    activities: [
      'Digital marketing strategy',
      'Social media management',
      'Social media advertising',
      'Search Engine Optimization (SEO)',
      'Google advertising campaigns',
      'Facebook, Instagram and TikTok advertising',
      'Brand identity development',
      'Logo and graphic design',
      'Corporate branding',
      'Content creation',
      'Video production and promotional campaigns',
      'Marketing consultancy',
      'Business promotion and online visibility'
    ],
    flagshipProducts: [
      'CREST Brand Authority Suite',
      'OmniReach Ad Performance Engine',
      'Executive Media & Video Production Studio'
    ],
    featuredProjects: [
      'Corporate Rebranding & Multi-Channel Growth Campaign',
      'Regional E-Commerce Performance Marketing Scale-Up',
      'Executive Documentary & Commercial Production Series'
    ],
    metrics: [
      { label: 'Marketing Services', value: '13+' },
      { label: 'Ad Platforms Covered', value: '6+' },
      { label: 'Avg. ROI Lift', value: '3.4x' }
    ],
    partnershipModel:
      'Retained agency partnerships, co-branded media productions, corporate communication retainers, and regional brand launch alliances.',
    heroImage: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80'
  },
  {
    id: 'crest-logistics',
    code: 'DIV-03',
    name: 'CREST LOGISTICS & TRANSPORT',
    shortName: 'Logistics & Transport',
    tagline: 'Transportation, Cargo Movement & Smart Logistics Services',
    description:
      'Building a seamless, technology-powered transportation ecosystem connecting businesses, cargo owners, and vehicle operators. Home to Cargoo, our digital cargo marketplace revolutionizing regional freight coordination.',
    phase: 'Phase 2: Subsequent Expansion',
    iconName: 'Truck',
    accentColor: '#34D399',
    activities: [
      'Cargo transportation',
      'Freight and logistics management',
      'Truck and vehicle coordination',
      'Cargo marketplace solutions',
      'Transportation technology',
      'Fleet management',
      'Delivery and distribution',
      'Supply chain coordination',
      'Logistics partnerships'
    ],
    flagshipProducts: [
      'Cargoo Digital Cargo Marketplace',
      'CREST Fleet Telemetry & Dispatch Suite'
    ],
    featuredProjects: [
      'Cargoo – Digital Cargo Transportation Marketplace',
      'Regional Corridor Freight & Fleet Coordination Network'
    ],
    metrics: [
      { label: 'Logistics Capabilities', value: '9+' },
      { label: 'Flagship Platform', value: 'Cargoo' },
      { label: 'Corridor Coverage', value: 'East & Central Africa' }
    ],
    partnershipModel:
      'Fleet owner onboarding, corporate freight contracts, 3PL distribution alliances, and logistics technology co-investment.',
    heroImage: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80'
  },
  {
    id: 'crest-foods',
    code: 'DIV-04',
    name: 'CREST FOODS & BEVERAGES',
    shortName: 'Foods & Beverages',
    tagline: 'Food Production, Food Services & Consumer Products',
    description:
      'Developing high-quality consumer-facing food and beverage brands—led by artisanal ice cream production, cold-chain distribution, food processing, and scalable FMCG retail partnerships.',
    phase: 'Phase 2: Subsequent Expansion',
    iconName: 'IceCream',
    accentColor: '#F59E0B',
    activities: [
      'Ice cream production and distribution',
      'Food and beverage businesses',
      'Food product development',
      'Retail and distribution',
      'Food processing',
      'Consumer product branding',
      'Food supply and business partnerships'
    ],
    flagshipProducts: [
      'Crest Creamery Artisanal Ice Cream Line',
      'CREST Refresh Beverages & Packaged Foods'
    ],
    featuredProjects: [
      'Crest Creamery Production & Cold-Chain Distribution Network',
      'Consumer Food Product Formulation & Retail Launch'
    ],
    metrics: [
      { label: 'Core Value Chains', value: '7' },
      { label: 'Flagship Line', value: 'Ice Cream & FMCG' },
      { label: 'Quality Standard', value: 'ISO / HACCP Ready' }
    ],
    partnershipModel:
      'Supermarket & retail stockists, regional cold-chain distributors, hospitality supply contracts, and franchise parlor operators.',
    heroImage: '/crest-food-beverage.jpg'
  },
  {
    id: 'crest-properties',
    code: 'DIV-05',
    name: 'CREST PROPERTIES & REAL ESTATE',
    shortName: 'Properties & Real Estate',
    tagline: 'Real Estate, Property Development & Property-Related Investments',
    description:
      'Creating enduring architectural and commercial value through strategic land acquisition, modern residential and commercial developments, turnkey construction projects, and professional property management.',
    phase: 'Phase 3: Long-Term Expansion',
    iconName: 'Building2',
    accentColor: '#D4AF37',
    activities: [
      'Real estate development',
      'Property investment',
      'Property management',
      'Commercial and residential property development',
      'Building and construction projects',
      'Property leasing and rental management',
      'Land acquisition and development',
      'Real estate partnerships'
    ],
    flagshipProducts: [
      'CREST Commercial & Mixed-Use Developments',
      'CREST Smart Property & Tenant Management System'
    ],
    featuredProjects: [
      'Crest Executive Business Park & Mixed-Use Concept',
      'Strategic Land Banking & Serviced Plots Initiative'
    ],
    metrics: [
      { label: 'Real Estate Services', value: '8' },
      { label: 'Asset Classes', value: 'Commercial & Residential' },
      { label: 'Focus', value: 'Sustainable Value' }
    ],
    partnershipModel:
      'Joint venture land development, institutional real estate syndication, construction partnerships, and corporate leasing.',
    heroImage: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80'
  },
  {
    id: 'crest-agribusiness',
    code: 'DIV-06',
    name: 'CREST AGRIBUSINESS',
    shortName: 'Agribusiness',
    tagline: 'Agriculture, Livestock & Agricultural Value Chains',
    description:
      'Modernizing agricultural production and value addition. We integrate commercial crop farming, livestock management, agro-processing, and precision Agritech solutions to strengthen regional food security and trade.',
    phase: 'Phase 3: Long-Term Expansion',
    iconName: 'Sprout',
    accentColor: '#4ADE80',
    activities: [
      'Commercial agriculture',
      'Crop production',
      'Livestock farming',
      'Agricultural processing',
      'Agricultural distribution',
      'Agribusiness investments',
      'Agricultural technology solutions',
      'Partnerships with farmers and agricultural enterprises'
    ],
    flagshipProducts: [
      'CREST Agro-Processing & Outgrower Network',
      'AgriPulse Smart Farm Management Platform'
    ],
    featuredProjects: [
      'Integrated Commercial Crop & Livestock Value Chain Project',
      'Digital Farmer Cooperative & Market Linkage Platform'
    ],
    metrics: [
      { label: 'Value Chain Pillars', value: '8' },
      { label: 'Integration', value: 'Farm-to-Market' },
      { label: 'Tech Enabler', value: 'Precision Agritech' }
    ],
    partnershipModel:
      'Outgrower farmer cooperatives, agro-processing off-take agreements, agricultural input partnerships, and impact investments.',
    heroImage: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?auto=format&fit=crop&w=1200&q=80'
  },
  {
    id: 'crest-education',
    code: 'DIV-07',
    name: 'CREST EDUCATION & TRAINING',
    shortName: 'Education & Training',
    tagline: 'Education, Professional Development & Technology Training',
    description:
      'Empowering the next generation of engineers, executives, and digital leaders through intensive software engineering bootcamps, AI education, corporate capability training, and institutional EdTech platforms.',
    phase: 'Phase 3: Long-Term Expansion',
    iconName: 'GraduationCap',
    accentColor: '#60A5FA',
    activities: [
      'Technology training',
      'Software development training',
      'Artificial Intelligence education',
      'Digital skills development',
      'Professional and business training',
      'Educational technology solutions',
      'Institutional partnerships',
      'Digital learning platforms'
    ],
    flagshipProducts: [
      'CREST Academy (Software & AI Fellowship)',
      'CREST School Portal (EdTech Suite)',
      'Executive Corporate Upskilling Programs'
    ],
    featuredProjects: [
      'Applied AI & Full-Stack Software Engineering Accelerator',
      'Digital Literacy & Institutional EdTech Transformation'
    ],
    metrics: [
      { label: 'Training Pillars', value: '8' },
      { label: 'Delivery Modes', value: 'Hybrid & Digital LMS' },
      { label: 'Focus', value: 'AI, Code & Leadership' }
    ],
    partnershipModel:
      'University and college alliances, corporate staff training programs, scholarship sponsorships, and government digital skills initiatives.',
    heroImage: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=1200&q=80'
  },
  {
    id: 'crest-investments',
    code: 'DIV-08',
    name: 'CREST INVESTMENTS & BUSINESS DEVELOPMENT',
    shortName: 'Investments & BizDev',
    tagline: 'Investment Opportunities, Business Development & Strategic Partnerships',
    description:
      'The strategic capital allocation and venture-building arm of CREST GROUP. We evaluate, structure, and incubate high-growth business ventures, strategic collaborations, and cross-industry expansion initiatives.',
    phase: 'Phase 3: Long-Term Expansion',
    iconName: 'Briefcase',
    accentColor: '#D4AF37',
    activities: [
      'Strategic business investments',
      'Business development',
      'Project partnerships',
      'Investment evaluation',
      'Business expansion initiatives',
      'Strategic collaborations',
      'Development of new business ventures'
    ],
    flagshipProducts: [
      'CREST Venture Studio & Co-Investment Desk',
      'Cross-Sector Strategic Partnership Framework'
    ],
    featuredProjects: [
      'CREST Group 2026–2030 Multi-Industry Expansion Pipeline',
      'Strategic Joint Venture & Venture Incubation Program'
    ],
    metrics: [
      { label: 'Investment Mandates', value: '7' },
      { label: 'Target Sectors', value: '8 Industries' },
      { label: 'Governance', value: 'Regulatory Compliant' }
    ],
    partnershipModel:
      'Co-investment syndicates, strategic joint ventures, project finance partnerships, and cross-border market entry alliances (subject to applicable regulatory approvals).',
    heroImage: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1200&q=80'
  }
];

export const INITIAL_PRODUCTS: ProductItem[] = [
  {
    id: 'copetra-ai',
    name: 'Copetra AI',
    divisionId: 'crest-technologies',
    divisionName: 'CREST Technologies',
    category: 'AI & Automation',
    badge: 'FLAGSHIP AI PLATFORM',
    tagline: 'Enterprise Artificial Intelligence, Workflow Automation & Decision Intelligence',
    description:
      'Copetra AI is CREST Technologies’ flagship Artificial Intelligence platform engineered to help businesses automate complex workflows, deploy intelligent multilingual customer assistants, analyze operational data in real time, and integrate custom LLM pipelines into existing ERP and CRM systems.',
    keyFeatures: [
      'Autonomous Business Agents for customer service, sales qualification & support across Web & WhatsApp',
      'Document Intelligence & automated extraction for invoices, contracts, and financial statements',
      'Predictive Analytics & executive forecasting dashboards powered by machine learning',
      'Seamless REST & Webhook integration with ERP, POS, and legacy enterprise databases',
      'Enterprise-grade data privacy, role-based access control, and audit logging'
    ],
    targetUsers: [
      'Banks, Microfinance & Financial Institutions',
      'Corporate Enterprises & Customer Contact Centers',
      'Retail Chains, Logistics Operators & Healthcare Providers',
      'Government Agencies & Educational Institutions'
    ],
    techSpecs: [
      'Multi-Model LLM Orchestration & RAG Pipeline',
      'Cloud & On-Premise Hybrid Deployment Ready',
      'Swahili & English Bilingual Natural Language Engine',
      'Real-Time REST / GraphQL API & WhatsApp Business API Connector'
    ],
    status: 'Live & Deployed',
    metrics: 'Reduces manual operational processing time by up to 68%',
    demoPreview: {
      title: 'Copetra AI Neural Command Center v2.6',
      kpis: [
        { label: 'Automated Workflows', value: '14,820/mo', trend: '+42%' },
        { label: 'Avg Response Latency', value: '0.64 sec', trend: 'Optimal' },
        { label: 'Cost Efficiency Gain', value: '68.4%', trend: '+19%' }
      ],
      modules: [
        'Conversational AI Concierge (Swahili + English)',
        'Smart Document & Invoice OCR Engine',
        'Executive Forecasting & Anomaly Detection',
        'Automated Workflow Orchestrator'
      ]
    }
  },
  {
    id: 'crest-school-portal',
    name: 'CREST School Portal',
    divisionId: 'crest-technologies',
    divisionName: 'CREST Technologies',
    category: 'EdTech',
    badge: 'COMPLETE EDTECH SUITE',
    tagline: 'Unified Academic, Financial & Campus Management System for Modern Institutions',
    description:
      'CREST School Portal is an all-in-one digital ecosystem for nursery, primary, secondary schools, colleges, and training institutes. It unifies student admissions, automated fee billing with mobile money/bank integration, CBC/NECTA/Cambridge grading, timetable automation, library, transport, and instant parent SMS/WhatsApp notifications.',
    keyFeatures: [
      'Digital Student Information System (Admissions, Attendance, Biometrics & Student IDs)',
      'Automated Fee Invoicing, Mobile Money / Bank Reconciliation & Instant E-Receipts',
      'Comprehensive Examination, Continuous Assessment & Automated Report Card Engine',
      'Dedicated Parent, Teacher & Student Portals (Web + Android/iOS Mobile App)',
      'HR, Payroll, Inventory, Hostel & School Bus Fleet Tracking Modules'
    ],
    targetUsers: [
      'Primary & Secondary Schools (Private & Public)',
      'Colleges, Vocational Institutes & Universities',
      'Multi-Campus Educational Groups & Academies'
    ],
    techSpecs: [
      'Cloud-Hosted with Offline Sync Capability',
      'Automated Bulk SMS, Email & WhatsApp Parent Alerts',
      'Mobile Money & Bank GePG/API Payment Gateways',
      'Role-Based Portals for Principals, Bursars, Teachers & Parents'
    ],
    status: 'Live & Deployed',
    metrics: '99.4% fee reconciliation accuracy & instant parent engagement',
    demoPreview: {
      title: 'CREST School Portal — Institutional Administration Hub',
      kpis: [
        { label: 'Fee Collection Rate', value: '96.8%', trend: '+24%' },
        { label: 'Report Generation', value: 'Instant', trend: '10x Faster' },
        { label: 'Parent App Engagement', value: '94.2%', trend: 'High' }
      ],
      modules: [
        'Academics & Automated Grading Engine',
        'Bursar Finance & Mobile Payment Gateway',
        'Parent & Student Mobile Portal',
        'Staff HR, Payroll & Library Management'
      ]
    }
  },
  {
    id: 'tradepos-solutions',
    name: 'TradePOS Solutions',
    divisionId: 'crest-technologies',
    divisionName: 'CREST Technologies',
    category: 'Enterprise & POS',
    badge: 'RETAIL & WHOLESALE ENGINE',
    tagline: 'Next-Generation Cloud & Offline Point of Sale, Inventory & Multi-Branch Retail Platform',
    description:
      'TradePOS Solutions empowers supermarkets, pharmacies, hardware stores, restaurants, wholesalers, and multi-branch distributors with lightning-fast billing, real-time stock tracking, expiry & batch alerts, supplier management, and fiscal/tax receipt compliance—working seamlessly both online and offline.',
    keyFeatures: [
      'Ultra-Fast Cashier Checkout with Barcode Scanner, Thermal Printer & Touch POS Support',
      'Offline-First Architecture: Continue selling without internet with automatic cloud sync',
      'Multi-Branch Warehouse, Stock Transfer, Low-Stock & Batch/Expiry Alerts',
      'Integrated Mobile Money, Card, Split-Payment & Customer Credit/Loyalty Ledger',
      'Real-Time Owner Mobile Dashboard for live sales, profit margins, and cashier audits'
    ],
    targetUsers: [
      'Supermarkets, Mini-Marts & Wholesale Distributors',
      'Pharmacies, Agro-Vets & Cosmetics Stores',
      'Hardware, Electronics & Spare Parts Dealers',
      'Restaurants, Cafes & Hospitality Outlets'
    ],
    techSpecs: [
      'Web, Windows Desktop, Android POS Terminal & iOS Owner App',
      'IndexedDB Offline Engine + Cloud PostgreSQL Sync',
      'Hardware Ready: Barcode Scanners, Cash Drawers, 58mm/80mm Thermal Printers',
      'Automated Daily Profit & Loss, VAT & Stock Valuation Reports'
    ],
    status: 'Live & Deployed',
    metrics: 'Zero stock-leakage & 100% real-time multi-branch visibility',
    demoPreview: {
      title: 'TradePOS Cloud Enterprise v4.2 — Live Retail Terminal',
      kpis: [
        { label: 'Checkout Speed', value: '< 1.8 sec', trend: 'Ultra-Fast' },
        { label: 'Offline Reliability', value: '100%', trend: 'Auto-Sync' },
        { label: 'Inventory Accuracy', value: '99.9%', trend: 'Verified' }
      ],
      modules: [
        'Touch POS Terminal & Barcode Checkout',
        'Multi-Warehouse & Batch Inventory Control',
        'Supplier Procurement & Customer Credit Ledger',
        'Executive Live Profit & Cashier Audit App'
      ]
    }
  },
  {
    id: 'cargoo-marketplace',
    name: 'Cargoo',
    divisionId: 'crest-logistics',
    divisionName: 'CREST Logistics & Transport',
    category: 'Logistics Marketplace',
    badge: 'PROPOSED FLAGSHIP PROJECT',
    tagline: 'Digital Cargo Transportation Marketplace Connecting Cargo Owners with Verified Transport Providers',
    description:
      'Cargoo is CREST Logistics & Transport’s transformative digital freight platform. It connects manufacturers, importers, agribusinesses, and SMEs directly with vetted truck owners and fleet operators—eliminating empty return trips, ensuring transparent freight pricing, and providing live GPS cargo visibility.',
    keyFeatures: [
      'Instant Cargo Posting & Automated Load-to-Truck Matching Algorithm',
      'Verified Carrier & Fleet Operator Onboarding with Document & Insurance Checks',
      'Transparent Bidding, Instant Freight Quotations & Digital Waybills / Proof of Delivery (e-POD)',
      'Real-Time GPS Route Tracking & Milestone Notifications via App & WhatsApp',
      'Return-Load (Backhaul) Optimization to reduce empty truck mileage and freight costs'
    ],
    targetUsers: [
      'Manufacturers, Importers, Exporters & Construction Firms',
      'Commercial Farmers & Agribusiness Distributors',
      'Fleet Owners, Logistics Companies & Independent Truck Operators',
      'Clearing & Forwarding Agents'
    ],
    techSpecs: [
      'Cargoo Shipper Web Portal + Android/iOS Mobile App',
      'Cargoo Driver & Fleet Partner Mobile App',
      'Live GPS Telemetry & Geofencing API',
      'Escrow-Ready Milestone Settlement & Digital Invoicing'
    ],
    status: 'Active Rollout',
    metrics: 'Cuts freight sourcing time by 75% and reduces empty backhauls',
    demoPreview: {
      title: 'Cargoo Marketplace — Live Freight & Fleet Control Tower',
      kpis: [
        { label: 'Load Matching Time', value: '< 12 mins', trend: '-75%' },
        { label: 'Fleet Utilization', value: '88.5%', trend: '+31%' },
        { label: 'Live GPS Tracking', value: '24/7 Active', trend: 'Real-Time' }
      ],
      modules: [
        'Shipper Load Posting & Instant Quote Engine',
        'Verified Transporter & Fleet Directory',
        'Live Corridor Telemetry & e-POD Verification',
        'Backhaul Optimization & Settlement Hub'
      ]
    }
  },
  {
    id: 'crest-nexus-erp',
    name: 'CREST Nexus ERP',
    divisionId: 'crest-technologies',
    divisionName: 'CREST Technologies',
    category: 'Enterprise & POS',
    badge: 'ENTERPRISE SUITE',
    tagline: 'Modular Enterprise Resource Planning for Growing Corporations & Institutions',
    description:
      'CREST Nexus ERP unifies Finance & Accounting, Human Resources & Payroll, Procurement, Inventory, Asset Management, and CRM into a single modular cloud platform tailored for African and global enterprises.',
    keyFeatures: [
      'Multi-Currency General Ledger, Accounts Payable/Receivable & Automated Financial Statements',
      'Complete HRIS, Biometric Attendance, Statutory Deductions & Automated Payroll',
      'Purchase Requisitions, LPO Approval Workflows & Vendor Management',
      'Project Costing, Fixed Asset Register & Executive BI Dashboards'
    ],
    targetUsers: [
      'Mid-to-Large Corporations & Conglomerates',
      'Manufacturing, Construction & Service Enterprises',
      'NGOs & Development Organizations'
    ],
    techSpecs: [
      'React + Vite Frontend with Laravel API & PostgreSQL Database',
      'Granular Role-Based Access Control & Multi-Company Consolidation',
      'REST API Connectors for Banks, Mobile Money & Copetra AI'
    ],
    status: 'Live & Deployed',
    metrics: '360° executive visibility across all corporate departments',
    demoPreview: {
      title: 'CREST Nexus ERP — Corporate Command Suite',
      kpis: [
        { label: 'Month-End Close', value: '2 Days', trend: '-70% Time' },
        { label: 'Payroll Processing', value: '1-Click', trend: 'Automated' },
        { label: 'Audit Compliance', value: '100%', trend: 'Full Trail' }
      ],
      modules: [
        'Core Finance & Multi-Entity Accounting',
        'HR, Attendance & Statutory Payroll',
        'Supply Chain & LPO Approval Workflow',
        'Executive KPI & Cashflow Intelligence'
      ]
    }
  },
  {
    id: 'crest-cloud-host',
    name: 'CREST Host & Cloud Infrastructure',
    divisionId: 'crest-technologies',
    divisionName: 'CREST Technologies',
    category: 'Cloud & Infrastructure',
    badge: 'DIGITAL INFRASTRUCTURE',
    tagline: 'Enterprise Domain Registration, NVMe Web Hosting, Corporate Email & Managed Cloud Servers',
    description:
      'Reliable digital infrastructure for businesses: instant domain registration (.co.tz, .com, .org, .africa), high-speed NVMe SSD web hosting, professional corporate email suites, SSL security, and managed VPS/cloud deployment.',
    keyFeatures: [
      'Instant Domain Registration & DNS Management (.com, .co.tz, .org, .tech, .africa)',
      'Ultra-Fast NVMe SSD Cloud Hosting with Free Automated SSL & Daily Offsite Backups',
      'Professional Corporate Email Suites with Advanced Anti-Spam & Calendar Sync',
      '24/7 Technical Support, Server Hardening & Cloud Migration Consultancy'
    ],
    targetUsers: [
      'SMEs, Startups & Corporate Enterprises',
      'E-Commerce Stores, Media Portals & Institutions',
      'Software Developers & Digital Agencies'
    ],
    techSpecs: [
      '99.9% Uptime SLA with DDoS Protection',
      'Automated SSL Certificates & Daily Snapshots',
      'cPanel / Custom Cloud Control Panel & SSH Access'
    ],
    status: 'Live & Deployed',
    metrics: '99.95% infrastructure uptime with dedicated local support',
    demoPreview: {
      title: 'CREST Cloud & Domain Control Center',
      kpis: [
        { label: 'Network Uptime', value: '99.95%', trend: 'SLA Guaranteed' },
        { label: 'Disk I/O Speed', value: 'NVMe Gen4', trend: '10x Faster' },
        { label: 'SSL Security', value: 'Auto-Active', trend: '256-Bit' }
      ],
      modules: [
        'Domain Search & Instant DNS Registry',
        'NVMe Cloud Hosting & VPS Provisioning',
        'Enterprise Business Email & Security Suite',
        'Automated Backup & SSL Manager'
      ]
    }
  },
  {
    id: 'crest-creamery-foods',
    name: 'Crest Creamery & Consumer Foods',
    divisionId: 'crest-foods',
    divisionName: 'CREST Foods & Beverages',
    category: 'Consumer Goods',
    badge: 'CONSUMER FMCG LINE',
    tagline: 'Premium Ice Cream Production, Cold-Chain Distribution & Quality Consumer Food Products',
    description:
      'Developed under CREST Foods & Beverages, Crest Creamery produces rich, hygienically crafted ice cream varieties and consumer food products tailored for retail outlets, supermarkets, events, hotels, and direct distribution networks.',
    keyFeatures: [
      'Multi-Flavor Artisanal & Commercial Ice Cream Production (Tubs, Cups, Cones & Bulk Catering)',
      'Dedicated Cold-Chain Storage & Refrigerated Distribution Network',
      'Retail Freezer Placement & Stockist Partnership Program for Supermarkets & Shops',
      'Custom Event Catering, Hospitality Supply & Co-Branded Food Product Development'
    ],
    targetUsers: [
      'Supermarkets, Mini-Marts & Retail Stockists',
      'Hotels, Restaurants, Cafes & Event Planners',
      'Regional Wholesale Food Distributors & Consumers'
    ],
    techSpecs: [
      'Strict Food Safety & Quality Assurance Standards',
      'Temperature-Controlled Cold Chain Logistics',
      'High-Margin Stockist & Distributor Partner Packages'
    ],
    status: 'Active Rollout',
    metrics: 'Expanding retail stockist & cold-chain footprint',
    demoPreview: {
      title: 'Crest Creamery & FMCG Distribution Matrix',
      kpis: [
        { label: 'Product SKUs', value: '12+ Flavors', trend: 'Expanding' },
        { label: 'Cold-Chain Temp', value: '-18°C to -22°C', trend: 'Monitored' },
        { label: 'Partner Margin', value: 'High Yield', trend: 'Retail Ready' }
      ],
      modules: [
        'Commercial Ice Cream & Dairy Production',
        'Retail Stockist & Freezer Placement Program',
        'Hospitality & Bulk Event Supply',
        'New Consumer Food Product R&D'
      ]
    }
  }
];

export const INITIAL_PROJECTS: ProjectItem[] = [
  {
    id: 'proj-copetra',
    title: 'Copetra AI — Enterprise Intelligence & Automation Suite',
    divisionId: 'crest-technologies',
    divisionName: 'CREST Technologies',
    category: 'Technology & AI',
    status: 'Active Flagship',
    summary:
      'Design and engineering of CREST Group’s proprietary AI platform delivering autonomous customer engagement, document intelligence, and predictive analytics for corporate clients.',
    impact: 'Enables 24/7 multilingual automation and 68% faster operational workflows.',
    deliverables: ['LLM Orchestration Engine', 'WhatsApp & Web AI Agents', 'Executive BI Dashboard', 'ERP API Connectors'],
    year: '2026',
    clientOrScope: 'Proprietary Flagship / Enterprise Clients'
  },
  {
    id: 'proj-cargoo',
    title: 'Cargoo — Digital Cargo Transportation Marketplace',
    divisionId: 'crest-logistics',
    divisionName: 'CREST Logistics & Transport',
    category: 'Transport & Logistics',
    status: 'Active Flagship',
    summary:
      'End-to-end digital logistics marketplace connecting cargo owners directly with verified truck operators, fleet owners, and transport providers across regional trade corridors.',
    impact: 'Streamlines freight booking, reduces empty return journeys, and brings full transparency to cargo movement.',
    deliverables: ['Shipper Booking Portal', 'Driver & Fleet Mobile App', 'Live GPS Tracking Engine', 'Digital Waybill & e-POD'],
    year: '2026',
    clientOrScope: 'Regional Freight & Logistics Ecosystem'
  },
  {
    id: 'proj-school-portal',
    title: 'CREST School Portal — Multi-Institution EdTech Rollout',
    divisionId: 'crest-technologies',
    divisionName: 'CREST Technologies',
    category: 'Software Systems',
    status: 'Active Flagship',
    summary:
      'Comprehensive cloud school management platform automating student records, academic grading, digital fee collection, and real-time parent communication.',
    impact: 'Digitizes 100% of academic and bursar workflows with instant mobile money reconciliation.',
    deliverables: ['Web Administration Portal', 'Parent & Teacher Mobile App', 'Automated Grading Engine', 'Payment Gateway Integration'],
    year: '2026',
    clientOrScope: 'Educational Institutions & Academies'
  },
  {
    id: 'proj-tradepos',
    title: 'TradePOS — Cloud & Offline Retail POS Ecosystem',
    divisionId: 'crest-technologies',
    divisionName: 'CREST Technologies',
    category: 'Software Systems',
    status: 'Completed',
    summary:
      'High-speed Point of Sale and multi-branch inventory management system built for retail chains, pharmacies, wholesalers, and supermarkets.',
    impact: 'Eliminates stock discrepancies and empowers business owners with live mobile profit tracking.',
    deliverables: ['Offline-First POS Terminal', 'Multi-Branch Inventory Cloud', 'Supplier & Credit Ledger', 'Owner Mobile Analytics'],
    year: '2026',
    clientOrScope: 'Retail & Wholesale Businesses'
  },
  {
    id: 'proj-creamery',
    title: 'Crest Creamery — Ice Cream Production & Retail Distribution Network',
    divisionId: 'crest-foods',
    divisionName: 'CREST Foods & Beverages',
    category: 'Foods & Beverages',
    status: 'Expansion Phase',
    summary:
      'Establishment of modern ice cream production, consumer packaging, branding, and cold-chain retail distribution across urban commercial hubs.',
    impact: 'Delivers premium consumer dairy treats while creating profitable distribution partnerships for local retailers.',
    deliverables: ['Formulation & Production Line', 'Brand Packaging Suite', 'Cold-Chain Fleet Integration', 'Retail Stockist Program'],
    year: '2026',
    clientOrScope: 'FMCG & Consumer Retail Market'
  },
  {
    id: 'proj-executive-park',
    title: 'CREST Commercial & Residential Property Initiative',
    divisionId: 'crest-properties',
    divisionName: 'CREST Properties & Real Estate',
    category: 'Real Estate',
    status: 'Strategic Initiative',
    summary:
      'Strategic land acquisition, modern commercial workspace planning, residential housing development, and digital property leasing management.',
    impact: 'Builds high-yield real estate assets and modern workspaces for growing businesses and families.',
    deliverables: ['Land Acquisition & Masterplan', 'Commercial & Residential Design', 'Property Leasing Portal', 'Investor Co-Development Model'],
    year: '2026–2027',
    clientOrScope: 'Real Estate Investors & Corporate Tenants'
  },
  {
    id: 'proj-agritech-chain',
    title: 'CREST Integrated Agribusiness & Smart Outgrower Program',
    divisionId: 'crest-agribusiness',
    divisionName: 'CREST Agribusiness',
    category: 'Agribusiness & Education',
    status: 'Strategic Initiative',
    summary:
      'Combining commercial crop and livestock production with agricultural processing, distribution, and digital farm management tools for partner farmers.',
    impact: 'Connects primary agricultural production directly to processing and urban food distribution networks.',
    deliverables: ['Commercial Farm Operations', 'Agro-Processing Unit', 'Outgrower Partner Network', 'Agri-Supply Distribution'],
    year: '2026–2028',
    clientOrScope: 'Agricultural Value Chain & Food Security'
  }
];

export const INITIAL_NEWS: NewsArticle[] = [
  {
    id: 'news-1',
    title: 'CREST GROUP Unveils 2026 Comprehensive Corporate Ecosystem & Multi-Industry Expansion Strategy',
    category: 'Corporate Announcement',
    date: 'November 2026',
    readTime: '4 min read',
    author: 'CREST Corporate Communications',
    divisionTag: 'CREST GROUP Corporate',
    featured: true,
    excerpt:
      'CREST GROUP officially establishes its unified digital corporate platform connecting eight strategic business divisions under one vision: "One Group. Multiple Industries. Unlimited Possibilities."',
    content: [
      'CREST GROUP has officially unveiled its comprehensive corporate digital ecosystem, marking a major milestone in the company’s mission to operate as a diversified, technology-driven business group across multiple high-growth industries.',
      'Structured around a disciplined phased expansion roadmap, CREST GROUP is prioritizing immediate market leadership through CREST Technologies and CREST Digital Marketing & Media, followed by rapid scale-up in CREST Logistics & Transport and CREST Foods & Beverages.',
      'Long-term strategic pillars across Properties & Real Estate, Agribusiness, Education & Training, and Investments & Business Development ensure that CREST GROUP is positioned not only for today’s commercial demands, but as an enduring institution for regional and international growth.'
    ]
  },
  {
    id: 'news-2',
    title: 'Introducing Copetra AI, CREST School Portal & TradePOS: Proprietary Technology Built for Scale',
    category: 'Product Launch',
    date: 'November 2026',
    readTime: '5 min read',
    author: 'CREST Technologies Engineering',
    divisionTag: 'CREST Technologies',
    featured: true,
    excerpt:
      'Discover how CREST Technologies is transforming enterprise operations, retail commerce, and educational administration through three flagship proprietary software platforms.',
    content: [
      'CREST Technologies has announced the commercial expansion of its flagship software portfolio: Copetra AI, CREST School Portal, and TradePOS Solutions.',
      'Copetra AI brings practical Artificial Intelligence and workflow automation directly into corporate operations, while TradePOS provides offline-first reliability and multi-branch inventory control for retail and wholesale businesses.',
      'Meanwhile, CREST School Portal continues to modernize educational institutions by unifying academic grading, automated fee reconciliation, and real-time parent communication into a single intuitive platform.'
    ]
  },
  {
    id: 'news-3',
    title: 'Cargoo by CREST Logistics: Reimagining Cargo Movement through a Digital Freight Marketplace',
    category: 'Technology & AI',
    date: 'October 2026',
    readTime: '4 min read',
    author: 'CREST Logistics Strategy Desk',
    divisionTag: 'CREST Logistics & Transport',
    excerpt:
      'How Cargoo is bridging the gap between cargo owners and transport providers with real-time load matching, fleet coordination, and transparent corridor logistics.',
    content: [
      'Freight inefficiency and empty return trips cost regional supply chains millions every year. Under CREST Logistics & Transport, our flagship project Cargoo is engineered to solve this challenge head-on.',
      'By connecting cargo owners directly with verified truck operators and fleet owners through a single digital marketplace, Cargoo streamlines quotations, dispatch coordination, and live shipment visibility from origin to destination.'
    ]
  },
  {
    id: 'news-4',
    title: 'CREST Digital Marketing & Media Launches Executive Brand Authority & Performance Growth Packages',
    category: 'Industry Insight',
    date: 'October 2026',
    readTime: '3 min read',
    author: 'CREST Creative & Media Studio',
    divisionTag: 'CREST Digital Marketing & Media',
    excerpt:
      'Combining corporate identity design, high-converting Google/Meta/TikTok ad campaigns, SEO dominance, and commercial video production for ambitious enterprises.',
    content: [
      'In a crowded digital economy, visibility without brand authority is no longer enough. CREST Digital Marketing & Media has launched tailored growth suites combining corporate identity engineering with measurable performance advertising.',
      'Businesses can now access end-to-end brand strategy, SEO optimization, paid social media campaigns, and professional commercial video production under one roof.'
    ]
  }
];

export const INITIAL_CAREERS: CareerOpening[] = [
  {
    id: 'job-1',
    title: 'Senior Full-Stack Software Engineer (React / Laravel / PostgreSQL)',
    division: 'CREST Technologies',
    location: 'Dar es Salaam / Hybrid',
    type: 'Full-Time',
    experience: '3+ Years',
    summary:
      'Architect and scale CREST GROUP’s proprietary enterprise platforms including TradePOS, CREST School Portal, and internal ecosystem APIs.',
    requirements: [
      'Strong proficiency in React, TypeScript, Vite, and Tailwind CSS',
      'Production experience building secure REST APIs with Laravel / PHP and PostgreSQL',
      'Experience with multi-tenant SaaS architectures, payment gateways, and CI/CD pipelines'
    ],
    deadline: 'Open Rolling'
  },
  {
    id: 'job-2',
    title: 'AI & Intelligent Automation Engineer (Copetra AI)',
    division: 'CREST Technologies',
    location: 'Dar es Salaam / Hybrid',
    type: 'Full-Time',
    experience: '2+ Years',
    summary:
      'Build LLM-powered business agents, RAG pipelines, and intelligent workflow integrations for Copetra AI enterprise deployments.',
    requirements: [
      'Experience with LLM APIs, RAG architectures, vector databases, and Python/TypeScript',
      'Ability to integrate AI workflows with WhatsApp Business API, ERPs, and customer support systems',
      'Strong analytical and problem-solving skills'
    ],
    deadline: 'Open Rolling'
  },
  {
    id: 'job-3',
    title: 'Digital Marketing & Performance Campaigns Lead',
    division: 'CREST Digital Marketing & Media',
    location: 'Dar es Salaam',
    type: 'Full-Time',
    experience: '2+ Years',
    summary:
      'Lead client digital strategy, Google/Meta/TikTok advertising campaigns, SEO growth, and brand communication initiatives.',
    requirements: [
      'Proven track record managing high-ROI paid campaigns across Google Ads, Meta, and TikTok',
      'Strong grasp of SEO, content strategy, analytics reporting, and corporate brand storytelling',
      'Excellent client communication and presentation skills'
    ],
    deadline: 'Open Rolling'
  },
  {
    id: 'job-4',
    title: 'Logistics Operations & Fleet Partnership Coordinator (Cargoo)',
    division: 'CREST Logistics & Transport',
    location: 'Dar es Salaam / Field',
    type: 'Full-Time',
    experience: '2+ Years',
    summary:
      'Coordinate shipper accounts, onboard verified truck and fleet operators onto the Cargoo platform, and oversee corridor freight dispatch.',
    requirements: [
      'Experience in freight forwarding, transport coordination, fleet management, or B2B logistics sales',
      'Strong network within transport operators and commercial cargo shippers',
      'Fluency in English and Swahili'
    ],
    deadline: 'Open Rolling'
  },
  {
    id: 'job-5',
    title: 'Graduate Technology & Business Development Fellow (Internship)',
    division: 'CREST Education & Training',
    location: 'Dar es Salaam',
    type: 'Internship',
    experience: 'Fresh Graduate / Final Year',
    summary:
      'Join CREST GROUP’s intensive rotational fellowship across software engineering, digital media, product growth, and corporate business development.',
    requirements: [
      'Degree or diploma in Computer Science, IT, Business Administration, Marketing, or related field',
      'High ambition, fast learner, and passion for technology-driven entrepreneurship',
      'Strong teamwork and communication abilities'
    ],
    deadline: 'Open Rolling'
  }
];

export const MOBILE_APP_CAPABILITIES = [
  {
    id: 'android-dev',
    title: 'Android Application Development',
    platform: 'Google Play & Enterprise APK',
    description:
      'Native and high-performance Android applications engineered for smartphones, rugged POS terminals, fleet tablets, and field agent devices—optimized for low-bandwidth and offline resilience.',
    highlights: ['Kotlin / React Native / Flutter', 'Offline SQLite & Room Sync', 'POS & Biometric Hardware SDKs']
  },
  {
    id: 'ios-dev',
    title: 'iOS Application Development',
    platform: 'Apple App Store & iPadOS',
    description:
      'Sleek, secure, executive-grade iOS and iPadOS applications with fluid animations, FaceID/TouchID security, and seamless Apple ecosystem integration.',
    highlights: ['Swift / Cross-Platform iOS', 'Biometric Auth & Push Alerts', 'App Store Compliance & Publishing']
  },
  {
    id: 'cross-platform',
    title: 'Cross-Platform Applications',
    platform: 'Unified Android, iOS & Web Codebase',
    description:
      'Rapid time-to-market with unified codebases delivering native-grade performance across both Android and iOS while cutting maintenance overhead by 40%.',
    highlights: ['Single Unified Architecture', 'Real-Time OTA Updates', 'Consistent Brand UI/UX']
  },
  {
    id: 'business-erp-apps',
    title: 'Business & Enterprise Applications',
    platform: 'Executive, HR, Sales & Field Force',
    description:
      'Custom mobile companions for ERP, sales force automation, inventory audits, approvals, and executive KPI monitoring on the go.',
    highlights: ['Live Executive Dashboards', 'Field Sales & Geo-Check-in', 'Role-Based Secure Access']
  },
  {
    id: 'ecommerce-apps',
    title: 'E-Commerce & Consumer Applications',
    platform: 'Retail, Food Delivery & Marketplaces',
    description:
      'High-conversion mobile shopping apps featuring instant Mobile Money (M-Pesa, Mixx by Yass, Airtel Money, HaloPesa) & card checkout, live order tracking, and loyalty rewards.',
    highlights: ['Mobile Money & Card Checkout', 'Live Delivery Rider Tracking', 'Push Promo & Loyalty Engine']
  },
  {
    id: 'logistics-apps',
    title: 'Logistics & Transportation Applications',
    platform: 'Fleet, Driver & Cargo Marketplaces',
    description:
      'Powering platforms like Cargoo with live GPS telemetry, driver dispatch, digital proof of delivery (e-POD), route optimization, and automated freight settlement.',
    highlights: ['Live GPS & Route Telemetry', 'Digital Waybills & e-POD', 'Driver & Shipper Dual Apps']
  },
  {
    id: 'educational-apps',
    title: 'Educational & e-Learning Applications',
    platform: 'Schools, Colleges & Corporate LMS',
    description:
      'Interactive mobile apps for CREST School Portal and digital learning platforms—connecting parents, students, and educators with instant grades, fees, and video lessons.',
    highlights: ['Parent Fee & Report Card App', 'Interactive Video & Quiz LMS', 'Offline Study Mode']
  },
  {
    id: 'integration-maintenance',
    title: 'Application Integration & Maintenance',
    platform: '24/7 Lifecycle & API Engineering',
    description:
      'Continuous SLA maintenance, OS version upgrades, security patching, cloud scaling, and deep API integration with banks, telecoms, and legacy systems.',
    highlights: ['Payment & Telecom API Links', '99.9% Uptime Monitoring', 'App Store & Play Store Lifecycle']
  }
];

export const DEVELOPMENT_ROADMAP = [
  {
    phase: 'Phase 1',
    title: 'Planning & Architecture',
    status: 'Completed',
    items: [
      'Comprehensive requirements gathering across 8 divisions',
      'Enterprise website & ecosystem architecture',
      'Multi-division sitemap development',
      'Structured corporate content organization'
    ]
  },
  {
    phase: 'Phase 2',
    title: 'Executive UI/UX Design',
    status: 'Completed',
    items: [
      'Dark Forest Green, Premium Gold & Cream brand identity system',
      'Corporate homepage & interactive ecosystem explorer',
      'Dedicated business division & product catalogue layouts',
      'Mobile-first responsive interface design'
    ]
  },
  {
    phase: 'Phase 3',
    title: 'Core Platform Development',
    status: 'Active / Delivered',
    items: [
      'Frontend engineering using Vite, React & Tailwind CSS',
      'API-ready modular architecture (Laravel / PHP + PostgreSQL schema ready)',
      'Interactive CMS & Administrative Management Dashboard',
      'WhatsApp, quotation & partnership workflow integrations'
    ]
  },
  {
    phase: 'Phase 4',
    title: 'Quality Assurance & Testing',
    status: 'Active',
    items: [
      'End-to-end functional & interactive flow testing',
      'Form validation & security hardening checks',
      'Core Web Vitals & Vite bundle performance optimization',
      'Cross-device responsive & User Acceptance Testing (UAT)'
    ]
  },
  {
    phase: 'Phase 5',
    title: 'Production Deployment',
    status: 'Ready',
    items: [
      'Official corporate domain & DNS configuration',
      'Cloud production hosting & SSL encryption setup',
      'Technical SEO indexing & structured schema markup',
      'Real-time analytics & conversion monitoring'
    ]
  },
  {
    phase: 'Phase 6',
    title: 'Maintenance & Ecosystem Expansion',
    status: 'Ongoing Horizon',
    items: [
      'Continuous technical maintenance & security updates',
      'Seamless onboarding of Phase 2 & Phase 3 business divisions',
      'Direct SSO & API links to Copetra AI, TradePOS & Cargoo',
      'International market & investor portal expansion'
    ]
  }
];
// Note: Customer inquiries, partnership proposals, and career applications contain
// sensitive PII and are stored EXCLUSIVELY in the server-side AES-256-GCM encrypted
// SQLite database (server/database.mjs) — never shipped in public frontend bundles.
