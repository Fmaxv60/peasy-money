"use client"

import { useEffect, useState } from "react"
import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { useIsMobile } from "@/hooks/use-mobile"
import { fetchWithAuth } from "@/lib/auth"

const chartConfig = {
  peaValue: {
    label: "Valeur PEA",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig

export function TickerChart() {
  const isMobile = useIsMobile()
  const [peaHistoryData, setPeaHistoryData] = useState<{ date: string, value: number }[]>([])
  const [loading, setLoading] = useState(false)
  const [timeRange, setTimeRange] = useState("1m")

  useEffect(() => {
    if (isMobile) setTimeRange("7j")
  }, [isMobile])

  useEffect(() => {
    const fetchPeaHistory = async () => {
      try {
        setLoading(true)
        const res = await fetchWithAuth(
          `http://127.0.0.1:8000/api/transaction/price/total_history?period=${timeRange}`
        )
        const data = await res.json()
        setPeaHistoryData(data)
      } catch (error) {
        console.error("Erreur récupération historique PEA :", error)
      } finally {
        setLoading(false)
      } 
    }

    fetchPeaHistory()
  }, [timeRange])

  return (
    <Card className="@container/card">
      <CardHeader className="relative">
        <CardTitle>Évolution du PEA</CardTitle>
        <CardDescription>
          Valeur totale du PEA sur la période sélectionnée
        </CardDescription>

        <div className="absolute right-4 top-4 flex gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Range" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="5a">5 dernières années</SelectItem>
              <SelectItem value="1a">1 dernière année</SelectItem>
              <SelectItem value="3m">3 derniers mois</SelectItem>
              <SelectItem value="1m">1 dernier mois</SelectItem>
              <SelectItem value="7d">7 derniers jours</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        {loading && (
          <div className="h-[250px] w-full">
            <Skeleton className="h-full w-full rounded-xl" />
          </div>
        )}
        {!loading && peaHistoryData.length > 0 && (
          <ChartContainer className="aspect-auto h-[250px] w-full" config={chartConfig}>
            <AreaChart data={peaHistoryData}>
              <defs>
                <linearGradient id="fillPea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#4f46e5" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                minTickGap={32}
                tickFormatter={(value) =>
                  new Date(value).toLocaleDateString("fr-FR", {
                    month: "short",
                    day: "numeric",
                  })
                }
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={2}
                width={40}
                tickFormatter={(value) => `${value.toFixed(0)} €`}
              />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    labelFormatter={(value) =>
                      new Date(value).toLocaleDateString("fr-FR", {
                        month: "short",
                        day: "numeric",
                      })
                    }
                    indicator="dot"
                  />
                }
              />
              <Area
                dataKey="value"
                type="monotone"
                fill="url(#fillPea)"
                stroke="#4f46e5"
                strokeWidth={2}
              />
            </AreaChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}
