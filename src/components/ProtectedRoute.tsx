
import React from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  // For now, just render children - auth logic can be added later
  return <>{children}</>;
}
