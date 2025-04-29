
import { useEffect } from 'react';

export const useQueuedMessage = (
  queuedMessage: string | null,
  isOpen: boolean,
  setQueuedMessage: (message: string | null) => void
) => {
  // Handle queued message processing
  useEffect(() => {
    if (queuedMessage && isOpen) {
      const timer = setTimeout(() => {
        const input = document.querySelector('input[placeholder="Message Finny..."]') as HTMLInputElement;
        const sendButton = input?.parentElement?.querySelector('button[type="submit"]') as HTMLButtonElement;
        
        if (input && sendButton) {
          input.value = queuedMessage;
          const event = new Event('input', { bubbles: true });
          input.dispatchEvent(event);
          setTimeout(() => {
            sendButton.click();
            setQueuedMessage(null);
          }, 100);
        }
      }, 500);
      
      return () => clearTimeout(timer);
    }
  }, [queuedMessage, isOpen, setQueuedMessage]);
};
