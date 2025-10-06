import { useFamilyContext } from "@/hooks/useFamilyContext";
import { Badge } from "@/components/ui/badge";
import { Users, User } from "lucide-react";

export const ContextIndicator = () => {
  const { currentFamily, isPersonalMode } = useFamilyContext();

  return (
    <Badge 
      variant={isPersonalMode ? "outline" : "default"}
      className="flex items-center gap-1.5 px-3 py-1"
    >
      {isPersonalMode ? (
        <>
          <User className="h-3.5 w-3.5" />
          <span>Personal</span>
        </>
      ) : (
        <>
          <Users className="h-3.5 w-3.5" />
          <span>{currentFamily?.name || 'Family'}</span>
        </>
      )}
    </Badge>
  );
};
