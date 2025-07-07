
import React, { useState, useEffect } from "react";
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
    window.location.href = '/app/dashboard';
  };

  return (
    <nav className={`
      sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/95 
      transition-all duration-300
      ${scrolled ? 'shadow-sm' : ''}
      /* Safe area insets for all devices */
      pt-safe-top
      /* Fallback padding for devices without safe-area-inset support */
      ${isMobile ? 'pt-[env(safe-area-inset-top,0px)] pt-[var(--safe-area-inset-top,0px)]' : ''}
    `}>
      <style jsx>{`
        /* CSS custom properties for safe area insets */
        :root {
          --safe-area-inset-top: env(safe-area-inset-top, 0px);
        }
        
        /* Tailwind safe area utility classes */
        .pt-safe-top {
          padding-top: env(safe-area-inset-top, 0px);
        }
        
        /* Additional mobile-specific safe area handling */
        @media (max-width: 640px) {
          .mobile-safe-area {
            padding-top: max(env(safe-area-inset-top, 0px), 20px);
          }
        }
      `}</style>
      
      <div className={`flex h-14 items-center justify-between max-w-full px-4 mx-auto ${isMobile ? 'mobile-safe-area' : ''}`}>
        {/* Left: Menu Button (Mobile only) */}
        {isMobile && (
          <Sheet open={settingsOpen} onOpenChange={setSettingsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
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
        <div onClick={handleLogoClick} className="flex items-center cursor-pointer hover:opacity-80 transition-opacity duration-200 flex-1 justify-center md:justify-start">
          <img 
            src="/lovable-uploads/865d9039-b9ca-4d0f-9e62-7321253ffafa.png" 
            alt="Hisaab Dost logo" 
            className="h-7 w-7 mr-2 rounded-md" 
          />
          <h2 className="font-semibold text-lg text-foreground truncate">
            Hisaab Dost
          </h2>
        </div>
        
        {/* Right: Notification and User Avatar */}
        <div className="flex items-center gap-2">
          <NotificationBell />
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-9 w-9 p-0 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage 
                    src="https://images.unsplash.com/photo-1501286353178-1ec881214838?w=100&h=100&fit=crop&crop=face" 
                    alt={user?.email || "User"} 
                  />
                  <AvatarFallback className="text-xs bg-primary/10 text-primary font-medium">
                    🐵
                  </AvatarFallback>
                </Avatar>
                <span className="sr-only">User menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-background border shadow-lg">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user?.email}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.email?.split('@')[0]}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => signOut()} className="text-destructive focus:text-destructive cursor-pointer">
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
