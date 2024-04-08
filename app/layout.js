import { DataContextProvider } from "@/Context/DataContext";
import SideBar from "./__components/SideBar";
import "./globals.css";

export const metadata = {
  title: "Enterprise Resourse Planning System",
  description: "ERP system developed by Nay Myo Khant",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-background">
        <DataContextProvider>
        {" "}
        <main className="max-w-[2000px] mx-auto flex items-start justify-between lg:justify-evenly px-5 py-10">
          <SideBar />
          {children}
        </main>
        </DataContextProvider>
      </body>
    </html>
  );
}
