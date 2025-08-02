import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import FinnyChat from '@/components/finny/FinnyChat';

export default function FinnyChatPage() {
  const navigate = useNavigate();

  const handleClose = () => {
    navigate(-1); // Go back to previous page
  };

  // Handle browser back button
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      // Prevent default back navigation and use our handler instead
      event.preventDefault();
      handleClose();
    };

    // Add popstate listener
    window.addEventListener('popstate', handlePopState);

    // Cleanup listener on unmount
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background">
      <FinnyChat isOpen={true} onClose={handleClose} />
    </div>
  );
}