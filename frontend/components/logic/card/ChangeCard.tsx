"use client"

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
import React from "react"
import { fetchWithAuth } from "@/lib/auth"

export function ChangeCard() {
  const [total, setTotal] = React.useState<number | null>(null)
  const [yesterdayTotal, setYesterdayTotal] = React.useState<number | null>(null)
  const loading = total === null || yesterdayTotal === null

  const getYesterdayDate = () => {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    return yesterday.toISOString().split("T")[0]
  }

  React.useEffect(() => {
    const fetchTotals = async () => {
      try {
        const [todayRes, yesterdayRes] = await Promise.all([
          fetchWithAuth(`http://127.0.0.1:8000/api/transaction/price/total`),
          fetchWithAuth(`http://127.0.0.1:8000/api/transaction/price/total?date_param=${getYesterdayDate()}`),
        ])
        const todayPrice = await todayRes.json()
        const yesterdayPrice = await yesterdayRes.json()
        setTotal(todayPrice)
        setYesterdayTotal(yesterdayPrice)
      } catch (error) {
        console.error("Erreur lors du fetch :", error)
      }
    }

    fetchTotals()
    const interval = setInterval(fetchTotals, 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  const { difference, formattedDiff, percentageDiff, trendIcon, trendColor } = React.useMemo(() => {
    if (total === null || yesterdayTotal === null) {
      return {
        difference: 0,
        formattedDiff: "",
        percentageDiff: "",
        trendIcon: null,
        trendColor: "",
      }
    }

    const diff = total - yesterdayTotal
    const formatted = diff.toLocaleString("fr-FR", {
      style: "currency",
      currency: "EUR",
    })
    const percentage = yesterdayTotal !== 0 ? ((diff / yesterdayTotal) * 100).toFixed(2) + " %" : "N/A"
    const trend =
      diff > 0 ? <TrendingUpIcon className="size-3" /> :
      diff < 0 ? <TrendingDownIcon className="size-3" /> :
      <span className="text-gray-500 text-xs">=</span>
    const colorClass =
      diff > 0 ? "text-green-600" :
      diff < 0 ? "text-red-600" :
      "text-black"

    return {
      difference: diff,
      formattedDiff: diff > 0 ? `+${formatted}` : formatted,
      percentageDiff: percentage,
      trendIcon: trend,
      trendColor: colorClass,
    }
  }, [total, yesterdayTotal])

  return (
    <Card className="@container/card w-full">
      <CardHeader className="relative">
        <CardDescription>Différence depuis hier</CardDescription>
        <CardTitle
          className={`@[250px]/card:text-3xl text-2xl font-semibold tabular-nums ${loading ? "" : trendColor}`}
        >
          {loading ? (
            <Skeleton className="h-10 w-1/2" />
          ) : (
            formattedDiff
          )}
        </CardTitle>
        <div className="absolute right-4 top-4">
          <Badge variant="outline" className="flex gap-1 rounded-lg text-xs">
            {loading ? (
              <Skeleton className="h-4 w-18" />
            ) : (
              <>
                {trendIcon}
                {percentageDiff}
              </>
            )}
          </Badge>
        </div>
      </CardHeader>
      <CardFooter className="flex-col items-start gap-1 text-sm">
        <div className="line-clamp-1 flex gap-2 font-medium">
          Tendance
          {loading ? null : (
            difference > 0 ? (
              <TrendingUpIcon className="size-4 relative top-[4px]" />
            ) : difference < 0 ? (
              <TrendingDownIcon className="size-4 relative top-[4px]" />
            ) : (
              <span className="text-gray-500 text-xs">=</span>
            )
          )}
        </div>
        <div className="text-muted-foreground">
          Différence de la somme totale du PEA depuis hier
        </div>
      </CardFooter>
    </Card>
  )
}
