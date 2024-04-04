import { DataContextProvider } from "@/Context/DataContext";
import SideBar from "./__components/SideBar";
import "./globals.css";

export const metadata = {
  title: "Enterprise Resourse Management System",
  description: "ERP system developed by Nay Myo Khant",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-background ">
        <DataContextProvider>
        {" "}
        <main className="flex items-start justify-between px-5 py-10">
          <SideBar />
          {children}
        </main>
        </DataContextProvider>
      </body>
    </html>
  );
}
