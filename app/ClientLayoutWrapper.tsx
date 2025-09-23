'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import SideBar from "../components/SideBar";
import FormSideBar from "@/components/FormSideBar";
import NetworkStatus from "@/components/NetworkStatus";
import { SidebarInset } from "@/components/ui/sidebar";

interface ClientLayoutWrapperProps {
  children: React.ReactNode;
}

export default function ClientLayoutWrapper({ children }: ClientLayoutWrapperProps) {
  const pathname = usePathname();
  const isAuthPage = pathname === "/login" || pathname === "/register" || pathname === "/auth/magic-link-callback";

  if (isAuthPage) {
    return (
      <main className="min-h-screen w-full">
        {children}
      </main>
    );
  }

  return (
    <div className="flex min-h-screen w-full">
      <SideBar />
      <SidebarInset>
        <div className="flex flex-col flex-1">
          <NetworkStatus/>
          <main className="flex-1 p-6">
            {children}
          </main>
          <FormSideBar />
        </div>
      </SidebarInset>
    </div>
  );
}