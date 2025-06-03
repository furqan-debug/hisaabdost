
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { LogOut, Menu, Bell, User } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useIsMobile } from "@/hooks/use-mobile";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useMonthContext } from "@/hooks/use-month-context";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import SettingsSidebar from "./SettingsSidebar";

const Navbar = () => {
  const { user, signOut } = useAuth();
  const isMobile = useIsMobile();
  const { selectedMonth, setSelectedMonth } = useMonthContext();
  const [scrolled, setScrolled] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogoClick = () => {
    window.location.href = '/app/dashboard';
  };

  // Get user initials for avatar fallback
  const getUserInitials = () => {
    if (!user?.email) return 'U';
    return user.email.charAt(0).toUpperCase();
  };

  return (
    <nav className="sticky top-0 z-10 border-b border-border/40 bg-background/95 backdrop-blur-lg supports-[backdrop-filter]:bg-background/60 transition-all duration-300 safe-area-top">
      <div className="flex h-14 items-center justify-between max-w-[480px] px-4 mx-auto">
        {/* Left: Menu Button */}
        <Sheet open={settingsOpen} onOpenChange={setSettingsOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon-sm" className="rounded-full hover:bg-muted transition-all duration-300">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Open menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[280px] sm:w-[350px] p-0 overflow-hidden">
            <SettingsSidebar isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
          </SheetContent>
        </Sheet>
        
        {/* Center: Logo and Title */}
        <div 
          className="flex items-center cursor-pointer hover:opacity-80 transition-opacity duration-200" 
          onClick={handleLogoClick}
        >
          <img 
            src="/lovable-uploads/865d9039-b9ca-4d0f-9e62-7321253ffafa.png" 
            alt="Hisaab Dost logo" 
            className="h-8 w-8 mr-2 rounded bg-white shadow-sm" 
            style={{
              filter: "drop-shadow(0 1px 3px rgba(128,102,255,0.12))"
            }} 
          />
          <h2 className="font-semibold text-lg bg-gradient-to-r from-[#6E59A5] to-[#9b87f5] bg-clip-text text-transparent">
            Hisaab Dost
          </h2>
        </div>
        
        {/* Right: Notification and User Avatar */}
        <div className="flex items-center gap-2">
          {/* Optional Notification Icon */}
          <Button variant="ghost" size="icon-sm" className="rounded-full hover:bg-muted transition-all duration-300">
            <Bell className="h-4 w-4" />
            <span className="sr-only">Notifications</span>
          </Button>

          {/* User Avatar Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-sm" className="rounded-full h-8 w-8 p-0">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="" alt={user?.email || "User"} />
                  <AvatarFallback className="text-xs bg-primary/10 text-primary font-medium">
                    {getUserInitials()}
                  </AvatarFallback>
                </Avatar>
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
    </nav>
  );
};

export default Navbar;
