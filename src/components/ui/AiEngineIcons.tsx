import React from 'react';

interface IconProps {
  className?: string;
  size?: number;
}

export function ChatGptIcon({ className = '', size = 18 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={`text-[#10A37F] ${className}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 1.1683a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4947zm-9.66-4.7254a4.4708 4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1402-2.2464zm-1.093-9.5298a4.4755 4.4755 0 0 1 2.3367-1.968l-.0047.161v5.5163a.7854.7854 0 0 0 .3927.6813l5.8428 3.3685-2.02 1.1683a.0757.0757 0 0 1-.0615 0L3.906 15.0478a4.5087 4.5087 0 0 1-2.4-5.8741zm15.4253 2.2133-5.8428-3.3685 2.02-1.1683a.0757.0757 0 0 1 .0615 0l4.8398 2.7913a4.4945 4.4945 0 0 1-.6767 8.105v-5.6772a.79.79 0 0 0-.4018-.6823zm2.7303-3.6669l-.142-.0852-4.7783-2.7582a.7759.7759 0 0 0-.7854 0L8.854 8.7997V6.4673a.0662.0662 0 0 1 .0331-.0615l4.8493-2.7913a4.504 4.504 0 0 1 6.6706 4.3013zm-10.875 4.7206l-2.6074-1.5056 2.6074-1.5056 2.6074 1.5056-2.6074 1.5056z" />
    </svg>
  );
}

export function GeminiIcon({ className = '', size = 18 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="geminiGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1BA1E3" />
          <stop offset="50%" stopColor="#5B7FFF" />
          <stop offset="100%" stopColor="#9B51E0" />
        </linearGradient>
      </defs>
      <path
        d="M12 0C12 6.627 6.627 12 0 12C6.627 12 12 17.373 12 24C12 17.373 17.373 12 24 12C17.373 12 12 6.627 12 0Z"
        fill="url(#geminiGrad)"
      />
    </svg>
  );
}

export function PerplexityIcon({ className = '', size = 18 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={`text-[#20808D] ${className}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M12 2.5a.75.75 0 0 1 .75.75V8h4.5a.75.75 0 0 1 .53 1.28L14.28 12.8l4.47 4.47a.75.75 0 0 1-.53 1.28H12.75v4.7a.75.75 0 0 1-1.5 0v-4.7H6.75a.75.75 0 0 1-.53-1.28l4.47-4.47-3.5-3.52A.75.75 0 0 1 7.72 8h3.53V3.25A.75.75 0 0 1 12 2.5zm0 7.81L9.62 12 12 14.38 14.38 12 12 10.31z" />
    </svg>
  );
}

export function ClaudeIcon({ className = '', size = 18 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={`text-[#D97757] ${className}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M13.727 3.5a1.2 1.2 0 0 0-2.348 0L9.957 9.877 3.58 11.299a1.2 1.2 0 0 0 0 2.348l6.377 1.422 1.422 6.377a1.2 1.2 0 0 0 2.348 0l1.422-6.377 6.377-1.422a1.2 1.2 0 0 0 0-2.348l-6.377-1.422L13.727 3.5z" />
    </svg>
  );
}

export function GoogleAiOverviewIcon({ className = '', size = 18 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Google AI Overviews"
    >
      <defs>
        <linearGradient id="aioGradIcon" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1A73E8" />
          <stop offset="40%" stopColor="#4285F4" />
          <stop offset="80%" stopColor="#7C3AED" />
          <stop offset="100%" stopColor="#9333EA" />
        </linearGradient>
      </defs>
      <path
        d="M10.5 1.5C10.5 6.47 6.47 10.5 1.5 10.5C6.47 10.5 10.5 14.53 10.5 19.5C10.5 14.53 14.53 10.5 19.5 10.5C14.53 10.5 10.5 6.47 10.5 1.5Z"
        fill="url(#aioGradIcon)"
      />
      <path
        d="M18.5 14.5C18.5 16.71 16.71 18.5 14.5 18.5C16.71 18.5 18.5 20.29 18.5 22.5C18.5 20.29 20.29 18.5 22.5 18.5C20.29 18.5 18.5 16.71 18.5 14.5Z"
        fill="#3B82F6"
      />
    </svg>
  );
}

export function AiModeIcon({ className = '', size = 18 }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Google AI Mode"
    >
      <defs>
        <linearGradient id="aiModeGradIcon" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1BA1E3" />
          <stop offset="35%" stopColor="#5474FF" />
          <stop offset="70%" stopColor="#9B51E0" />
          <stop offset="100%" stopColor="#EA4335" />
        </linearGradient>
      </defs>
      <path
        d="M12 0C12 6.627 6.627 12 0 12C6.627 12 12 17.373 12 24C12 17.373 17.373 12 24 12C17.373 12 12 6.627 12 0Z"
        fill="url(#aiModeGradIcon)"
      />
    </svg>
  );
}
