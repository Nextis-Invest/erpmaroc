import Image from "next/image";
import SideBar from "./__components/SideBar";

export default function Home() {
  return (
    <main className="flex min-h-screen items-start justify-between px-5 py-10">
      <SideBar />
    </main>
  );
}
