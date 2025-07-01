
import React from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";

interface SettingsHeaderProps {
  onClose: () => void;
}

export function SettingsHeader({ onClose }: SettingsHeaderProps) {
  return (
    <div className="flex items-center gap-2 px-4 py-4 border-b safe-area-top bg-background">
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
  );
}
