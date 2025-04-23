
import React from "react";
import { Button } from "@/components/ui/button";
import { Moon, Settings, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export function ThemeSettings() {
  const { theme, setTheme } = useTheme();
  
  return (
    <div className="px-4 py-3">
      <h3 className="text-sm font-medium text-muted-foreground mb-3">Theme</h3>
      <div className="flex flex-col gap-2">
        <Button 
          variant="outline" 
          className={`justify-start h-9 ${theme === 'light' ? 'bg-accent' : ''}`}
          onClick={() => setTheme('light')}
        >
          <Sun className="mr-2 h-4 w-4" />
          Light
        </Button>
        <Button 
          variant="outline" 
          className={`justify-start h-9 ${theme === 'dark' ? 'bg-accent' : ''}`}
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
          System
        </Button>
      </div>
    </div>
  );
}
