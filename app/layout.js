import "./globals.css";


export const metadata = {
  title: "Enterprise Resourse Management System",
  description: "ERP system developed by Nay Myo Khant",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-background " >{children}</body>
    </html>
  );
}
