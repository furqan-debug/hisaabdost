import React from 'react';
import { useNavigate } from 'react-router-dom';
import FinnyChat from '@/components/finny/FinnyChat';

export default function FinnyChatPage() {
  const navigate = useNavigate();

  const handleClose = () => {
    navigate(-1); // Go back to previous page
  };

  return (
    <div className="min-h-screen bg-background">
      <FinnyChat isOpen={true} onClose={handleClose} />
    </div>
  );
}