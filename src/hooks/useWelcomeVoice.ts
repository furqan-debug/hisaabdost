import { useEffect, useRef, useState, useCallback } from 'react';

const WELCOME_TEXT = `Hisaab Dost, Take control of your financial future, Track expenses, build wealth, and achieve your goals with confidence, Your journey to financial freedom starts here`;
const VOICE_PLAYED_KEY = 'welcome_voice_played';

export function useWelcomeVoice(enabled: boolean = true) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const hasPlayedRef = useRef(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    // Check if Web Speech API is supported
    setIsSupported('speechSynthesis' in window);
    
    // Check if voice has already been played this session
    const hasPlayed = sessionStorage.getItem(VOICE_PLAYED_KEY);
    if (hasPlayed) {
      hasPlayedRef.current = true;
    }
    
    // Load voices
    if ('speechSynthesis' in window) {
      window.speechSynthesis.getVoices();
    }
  }, []);

  const speak = useCallback(() => {
    if (!isSupported || !enabled || hasPlayedRef.current || isPlaying) return;

    // Mark as played to prevent duplicate attempts
    hasPlayedRef.current = true;
    sessionStorage.setItem(VOICE_PLAYED_KEY, 'true');

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
        hasPlayedRef.current = false; // Allow retry on error
        sessionStorage.removeItem(VOICE_PLAYED_KEY);
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
  }, [isSupported, enabled, isPlaying]);

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
