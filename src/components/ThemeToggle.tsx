
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
  const [colorMode, setColorMode] = useState<"default" | "pink" | "blue" | "purple">("default");

  // After mounting, we can access the DOM
  useEffect(() => {
    setMounted(true);
    // Set initial color mode based on document class
    if (document.documentElement.classList.contains("pink")) {
      setColorMode("pink");
    } else if (document.documentElement.classList.contains("blue")) {
      setColorMode("blue");
    } else if (document.documentElement.classList.contains("purple")) {
      setColorMode("purple");
    } else {
      setColorMode("default");
    }
  }, []);

  // Handle theme changes
  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
  };

  // Handle color scheme changes
  const handleColorChange = (newColor: "default" | "pink" | "blue" | "purple") => {
    // Remove existing color classes
    document.documentElement.classList.remove("pink", "blue", "purple");
    
    // Add new color class if needed
    if (newColor !== "default") {
      document.documentElement.classList.add(newColor);
    }
    
    setColorMode(newColor);
    
    // Add a transition effect to all elements when theme changes
    document.documentElement.style.transition = "background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease";
    setTimeout(() => {
      document.documentElement.style.transition = "";
    }, 300);
  };

  // Don't render anything until mounted to prevent hydration mismatch
  if (!mounted) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="w-10 h-10 rounded-full">
          {colorMode !== "default" ? (
            <Palette className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all" />
          ) : (
            <>
              <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </>
          )}
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 backdrop-blur-md bg-background/80 border-border/30">
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
            <Sun className="h-4 w-4 mr-2" />
            Light
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => handleThemeChange("dark")}
            className={resolvedTheme === "dark" ? "bg-accent" : ""}
          >
            <Moon className="h-4 w-4 mr-2" />
            Dark
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleThemeChange("system")}>
            <div className="w-4 h-4 mr-2 flex items-center justify-center">
              <Sun className="h-3 w-3 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-3 w-3 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </div>
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
          <DropdownMenuItem 
            onClick={() => handleColorChange("blue")}
            className={colorMode === "blue" ? "bg-accent" : ""}
          >
            <div className="w-4 h-4 rounded-full bg-[hsl(210,100%,56%)] mr-2" />
            Blue
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => handleColorChange("purple")}
            className={colorMode === "purple" ? "bg-accent" : ""}
          >
            <div className="w-4 h-4 rounded-full bg-[hsl(270,76%,60%)] mr-2" />
            Purple
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
