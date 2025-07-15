
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Moon, Settings, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export function ThemeSettings() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [systemTheme, setSystemTheme] = useState<"dark" | "light">("light");
  const [mounted, setMounted] = useState(false);
  
  // Listen for system theme changes
  useEffect(() => {
    setMounted(true);
    
    // Check the initial system preference
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setSystemTheme(mediaQuery.matches ? "dark" : "light");
    
    // Add listener for theme changes
    const handleChange = (e: MediaQueryListEvent) => {
      setSystemTheme(e.matches ? "dark" : "light");
    };
    
    mediaQuery.addEventListener('change', handleChange);
    
    // Ensure purple theme is always applied
    document.documentElement.classList.remove("pink");
    document.documentElement.classList.add("purple");
    localStorage.setItem("color-theme", "purple");
    
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);
  
  if (!mounted) return null;
  
  // Determine the actual theme to display (for UI indication)
  const displayTheme = theme === 'system' ? systemTheme : resolvedTheme;
  
  return (
    <div className="px-4 py-3">
      <h3 className="text-sm font-medium text-muted-foreground mb-3">Theme</h3>
      <div className="flex flex-col gap-2">
        <Button 
          variant="outline" 
          className={`justify-start h-9 ${displayTheme === 'light' && theme === 'light' ? 'bg-accent' : ''}`}
          onClick={() => setTheme('light')}
        >
          <Sun className="mr-2 h-4 w-4" />
          Light
        </Button>
        <Button 
          variant="outline" 
          className={`justify-start h-9 ${displayTheme === 'dark' && theme === 'dark' ? 'bg-accent' : ''}`}
          onClick={() => setTheme('dark')}
        >
          <Moon className="mr-2 h-4 w-4" />
          Dark
        </Button>
        <Button 
          variant="outline" 
          className={`justify-start h-9 ${theme === 'system' ? 'bg-accent' : ''}`}
          onClick={() => setTheme('system')}
        >
          <Settings className="mr-2 h-4 w-4" />
          System ({systemTheme})
        </Button>
      </div>
      <div className="mt-4 p-3 bg-muted/50 rounded-md">
        <p className="text-xs text-muted-foreground">
          Purple color theme is active for all users
        </p>
      </div>
    </div>
  );
}
