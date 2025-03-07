
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogOut, Menu, User } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { ThemeToggle } from "./ThemeToggle";
import { SidebarTrigger } from "./ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";

const Navbar = () => {
  const { user, signOut } = useAuth();
  const isMobile = useIsMobile();

  return (
    <nav className="sticky top-0 z-10 border-b border-border/40 bg-background/95 backdrop-blur-lg supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 md:h-16 items-center px-4 gap-3 max-w-[480px] mx-auto">
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
        
        <h2 className="text-xl font-semibold flex-1 whitespace-nowrap overflow-hidden text-ellipsis bg-gradient-to-r from-[#9b87f5] to-primary bg-clip-text text-transparent">
          Expense AI
        </h2>
        
        <ThemeToggle />
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="glass" 
              size="icon-sm" 
              className="rounded-full transition-all duration-300"
            >
              <User className="h-5 w-5" />
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
