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
import { cn } from "@/lib/utils";

export function ThemeToggle() {
  const { setTheme, theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [colorMode, setColorMode] = useState<"default" | "pink" | "purple">("default");
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (document.documentElement.classList.contains("pink")) {
      setColorMode("pink");
    } else if (document.documentElement.classList.contains("purple")) {
      setColorMode("purple");
    } else {
      setColorMode("default");
    }
  }, []);

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme);
  };

  const handleColorChange = (newColor: "default" | "pink" | "purple") => {
    document.documentElement.classList.remove("pink", "purple");
    
    if (newColor === "pink") {
      document.documentElement.classList.add("pink");
    } else if (newColor === "purple") {
      document.documentElement.classList.add("purple");
    }
    
    localStorage.setItem("color-theme", newColor);
    setColorMode(newColor);
  };

  if (!mounted) return null;

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
        className="w-56 animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95"
      >
        <DropdownMenuLabel>Appearance</DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        <DropdownMenuGroup>
          <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
            Mode
          </DropdownMenuLabel>
          <DropdownMenuItem 
            onClick={() => handleThemeChange("light")}
            className={cn(resolvedTheme === "light" ? "bg-accent" : "")}
          >
            <Sun className="mr-2 h-4 w-4" />
            Light
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => handleThemeChange("dark")}
            className={cn(resolvedTheme === "dark" ? "bg-accent" : "")}
          >
            <Moon className="mr-2 h-4 w-4" />
            Dark
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleThemeChange("system")}>
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
          <DropdownMenuItem 
            onClick={() => handleColorChange("default")}
            className={cn(colorMode === "default" ? "bg-accent" : "")}
          >
            <div className="w-4 h-4 rounded-full bg-[hsl(142,76%,36%)] mr-2" />
            Green (Default)
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => handleColorChange("pink")}
            className={cn(colorMode === "pink" ? "bg-accent" : "")}
          >
            <div className="w-4 h-4 rounded-full bg-[hsl(328,73%,69%)] mr-2" />
            Pink
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => handleColorChange("purple")}
            className={cn(colorMode === "purple" ? "bg-accent" : "")}
          >
            <div className="w-4 h-4 rounded-full bg-[hsl(265,73%,69%)] mr-2" />
            Royal Purple
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
