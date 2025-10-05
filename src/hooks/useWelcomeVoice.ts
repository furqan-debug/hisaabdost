import { useEffect, useRef, useState } from 'react';

const WELCOME_TEXT = `Hisaab Dost. Take control of your financial future. Track expenses, build wealth, and achieve your goals with confidence. Your journey to financial freedom starts here.`;

export function useWelcomeVoice(enabled: boolean = true) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    // Check if Web Speech API is supported
    setIsSupported('speechSynthesis' in window);
  }, []);

  const speak = () => {
    if (!isSupported || !enabled) return;

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(WELCOME_TEXT);
    utteranceRef.current = utterance;

    // Configure voice settings for a pleasant female voice
    utterance.rate = 0.9; // Slightly slower for clarity
    utterance.pitch = 1.1; // Slightly higher pitch
    utterance.volume = 0.8; // Not too loud

    // Try to get a female voice
    const voices = window.speechSynthesis.getVoices();
    const femaleVoice = voices.find(voice => 
      voice.name.toLowerCase().includes('female') || 
      voice.name.toLowerCase().includes('samantha') ||
      voice.name.toLowerCase().includes('victoria') ||
      voice.name.toLowerCase().includes('zira')
    ) || voices.find(voice => voice.lang.startsWith('en'));

    if (femaleVoice) {
      utterance.voice = femaleVoice;
    }

    utterance.onstart = () => setIsPlaying(true);
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);

    window.speechSynthesis.speak(utterance);
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
