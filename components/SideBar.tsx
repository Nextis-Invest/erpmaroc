"use client";

import Link from "next/link";
import React from "react";
import { usePathname } from "next/navigation";
import {
  ChartLine,
  Users,
  Store,
  Tags,
  Warehouse,
  ShieldAlert,
  Settings,
  LogOut,
  UserCog,
  Calculator
} from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const SideBar = () => {
  const pathname = usePathname();
  const { data: session } = useSession();

  const menuItems = [
    {
      title: "Tableau de Bord",
      url: "/",
      icon: ChartLine,
    },
    {
      title: "RH",
      url: "/hr",
      icon: UserCog,
    },
    {
      title: "Paie",
      url: "/payroll",
      icon: Calculator,
    },
    {
      title: "Succursales",
      url: "/branches",
      icon: Store,
    },
    {
      title: "Produits",
      url: "/products",
      icon: Tags,
    },
    {
      title: "Enregistrements",
      url: "/record",
      icon: Warehouse,
    },
    {
      title: "Administration",
      url: "/admin",
      icon: ShieldAlert,
    },
    {
      title: "Paramètres",
      url: "/settings",
      icon: Settings,
    },
  ];

  return (
    <Sidebar variant="sidebar" collapsible="icon">
      <SidebarHeader>
        <Link href="/" className="flex items-center justify-center p-4">
          <h1 className="text-2xl font-bold text-primary">
            ERP Maroc
          </h1>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.url}
                    tooltip={item.title}
                  >
                    <Link href={item.url} prefetch>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      {session && (
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <button onClick={() => signOut({ callbackUrl: '/login' })}>
                  <LogOut className="h-4 w-4" />
                  <span>Déconnexion</span>
                </button>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      )}
    </Sidebar>
  );
};

export default SideBar;