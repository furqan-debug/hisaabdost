import { useEffect, useRef } from 'react';

const MUSIC_PLAYED_KEY = 'welcome_music_played';

export function useWelcomeMusic() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const hasPlayedRef = useRef(false);

  useEffect(() => {
    // Check if music has already been played this session
    const hasPlayed = sessionStorage.getItem(MUSIC_PLAYED_KEY);
    if (hasPlayed || hasPlayedRef.current) {
      return;
    }

    // Mark as played
    hasPlayedRef.current = true;
    sessionStorage.setItem(MUSIC_PLAYED_KEY, 'true');

    // Create audio element
    const audio = new Audio('/welcome-intro.mp3');
    audio.volume = 0.3; // Keep it subtle
    audioRef.current = audio;

    // Play after a short delay
    const timer = setTimeout(() => {
      audio.play().catch(err => {
        console.log('Audio autoplay prevented:', err);
        // Browser blocked autoplay - that's okay
      });
    }, 500);

    return () => {
      clearTimeout(timer);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  return { audioRef };
}
