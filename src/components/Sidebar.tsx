
import {
  Sidebar as SidebarComponent,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  BarChart2,
  Home,
  Wallet,
  Receipt,
  Target,
  History,
} from "lucide-react";
import { useLocation, Link } from "react-router-dom";
import { MonthSelector } from "./MonthSelector";
import { useMonthContext } from "@/hooks/use-month-context";

const menuItems = [
  { icon: Home, label: "Dashboard", path: "/app/dashboard" },
  { icon: Receipt, label: "Expenses", path: "/app/expenses" },
  { icon: Wallet, label: "Budget", path: "/app/budget" },
  { icon: BarChart2, label: "Analytics", path: "/app/analytics" },
  { icon: Target, label: "Goals", path: "/app/goals" },
  { icon: History, label: "History", path: "/app/history" },
];

const Sidebar = () => {
  const location = useLocation();
  const { selectedMonth, setSelectedMonth } = useMonthContext();

  const handleMonthChange = (date: Date) => {
    setSelectedMonth(date);
  };

  return (
    <SidebarComponent>
      <SidebarContent>
        <div className="flex items-center gap-2 px-4 py-6">
          <img
            src="/lovable-uploads/865d9039-b9ca-4d0f-9e62-7321253ffafa.png"
            alt="Hisab Dost logo"
            className="h-7 w-7 bg-white rounded shadow-sm"
            style={{ filter: "drop-shadow(0 2px 3px rgba(128,102,255,0.10))" }}
          />
          <span className="font-bold text-lg bg-gradient-to-r from-[#6E59A5] to-[#9b87f5] bg-clip-text text-transparent">
            Hisab Dost
          </span>
        </div>
        
        <div className="px-3 mb-4">
          <MonthSelector
            selectedMonth={selectedMonth}
            onChange={handleMonthChange}
          />
        </div>
        
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.label}>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname === item.path}
                  >
                    <Link to={item.path} className="menu-link flex items-center gap-3 py-2.5 px-3">
                      <item.icon className="h-5 w-5" />
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </SidebarComponent>
  );
};

export default Sidebar;
