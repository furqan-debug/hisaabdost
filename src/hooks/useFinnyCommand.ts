
import { useFinny } from '@/components/finny/FinnyProvider';
import { useAuth } from '@/lib/auth';
import { toast } from 'sonner';

/**
 * Hook to send commands to Finny programmatically
 */
export function useFinnyCommand() {
  const { openChat } = useFinny();
  const { user } = useAuth();

  /**
   * Send a command to Finny to add an expense
   */
  const addExpense = (amount: number, category: string, description?: string) => {
    if (!user) {
      toast.error('Please log in to use Finny');
      return;
    }

    // Format the message for Finny
    const message = `Add expense of ${amount} for ${category}${description ? ` for ${description}` : ''}`;
    
    // Open Finny chat with the message
    openChat();
    
    // This simulates a user typing the message
    // In a real implementation, you might want to send this directly to the Finny API
    const input = document.querySelector('input[placeholder="Message Finny..."]') as HTMLInputElement;
    const sendButton = input?.parentElement?.querySelector('button[type="submit"]') as HTMLButtonElement;
    
    if (input && sendButton) {
      input.value = message;
      // Trigger input event to update React state
      const event = new Event('input', { bubbles: true });
      input.dispatchEvent(event);
      // Click the send button
      setTimeout(() => sendButton.click(), 100);
    }
  };

  return {
    addExpense
  };
}
