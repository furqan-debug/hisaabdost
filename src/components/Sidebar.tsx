
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
} from "lucide-react";
import { useLocation, Link } from "react-router-dom";
import { MonthSelector } from "./MonthSelector";
import { useMonthContext } from "@/hooks/use-month-context";

const menuItems = [
  { icon: Home, label: "Dashboard", path: "/" },
  { icon: Receipt, label: "Expenses", path: "/expenses" },
  { icon: Wallet, label: "Budget", path: "/budget" },
  { icon: BarChart2, label: "Analytics", path: "/analytics" },
  { icon: Target, label: "Goals", path: "/goals" },
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
          <Wallet className="h-7 w-7 text-primary animate-pulse" />
          <span className="font-bold text-lg bg-gradient-to-r from-[#9b87f5] to-primary bg-clip-text text-transparent">
            Expense AI
          </span>
        </div>
        
        {/* Month selector in sidebar for desktop */}
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
