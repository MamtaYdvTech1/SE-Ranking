/**
 * Centralized ISO 639-1 Language Dataset and Utilities
 */

export interface LanguageData {
  code: string;           // ISO 639-1 alpha-2 (e.g. "en")
  name: string;           // English name (e.g. "English")
  nativeName: string;     // Native name (e.g. "English", "Español")
  countryCode?: string;   // Primary associated country (e.g. "us", "es")
  direction?: 'ltr' | 'rtl';
}

export const LANGUAGES_DATA: LanguageData[] = [
  { code: 'en', name: 'English', nativeName: 'English', countryCode: 'us', direction: 'ltr' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', countryCode: 'es', direction: 'ltr' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', countryCode: 'de', direction: 'ltr' },
  { code: 'fr', name: 'French', nativeName: 'Français', countryCode: 'fr', direction: 'ltr' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', countryCode: 'it', direction: 'ltr' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', countryCode: 'br', direction: 'ltr' },
  { code: 'nl', name: 'Dutch', nativeName: 'Nederlands', countryCode: 'nl', direction: 'ltr' },
  { code: 'pl', name: 'Polish', nativeName: 'Polski', countryCode: 'pl', direction: 'ltr' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', countryCode: 'in', direction: 'ltr' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', countryCode: 'jp', direction: 'ltr' },
  { code: 'zh', name: 'Chinese (Simplified)', nativeName: '简体中文', countryCode: 'cn', direction: 'ltr' },
  { code: 'ko', name: 'Korean', nativeName: '한국어', countryCode: 'kr', direction: 'ltr' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', countryCode: 'sa', direction: 'rtl' },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', countryCode: 'tr', direction: 'ltr' },
  { code: 'uk', name: 'Ukrainian', nativeName: 'Українська', countryCode: 'ua', direction: 'ltr' },
  { code: 'sv', name: 'Swedish', nativeName: 'Svenska', countryCode: 'se', direction: 'ltr' },
  { code: 'da', name: 'Danish', nativeName: 'Dansk', countryCode: 'dk', direction: 'ltr' },
  { code: 'fi', name: 'Finnish', nativeName: 'Suomi', countryCode: 'fi', direction: 'ltr' },
  { code: 'no', name: 'Norwegian', nativeName: 'Norsk', countryCode: 'no', direction: 'ltr' },
  { code: 'cs', name: 'Czech', nativeName: 'Čeština', countryCode: 'cz', direction: 'ltr' },
  { code: 'el', name: 'Greek', nativeName: 'Ελληνικά', countryCode: 'gr', direction: 'ltr' },
  { code: 'he', name: 'Hebrew', nativeName: 'עברית', countryCode: 'il', direction: 'rtl' },
  { code: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia', countryCode: 'id', direction: 'ltr' },
  { code: 'th', name: 'Thai', nativeName: 'ไทย', countryCode: 'th', direction: 'ltr' },
  { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt', countryCode: 'vn', direction: 'ltr' },
  { code: 'ro', name: 'Romanian', nativeName: 'Română', countryCode: 'ro', direction: 'ltr' },
  { code: 'hu', name: 'Hungarian', nativeName: 'Magyar', countryCode: 'hu', direction: 'ltr' },
];

const LANG_MAP = new Map<string, LanguageData>();
LANGUAGES_DATA.forEach((l) => {
  LANG_MAP.set(l.code.toLowerCase(), l);
  LANG_MAP.set(l.name.toLowerCase(), l);
});

export function getAllLanguages(): LanguageData[] {
  return LANGUAGES_DATA;
}

export function getLanguageByCode(code?: string | null): LanguageData {
  if (!code) return LANGUAGES_DATA[0];
  const cleaned = code.trim().toLowerCase();
  return LANG_MAP.get(cleaned) || {
    code: cleaned,
    name: cleaned.toUpperCase(),
    nativeName: cleaned.toUpperCase(),
    direction: 'ltr',
  };
}

export function searchLanguages(query: string): LanguageData[] {
  const q = query.trim().toLowerCase();
  if (!q) return LANGUAGES_DATA;
  return LANGUAGES_DATA.filter(
    (l) =>
      l.name.toLowerCase().includes(q) ||
      l.code.toLowerCase().includes(q) ||
      l.nativeName.toLowerCase().includes(q)
  );
}
