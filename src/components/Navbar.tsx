
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Bell, LogOut, Plus, Settings, User } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { ThemeToggle } from "./ThemeToggle";

const Navbar = () => {
  const { user, signOut } = useAuth();

  return (
    <nav className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 md:h-16 items-center px-4 gap-2 md:gap-4">
        <h2 className="text-lg font-semibold flex-1 whitespace-nowrap overflow-hidden text-ellipsis">
          Smart Expense Tracker
        </h2>
        <Button 
          variant="outline" 
          size="icon" 
          className="w-8 h-8 md:w-10 md:h-10 transition-transform hover:scale-105"
        >
          <Plus className="h-4 w-4" />
          <span className="sr-only">Add new expense</span>
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          className="w-8 h-8 md:w-10 md:h-10 relative"
        >
          <Bell className="h-4 w-4" />
          <span className="sr-only">Notifications</span>
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
        </Button>
        <ThemeToggle />
        <Button 
          variant="ghost" 
          size="icon" 
          className="w-8 h-8 md:w-10 md:h-10"
        >
          <Settings className="h-4 w-4" />
          <span className="sr-only">Settings</span>
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              className="w-8 h-8 md:w-10 md:h-10"
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
    </nav>
  );
};

export default Navbar;
