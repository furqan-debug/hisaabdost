
export interface ChartContainerProps {
  children: React.ReactNode;
  className?: string;
  config?: Record<string, {
    color: string;
  }>;
}
