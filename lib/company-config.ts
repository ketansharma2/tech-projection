export type CompanySlug = 'maven' | 'mks' | 'savvi' | 'profit-pathshala'

export interface CompanyTheme {
  name: string
  slug: CompanySlug
  primaryColor: string
  headingColor: string
  logoUrl: string
  gradient?: string
}

export const companyThemeConfig: Record<CompanySlug, CompanyTheme> = {
  maven: {
    name: 'Maven',
    slug: 'maven',
    primaryColor: '#103c7f',
    headingColor: '#103c7f',
    logoUrl: 'https://via.placeholder.com/32?text=M',
  },
  mks: {
    name: 'MKS',
    slug: 'mks',
    primaryColor: '#6366f1',
    headingColor: '#4f46e5',
    logoUrl: 'https://via.placeholder.com/32?text=MK',
  },
  savvi: {
    name: 'Savvi',
    slug: 'savvi',
    primaryColor: '#ec4899',
    headingColor: '#be185d',
    logoUrl: 'https://via.placeholder.com/32?text=S',
  },
  'profit-pathshala': {
    name: 'Profit Pathshala',
    slug: 'profit-pathshala',
    primaryColor: '#d97706',
    headingColor: '#1f2937',
    logoUrl: 'https://via.placeholder.com/32?text=PP',
  },
}

export const allCompanies = Object.values(companyThemeConfig)

export function getCompanyTheme(slug: string): CompanyTheme {
  const theme = companyThemeConfig[slug as CompanySlug]
  return theme || companyThemeConfig.maven
}
