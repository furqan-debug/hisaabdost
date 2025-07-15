
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

  useEffect(() => {
    setMounted(true);
    // Ensure purple theme is always applied
    document.documentElement.classList.remove("pink");
    document.documentElement.classList.add("purple");
    localStorage.setItem("color-theme", "purple");
  }, []);

  // Force theme application when theme changes with better persistence
  useEffect(() => {
    if (mounted && theme) {
      // Force immediate theme application with storage
      setTimeout(() => {
        if (theme === 'dark') {
          document.documentElement.classList.add('dark');
          localStorage.setItem('hisaabdost-theme', 'dark');
        } else if (theme === 'light') {
          document.documentElement.classList.remove('dark');
          localStorage.setItem('hisaabdost-theme', 'light');
        } else if (theme === 'system') {
          const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
          if (isDark) {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }
          localStorage.setItem('hisaabdost-theme', 'system');
        }
        console.log(`Theme applied: ${theme}, localStorage: ${localStorage.getItem('hisaabdost-theme')}`);
      }, 0);
    }
  }, [theme, mounted]);

  if (!mounted) return null;

  const handleThemeChange = (newTheme: string) => {
    console.log(`ThemeToggle: Changing theme to ${newTheme}`);
    setTheme(newTheme);
    setIsOpen(false);
  };

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
        className="w-56 animate-in fade-in-0 zoom-in-95"
      >
        <DropdownMenuLabel>Appearance</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <DropdownMenuGroup>
          <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
            Mode
          </DropdownMenuLabel>
          <DropdownMenuItem 
            onClick={() => handleThemeChange("light")}
            className={cn(theme === "light" ? "bg-accent" : "")}
          >
            <Sun className="mr-2 h-4 w-4" />
            Light
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => handleThemeChange("dark")}
            className={cn(theme === "dark" ? "bg-accent" : "")}
          >
            <Moon className="mr-2 h-4 w-4" />
            Dark
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => handleThemeChange("system")}
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
