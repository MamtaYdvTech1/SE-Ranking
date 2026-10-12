/**
 * Comprehensive ISO 3166-1 alpha-2 / alpha-3 Country Dataset and Utilities.
 * Production source of truth for countries and dynamic flag representations.
 */

export interface CountryData {
  code: string;         // ISO alpha-2 (e.g. "US")
  alpha3: string;       // ISO alpha-3 (e.g. "USA")
  name: string;         // Common English name
  nativeName?: string;  // Native name
  callingCode?: string; // Country calling code
  region: string;       // Continent / Region
  flagCode: string;     // SVG filename code (lowercase alpha-2 e.g. "us")
}

export const COUNTRIES_DATA: CountryData[] = [
  { code: 'US', alpha3: 'USA', name: 'United States', nativeName: 'United States', callingCode: '+1', region: 'North America', flagCode: 'us' },
  { code: 'IN', alpha3: 'IND', name: 'India', nativeName: 'भारत', callingCode: '+91', region: 'Asia', flagCode: 'in' },
  { code: 'GB', alpha3: 'GBR', name: 'United Kingdom', nativeName: 'United Kingdom', callingCode: '+44', region: 'Europe', flagCode: 'gb' },
  { code: 'CA', alpha3: 'CAN', name: 'Canada', nativeName: 'Canada', callingCode: '+1', region: 'North America', flagCode: 'ca' },
  { code: 'AU', alpha3: 'AUS', name: 'Australia', nativeName: 'Australia', callingCode: '+61', region: 'Oceania', flagCode: 'au' },
  { code: 'DE', alpha3: 'DEU', name: 'Germany', nativeName: 'Deutschland', callingCode: '+49', region: 'Europe', flagCode: 'de' },
  { code: 'FR', alpha3: 'FRA', name: 'France', nativeName: 'France', callingCode: '+33', region: 'Europe', flagCode: 'fr' },
  { code: 'ES', alpha3: 'ESP', name: 'Spain', nativeName: 'España', callingCode: '+34', region: 'Europe', flagCode: 'es' },
  { code: 'IT', alpha3: 'ITA', name: 'Italy', nativeName: 'Italia', callingCode: '+39', region: 'Europe', flagCode: 'it' },
  { code: 'NL', alpha3: 'NLD', name: 'Netherlands', nativeName: 'Nederland', callingCode: '+31', region: 'Europe', flagCode: 'nl' },
  { code: 'BR', alpha3: 'BRA', name: 'Brazil', nativeName: 'Brasil', callingCode: '+55', region: 'South America', flagCode: 'br' },
  { code: 'JP', alpha3: 'JPN', name: 'Japan', nativeName: '日本', callingCode: '+81', region: 'Asia', flagCode: 'jp' },
  { code: 'AE', alpha3: 'ARE', name: 'United Arab Emirates', nativeName: 'دولة الإمارات العربية المتحدة', callingCode: '+971', region: 'Middle East', flagCode: 'ae' },
  { code: 'SG', alpha3: 'SGP', name: 'Singapore', nativeName: 'Singapore', callingCode: '+65', region: 'Asia', flagCode: 'sg' },
  { code: 'AF', alpha3: 'AFG', name: 'Afghanistan', nativeName: 'افغانستان', callingCode: '+93', region: 'Asia', flagCode: 'af' },
  { code: 'AL', alpha3: 'ALB', name: 'Albania', nativeName: 'Shqipëria', callingCode: '+355', region: 'Europe', flagCode: 'al' },
  { code: 'DZ', alpha3: 'DZA', name: 'Algeria', nativeName: 'الجزائر', callingCode: '+213', region: 'Africa', flagCode: 'dz' },
  { code: 'AD', alpha3: 'AND', name: 'Andorra', nativeName: 'Andorra', callingCode: '+376', region: 'Europe', flagCode: 'ad' },
  { code: 'AO', alpha3: 'AGO', name: 'Angola', nativeName: 'Angola', callingCode: '+244', region: 'Africa', flagCode: 'ao' },
  { code: 'AR', alpha3: 'ARG', name: 'Argentina', nativeName: 'Argentina', callingCode: '+54', region: 'South America', flagCode: 'ar' },
  { code: 'AM', alpha3: 'ARM', name: 'Armenia', nativeName: 'Հայաստան', callingCode: '+374', region: 'Asia', flagCode: 'am' },
  { code: 'AT', alpha3: 'AUT', name: 'Austria', nativeName: 'Österreich', callingCode: '+43', region: 'Europe', flagCode: 'at' },
  { code: 'AZ', alpha3: 'AZE', name: 'Azerbaijan', nativeName: 'Azərbaycan', callingCode: '+994', region: 'Asia', flagCode: 'az' },
  { code: 'BH', alpha3: 'BHR', name: 'Bahrain', nativeName: 'البحرين', callingCode: '+973', region: 'Middle East', flagCode: 'bh' },
  { code: 'BD', alpha3: 'BGD', name: 'Bangladesh', nativeName: 'বাংলাদেশ', callingCode: '+880', region: 'Asia', flagCode: 'bd' },
  { code: 'BE', alpha3: 'BEL', name: 'Belgium', nativeName: 'België', callingCode: '+32', region: 'Europe', flagCode: 'be' },
  { code: 'BG', alpha3: 'BGR', name: 'Bulgaria', nativeName: 'България', callingCode: '+359', region: 'Europe', flagCode: 'bg' },
  { code: 'CL', alpha3: 'CHL', name: 'Chile', nativeName: 'Chile', callingCode: '+56', region: 'South America', flagCode: 'cl' },
  { code: 'CN', alpha3: 'CHN', name: 'China', nativeName: '中国', callingCode: '+86', region: 'Asia', flagCode: 'cn' },
  { code: 'CO', alpha3: 'COL', name: 'Colombia', nativeName: 'Colombia', callingCode: '+57', region: 'South America', flagCode: 'co' },
  { code: 'CR', alpha3: 'CRI', name: 'Costa Rica', nativeName: 'Costa Rica', callingCode: '+506', region: 'North America', flagCode: 'cr' },
  { code: 'HR', alpha3: 'HRV', name: 'Croatia', nativeName: 'Hrvatska', callingCode: '+385', region: 'Europe', flagCode: 'hr' },
  { code: 'CY', alpha3: 'CYP', name: 'Cyprus', nativeName: 'Κύπρος', callingCode: '+357', region: 'Europe', flagCode: 'cy' },
  { code: 'CZ', alpha3: 'CZE', name: 'Czechia', nativeName: 'Česko', callingCode: '+420', region: 'Europe', flagCode: 'cz' },
  { code: 'DK', alpha3: 'DNK', name: 'Denmark', nativeName: 'Danmark', callingCode: '+45', region: 'Europe', flagCode: 'dk' },
  { code: 'EG', alpha3: 'EGY', name: 'Egypt', nativeName: 'مصر', callingCode: '+20', region: 'Africa', flagCode: 'eg' },
  { code: 'EE', alpha3: 'EST', name: 'Estonia', nativeName: 'Eesti', callingCode: '+372', region: 'Europe', flagCode: 'ee' },
  { code: 'FI', alpha3: 'FIN', name: 'Finland', nativeName: 'Suomi', callingCode: '+358', region: 'Europe', flagCode: 'fi' },
  { code: 'GE', alpha3: 'GEO', name: 'Georgia', nativeName: 'საქართველო', callingCode: '+995', region: 'Asia', flagCode: 'ge' },
  { code: 'GR', alpha3: 'GRC', name: 'Greece', nativeName: 'Ελλάδα', callingCode: '+30', region: 'Europe', flagCode: 'gr' },
  { code: 'HK', alpha3: 'HKG', name: 'Hong Kong', nativeName: '香港', callingCode: '+852', region: 'Asia', flagCode: 'hk' },
  { code: 'HU', alpha3: 'HUN', name: 'Hungary', nativeName: 'Magyarország', callingCode: '+36', region: 'Europe', flagCode: 'hu' },
  { code: 'IS', alpha3: 'ISL', name: 'Iceland', nativeName: 'Ísland', callingCode: '+354', region: 'Europe', flagCode: 'is' },
  { code: 'ID', alpha3: 'IDN', name: 'Indonesia', nativeName: 'Indonesia', callingCode: '+62', region: 'Asia', flagCode: 'id' },
  { code: 'IE', alpha3: 'IRL', name: 'Ireland', nativeName: 'Éire', callingCode: '+353', region: 'Europe', flagCode: 'ie' },
  { code: 'IL', alpha3: 'ISR', name: 'Israel', nativeName: 'ישראל', callingCode: '+972', region: 'Middle East', flagCode: 'il' },
  { code: 'KE', alpha3: 'KEN', name: 'Kenya', nativeName: 'Kenya', callingCode: '+254', region: 'Africa', flagCode: 'ke' },
  { code: 'KR', alpha3: 'KOR', name: 'South Korea', nativeName: '대한민국', callingCode: '+82', region: 'Asia', flagCode: 'kr' },
  { code: 'KW', alpha3: 'KWT', name: 'Kuwait', nativeName: 'الكويت', callingCode: '+965', region: 'Middle East', flagCode: 'kw' },
  { code: 'LV', alpha3: 'LVA', name: 'Latvia', nativeName: 'Latvija', callingCode: '+371', region: 'Europe', flagCode: 'lv' },
  { code: 'LT', alpha3: 'LTU', name: 'Lithuania', nativeName: 'Lietuva', callingCode: '+370', region: 'Europe', flagCode: 'lt' },
  { code: 'LU', alpha3: 'LUX', name: 'Luxembourg', nativeName: 'Luxembourg', callingCode: '+352', region: 'Europe', flagCode: 'lu' },
  { code: 'MY', alpha3: 'MYS', name: 'Malaysia', nativeName: 'Malaysia', callingCode: '+60', region: 'Asia', flagCode: 'my' },
  { code: 'MX', alpha3: 'MEX', name: 'Mexico', nativeName: 'México', callingCode: '+52', region: 'North America', flagCode: 'mx' },
  { code: 'MA', alpha3: 'MAR', name: 'Morocco', nativeName: 'المغرب', callingCode: '+212', region: 'Africa', flagCode: 'ma' },
  { code: 'NZ', alpha3: 'NZL', name: 'New Zealand', nativeName: 'New Zealand', callingCode: '+64', region: 'Oceania', flagCode: 'nz' },
  { code: 'NG', alpha3: 'NGA', name: 'Nigeria', nativeName: 'Nigeria', callingCode: '+234', region: 'Africa', flagCode: 'ng' },
  { code: 'NO', alpha3: 'NOR', name: 'Norway', nativeName: 'Norge', callingCode: '+47', region: 'Europe', flagCode: 'no' },
  { code: 'OM', alpha3: 'OMN', name: 'Oman', nativeName: 'عمان', callingCode: '+968', region: 'Middle East', flagCode: 'om' },
  { code: 'PK', alpha3: 'PAK', name: 'Pakistan', nativeName: 'پاکستان', callingCode: '+92', region: 'Asia', flagCode: 'pk' },
  { code: 'PA', alpha3: 'PAN', name: 'Panama', nativeName: 'Panamá', callingCode: '+507', region: 'North America', flagCode: 'pa' },
  { code: 'PE', alpha3: 'PER', name: 'Peru', nativeName: 'Perú', callingCode: '+51', region: 'South America', flagCode: 'pe' },
  { code: 'PH', alpha3: 'PHL', name: 'Philippines', nativeName: 'Pilipinas', callingCode: '+63', region: 'Asia', flagCode: 'ph' },
  { code: 'PL', alpha3: 'POL', name: 'Poland', nativeName: 'Polska', callingCode: '+48', region: 'Europe', flagCode: 'pl' },
  { code: 'PT', alpha3: 'PRT', name: 'Portugal', nativeName: 'Portugal', callingCode: '+351', region: 'Europe', flagCode: 'pt' },
  { code: 'QA', alpha3: 'QAT', name: 'Qatar', nativeName: 'قطر', callingCode: '+974', region: 'Middle East', flagCode: 'qa' },
  { code: 'RO', alpha3: 'ROU', name: 'Romania', nativeName: 'România', callingCode: '+40', region: 'Europe', flagCode: 'ro' },
  { code: 'SA', alpha3: 'SAU', name: 'Saudi Arabia', nativeName: 'المملكة العربية السعودية', callingCode: '+966', region: 'Middle East', flagCode: 'sa' },
  { code: 'RS', alpha3: 'SRB', name: 'Serbia', nativeName: 'Srbija', callingCode: '+381', region: 'Europe', flagCode: 'rs' },
  { code: 'SK', alpha3: 'SVK', name: 'Slovakia', nativeName: 'Slovensko', callingCode: '+421', region: 'Europe', flagCode: 'sk' },
  { code: 'SI', alpha3: 'SVN', name: 'Slovenia', nativeName: 'Slovenija', callingCode: '+386', region: 'Europe', flagCode: 'si' },
  { code: 'ZA', alpha3: 'ZAF', name: 'South Africa', nativeName: 'South Africa', callingCode: '+27', region: 'Africa', flagCode: 'za' },
  { code: 'SE', alpha3: 'SWE', name: 'Sweden', nativeName: 'Sverige', callingCode: '+46', region: 'Europe', flagCode: 'se' },
  { code: 'CH', alpha3: 'CHE', name: 'Switzerland', nativeName: 'Schweiz', callingCode: '+41', region: 'Europe', flagCode: 'ch' },
  { code: 'TW', alpha3: 'TWN', name: 'Taiwan', nativeName: '台灣', callingCode: '+886', region: 'Asia', flagCode: 'tw' },
  { code: 'TH', alpha3: 'THA', name: 'Thailand', nativeName: 'ประเทศไทย', callingCode: '+66', region: 'Asia', flagCode: 'th' },
  { code: 'TR', alpha3: 'TUR', name: 'Türkiye', nativeName: 'Türkiye', callingCode: '+90', region: 'Europe', flagCode: 'tr' },
  { code: 'UA', alpha3: 'UKR', name: 'Ukraine', nativeName: 'Україна', callingCode: '+380', region: 'Europe', flagCode: 'ua' },
  { code: 'VN', alpha3: 'VNM', name: 'Vietnam', nativeName: 'Việt Nam', callingCode: '+84', region: 'Asia', flagCode: 'vn' },
];

export const ISO_COUNTRIES: Record<string, string> = Object.fromEntries(
  COUNTRIES_DATA.map((c) => [c.code, c.name])
);

// Map for quick lookup
const COUNTRY_MAP = new Map<string, CountryData>();
COUNTRIES_DATA.forEach((c) => {
  COUNTRY_MAP.set(c.code.toUpperCase(), c);
  COUNTRY_MAP.set(c.alpha3.toUpperCase(), c);
  COUNTRY_MAP.set(c.name.toLowerCase(), c);
});

// Common aliases
const ALIASES: Record<string, string> = {
  usa: 'US',
  'united states': 'US',
  'united states of america': 'US',
  uk: 'GB',
  'united kingdom': 'GB',
  greatbritain: 'GB',
  england: 'GB',
  uae: 'AE',
  russia: 'RU',
  turkey: 'TR',
  türkiye: 'TR',
  korea: 'KR',
  'south korea': 'KR',
  holland: 'NL',
};

export function getAllCountries(): CountryData[] {
  return COUNTRIES_DATA;
}

export function normalizeCountryCode(input?: string | null): string | null {
  if (!input) return null;
  const cleaned = input.trim();
  if (!cleaned) return null;

  const upper = cleaned.toUpperCase();
  if (COUNTRY_MAP.has(upper)) {
    return COUNTRY_MAP.get(upper)!.code;
  }

  const lower = cleaned.toLowerCase();
  if (ALIASES[lower]) {
    return ALIASES[lower];
  }

  if (COUNTRY_MAP.has(lower)) {
    return COUNTRY_MAP.get(lower)!.code;
  }

  // Partial search
  const found = COUNTRIES_DATA.find((c) =>
    c.name.toLowerCase().includes(lower) || lower.includes(c.name.toLowerCase())
  );
  if (found) return found.code;

  if (upper.length === 2) {
    return upper;
  }

  return null;
}

export function getCountryInfo(input?: string | null): CountryData | null {
  const code = normalizeCountryCode(input);
  if (!code) return null;
  const country = COUNTRY_MAP.get(code);
  if (country) return country;

  return {
    code,
    alpha3: code + 'X',
    name: code,
    region: 'Global',
    flagCode: code.toLowerCase(),
  };
}

export function searchCountries(query: string): CountryData[] {
  const q = query.trim().toLowerCase();
  if (!q) return COUNTRIES_DATA;

  return COUNTRIES_DATA.filter(
    (c) =>
      c.name.toLowerCase().includes(q) ||
      c.code.toLowerCase().includes(q) ||
      c.alpha3.toLowerCase().includes(q) ||
      (c.nativeName && c.nativeName.toLowerCase().includes(q))
  );
}
