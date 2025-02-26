
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, Menu, Plus, User } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { ThemeToggle } from "./ThemeToggle";
import { SidebarTrigger } from "./ui/sidebar";

const Navbar = () => {
  const { user, signOut } = useAuth();

  return (
    <nav className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 md:h-16 items-center px-4 gap-3">
        <SidebarTrigger>
          <Button 
            variant="ghost" 
            size="icon" 
            className="w-9 h-9 rounded-full hover:bg-muted transition-all duration-300"
          >
            <Menu className="h-4 w-4" />
            <span className="sr-only">Toggle menu</span>
          </Button>
        </SidebarTrigger>
        <h2 className="text-lg font-semibold flex-1 whitespace-nowrap overflow-hidden text-ellipsis bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
          AI-Budget Beacon
        </h2>
        <Button 
          variant="default" 
          size="icon" 
          className="w-9 h-9 rounded-full shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 bg-gradient-to-r from-primary to-primary/90"
        >
          <Plus className="h-4 w-4 text-primary-foreground" />
          <span className="sr-only">Add new expense</span>
        </Button>
        <ThemeToggle />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              className="w-9 h-9 rounded-full hover:bg-muted transition-all duration-300"
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
