
import React from "react";

export function ColorSettings() {
  return (
    <div className="px-4 py-[13px]">
      <h3 className="text-sm font-medium text-muted-foreground mb-3">Color</h3>
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-start h-9 px-3 py-2 bg-accent rounded-md border">
          <div className="w-4 h-4 rounded-full bg-[hsl(265,73%,69%)] mr-2" />
          <span className="text-sm font-medium">Purple (Active)</span>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Purple theme is active for all users
        </p>
      </div>
    </div>
  );
}
