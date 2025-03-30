
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, LogOut, Menu, Search, User, X } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { ThemeToggle } from "./ThemeToggle";
import { SidebarTrigger } from "./ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import { MonthSelector } from "./MonthSelector";
import { useMonthContext } from "@/hooks/use-month-context";
import { cn } from "@/lib/utils";

const Navbar = () => {
  const { user, signOut } = useAuth();
  const isMobile = useIsMobile();
  const { selectedMonth, setSelectedMonth } = useMonthContext();
  const [searchOpen, setSearchOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  
  // Track scroll position for navbar styling
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={cn(
      "sticky top-0 z-10 border-b border-border/40 bg-background/95 backdrop-blur-lg supports-[backdrop-filter]:bg-background/60 transition-all duration-300",
      scrolled && "shadow-sm"
    )}>
      <div className="flex h-14 items-center px-3 gap-2 max-w-[480px] mx-auto">
        {!isMobile && (
          <SidebarTrigger>
            <Button 
              variant="ghost" 
              size="icon-sm" 
              className="rounded-full hover:bg-muted transition-all duration-300"
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SidebarTrigger>
        )}
        
        <div className="flex-1 flex items-center">
          <h2 className="text-lg font-semibold whitespace-nowrap overflow-hidden text-ellipsis bg-gradient-to-r from-[#9b87f5] to-primary bg-clip-text text-transparent">
            Expense AI
          </h2>
          
          {isMobile && (
            <div className={cn("ml-auto flex items-center gap-1", searchOpen ? "hidden" : "")}>
              <Button 
                variant="ghost" 
                size="icon-sm" 
                className="rounded-full hover:bg-muted transition-all duration-300"
                onClick={() => setSearchOpen(true)}
              >
                <Search className="h-4 w-4" />
              </Button>
              
              <MonthSelector
                selectedMonth={selectedMonth}
                onChange={setSelectedMonth}
                className="h-7 w-auto min-w-[100px] text-xs"
              />
            </div>
          )}
          
          {searchOpen && isMobile && (
            <div className="ml-2 flex-1 animate-fade-in flex items-center">
              <input 
                type="search" 
                placeholder="Search expenses..." 
                className="w-full rounded-full bg-muted/50 px-3 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                onBlur={() => setSearchOpen(false)}
                autoFocus
              />
              <Button 
                variant="ghost" 
                size="icon-sm" 
                className="ml-1 rounded-full h-6 w-6"
                onClick={() => setSearchOpen(false)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          )}
        </div>
        
        {/* Month selector in navbar for desktop */}
        {!isMobile && (
          <div className="mr-1">
            <MonthSelector
              selectedMonth={selectedMonth}
              onChange={setSelectedMonth}
              className="h-8 w-auto min-w-[110px]"
            />
          </div>
        )}
        
        <div className="flex items-center gap-1">
          <ThemeToggle />
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="glass" 
                size="icon-sm" 
                className="rounded-full transition-all duration-300 h-7 w-7"
              >
                <User className="h-4 w-4" />
                <span className="sr-only">User menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 animate-scale-in">
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
                className="text-destructive focus:text-destructive"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
