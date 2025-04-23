
import React from "react";
import { Separator } from "@/components/ui/separator";
import { MonthSelector } from "./MonthSelector";
import { useAuth } from "@/lib/auth";
import { SettingsHeader } from "./settings/SettingsHeader";
import { ThemeSettings } from "./settings/ThemeSettings";
import { ColorSettings } from "./settings/ColorSettings";
import { CurrencySettings } from "./settings/CurrencySettings";
import { UserSection } from "./settings/UserSection";

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
  const { signOut } = useAuth();

  const handleSignOut = () => {
    onClose();
    signOut();
  };

  return (
    <div className="flex flex-col h-full bg-background">
      <SettingsHeader onClose={onClose} />

      <div className="flex-1 py-4 overflow-auto">
        <div className="px-4 pb-4 mb-2 flex items-center gap-3">
          <img
            src="/lovable-uploads/8d22f3db-ed72-4c4b-a265-1979f7bba8b0.png"
            alt="Hisab Dost logo"
            className="h-8 w-8 bg-white rounded shadow"
            style={{ filter: "drop-shadow(0 2px 3px rgba(128,102,255,0.10))" }}
          />
          <h2 className="text-xl font-bold bg-gradient-to-r from-[#6E59A5] to-[#9b87f5] bg-clip-text text-transparent mb-2">
            Hisab Dost
          </h2>
        </div>
        <h3 className="text-sm font-medium text-muted-foreground mb-2">Date Range</h3>
        <MonthSelector
          selectedMonth={selectedMonth}
          onChange={onMonthChange}
          className="w-full"
        />
      </div>

      <Separator className="my-2" />
      <CurrencySettings />
      <Separator className="my-2" />
      <ThemeSettings />
      <Separator className="my-2" />
      <ColorSettings />
      <UserSection onSignOut={handleSignOut} />
    </div>
  );
}
