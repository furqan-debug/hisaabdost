
interface ReceiptPreviewImageProps {
  previewUrl: string | null;
}

export function ReceiptPreviewImage({ previewUrl }: ReceiptPreviewImageProps) {
  if (!previewUrl) return null;
  
  return (
    <div className="relative w-full max-h-64 overflow-hidden rounded-md border">
      <img
        src={previewUrl}
        alt="Receipt preview"
        className="w-full object-contain"
      />
    </div>
  );
}
