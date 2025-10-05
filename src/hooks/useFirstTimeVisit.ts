import { useState, useEffect } from 'react';

const FIRST_VISIT_KEY = 'hasVisitedBefore';

export function useFirstTimeVisit() {
  const [isFirstVisit, setIsFirstVisit] = useState<boolean | null>(null);

  useEffect(() => {
    const hasVisited = localStorage.getItem(FIRST_VISIT_KEY);
    setIsFirstVisit(!hasVisited);
  }, []);

  const markVisitComplete = () => {
    localStorage.setItem(FIRST_VISIT_KEY, 'true');
    setIsFirstVisit(false);
  };

  return {
    isFirstVisit,
    markVisitComplete,
    isLoading: isFirstVisit === null
  };
}
