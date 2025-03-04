
import { useRef } from "react";

interface ReceiptFileInputProps {
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  inputRef?: React.RefObject<HTMLInputElement>;
}

export function ReceiptFileInput({ onChange, inputRef }: ReceiptFileInputProps) {
  const defaultRef = useRef<HTMLInputElement>(null);
  const ref = inputRef || defaultRef;
  
  return (
    <input
      ref={ref}
      id="receipt-upload"
      type="file"
      accept="image/*,.pdf"
      onChange={onChange}
      className="hidden"
    />
  );
}
