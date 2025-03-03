
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { setTheme, theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [changing, setChanging] = useState(false);
  
  // Only show the UI after the component is mounted to avoid hydration issues
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  
  const handleThemeChange = (newTheme: string) => {
    setChanging(true);
    setTheme(newTheme);
    setTimeout(() => setChanging(false), 600);
  };

  return (
    <>
      <div className={`theme-indicator ${theme} ${changing ? 'theme-changing' : ''}`} />
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="w-10 h-10 rounded-full bg-background/30 backdrop-blur-sm">
            <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 theme-toggle-icon text-yellow-500" />
            <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 theme-toggle-icon text-blue-400" />
            <span className="sr-only">Toggle theme</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="animate-fade-in">
          <DropdownMenuItem 
            onClick={() => handleThemeChange("light")}
            className="cursor-pointer flex items-center gap-2"
          >
            <Sun className="h-4 w-4 text-yellow-500" />
            Light
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => handleThemeChange("dark")}
            className="cursor-pointer flex items-center gap-2"
          >
            <Moon className="h-4 w-4 text-blue-400" />
            Dark
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => handleThemeChange("system")}
            className="cursor-pointer flex items-center gap-2"
          >
            <svg className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
            System
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
