"use client";

import Image from "next/image";
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
  UserCog
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
      title: "Dashboard",
      url: "/",
      icon: ChartLine,
    },
    {
      title: "Staffs",
      url: "/staffs",
      icon: Users,
    },
    {
      title: "HR",
      url: "/hr",
      icon: UserCog,
    },
    {
      title: "Branches",
      url: "/branches",
      icon: Store,
    },
    {
      title: "Products",
      url: "/products",
      icon: Tags,
    },
    {
      title: "Record",
      url: "/record",
      icon: Warehouse,
    },
    {
      title: "Admin",
      url: "/admin",
      icon: ShieldAlert,
    },
    {
      title: "Settings",
      url: "/settings",
      icon: Settings,
    },
  ];

  return (
    <Sidebar variant="sidebar" collapsible="icon">
      <SidebarHeader>
        <Link href="/" className="flex items-center justify-center p-2">
          <Image
            src="/assets/logo.png"
            width={100}
            height={100}
            alt="logo"
            priority
            unoptimized
            className="w-full h-auto"
          />
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
                  <span>Logout</span>
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