
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, Menu, User } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { ThemeToggle } from "./ThemeToggle";
import { SidebarTrigger } from "./ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { MonthSelector } from "./MonthSelector";
import { useMonthContext } from "@/hooks/use-month-context";

const Navbar = () => {
  const { user, signOut } = useAuth();
  const isMobile = useIsMobile();
  const { selectedMonth, setSelectedMonth } = useMonthContext();

  return (
    <nav className="sticky top-0 z-10 border-b border-border/40 bg-background/95 backdrop-blur-lg supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 md:h-16 items-center px-4 gap-3 max-w-[480px] mx-auto">
        {!isMobile && (
          <SidebarTrigger>
            <Button 
              variant="ghost" 
              size="icon-sm" 
              className="rounded-full hover:bg-muted transition-all duration-300 active-scale focus-ring"
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SidebarTrigger>
        )}
        
        <h2 className="text-xl font-semibold flex-1 whitespace-nowrap overflow-hidden text-ellipsis gradient-text">
          Expense AI
        </h2>
        
        {/* Month selector in navbar for mobile users */}
        {isMobile && (
          <div className="mr-1">
            <MonthSelector
              selectedMonth={selectedMonth}
              onChange={setSelectedMonth}
              className="h-8 w-auto min-w-[110px] frosted-card"
            />
          </div>
        )}
        
        <ThemeToggle />
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="glass" 
              size="icon-sm" 
              className="rounded-full transition-all duration-300 active-scale frosted-card"
            >
              <User className="h-5 w-5" />
              <span className="sr-only">User menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 animate-scale-in frosted-card">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user?.email}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user?.email?.split('@')[0]}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={() => signOut()}
              className="text-destructive focus:text-destructive active-scale"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  );
};

export default Navbar;
