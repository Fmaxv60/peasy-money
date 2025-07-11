"use client"

import { 
  Home,
  CircleDollarSign
} from "lucide-react"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { ProfilCard } from "@/components/logic/sidebar/ProfilCard"

type User = {
  username: string
  email: string
}

export function AppSidebar() {

  const items = [
    {
      title: "Home",
      url: "/dashboard",
      icon: Home,
    },
    {
      title: "Transactions",
      url: "/transactions",
      icon: CircleDollarSign,
    }
  ]

  return (
    <Sidebar>
      <SidebarContent className="flex flex-col justify-between h-full">
        <div>
          <SidebarGroup>
            <SidebarGroupLabel>Peasy Money</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <a href={item.url}>
                        <item.icon className="mr-2" />
                        <span>{item.title}</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </div>

        <ProfilCard />
      </SidebarContent>
    </Sidebar>
  )
}
