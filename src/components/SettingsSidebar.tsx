
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  Calendar, 
  ChevronLeft, 
  Palette, 
  Settings, 
  User, 
  Moon, 
  Sun, 
  LogOut,
  Globe,
  DollarSign 
} from "lucide-react";
import { MonthSelector } from "./MonthSelector";
import { useTheme } from "next-themes";
import { useAuth } from "@/lib/auth";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCurrency } from "@/hooks/use-currency";
import { CURRENCY_OPTIONS, CurrencyCode } from "@/utils/currencyUtils";

interface SettingsSidebarProps {
  selectedMonth: Date;
  onMonthChange: (date: Date) => void;
  onClose: () => void;
}

export function SettingsSidebar({ 
  selectedMonth, 
  onMonthChange, 
  onClose 
}: SettingsSidebarProps) {
  const { theme, setTheme } = useTheme();
  const { user, signOut } = useAuth();
  const [language, setLanguage] = React.useState("english");
  const { currencyCode, setCurrencyCode } = useCurrency();
  const [colorMode, setColorMode] = useState<"default" | "pink" | "blue">("default");

  // Initialize colorMode from localStorage or document class
  useEffect(() => {
    // Check localStorage first
    const savedColorTheme = localStorage.getItem("color-theme");
    
    if (savedColorTheme === "pink" || document.documentElement.classList.contains("pink")) {
      setColorMode("pink");
    } else if (savedColorTheme === "blue" || document.documentElement.classList.contains("blue")) {
      setColorMode("blue");
    } else {
      setColorMode("default");
    }
  }, []);

  const handleColorChange = (newColor: "default" | "pink" | "blue") => {
    // Remove existing color classes
    document.documentElement.classList.remove("pink", "blue");
    
    // Add new color class if needed
    if (newColor === "pink") {
      document.documentElement.classList.add("pink");
    } else if (newColor === "blue") {
      document.documentElement.classList.add("blue");
    }
    
    // Save color preference to localStorage
    localStorage.setItem("color-theme", newColor);
    
    setColorMode(newColor);
  };

  const handleSignOut = () => {
    onClose();
    signOut();
  };

  const handleCurrencyChange = (value: string) => {
    setCurrencyCode(value as CurrencyCode);
  };

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="flex items-center gap-2 px-4 py-4 border-b">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={onClose}
          className="h-8 w-8 rounded-full hover:bg-muted"
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </Button>
        <h2 className="text-lg font-semibold">Settings</h2>
      </div>

      <div className="flex-1 py-4 overflow-auto">
        <div className="px-4 pb-4 mb-2">
          <h2 className="text-xl font-bold bg-gradient-to-r from-[#9b87f5] to-primary bg-clip-text text-transparent mb-4">
            Expensify AI
          </h2>
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Date Range</h3>
          <MonthSelector
            selectedMonth={selectedMonth}
            onChange={onMonthChange}
            className="w-full"
          />
        </div>

        <Separator className="my-2" />

        <div className="px-4 py-3">
          <h3 className="text-sm font-medium text-muted-foreground mb-3">Currency</h3>
          <Select value={currencyCode} onValueChange={handleCurrencyChange}>
            <SelectTrigger className="w-full h-9">
              <SelectValue placeholder="Select currency" />
            </SelectTrigger>
            <SelectContent>
              {CURRENCY_OPTIONS.map((option) => (
                <SelectItem key={option.code} value={option.code}>
                  <div className="flex items-center">
                    <span className="mr-2">{option.symbol}</span>
                    <span>{option.label}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Separator className="my-2" />

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

        <Separator className="my-2" />

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
              className={`justify-start h-9 ${colorMode === 'blue' ? 'bg-accent' : ''}`}
              onClick={() => handleColorChange('blue')}
            >
              <div className="w-4 h-4 rounded-full bg-[hsl(214,82%,51%)] mr-2" />
              Blue
            </Button>
          </div>
        </div>

        <Separator className="my-2" />

        <div className="px-4 py-3">
          <h3 className="text-sm font-medium text-muted-foreground mb-3">Language</h3>
          <div className="flex flex-col gap-2">
            <Button 
              variant="outline" 
              className={`justify-start h-9 ${language === 'english' ? 'bg-accent' : ''}`}
              onClick={() => setLanguage('english')}
            >
              <Globe className="mr-2 h-4 w-4" />
              English
            </Button>
            <Button 
              variant="outline" 
              className={`justify-start h-9 ${language === 'spanish' ? 'bg-accent' : ''}`}
              onClick={() => setLanguage('spanish')}
            >
              <Globe className="mr-2 h-4 w-4" />
              Spanish
            </Button>
            <Button 
              variant="outline" 
              className={`justify-start h-9 ${language === 'french' ? 'bg-accent' : ''}`}
              onClick={() => setLanguage('french')}
            >
              <Globe className="mr-2 h-4 w-4" />
              French
            </Button>
          </div>
        </div>
      </div>

      <div className="border-t p-4">
        <div className="flex items-center mb-4">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.email}</p>
            <p className="text-xs text-muted-foreground truncate">
              {user?.email?.split('@')[0]}
            </p>
          </div>
        </div>
        <Button 
          variant="destructive" 
          className="w-full justify-start"
          onClick={handleSignOut}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign out
        </Button>
      </div>
    </div>
  );
}
