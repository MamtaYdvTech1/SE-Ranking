import React from 'react';

export interface IconProps {
  className?: string;
  size?: number;
}

/**
 * Official Google 4-Color Super "G" Logo
 */
export function GoogleIcon({ className = 'w-4 h-4 shrink-0', size = 16 }: IconProps) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      aria-label="Google"
      role="img"
    >
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      />
    </svg>
  );
}

/**
 * Official OpenAI / ChatGPT Rosette Logo
 */
export function ChatGptIcon({
  className = 'w-4 h-4 shrink-0',
  size = 16,
  colored = true,
}: IconProps & { colored?: boolean }) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      style={colored ? { color: '#10A37F' } : undefined}
      aria-label="ChatGPT"
      role="img"
    >
      <path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1683a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4947zm-9.66-4.7254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1402-2.2464zm-1.093-9.5298a4.4755 4.4755 0 0 1 2.3367-1.968l-.0047.161v5.5163a.7854.7854 0 0 0 .3927.6813l5.8428 3.3685-2.02 1.1683a.0757.0757 0 0 1-.0615 0L3.906 15.0478a4.5087 4.5087 0 0 1-2.4-5.8741zm15.4253 2.2133-5.8428-3.3685 2.02-1.1683a.0757.0757 0 0 1 .0615 0l4.8398 2.7913a4.4945 4.4945 0 0 1-.6767 8.105v-5.6772a.79.79 0 0 0-.4018-.6823zm2.7303-3.6669l-.142-.0852-4.7783-2.7582a.7759.7759 0 0 0-.7854 0L8.854 8.7997V6.4673a.0662.0662 0 0 1 .0331-.0615l4.8493-2.7913a4.504 4.504 0 0 1 6.6706 4.3013zm-10.875 4.7206l-2.6074-1.5056 2.6074-1.5056 2.6074 1.5056-2.6074 1.5056z" />
    </svg>
  );
}

/**
 * Official Google AI Overviews Sparkle Icon
 * Distinctive dual-sparkle 4-point star in Google AI gradient colors
 */
export function AiOverviewsIcon({ className = 'w-4 h-4 shrink-0', size = 16 }: IconProps) {
  const gradId = React.useId();
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Google AI Overviews"
      role="img"
    >
      <defs>
        <linearGradient id={`aioGrad-${gradId}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1A73E8" />
          <stop offset="40%" stopColor="#4285F4" />
          <stop offset="80%" stopColor="#7C3AED" />
          <stop offset="100%" stopColor="#9333EA" />
        </linearGradient>
      </defs>
      {/* Primary 4-pointed Google AI Sparkle */}
      <path
        d="M10.5 1.5C10.5 6.47 6.47 10.5 1.5 10.5C6.47 10.5 10.5 14.53 10.5 19.5C10.5 14.53 14.53 10.5 19.5 10.5C14.53 10.5 10.5 6.47 10.5 1.5Z"
        fill={`url(#aioGrad-${gradId})`}
      />
      {/* Secondary accent sparkle */}
      <path
        d="M18.5 14.5C18.5 16.71 16.71 18.5 14.5 18.5C16.71 18.5 18.5 20.29 18.5 22.5C18.5 20.29 20.29 18.5 22.5 18.5C20.29 18.5 18.5 16.71 18.5 14.5Z"
        fill="#3B82F6"
      />
    </svg>
  );
}

/**
 * Official Google AI Mode (Gemini Generative Conversational Search) Icon
 * Google Gemini's signature 4-point star in authentic Google Gemini multi-color gradient
 */
export function AiModeIcon({ className = 'w-4 h-4 shrink-0', size = 16 }: IconProps) {
  const gradId = React.useId();
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Google AI Mode"
      role="img"
    >
      <defs>
        <linearGradient id={`aiModeGrad-${gradId}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1BA1E3" />
          <stop offset="35%" stopColor="#5474FF" />
          <stop offset="70%" stopColor="#9B51E0" />
          <stop offset="100%" stopColor="#EA4335" />
        </linearGradient>
      </defs>
      <path
        d="M12 0C12 6.627 6.627 12 0 12C6.627 12 12 17.373 12 24C12 17.373 17.373 12 24 12C17.373 12 12 6.627 12 0Z"
        fill={`url(#aiModeGrad-${gradId})`}
      />
    </svg>
  );
}

/**
 * Official Google Gemini Icon
 */
export function GeminiIcon({ className = 'w-4 h-4 shrink-0', size = 16 }: IconProps) {
  const gradId = React.useId();
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Google Gemini"
      role="img"
    >
      <defs>
        <linearGradient id={`geminiIconGrad-${gradId}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1BA1E3" />
          <stop offset="35%" stopColor="#5474FF" />
          <stop offset="70%" stopColor="#9B51E0" />
          <stop offset="100%" stopColor="#EA4335" />
        </linearGradient>
      </defs>
      <path
        d="M12 2C12 7.523 7.523 12 2 12C7.523 12 12 16.477 12 22C12 16.477 16.477 12 22 12C16.477 12 12 7.523 12 2Z"
        fill={`url(#geminiIconGrad-${gradId})`}
      />
    </svg>
  );
}

/**
 * Official Perplexity AI Icon
 */
export function PerplexityIcon({ className = 'w-4 h-4 shrink-0', size = 16 }: IconProps) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      style={{ color: '#20B2AA' }}
      aria-label="Perplexity AI"
      role="img"
    >
      <path d="M12.983 2.012v4.83h5.92V2.012h-5.92zm-1.966 0H5.097v4.83h5.92V2.012zm1.966 6.54v6.896l4.238 3.864 1.682-1.533V8.552h-5.92zm-1.966 0H5.097v8.785l1.682 1.533 4.238-3.864V8.552zm1.966 8.598v4.838h5.92V17.15h-5.92zm-1.966 0H5.097v4.838h5.92V17.15z" />
    </svg>
  );
}

/**
 * Official Microsoft Bing Icon
 */
export function BingIcon({ className = 'w-4 h-4 shrink-0', size = 16 }: IconProps) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Microsoft Bing"
      role="img"
    >
      <path
        d="M5.5 2L5 6.3V19.8L10 22.7L18.5 17.8V12.7L14.7 10.9L10 13.5V5.2L5.5 2Z"
        fill="#008373"
      />
      <path
        d="M5.5 2L10 5.2V13.5L14.7 10.9L18.5 12.7L14.5 7.6L10 5.2V2.5L5.5 2Z"
        fill="#00A4EF"
      />
      <path
        d="M10 13.5L14.7 10.9L18.5 12.7V17.8L10 22.7V13.5Z"
        fill="#0F6CBD"
      />
    </svg>
  );
}

/**
 * Official Yahoo Icon
 */
export function YahooIcon({ className = 'w-4 h-4 shrink-0', size = 16 }: IconProps) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Yahoo"
      role="img"
    >
      <rect width="24" height="24" rx="5" fill="#6001D2" />
      <path
        d="M6.5 6L10.3 13.2V18H12.7V13.2L16.5 6H14L11.5 11.2L9 6H6.5ZM17.2 14.5C16.5 14.5 16 15 16 15.7C16 16.4 16.5 16.9 17.2 16.9C17.9 16.9 18.4 16.4 18.4 15.7C18.4 15 17.9 14.5 17.2 14.5Z"
        fill="white"
      />
    </svg>
  );
}

/**
 * Official Yandex Icon
 */
export function YandexIcon({ className = 'w-4 h-4 shrink-0', size = 16 }: IconProps) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Yandex"
      role="img"
    >
      <circle cx="12" cy="12" r="11" fill="#FC3F1D" />
      <path
        d="M13.8 6H12.1C10.2 6 9 7.1 9 8.7C9 10.1 9.7 11 10.9 11.9L9 18H11.2L12.9 12.6H13.8V18H16V6H13.8ZM13.8 10.8H12.3C11.5 10.8 11 10.3 11 9.6C11 8.9 11.5 8 12.3 8H13.8V10.8Z"
        fill="white"
      />
    </svg>
  );
}

/**
 * Official DuckDuckGo Icon
 */
export function DuckDuckGoIcon({ className = 'w-4 h-4 shrink-0', size = 16 }: IconProps) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="DuckDuckGo"
      role="img"
    >
      <circle cx="12" cy="12" r="11" fill="#DE5833" />
      <ellipse cx="12" cy="12.5" rx="5" ry="5.5" fill="#FFFFFF" />
      <path d="M12 9C10.5 9 9.5 10.2 9.5 11.8C9.5 13.8 11 15 12 15C13 15 14.5 13.8 14.5 11.8C14.5 10.2 13.5 9 12 9Z" fill="#FFFFFF" />
      <path d="M12.5 12.5L16 13C16 13 15.5 14.2 13.8 14.2L12.5 12.5Z" fill="#F4900C" />
      <circle cx="11.5" cy="11.5" r="1" fill="#31373D" />
      <path d="M10 16L12 17.5L14 16L12 16.5L10 16Z" fill="#5F9836" />
    </svg>
  );
}

/**
 * Official YouTube Icon
 */
export function YouTubeIcon({ className = 'w-4 h-4 shrink-0', size = 16 }: IconProps) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="YouTube"
      role="img"
    >
      <path
        d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814z"
        fill="#FF0000"
      />
      <polygon points="9.545,15.568 15.795,12 9.545,8.432" fill="#FFFFFF" />
    </svg>
  );
}

/**
 * Helper component that renders the real authentic icon based on engine name/id
 */
export function SearchEngineIcon({
  engine,
  size = 16,
  className = '',
}: {
  engine: string;
  size?: number;
  className?: string;
}) {
  const norm = (engine || '').toLowerCase().trim();
  if (norm === 'google' || (norm.includes('google') && !norm.includes('overview') && !norm.includes('mode'))) {
    return <GoogleIcon size={size} className={className} />;
  }
  if (norm.includes('overview') || norm === 'ai-overviews' || norm === 'ai overviews') {
    return <AiOverviewsIcon size={size} className={className} />;
  }
  if (norm.includes('mode') || norm === 'ai-mode' || norm === 'ai mode') {
    return <AiModeIcon size={size} className={className} />;
  }
  if (norm.includes('chatgpt') || norm.includes('gpt') || norm.includes('openai')) {
    return <ChatGptIcon size={size} className={className} />;
  }
  if (norm.includes('gemini')) {
    return <GeminiIcon size={size} className={className} />;
  }
  if (norm.includes('perplexity')) {
    return <PerplexityIcon size={size} className={className} />;
  }
  if (norm.includes('bing') || norm.includes('copilot')) {
    return <BingIcon size={size} className={className} />;
  }
  if (norm.includes('yahoo')) {
    return <YahooIcon size={size} className={className} />;
  }
  if (norm.includes('yandex')) {
    return <YandexIcon size={size} className={className} />;
  }
  if (norm.includes('duckduckgo')) {
    return <DuckDuckGoIcon size={size} className={className} />;
  }
  if (norm.includes('youtube')) {
    return <YouTubeIcon size={size} className={className} />;
  }
  return <GoogleIcon size={size} className={className} />;
}
