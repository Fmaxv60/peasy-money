"use client"

import {
  LogOutIcon,
  MoreVerticalIcon,
  SettingsIcon
} from "lucide-react"

import {
  Avatar,
  AvatarFallback,
} from "@/components/ui/avatar"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { fetchWithAuth } from "@/lib/auth"

type user = {
  username: string
  email: string
}

export function ProfilCard() {
  const [user, setUser] = useState<user | null>(null)
  const [subscription, setSubscription] = useState<string | null>(null)
  const { isMobile } = useSidebar()
  const router = useRouter()

  useEffect(() => {
    fetchWithAuth("http://localhost:8000/api/user/me")
      .then((res) => res.json())
      .then((data) => setUser(data))
      .catch((err) => console.error("Erreur récupération utilisateur :", err))
  }, [])

  useEffect(() => {
    fetchWithAuth("http://localhost:8000/api/user/subscription")
      .then((res) => res.json())
      .then((data) => setSubscription(data))
      .catch((err) => console.error("Erreur récupération utilisateur :", err))
  }, [])

  const handleLogout = () => {
    localStorage.removeItem("token")
    router.push("/login")
    toast("Déconnexion réussie !", {
      description: "Votre avez été déconnecté avec succès.",
    })
  }

  return (
    <SidebarMenu className="mb-2">
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <Avatar className="h-8 w-8 rounded-lg grayscale">
                <AvatarFallback className="rounded-lg">
                  {user?.username?.slice(0, 2).toUpperCase() || "UN"}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight items-center gap-1">
                <span className="truncate font-medium flex items-center gap-2">
                  {user?.username || "Unknown User"}
                  <Badge
                    className={
                      subscription === "premium"
                        ? "border-amber-500 bg-gradient-to-r from-amber-300 via-amber-400 to-amber-300 text-amber-900 text-[10px] px-2 py-0.5 font-semibold shadow-sm"
                        : "border-gray-400 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 text-gray-700 text-xs px-2 py-0.5 font-semibold shadow-sm"
                    }
                    style={{
                      backgroundSize: "200% 100%",
                      backgroundPosition: "left",
                      animation: "shine 3s linear infinite",
                    }}
                  >
                    {subscription || "free"}
                  </Badge>
                </span>
                <span className="truncate text-xs text-muted-foreground">
                  {user?.email || "No email"}
                </span>

                <style jsx>{`
                  @keyframes shine {
                    0% {
                      background-position: 200% 0;
                    }
                    100% {
                      background-position: -200% 0;
                    }
                  }
                `}</style>
              </div>
              <MoreVerticalIcon className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarFallback className="rounded-lg">
                    {user?.username?.slice(0, 2).toUpperCase() || "UN"}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{user?.username || "Unknown User"}</span>
                  <span className="truncate text-xs text-muted-foreground">
                    {user?.email}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push("/settings")}>
              <SettingsIcon className="mr-2 h-4 w-4" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleLogout}>
              <LogOutIcon className="mr-2 h-4 w-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
