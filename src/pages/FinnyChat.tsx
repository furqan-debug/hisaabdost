import React from 'react';
import FinnyChat from '@/components/finny/FinnyChat';

export default function FinnyChatPage() {
  return (
    <div className="min-h-screen bg-background">
      <FinnyChat isOpen={true} onClose={() => {}} />
    </div>
  );
}