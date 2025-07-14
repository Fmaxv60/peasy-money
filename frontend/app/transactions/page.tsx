import { RepartitionPieChart } from "@/components/logic/chart/RepartitionPieChart"
import { DataTableTransaction } from "@/components/logic/transactions/DataTable"

export default function Home() {
  return (
    <main className="p-6">
      <RepartitionPieChart />
      <DataTableTransaction />
    </main>
  )
}
