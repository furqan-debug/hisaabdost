
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
      sticky top-0 z-50 border-b bg-background/95 backdrop-blur-sm
      transition-all duration-300 ease-in-out
      ${scrolled ? 'shadow-lg border-border/50' : 'border-border/20'}
      ${isMobile ? 'pt-safe-top' : ''}
    `}>
      <style>{`
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
      
      <div className={`flex h-16 items-center justify-between max-w-full px-4 lg:px-6 mx-auto ${isMobile ? 'mobile-safe-area' : ''}`}>
        {/* Left: Menu Button (Mobile only) */}
        {isMobile && (
          <Sheet open={settingsOpen} onOpenChange={setSettingsOpen}>
            <SheetTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-10 w-10 p-0 rounded-xl hover:bg-accent/80 transition-colors duration-200"
              >
                <Menu className="h-5 w-5" />
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
          className="flex items-center cursor-pointer hover:opacity-90 active:scale-[0.98] transition-all duration-200 flex-1 justify-center md:justify-start group"
        >
          <div className="relative">
            <img 
              src="/lovable-uploads/865d9039-b9ca-4d0f-9e62-7321253ffafa.png" 
              alt="Hisaab Dost logo" 
              className="h-8 w-8 mr-3 rounded-lg shadow-sm group-hover:shadow-md transition-shadow duration-200" 
            />
            {/* Subtle glow effect on hover */}
            <div className="absolute inset-0 bg-primary/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 blur-sm -z-10" />
          </div>
          <div className="flex flex-col">
            <h2 className="font-bold text-lg text-foreground leading-tight">
              Hisaab Dost
            </h2>
            <span className="text-xs text-muted-foreground font-medium leading-none">
              Personal Finance
            </span>
          </div>
        </div>
        
        {/* Right: Notification and User Avatar */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <NotificationBell />
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-10 w-10 p-0 rounded-full hover:ring-2 hover:ring-primary/20 transition-all duration-200"
              >
                <Avatar className="h-9 w-9 ring-2 ring-border/50 hover:ring-primary/30 transition-all duration-200">
                  <AvatarImage 
                    src="https://images.unsplash.com/photo-1501286353178-1ec881214838?w=100&h=100&fit=crop&crop=face" 
                    alt={user?.email || "User"} 
                    className="object-cover"
                  />
                  <AvatarFallback className="text-sm bg-gradient-to-br from-primary/10 to-accent/10 text-primary font-semibold">
                    🐵
                  </AvatarFallback>
                </Avatar>
                <span className="sr-only">User menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              align="end" 
              className="w-64 bg-background/95 backdrop-blur-sm border shadow-xl rounded-xl p-2"
            >
              <DropdownMenuLabel className="font-normal p-3">
                <div className="flex flex-col space-y-2">
                  <p className="text-sm font-semibold leading-none text-foreground">
                    {user?.email}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground bg-muted/50 px-2 py-1 rounded-md inline-block w-fit">
                    @{user?.email?.split('@')[0]}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="my-2" />
              <DropdownMenuItem 
                onClick={() => signOut()} 
                className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer rounded-lg p-3 transition-colors duration-200"
              >
                <LogOut className="mr-3 h-4 w-4" />
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
