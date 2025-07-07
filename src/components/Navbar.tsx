
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { LogOut, Menu, User } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useIsMobile } from "@/hooks/use-mobile";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import SettingsSidebar from "./SettingsSidebar";

const Navbar = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
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
    navigate('/app/dashboard');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/40">
      <div className="flex h-14 items-center justify-between px-3 lg:px-4 mx-auto max-w-full">
        {/* Left: Menu Button (Mobile only) */}
        {isMobile && (
          <Sheet open={settingsOpen} onOpenChange={setSettingsOpen}>
            <SheetTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0"
              >
                <Menu className="h-4 w-4" />
                <span className="sr-only">Open menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[280px] p-0">
              <SettingsSidebar isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
            </SheetContent>
          </Sheet>
        )}
        
        {/* Center: Logo and Title */}
        <div 
          onClick={handleLogoClick} 
          className="flex items-center cursor-pointer hover:opacity-90 transition-opacity flex-1 justify-center md:justify-start"
        >
          <img 
            src="/lovable-uploads/865d9039-b9ca-4d0f-9e62-7321253ffafa.png" 
            alt="Hisaab Dost logo" 
            className="h-6 w-6 mr-2" 
          />
          <div className="flex flex-col">
            <h2 className="font-bold text-sm text-foreground leading-tight">
              Hisaab Dost
            </h2>
            <span className="text-xs text-muted-foreground font-medium leading-none">
              Personal Finance
            </span>
          </div>
        </div>
        
        {/* Right: Notification and User Avatar */}
        <div className="flex items-center gap-2">
          <NotificationBell />
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 w-8 p-0 rounded-full"
              >
                <Avatar className="h-7 w-7">
                  <AvatarImage 
                    src="https://images.unsplash.com/photo-1501286353178-1ec881214838?w=100&h=100&fit=crop&crop=face" 
                    alt={user?.email || "User"} 
                  />
                  <AvatarFallback className="text-xs">
                    🐵
                  </AvatarFallback>
                </Avatar>
                <span className="sr-only">User menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {user?.email}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    @{user?.email?.split('@')[0]}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => signOut()} 
                className="text-destructive focus:text-destructive cursor-pointer"
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
