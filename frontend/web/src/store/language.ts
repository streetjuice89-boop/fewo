import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Language = 'de' | 'en';

interface LanguageState {
  language: Language;
  setLanguage: (lang: Language) => void;
}

export const useLanguageStore = create<LanguageState>()(
  persist(
    (set) => ({
      language: 'de',
      setLanguage: (language) => set({ language }),
    }),
    {
      name: 'language-storage',
    }
  )
);

// Country code to flag emoji mapping
export const countryFlags: Record<string, string> = {
  DE: '🇩🇪',
  ES: '🇪🇸',
  IT: '🇮🇹',
  FR: '🇫🇷',
  PT: '🇵🇹',
  GR: '🇬🇷',
  HR: '🇭🇷',
  AT: '🇦🇹',
  CH: '🇨🇭',
  NL: '🇳🇱',
  BE: '🇧🇪',
  PL: '🇵🇱',
  CZ: '🇨🇿',
  TR: '🇹🇷',
  GB: '🇬🇧',
  US: '🇺🇸',
};

export const getFlag = (countryCode: string): string => {
  return countryFlags[countryCode?.toUpperCase()] || '🏳️';
};

