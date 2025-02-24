
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useAI } from '@/hooks/useAI';
import { useToast } from '@/components/ui/use-toast';
import { Loader2 } from 'lucide-react';

export function AIAssistant() {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const { toast } = useToast();
  const { generateResponse, isLoading } = useAI({
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    try {
      const result = await generateResponse(prompt);
      setResponse(result.text);
      setPrompt('');
    } catch (error) {
      console.error('Error generating response:', error);
    }
  };

  return (
    <div className="space-y-4 p-4 border rounded-lg">
      <h2 className="text-lg font-semibold">AI Financial Assistant</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Ask for financial advice or insights..."
          className="min-h-[100px]"
        />
        <Button disabled={isLoading || !prompt.trim()} type="submit">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            'Get AI Response'
          )}
        </Button>
      </form>
      {response && (
        <div className="mt-4 p-4 bg-muted rounded-lg">
          <p className="whitespace-pre-wrap">{response}</p>
        </div>
      )}
    </div>
  );
}
