"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Checkbox } from "@/components/ui/checkbox"

export type Transaction = {
  id: number
  quantity: number
  date_of: string
  type: string
  ticker: string
  price: number
  user_id: number
}

export const columns: ColumnDef<Transaction>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "date_of",
    header: "Date",
  },
  {
    accessorKey: "ticker",
    header: "Ticker",
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => {
      const type = row.getValue("type") as string;
      let color = "text-gray-900";
      if (type === "achat") {
        color = "text-green-500";
      } else if (type === "vente") {
        color = "text-red-500";
      }
      return <div className={color}>{type}</div>;
    },
  },
  {
    accessorKey: "quantity",
    header: "Quantité",
  },
  {
    accessorKey: "price",
    header: "Prix (€)",
    cell: ({ row }) => {
      const price = parseFloat(row.getValue("price"))
      return <div>{price.toFixed(2)} €</div>
    },
  },
]
