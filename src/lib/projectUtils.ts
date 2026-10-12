/**
 * Project and domain helper utilities for real website logos and favicons.
 */

export function getCleanDomain(urlOrDomain: string): string {
  if (!urlOrDomain) return '';
  return urlOrDomain
    .trim()
    .replace(/^https?:\/\//i, '')
    .replace(/^www\./i, '')
    .split('/')[0]
    .split('?')[0]
    .split(':')[0]
    .toLowerCase();
}

/**
 * Returns Google S2 Favicon URL with high-res 64px icon size.
 */
export function getProjectLogoUrl(urlOrDomain: string, size = 64): string {
  const clean = getCleanDomain(urlOrDomain);
  if (!clean) return '';
  return `https://www.google.com/s2/favicons?domain=${clean}&sz=${size}`;
}

/**
 * Returns fallback letter for a domain or project name.
 */
export function getProjectFallbackLetter(nameOrDomain: string): string {
  const clean = getCleanDomain(nameOrDomain) || nameOrDomain || 'P';
  return clean[0].toUpperCase();
}
