"use client"

import { useEffect, useState } from "react"
import { Pie, PieChart, LabelList } from "recharts"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
} from "@/components/ui/chart"
import { fetchWithAuth } from "@/lib/auth"

type CapitalData = {
  [ticker: string]: number
}

type DataEntry = {
  ticker: string
  amount: number
  fill: string
}

// ✅ Tooltip personnalisé
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length > 0) {
    const { name, value } = payload[0]
    return (
      <div className="rounded-md bg-background p-2 text-sm shadow">
        <div className="text-muted-foreground text-xs font-medium">{name}</div>
        <div className="text-foreground font-semibold">{value.toFixed(2)} €</div>
      </div>
    )
  }
  return null
}

export function RepartitionPieChart() {
  const [chartData, setChartData] = useState<DataEntry[]>([])
  const [chartConfig, setChartConfig] = useState<ChartConfig>({})

  useEffect(() => {
    const fetchData = async () => {
      try {
        const tickersRes = await fetchWithAuth("http://localhost:8000/api/transaction/tickers/")
        const tickers: string[] = await tickersRes.json()

        const pricesRes = await fetchWithAuth("http://localhost:8000/api/transaction/ticker/price/")
        const prices: CapitalData = await pricesRes.json()

        const colorPalette = [
          "var(--chart-1)",
          "var(--chart-2)",
          "var(--chart-3)",
          "var(--chart-4)",
          "var(--chart-5)",
          "var(--chart-6)",
          "var(--chart-7)",
          "var(--chart-8)",
        ]

        const data: DataEntry[] = tickers.map((ticker, index) => ({
          ticker,
          amount: prices[ticker] ?? 0,
          fill: colorPalette[index % colorPalette.length],
        }))

        const config: ChartConfig = {
          amount: { label: "Montant (€)" },
        }

        tickers.forEach((ticker, index) => {
          config[ticker] = {
            label: ticker,
            color: colorPalette[index % colorPalette.length],
          }
        })

        setChartData(data)
        setChartConfig(config)
      } catch (error) {
        console.error("Erreur de chargement des données :", error)
      }
    }

    fetchData()
  }, [])

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>Répartition du capital investi par ETF</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="[&_.recharts-text]:fill-background mx-auto aspect-square max-h-[250px]"
        >
          <PieChart>
            <ChartTooltip content={<CustomTooltip />} />
            <Pie data={chartData} dataKey="amount" nameKey="ticker">
              <LabelList
                dataKey="none"
                className="fill-background"
                stroke="none"
                fontSize={12}
                formatter={(value: keyof typeof chartConfig) =>
                  chartConfig[value]?.label
                }
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
