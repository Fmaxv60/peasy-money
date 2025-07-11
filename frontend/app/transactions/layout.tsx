import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/logic/sidebar/AppSidebar"
import { TotalSummary } from "@/components/logic/text/Total"

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="w-full p-4">
        <div className="flex items-center justify-between mb-4">
          <SidebarTrigger />
          <TotalSummary />
        </div>
        {children}
      </main>
    </SidebarProvider>
  )
}
