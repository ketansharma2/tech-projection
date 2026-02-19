export default function UserPage() {
  return (
    <div className="pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold">User Dashboard</h1>
        <p className="mt-4 text-gray-600">
          User pages will be created here. Navigate to a company-specific user page:
        </p>
        <ul className="mt-4 space-y-2">
          <li><a href="/maven/user" className="text-blue-600 hover:underline">Maven User</a></li>
          <li><a href="/mks/user" className="text-blue-600 hover:underline">MKS User</a></li>
        </ul>
      </div>
    </div>
  )
}
