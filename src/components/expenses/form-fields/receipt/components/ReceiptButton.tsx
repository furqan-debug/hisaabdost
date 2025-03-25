
import { Button, ButtonProps } from "@/components/ui/button";
import { Upload, Camera, RotateCcw } from "lucide-react";

interface ReceiptButtonProps extends ButtonProps {
  icon: "upload" | "camera" | "retry";
  children: React.ReactNode;
}

export function ReceiptButton({ 
  icon, 
  children, 
  ...props 
}: ReceiptButtonProps) {
  const IconComponent = {
    upload: Upload,
    camera: Camera,
    retry: RotateCcw
  }[icon];

  return (
    <Button {...props}>
      <IconComponent className="mr-2 h-4 w-4" />
      {children}
    </Button>
  );
}
