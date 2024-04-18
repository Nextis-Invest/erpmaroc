import { DataContextProvider } from "@/Context/DataContext";
import SideBar from "../components/SideBar";
import "./globals.css";
import { UserProvider } from "@auth0/nextjs-auth0/client";
import FormSideBar from "@/components/FormSideBar";

export const metadata = {
  title: "Enterprise Resourse Planning System",
  description: "ERP system developed by Nay Myo Khant",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-background">
        <UserProvider>
          <DataContextProvider>
            {" "}
            <main className="max-w-[2000px] mx-auto flex items-start justify-between lg:justify-evenly px-5 py-10">
              <SideBar />
              {children}
              <FormSideBar />
            </main>
          </DataContextProvider>
        </UserProvider>
      </body>
    </html>
  );
}
