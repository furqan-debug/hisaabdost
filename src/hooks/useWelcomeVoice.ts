import { useEffect, useRef, useState } from 'react';

const WELCOME_TEXT = `Hisaab Dost, Take control of your financial future, Track expenses, build wealth, and achieve your goals with confidence, Your journey to financial freedom starts here`;

export function useWelcomeVoice(enabled: boolean = true) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    // Check if Web Speech API is supported
    setIsSupported('speechSynthesis' in window);
    
    // Load voices
    if ('speechSynthesis' in window) {
      window.speechSynthesis.getVoices();
    }
  }, []);

  const speak = () => {
    if (!isSupported || !enabled) return;

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    // Wait for voices to load
    const loadVoicesAndSpeak = () => {
      const utterance = new SpeechSynthesisUtterance(WELCOME_TEXT);
      utteranceRef.current = utterance;

      // Configure voice settings for a pleasant female voice
      utterance.rate = 0.95;
      utterance.pitch = 1.1;
      utterance.volume = 0.9;
      utterance.lang = 'en-US';

      // Get available voices
      const voices = window.speechSynthesis.getVoices();
      
      // Try to find a female voice
      const femaleVoice = voices.find(voice => 
        voice.lang === 'en-US' && (
          voice.name.toLowerCase().includes('female') ||
          voice.name.toLowerCase().includes('samantha') ||
          voice.name.toLowerCase().includes('zira')
        )
      ) || voices.find(voice => voice.lang === 'en-US') || voices[0];

      if (femaleVoice) {
        utterance.voice = femaleVoice;
      }

      utterance.onstart = () => setIsPlaying(true);
      utterance.onend = () => setIsPlaying(false);
      utterance.onerror = (e) => {
        console.error('Speech error:', e);
        setIsPlaying(false);
      };

      window.speechSynthesis.speak(utterance);
    };

    // Check if voices are loaded
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      loadVoicesAndSpeak();
    } else {
      // Wait for voices to load
      window.speechSynthesis.onvoiceschanged = () => {
        loadVoicesAndSpeak();
      };
    }
  };

  const stop = () => {
    window.speechSynthesis.cancel();
    setIsPlaying(false);
  };

  return {
    speak,
    stop,
    isPlaying,
    isSupported,
  };
}
