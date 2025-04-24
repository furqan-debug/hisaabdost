
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

export function ColorSettings() {
  const [colorMode, setColorMode] = useState<"default" | "pink" | "purple">("default");

  useEffect(() => {
    const savedColorTheme = localStorage.getItem("color-theme");
    
    if (savedColorTheme === "pink" || document.documentElement.classList.contains("pink")) {
      setColorMode("pink");
    } else if (savedColorTheme === "purple" || document.documentElement.classList.contains("purple")) {
      setColorMode("purple");
    } else {
      setColorMode("default");
    }
  }, []);

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

  return (
    <div className="px-4 py-3">
      <h3 className="text-sm font-medium text-muted-foreground mb-3">Color</h3>
      <div className="flex flex-col gap-2">
        <Button 
          variant="outline" 
          className={`justify-start h-9 ${colorMode === 'default' ? 'bg-accent' : ''}`}
          onClick={() => handleColorChange('default')}
        >
          <div className="w-4 h-4 rounded-full bg-[hsl(142,76%,36%)] mr-2" />
          Green (Default)
        </Button>
        <Button 
          variant="outline" 
          className={`justify-start h-9 ${colorMode === 'pink' ? 'bg-accent' : ''}`}
          onClick={() => handleColorChange('pink')}
        >
          <div className="w-4 h-4 rounded-full bg-[hsl(328,73%,69%)] mr-2" />
          Pink
        </Button>
        <Button 
          variant="outline" 
          className={`justify-start h-9 ${colorMode === 'purple' ? 'bg-accent' : ''}`}
          onClick={() => handleColorChange('purple')}
        >
          <div className="w-4 h-4 rounded-full bg-[hsl(265,73%,69%)] mr-2" />
          Royal Purple
        </Button>
      </div>
    </div>
  );
}
