
import { useRef } from "react";

interface ReceiptFileInputProps {
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  inputRef?: React.RefObject<HTMLInputElement>;
  id?: string;
}

export function ReceiptFileInput({ onChange, inputRef, id = "receipt-upload" }: ReceiptFileInputProps) {
  const defaultRef = useRef<HTMLInputElement>(null);
  const ref = inputRef || defaultRef;
  
  return (
    <input
      ref={ref}
      id={id}
      type="file"
      accept="image/*,.pdf"
      onChange={onChange}
      className="hidden"
    />
  );
}
