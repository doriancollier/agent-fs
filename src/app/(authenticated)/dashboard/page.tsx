import { requireAuthOrRedirect } from '@/layers/shared/api/auth'
import { SignOutButton } from '@/layers/features/auth'

export default async function DashboardPage() {
  const { user } = await requireAuthOrRedirect()

  return (
    <div className="container py-12">
      <div className="space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-semibold">Dashboard</h1>
            <p className="text-muted-foreground mt-2">
              Welcome back, {user.name}
            </p>
          </div>
          <SignOutButton />
        </div>

        <div className="rounded-xl border bg-card p-6 shadow-soft">
          <h2 className="text-lg font-medium mb-4">Your Account</h2>
          <dl className="space-y-3">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Email</dt>
              <dd className="font-medium">{user.email}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Name</dt>
              <dd className="font-medium">{user.name}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Member since</dt>
              <dd className="font-medium">
                {new Date(user.createdAt).toLocaleDateString()}
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  )
}
