import { DataContextProvider } from "@/Context/DataContext";
import "./globals.css";
import { SessionProvider } from "next-auth/react";
import FormSideBar from "@/components/FormSideBar";
import { ReactQueryProvider } from "@/Context/QueryClientProvider";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { SidebarProvider } from "@/components/SidebarWithZustand";
import { SidebarInset } from "@/components/ui/sidebar";
import { HRStoreProvider } from "@/stores/hrStoreProvider";
import ClientLayoutWrapper from "./ClientLayoutWrapper";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: 'ERP Maroc - Système de Gestion de Paie',
  description: 'Système ERP pour la gestion de paie marocaine avec calculs CNSS, AMO et IR',
  keywords: ['ERP', 'Paie', 'Maroc', 'CNSS', 'AMO', 'IR', 'Dirham'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-background" suppressHydrationWarning={true}>
        <SessionProvider>
          <ReactQueryProvider>
            <DataContextProvider>
              <HRStoreProvider>
                <SidebarProvider defaultOpen={true}>
                  <ClientLayoutWrapper>
                    {children}
                  </ClientLayoutWrapper>
                  <ReactQueryDevtools initialIsOpen={false} />
                </SidebarProvider>
              </HRStoreProvider>
            </DataContextProvider>
          </ReactQueryProvider>
        </SessionProvider>
      </body>
    </html>
  );
}