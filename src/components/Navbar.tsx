
import { Button } from "@/components/ui/button";
import { Bell, Plus, Settings } from "lucide-react";

const Navbar = () => {
  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center px-4 gap-4">
        <h2 className="text-lg font-semibold flex-1">Smart Expense Tracker</h2>
        <Button variant="outline" size="icon" className="w-10 h-10">
          <Plus className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="w-10 h-10">
          <Bell className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="w-10 h-10">
          <Settings className="h-4 w-4" />
        </Button>
      </div>
    </nav>
  );
};

export default Navbar;
