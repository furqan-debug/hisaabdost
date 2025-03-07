
import React from "react";

interface FormSectionProps {
  children: React.ReactNode;
}

export function FormSection({ children }: FormSectionProps) {
  return <div className="space-y-4">{children}</div>;
}
