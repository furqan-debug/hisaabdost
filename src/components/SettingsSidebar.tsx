
import React from "react";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/lib/auth";
import { SettingsHeader } from "./settings/SettingsHeader";
import { ThemeSettings } from "./settings/ThemeSettings";
import { ColorSettings } from "./settings/ColorSettings";
import { CurrencySettings } from "./settings/CurrencySettings";
import { UserSection } from "./settings/UserSection";
import { ScrollArea } from "./ui/scroll-area";
import { MonthSelector } from "./MonthSelector";

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
  const {
    signOut
  } = useAuth();

  const handleSignOut = () => {
    onClose();
    signOut();
  };

  return (
    <div className="flex flex-col h-full bg-background">
      <SettingsHeader onClose={onClose} />
      
      <ScrollArea className="flex-1 overflow-y-auto">
        <div className="p-4">
          <div className="pb-4 mb-2 flex items-center gap-3 py-[12px] px-0 my-0">
            <img
              src="/lovable-uploads/865d9039-b9ca-4d0f-9e62-7321253ffafa.png"
              alt="Hisaab Dost logo"
              style={{
                filter: "drop-shadow(0 2px 3px rgba(128,102,255,0.10))"
              }}
              className="h-20 w-20 bg-white rounded shadow"
            />
            <h2 className="font-bold bg-gradient-to-r from-[#6E59A5] to-[#9b87f5] bg-clip-text text-transparent py-[5px] px-[5px] text-3xl">
              Hisaab Dost
            </h2>
          </div>
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Date Range</h3>
          <MonthSelector selectedMonth={selectedMonth} onChange={onMonthChange} className="w-full mb-4" />
        </div>

        <Separator />
        <CurrencySettings />
        <Separator />
        <ThemeSettings />
        <Separator />
        <ColorSettings />
        <Separator />
        <UserSection onSignOut={handleSignOut} />
      </ScrollArea>
    </div>
  );
}
