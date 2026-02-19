import { redirect } from 'next/navigation'

export default async function ProductsPage({ params }: { params: Promise<{ companySlug: string }> }) {
  const { companySlug } = await params
  redirect(`/${companySlug}/development/products`)
}
