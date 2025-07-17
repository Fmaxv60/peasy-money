"use client"

import * as React from "react"
import {
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  getCoreRowModel,
  useReactTable,
  flexRender,
} from "@tanstack/react-table"
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { columns, Transaction } from "./columns"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { AlertCircle, ChevronDown, Plus } from "lucide-react"
import { fetchWithAuth } from "@/lib/auth"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { toast } from "sonner"

export function DataTableTransaction({ onTransactionAdded }: { onTransactionAdded?: () => void }) {
  const [data, setData] = React.useState<Transaction[]>([])
  const [loading, setLoading] = React.useState(true)
  const [sorting, setSorting] = React.useState<SortingState>([
    { id: "date_of", desc: true },
  ])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})
  const [pageIndex, setPageIndex] = React.useState(0)
  const [pageSize, setPageSize] = React.useState(10)
  const firstCellRef = React.useRef<HTMLTableCellElement | null>(null)
  const [cellHeight, setCellHeight] = React.useState<number | null>(null)
  const [open, setOpen] = React.useState(false)

  const [ticker, setTicker] = React.useState("")
  const [quantity, setQuantity] = React.useState("")
  const [price, setPrice] = React.useState("")
  const [date, setDate] = React.useState("")

  // Auto-complétion
  const [tickers, setTickers] = React.useState<{ [name: string]: string }>({})
  const [suggestions, setSuggestions] = React.useState<string[]>([])
  const [isTickerFocused, setIsTickerFocused] = React.useState(false)

  React.useEffect(() => {
    if (firstCellRef.current) {
      setCellHeight(firstCellRef.current.offsetHeight)
    }
  }, [firstCellRef.current])

  const fetchTransactions = async () => {
    setLoading(true)
    try {
      const offset = pageIndex * pageSize
      const res = await fetchWithAuth(
        `http://127.0.0.1:8000/api/transaction/?user_id=1&page_size=${pageSize}&page=${offset}`
      )
      const transactions = await res.json()
      setData(transactions)
    } catch (error) {
      console.error("Erreur lors du fetch :", error)
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => {
    fetchTransactions()
  }, [pageIndex, pageSize])

  // Charger les tickers
  React.useEffect(() => {
    const fetchTickers = async () => {
      const res = await fetchWithAuth("http://127.0.0.1:8000/api/ticker/")
      if (!res.ok) return
      const data = await res.json()
      setTickers(data)
    }
    fetchTickers()
  }, [])

  // Mettre à jour les suggestions
  React.useEffect(() => {
    if (ticker.trim().length === 0) {
      setSuggestions([])
      return
    }

    const filtered = Object.keys(tickers).filter(name =>
      name.toLowerCase().includes(ticker.toLowerCase())
    )
    setSuggestions(filtered.slice(0, 5))
  }, [ticker, tickers])


  const table = useReactTable({
    data,
    columns,
    manualPagination: true,
    pageCount: -1,
    state: {
      pagination: {
        pageIndex,
        pageSize,
      },
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
    onPaginationChange: (updater) => {
      const newState = typeof updater === "function" ? updater({ pageIndex, pageSize }) : updater
      setPageIndex(newState.pageIndex)
      setPageSize(newState.pageSize)
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <div className="w-full">
      <div className="flex items-center py-4">
        <Input
          placeholder="Filtrer par ticker..."
          value={(table.getColumn("ticker")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("ticker")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        <div className="flex gap-2 ml-auto">
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="bg-green-600 text-white hover:bg-green-700">
                <Plus className="w-4 h-4" />
                Ajouter une transaction
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-[700px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Ajouter une transaction</DialogTitle>
              </DialogHeader>
              <form
                onSubmit={async (e) => {
                  e.preventDefault()

                  const payload = {
                    ticker,
                    quantity: Number(quantity),
                    price: Number(price),
                    date_of: date,
                    type: "achat",
                  }

                  try {
                    const res = await fetchWithAuth("http://127.0.0.1:8000/api/transaction/", {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                      },
                      body: JSON.stringify(payload),
                    })

                    if (!res.ok) {
                      if (res.status === 400) {
                        toast("Ticker non valide", {
                          description: "Le ticker que vous avez entré n'est pas valide. Assurez-vous d'utiliser le format correct.",
                          style: {
                            backgroundColor: "#fef2f2",
                            color: "#b91c1c",
                            border: "1px solid #b91c1c",
                          },
                          className: "shadow-md rounded-md",
                          descriptionClassName: "text-xs text-red-700",
                          actionButtonStyle: {
                            backgroundColor: "#b91c1c",
                            color: "#fff",
                          }
                        })
                      }
                      else {
                        toast("Erreur d'ajout de la transaction", {
                          description: "Une erreur est survenue lors de l'ajout de la transaction.",
                          style: {
                            backgroundColor: "#fef2f2",
                            color: "#b91c1c",
                            border: "1px solid #b91c1c",
                          },
                          className: "shadow-md rounded-md",
                          descriptionClassName: "text-xs text-red-700",
                          actionButtonStyle: {
                            backgroundColor: "#b91c1c",
                            color: "#fff",
                          }
                        })
                      }
                      return
                    }

                    await fetchTransactions()
                    onTransactionAdded?.()
                    setOpen(false)
                    setTicker("")
                    setQuantity("")
                    setPrice("")
                    setDate("")
                  } catch (err) {
                    console.error(err)
                  }
                }}
                className="space-y-4"
              >
                <Alert className="border-l-4 pl-4 shadow-sm">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Information</AlertTitle>
                  <AlertDescription>
                    Toujours ajouter .PA à la fin du ticker pour les actions PEA.
                  </AlertDescription>
                </Alert>
                {/* Champ Ticker avec suggestions */}
                <div className="relative">
                  <Input
                    placeholder="Ticker"
                    value={ticker}
                    onChange={(e) => setTicker(e.target.value)}
                    onFocus={() => setIsTickerFocused(true)}
                    onBlur={() => setTimeout(() => setIsTickerFocused(false), 150)}
                    required
                    autoComplete="off"
                  />
                  {isTickerFocused && ticker.length > 0 && suggestions.length > 0 && (
                    <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded mt-1 max-h-40 overflow-y-auto shadow">
                      {suggestions.map((name) => (
                        <li
                          key={name}
                          onClick={() => {
                            setTicker(tickers[name])
                            setIsTickerFocused(false)
                          }}
                          className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                        >
                          {name} ({tickers[name]})
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <Input
                  placeholder="Quantité"
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  required
                />
                <Input
                  placeholder="Prix d'achat"
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  required
                />
                <Input
                  placeholder="Date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
                <DialogFooter>
                  <Button type="submit" className="bg-green-600 text-white hover:bg-green-700">
                    Enregistrer
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                Colonnes <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {table
                .getAllColumns()
                .filter((col) => col.getCanHide())
                .map((column) => (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) => column.toggleVisibility(!!value)}
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: table.getState().pagination.pageSize }).map((_, i) => (
                <TableRow key={`skeleton-row-${i}`} style={{ height: cellHeight ? `${cellHeight}px` : 'auto' }}>
                  {columns.map((column, j) => (
                    <TableCell key={`skeleton-${i}-${j}`}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center">
                  Aucune transaction.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between py-4">
        <div className="flex items-center gap-2">
          <span>Afficher</span>
          <select
            className="border rounded px-2 py-1 text-sm"
            value={table.getState().pagination.pageSize}
            onChange={(e) => table.setPageSize(Number(e.target.value))}
          >
            {[10, 20, 50, 100].map((pageSize) => (
              <option key={pageSize} value={pageSize}>
                {pageSize}
              </option>
            ))}
          </select>
          <span>lignes par page</span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Précédent
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Suivant
          </Button>
        </div>
      </div>
    </div>
  )
}
