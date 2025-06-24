
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

export function ThemeToggle() {
  const { setTheme, theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [systemTheme, setSystemTheme] = useState<"dark" | "light">("light");

  // Listen for system theme changes
  useEffect(() => {
    // Check the initial system preference
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setSystemTheme(mediaQuery.matches ? "dark" : "light");
    
    // Add listener for theme changes
    const handleChange = (e: MediaQueryListEvent) => {
      setSystemTheme(e.matches ? "dark" : "light");
      
      // If user has selected system theme, update the theme immediately
      if (theme === 'system') {
        // This will trigger a re-render with the new system theme
        setTheme('system');
      }
    };
    
    mediaQuery.addEventListener('change', handleChange);
    
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, [theme, setTheme]);

  useEffect(() => {
    setMounted(true);
    // Ensure purple theme is always applied
    document.documentElement.classList.remove("pink");
    document.documentElement.classList.add("purple");
    localStorage.setItem("color-theme", "purple");
  }, []);

  if (!mounted) return null;

  // Determine the actual theme to display (for UI indication)
  const displayTheme = theme === 'system' ? systemTheme : resolvedTheme;

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="w-10 h-10 rounded-full">
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="w-56 animate-in fade-in-0 zoom-in-95 touch-scroll-container"
      >
        <DropdownMenuLabel>Appearance</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <DropdownMenuGroup>
          <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
            Mode
          </DropdownMenuLabel>
          <DropdownMenuItem 
            onClick={() => setTheme("light")}
            className={cn(displayTheme === "light" && theme === "light" ? "bg-accent" : "")}
          >
            <Sun className="mr-2 h-4 w-4" />
            Light
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => setTheme("dark")}
            className={cn(displayTheme === "dark" && theme === "dark" ? "bg-accent" : "")}
          >
            <Moon className="mr-2 h-4 w-4" />
            Dark
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => setTheme("system")}
            className={cn(theme === "system" ? "bg-accent" : "")}
          >
            <span className="mr-2 flex h-4 w-4 items-center justify-center">
              <Sun className="h-3 w-3 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-3 w-3 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </span>
            System
          </DropdownMenuItem>
        </DropdownMenuGroup>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuGroup>
          <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
            Color
          </DropdownMenuLabel>
          <div className="flex items-center justify-start h-9 px-2 py-2 bg-accent rounded-sm mx-1">
            <div className="w-4 h-4 rounded-full bg-[hsl(265,73%,69%)] mr-2" />
            <span className="text-sm">Purple (Active)</span>
          </div>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
