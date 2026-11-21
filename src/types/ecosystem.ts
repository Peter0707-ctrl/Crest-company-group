export type ActiveTab =
  | 'home'
  | 'about'
  | 'businesses'
  | 'products'
  | 'mobile-apps'
  | 'projects'
  | 'news'
  | 'partnerships'
  | 'careers'
  | 'contact'
  | 'admin';

export type ExpansionPhase = 'Phase 1: Initial Priority' | 'Phase 2: Subsequent Expansion' | 'Phase 3: Long-Term Expansion';

export interface Division {
  id: string;
  code: string;
  name: string;
  shortName: string;
  tagline: string;
  description: string;
  phase: ExpansionPhase;
  iconName: string;
  accentColor: string;
  activities: string[];
  flagshipProducts: string[];
  featuredProjects: string[];
  metrics: {
    label: string;
    value: string;
  }[];
  partnershipModel: string;
  heroImage: string;
}

export interface ProductItem {
  id: string;
  name: string;
  divisionId: string;
  divisionName: string;
  category: 'AI & Automation' | 'Enterprise & POS' | 'EdTech' | 'Logistics Marketplace' | 'Cloud & Infrastructure' | 'Consumer Goods';
  badge: string;
  tagline: string;
  description: string;
  keyFeatures: string[];
  targetUsers: string[];
  techSpecs: string[];
  status: 'Live & Deployed' | 'Active Rollout' | 'Pilot & Beta' | 'In Development';
  metrics: string;
  demoPreview: {
    title: string;
    kpis: { label: string; value: string; trend: string }[];
    modules: string[];
  };
}

export interface ProjectItem {
  id: string;
  title: string;
  divisionId: string;
  divisionName: string;
  category: 'Technology & AI' | 'Software Systems' | 'Transport & Logistics' | 'Foods & Beverages' | 'Real Estate' | 'Agribusiness & Education';
  status: 'Active Flagship' | 'Completed' | 'Expansion Phase' | 'Strategic Initiative';
  summary: string;
  impact: string;
  deliverables: string[];
  year: string;
  clientOrScope: string;
}

export interface NewsArticle {
  id: string;
  title: string;
  category: 'Corporate Announcement' | 'Product Launch' | 'Technology & AI' | 'Strategic Partnership' | 'Industry Insight' | 'Company Event';
  date: string;
  readTime: string;
  author: string;
  excerpt: string;
  content: string[];
  divisionTag: string;
  featured?: boolean;
}

export interface CareerOpening {
  id: string;
  title: string;
  division: string;
  location: string;
  type: 'Full-Time' | 'Internship' | 'Contract / Consultant' | 'Graduate Trainee';
  experience: string;
  summary: string;
  requirements: string[];
  deadline: string;
}

export interface CustomerInquiry {
  id: string;
  fullName: string;
  organization: string;
  email: string;
  phone: string;
  division: string;
  serviceOrProduct: string;
  budgetRange: string;
  message: string;
  createdAt: string;
  status: 'New' | 'In Review' | 'Quoted' | 'Resolved';
}

export interface PartnershipRequest {
  id: string;
  organizationName: string;
  contactPerson: string;
  email: string;
  phone: string;
  partnershipType: 'Strategic Collaboration' | 'Joint Venture' | 'Equity / Project Investment' | 'Distribution & Supply Chain' | 'Technology Integration';
  targetDivision: string;
  investmentCapacity: string;
  proposalSummary: string;
  createdAt: string;
  status: 'Pending Review' | 'Executive Committee' | 'Approved';
}

export interface CareerApplication {
  id: string;
  jobId: string;
  jobTitle: string;
  applicantName: string;
  email: string;
  phone: string;
  portfolioOrLinkedin: string;
  experienceYears: string;
  coverNote: string;
  createdAt: string;
  status: 'Submitted' | 'Shortlisted' | 'Interviewing';
}
