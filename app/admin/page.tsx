export default function AdminPage() {
  return (
    <div className="pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="mt-4 text-gray-600">
          Admin pages will be created here. Navigate to a company-specific admin page:
        </p>
        <ul className="mt-4 space-y-2">
          <li><a href="/maven/admin" className="text-blue-600 hover:underline">Maven Admin</a></li>
          <li><a href="/mks/admin" className="text-blue-600 hover:underline">MKS Admin</a></li>
        </ul>
      </div>
    </div>
  )
}
