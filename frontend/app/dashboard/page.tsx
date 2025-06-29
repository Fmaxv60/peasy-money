import { DataTableTransaction } from "@/components/logic/transactions/DataTable"
import { TickerChart } from "@/components/logic/chart/TickerChart"
import { SummaryCard } from "@/components/logic/card/SummaryCard"
import { ChangeCard } from "@/components/logic/card/ChangeCard"


export default function Home() {
  return (
    <main className="p-6">
      <div className="flex gap-4 items-stretch">
        <div className="w-1/3 flex flex-col justify-between">
          <SummaryCard />
          <ChangeCard />
        </div>
        <div className="w-2/3">
          <TickerChart />
        </div>
      </div>
      <h1 className="text-2xl font-bold mt-4">Transactions</h1>
      <DataTableTransaction />
    </main>
  )
}
