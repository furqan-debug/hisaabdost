
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { LogOut, Menu, User } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useIsMobile } from "@/hooks/use-mobile";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useMonthContext } from "@/hooks/use-month-context";
import { SettingsSidebar } from "./SettingsSidebar";
const Navbar = () => {
  const {
    user,
    signOut
  } = useAuth();
  const isMobile = useIsMobile();
  const {
    selectedMonth,
    setSelectedMonth
  } = useMonthContext();
  const [scrolled, setScrolled] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  return <nav className="sticky top-0 z-10 border-b border-border/40 bg-background/95 backdrop-blur-lg supports-[backdrop-filter]:bg-background/60 transition-all duration-300">
      <div className="flex h-14 items-center gap-2 max-w-[480px] py-[20px] px-0 my-[4px] mx-[7px]">
        <Sheet open={settingsOpen} onOpenChange={setSettingsOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon-sm" className="rounded-full hover:bg-muted transition-all duration-300 py-[13px] mx-0 my-0 font-normal">
              <Menu className="h-9 w-7 " />
              <span className="sr-only">Open menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[280px] sm:w-[350px] p-0 overflow-hidden">
            <SettingsSidebar selectedMonth={selectedMonth} onMonthChange={setSelectedMonth} onClose={() => setSettingsOpen(false)} />
          </SheetContent>
        </Sheet>
        
        <div className="flex-1 flex items-center">
          <img src="/lovable-uploads/865d9039-b9ca-4d0f-9e62-7321253ffafa.png" alt="Hisaab Dost logo" className="h-8 w-8 mr-2 rounded bg-white shadow-sm" style={{
          filter: "drop-shadow(0 1px 3px rgba(128,102,255,0.12))"
        }} />
          <h2 className="font-semibold whitespace-nowrap overflow-hidden text-ellipsis bg-gradient-to-r from-[#6E59A5] to-[#9b87f5] bg-clip-text text-transparent py-0 text-xl">
            Hisaab Dost
          </h2>
        </div>
        
        <div className="flex items-center gap-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="glass" size="icon-sm" className="rounded-full transition-all duration-300 h-7 w-7">
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
              <DropdownMenuItem onClick={() => signOut()} className="text-destructive focus:text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>;
};
export default Navbar;
