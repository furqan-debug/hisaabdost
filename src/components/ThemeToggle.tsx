
import { Moon, Sun, Palette } from "lucide-react";
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

export function ThemeToggle() {
  const { setTheme, theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [colorMode, setColorMode] = useState<"default" | "pink">("default");

  // After mounting, we can access the DOM
  useEffect(() => {
    setMounted(true);
    // Set initial color mode based on document class
    if (document.documentElement.classList.contains("pink")) {
      setColorMode("pink");
    } else {
      setColorMode("default");
    }
  }, []);

  // Handle theme changes
  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
  };

  // Handle color scheme changes
  const handleColorChange = (newColor: "default" | "pink") => {
    // Remove existing color class
    document.documentElement.classList.remove("pink");
    
    // Add new color class if needed
    if (newColor === "pink") {
      document.documentElement.classList.add("pink");
    }
    
    setColorMode(newColor);
  };

  // Don't render anything until mounted to prevent hydration mismatch
  if (!mounted) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="w-10 h-10">
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Appearance</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <DropdownMenuGroup>
          <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
            Mode
          </DropdownMenuLabel>
          <DropdownMenuItem 
            onClick={() => handleThemeChange("light")}
            className={resolvedTheme === "light" ? "bg-accent" : ""}
          >
            Light
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => handleThemeChange("dark")}
            className={resolvedTheme === "dark" ? "bg-accent" : ""}
          >
            Dark
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleThemeChange("system")}>
            System
          </DropdownMenuItem>
        </DropdownMenuGroup>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuGroup>
          <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
            Color
          </DropdownMenuLabel>
          <DropdownMenuItem 
            onClick={() => handleColorChange("default")}
            className={colorMode === "default" ? "bg-accent" : ""}
          >
            <div className="w-4 h-4 rounded-full bg-[hsl(142,76%,36%)] mr-2" />
            Green (Default)
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => handleColorChange("pink")}
            className={colorMode === "pink" ? "bg-accent" : ""}
          >
            <div className="w-4 h-4 rounded-full bg-[hsl(328,73%,69%)] mr-2" />
            Pink
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
