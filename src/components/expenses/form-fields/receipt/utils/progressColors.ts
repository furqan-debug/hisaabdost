
export function getProgressColor(progress: number): string {
  if (progress < 30) return 'bg-amber-500';
  if (progress < 70) return 'bg-blue-500';
  return 'bg-emerald-500';
}
