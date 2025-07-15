import { InvestedCard } from "@/components/logic/card/InvestedCard"
import { RepartitionPieChart } from "@/components/logic/chart/RepartitionPieChart"
import { DataTableTransaction } from "@/components/logic/transactions/DataTable"

export default function Home() {
  return (
    <main className="p-6">
      <div className="flex flex-wrap gap-4">
        <div className="flex-1 min-w-[300px]">
          <InvestedCard />
        </div>
        <div className="flex-1 min-w-[300px]">
          <RepartitionPieChart />
        </div>
      </div>
      <DataTableTransaction />
    </main>
  )
}
