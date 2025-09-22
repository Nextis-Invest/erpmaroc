"use client"

import { DataContextProvider } from "@/Context/DataContext";
import SideBar from "../components/SideBar";
import "./globals.css";
import { UserProvider } from "@auth0/nextjs-auth0/client";
import FormSideBar from "@/components/FormSideBar";
import { ReactQueryProvider } from "@/Context/QueryClientProvider";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import NetworkStatus from "@/components/NetworkStatus";
import { usePathname } from "next/navigation";
import { SidebarProvider } from "@/components/SidebarWithZustand";
import { SidebarInset } from "@/components/ui/sidebar";

export default function RootLayout({ children }) {
  const pathname = usePathname();
  const isAuthPage = pathname === "/login" || pathname === "/register";

  return (
    <html lang="en">
      <body className="bg-background">
        <UserProvider>
          <ReactQueryProvider>
            <DataContextProvider>
              {isAuthPage ? (
                // Auth pages layout without sidebar
                <main className="min-h-screen">
                  {children}
                </main>
              ) : (
                // Regular layout with sidebar
                <SidebarProvider defaultOpen={true}>
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
                    <ReactQueryDevtools initialIsOpen={false} />
                  </div>
                </SidebarProvider>
              )}
            </DataContextProvider>
          </ReactQueryProvider>
        </UserProvider>
      </body>
    </html>
  );
}