import Image from "next/image";
import SideBar from "../components/SideBar";
import DashBoard from "../components/DashBoard";

export default function Home() {
  return (
    <section id="dashboard" className="grow min-w-[80%] h-full">
      <DashBoard />
    </section>
  )
}
