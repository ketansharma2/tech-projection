export default function HodPage() {
  return (
    <div className="pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold">HOD Dashboard</h1>
        <p className="mt-4 text-gray-600">
          HOD pages will be created here. Navigate to a company-specific HOD page:
        </p>
        <ul className="mt-4 space-y-2">
          <li><a href="/hod/maven" className="text-blue-600 hover:underline">Maven HOD</a></li>
          <li><a href="/hod/mks" className="text-blue-600 hover:underline">MKS HOD</a></li>
        </ul>
      </div>
    </div>
  )
}
