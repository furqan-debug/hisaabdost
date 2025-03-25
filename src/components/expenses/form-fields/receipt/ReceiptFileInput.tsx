
import { useRef } from "react";

interface ReceiptFileInputProps {
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  inputRef?: React.RefObject<HTMLInputElement>;
  id?: string;
  useCamera?: boolean;
}

export function ReceiptFileInput({ 
  onChange, 
  inputRef, 
  id = "receipt-upload",
  useCamera = false
}: ReceiptFileInputProps) {
  const defaultRef = useRef<HTMLInputElement>(null);
  const ref = inputRef || defaultRef;
  
  return (
    <input
      ref={ref}
      id={id}
      type="file"
      accept="image/*,.pdf"
      capture={useCamera ? "environment" : undefined}
      onChange={onChange}
      className="hidden"
    />
  );
}
