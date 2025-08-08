export default function DashboardPage() {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
      <section className="card col-span-1 p-6 lg:col-span-8">
        <h2 className="mb-2 text-lg font-semibold">Overview</h2>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">Interactive charts for time tracking and invoices will appear here.</p>
      </section>
      <aside className="card col-span-1 p-6 lg:col-span-4">
        <h3 className="mb-2 text-base font-semibold">Notifications</h3>
        <p className="text-sm text-neutral-600 dark:text-neutral-400">No notifications yet.</p>
      </aside>
    </div>
  )
}