"use client"

import React from "react"
import { TrendingDownIcon, TrendingUpIcon } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { fetchWithAuth } from "@/lib/auth"

export function SummaryCard() {
  const [total, setTotal] = React.useState(0)
  const [totalInvest, setTotalInvest] = React.useState(0)
  const [loading, setLoading] = React.useState(true)

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [resTotal, resInvest] = await Promise.all([
          fetchWithAuth("http://127.0.0.1:8000/api/transaction/price/total"),
          fetchWithAuth("http://127.0.0.1:8000/api/transaction/price/total_invest"),
        ])
        const [priceTotal, priceInvest] = await Promise.all([
          resTotal.json(),
          resInvest.json(),
        ])
        setTotal(priceTotal)
        setTotalInvest(priceInvest)
      } catch (error) {
        console.error("Erreur lors du fetch :", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const variation = React.useMemo(() => totalInvest !== 0
    ? ((total - totalInvest) / totalInvest) * 100
    : 0, [total, totalInvest])

  const formatCurrency = (value: number) =>
    value.toLocaleString("fr-FR", {
      style: "currency",
      currency: "EUR",
    })

  const trendIcon = (size: string) => {
    if (total > totalInvest) return <TrendingUpIcon className={size} />
    if (total < totalInvest) return <TrendingDownIcon className={size} />
    return <span className="text-gray-500 text-xs">=</span>
  }

  return (
    <Card className="@container/card w-full">
      <CardHeader className="relative">
        <CardDescription>Total PEA</CardDescription>
        <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
          {loading ? (
            <Skeleton className="h-10 w-1/2" />
          ) : (
            formatCurrency(total)
          )}
        </CardTitle>
        <div className="absolute right-4 top-4">
          <Badge variant="outline" className="flex gap-1 rounded-lg text-xs">
            {trendIcon("size-3")}
            {`${variation.toFixed(2)} %`}
          </Badge>
        </div>
      </CardHeader>
      <CardFooter className="flex-col items-start gap-1 text-sm">
        <div className="line-clamp-1 flex gap-2 font-medium">
          Tendance
          {trendIcon("size-4 relative top-[4px]")}
        </div>
        <div className="text-muted-foreground">
          Valeur totale du PEA depuis le début
        </div>
      </CardFooter>
    </Card>
  )
}
