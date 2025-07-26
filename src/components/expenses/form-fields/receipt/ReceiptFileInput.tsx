
import React from "react";

interface ReceiptFileInputProps {
  id: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  inputRef: React.RefObject<HTMLInputElement>;
  useCamera: boolean;
  accept?: string;
}

export function ReceiptFileInput({
  id,
  onChange,
  inputRef,
  useCamera,
  accept = "image/*"
}: ReceiptFileInputProps) {
  return (
    <input
      type="file"
      id={id}
      name={id}
      accept={useCamera ? "image/*;capture=camera" : accept}
      capture={useCamera ? true : undefined}
      className="hidden"
      onChange={onChange}
      ref={inputRef}
    />
  );
}
