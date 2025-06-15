
import React from "react";
import { Bell, LogOut, Settings, User, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { OfflineStatus } from "@/components/ui/offline-indicator";
import { useAuth } from "@/lib/auth";
import { useNavigate } from "react-router-dom";

interface NavbarProps {
  onToggleSidebar: () => void;
  onSettingsOpen: () => void;
}

export function Navbar({ onToggleSidebar, onSettingsOpen }: NavbarProps) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/auth');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const getInitials = (email: string) => {
    return email?.charAt(0).toUpperCase() || 'U';
  };

  return (
    <nav className="relative bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 shadow-sm backdrop-blur-md supports-[backdrop-filter]:bg-white/80 dark:supports-[backdrop-filter]:bg-gray-950/80 sticky top-0 z-50">
      <div className="flex h-16 items-center justify-between px-4 lg:px-6 max-w-7xl mx-auto">
        {/* Left Section */}
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onToggleSidebar}
            className="h-9 w-9 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle sidebar</span>
          </Button>
          
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-md">
              <span className="text-white font-bold text-lg">H</span>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                Hisaab Dost
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400 -mt-1">
                Smart expense tracker
              </p>
            </div>
            <span className="sm:hidden text-lg font-bold text-gray-900 dark:text-white">
              Hisaab Dost
            </span>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-2 md:gap-3">
          {/* Status Indicators */}
          <div className="hidden md:flex items-center">
            <OfflineStatus />
          </div>
          
          {/* Notifications */}
          <div className="relative">
            <NotificationBell />
          </div>
          
          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="ghost" 
                className="relative h-9 w-9 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
              >
                <Avatar className="h-8 w-8 border-2 border-gray-200 dark:border-gray-700">
                  <AvatarFallback className="bg-gradient-to-br from-emerald-100 to-emerald-200 dark:from-emerald-900 dark:to-emerald-800 text-emerald-700 dark:text-emerald-300 font-semibold text-sm">
                    {getInitials(user?.email || '')}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              className="w-64 p-2 bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 shadow-xl rounded-xl" 
              align="end" 
              forceMount
            >
              {/* User Info Header */}
              <div className="px-3 py-2 mb-2 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {user?.email || 'User'}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Account settings
                </p>
              </div>
              
              <DropdownMenuItem 
                onClick={() => onSettingsOpen()}
                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer transition-colors"
              >
                <div className="h-8 w-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                  <Settings className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium">Settings</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">Preferences & more</span>
                </div>
              </DropdownMenuItem>
              
              <DropdownMenuSeparator className="my-2 bg-gray-200 dark:bg-gray-800" />
              
              <DropdownMenuItem 
                onClick={handleSignOut}
                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 cursor-pointer transition-colors text-red-600 dark:text-red-400"
              >
                <div className="h-8 w-8 rounded-full bg-red-100 dark:bg-red-950/30 flex items-center justify-center">
                  <LogOut className="h-4 w-4" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium">Sign out</span>
                  <span className="text-xs opacity-75">End your session</span>
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      {/* Mobile Status Bar */}
      <div className="md:hidden px-4 pb-2">
        <OfflineStatus />
      </div>
    </nav>
  );
}
