
import { Button } from "@/components/ui/button";

interface DeleteButtonProps {
  selectedCount: number;
  onDelete: () => void;
  isMobile: boolean;
}

export function DeleteButton({ selectedCount, onDelete, isMobile }: DeleteButtonProps) {
  if (selectedCount === 0) return null;

  return (
    <Button 
      variant="destructive"
      onClick={onDelete}
      size={isMobile ? "sm" : "default"}
      className="whitespace-nowrap rounded-lg"
    >
      Delete {selectedCount > 0 && `(${selectedCount})`}
    </Button>
  );
}
