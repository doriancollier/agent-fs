import { ShowcaseSidebar } from './_components/ShowcaseSidebar'
import { ShowcaseHeader } from './_components/ShowcaseHeader'

export default function ShowcaseLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <ShowcaseSidebar />
      <div className="flex-1 flex flex-col">
        <ShowcaseHeader />
        <main className="flex-1 container-wide py-8">
          {children}
        </main>
      </div>
    </div>
  )
}
