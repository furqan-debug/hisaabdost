
export function getProgressColor(progress: number): string {
  // Create a more gradual color progression with specific breakpoints
  if (progress < 20) return 'bg-amber-400';         // Starting amber
  if (progress < 40) return 'bg-yellow-400';        // Moving to yellow
  if (progress < 60) return 'bg-blue-400';          // Then blue
  if (progress < 80) return 'bg-blue-500';          // Deeper blue
  if (progress < 95) return 'bg-emerald-400';       // Getting to emerald
  return 'bg-emerald-500';                          // Final emerald
}

// Helper function to get custom progress styles including gradients
export function getProgressStyles(progress: number): {
  background: string;
  className: string;
} {
  // For very smooth transitions, return a gradient background
  if (progress < 20) {
    return {
      background: 'linear-gradient(90deg, #fbbf24 0%, #f59e0b 100%)', // amber gradient
      className: 'from-amber-400 to-amber-500'
    };
  }
  if (progress < 40) {
    return {
      background: 'linear-gradient(90deg, #f59e0b 0%, #eab308 100%)', // amber to yellow
      className: 'from-amber-500 to-yellow-500'
    };
  }
  if (progress < 60) {
    return {
      background: 'linear-gradient(90deg, #eab308 0%, #3b82f6 100%)', // yellow to blue
      className: 'from-yellow-500 to-blue-500'
    };
  }
  if (progress < 80) {
    return {
      background: 'linear-gradient(90deg, #3b82f6 0%, #10b981 100%)', // blue to emerald
      className: 'from-blue-500 to-emerald-500'
    };
  }
  if (progress < 95) {
    return {
      background: 'linear-gradient(90deg, #10b981 0%, #059669 100%)', // light to deeper emerald
      className: 'from-emerald-500 to-emerald-600'
    };
  }
  
  // Final state
  return {
    background: 'linear-gradient(90deg, #10b981 0%, #047857 100%)', // emerald gradient
    className: 'from-emerald-500 to-emerald-700'
  };
}
