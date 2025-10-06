import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { BarChart2, Target, HandCoins, Settings, User, Bell } from "lucide-react";
import { useState } from "react";
import SettingsSidebar from "../SettingsSidebar";

interface MoreSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const moreItems = [
  { icon: BarChart2, label: "Analytics", path: "/app/analytics", color: "text-purple-500" },
  { icon: Target, label: "Goals", path: "/app/goals", color: "text-blue-500" },
  { icon: HandCoins, label: "Loans & Udhaar", path: "/app/loans", color: "text-amber-500" },
  { icon: Settings, label: "Settings", path: null, color: "text-gray-500" },
];

export function MoreSheet({ open, onOpenChange }: MoreSheetProps) {
  const navigate = useNavigate();
  const [settingsOpen, setSettingsOpen] = useState(false);

  const handleItemClick = (path: string | null, label: string) => {
    if (label === "Settings") {
      setSettingsOpen(true);
    } else if (path) {
      navigate(path);
      onOpenChange(false);
    }
  };

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="bottom" className="h-[70vh] rounded-t-3xl">
          <SheetHeader>
            <SheetTitle>More Options</SheetTitle>
            <SheetDescription>
              Access additional features and settings
            </SheetDescription>
          </SheetHeader>
          
          <div className="grid grid-cols-3 gap-4 mt-6">
            {moreItems.map((item) => (
              <Button
                key={item.label}
                variant="outline"
                className="flex flex-col h-24 items-center justify-center gap-2 rounded-2xl border-2 hover:border-primary/50 hover:bg-accent/30 transition-all"
                onClick={() => handleItemClick(item.path, item.label)}
              >
                <item.icon className={`h-6 w-6 ${item.color}`} />
                <span className="text-xs font-medium text-center">{item.label}</span>
              </Button>
            ))}
          </div>
        </SheetContent>
      </Sheet>

      {/* Settings Sheet */}
      <Sheet open={settingsOpen} onOpenChange={setSettingsOpen}>
        <SheetContent side="left" className="w-[280px] p-0">
          <SettingsSidebar 
            isOpen={settingsOpen} 
            onClose={() => setSettingsOpen(false)}
            onParentClose={() => onOpenChange(false)}
          />
        </SheetContent>
      </Sheet>
    </>
  );
}
