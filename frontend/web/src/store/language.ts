import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { translations } from '../i18n/translations';
import type { TranslationKey } from '../i18n/translations';

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

// Translation function - use this in components
export const useTranslation = () => {
  const language = useLanguageStore((state) => state.language);
  
  const t = (key: TranslationKey): string => {
    return translations[language]?.[key] || key;
  };
  
  return { t, language };
};

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


