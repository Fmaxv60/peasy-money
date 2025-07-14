"use client"

import React from "react"
import { fetchWithAuth } from "@/lib/auth" // Assure-toi que ce chemin est correct

export function TotalSummary() {
  const [total, setTotal] = React.useState<number | null>(null)
  const [yesterdayTotal, setYesterdayTotal] = React.useState<number | null>(null)

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
  }, [])

  if (total === null || yesterdayTotal === null) {
    return <p className="text-muted-foreground">Chargement du total...</p>
  }

  const diff = total - yesterdayTotal
  const formattedDiff = diff.toLocaleString("fr-FR", {
    style: "currency",
    currency: "EUR",
  })
  const colorClass =
    diff > 0 ? "text-green-600" :
    diff < 0 ? "text-red-600" :
    "text-black"

  return (
    <p className={`text-sm font-medium ${colorClass}`}>
      {total.toLocaleString("fr-FR", {
            style: "currency",
            currency: "EUR",
        })
      } ({diff > 0 ? "+" : ""}{formattedDiff})
    </p>
  )
}
