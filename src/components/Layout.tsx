
import { ReactNode } from "react";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import { BottomNavigation } from "./BottomNavigation";
import { useIsMobile } from "@/hooks/use-mobile";

interface LayoutProps {
  children: ReactNode;
  selectedMonth: Date;
  setSelectedMonth: (date: Date) => void;
}

const Layout = ({ children, selectedMonth, setSelectedMonth }: LayoutProps) => {
  const isMobile = useIsMobile();

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar selectedMonth={selectedMonth} setSelectedMonth={setSelectedMonth} />
      <div className="flex flex-1">
        {!isMobile && <Sidebar />}
        <main className="flex-1 px-4 py-4 max-w-[480px] mx-auto w-full">
          {children}
        </main>
      </div>
      {isMobile && <BottomNavigation />}
    </div>
  );
};

export default Layout;
