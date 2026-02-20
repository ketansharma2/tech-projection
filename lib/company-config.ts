export type CompanySlug = 'maven' | 'mks' | 'savvi' | 'profit-pathshala'

export interface CompanyTheme {
  name: string
  slug: CompanySlug
  primaryColor: string
  headingColor: string
  logoUrl: string
  gradient?: string
  logoBackground?: string
  logoInitials?: string
  switcherName?: string
  domain?: string
  tagline?: string
  techDescription?: string
}

export const companyThemeConfig: Record<CompanySlug, CompanyTheme> = {
  maven: {
    name: 'Maven',
    slug: 'maven',
    primaryColor: '#103c7f',
    headingColor: '#103c7f',
    logoUrl: 'https://via.placeholder.com/32?text=M',
    logoBackground: '#103c7f',
    logoInitials: 'M',
    switcherName: 'Maven Jobs',
    domain: 'maven.jobs',
    tagline: 'Leading recruitment and staffing solutions',
    techDescription: 'Data-driven recruitment technology, automation pipelines, and candidate management systems',
  },
  mks: {
    name: 'MKS',
    slug: 'mks',
    primaryColor: '#6366f1',
    headingColor: '#4f46e5',
    logoUrl: 'https://via.placeholder.com/32?text=MK',
    logoBackground: '#6366f1',
    logoInitials: 'MK',
    switcherName: 'MKS',
    domain: 'mks.work',
    tagline: 'Digital transformation and IT services',
    techDescription: 'Comprehensive tech solutions including software development, cloud infrastructure, and digital marketing',
  },
  savvi: {
    name: 'Savvi',
    slug: 'savvi',
    primaryColor: '#ec4899',
    headingColor: '#be185d',
    logoUrl: 'https://via.placeholder.com/32?text=S',
    logoBackground: '#ec4899',
    logoInitials: 'S',
    switcherName: 'Savvi',
    domain: 'savvi.ai',
    tagline: 'AI-powered business solutions',
    techDescription: 'Cutting-edge AI and machine learning solutions for business automation and growth',
  },
  'profit-pathshala': {
    name: 'Profit Pathshala',
    slug: 'profit-pathshala',
    primaryColor: '#d97706',
    headingColor: '#1f2937',
    logoUrl: 'https://via.placeholder.com/32?text=PP',
    logoBackground: '#d97706',
    logoInitials: 'PP',
    switcherName: 'Profit Pathshala',
    domain: 'profitpathshala.com',
    tagline: 'E-commerce and digital education platform',
    techDescription: 'E-commerce solutions combined with digital education and skill development platforms',
  },
}

export const allCompanies = Object.values(companyThemeConfig)

export function getCompanyTheme(slug: string): CompanyTheme {
  const theme = companyThemeConfig[slug as CompanySlug]
  return theme || companyThemeConfig.maven
}
