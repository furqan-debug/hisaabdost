
import React from "react";
import { Bell, LogOut, Settings, Menu } from "lucide-react";
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
    <nav className="bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50">
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
          <span className="text-lg font-bold text-gray-900 dark:text-white">
            Hisaab Dost
          </span>
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
                  <AvatarFallback className="bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 font-semibold text-sm">
                    {getInitials(user?.email || '')}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-56 p-2 bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 shadow-xl rounded-xl"
              align="end"
              forceMount
            >
              <div className="px-3 py-2 mb-2">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {user?.email || 'User'}
                </p>
              </div>
              <DropdownMenuItem
                onClick={() => onSettingsOpen()}
                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer transition-colors"
              >
                <Settings className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                <span className="text-sm font-medium">Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="my-2 bg-gray-200 dark:bg-gray-800" />
              <DropdownMenuItem
                onClick={handleSignOut}
                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/20 cursor-pointer transition-colors text-red-600 dark:text-red-400"
              >
                <LogOut className="h-4 w-4" />
                <span className="text-sm font-medium">Sign out</span>
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

