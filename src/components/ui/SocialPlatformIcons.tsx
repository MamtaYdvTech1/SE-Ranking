import React from 'react';

export function FacebookIcon({ className = 'w-4 h-4 shrink-0' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <rect width="24" height="24" rx="5" fill="#1877F2" />
      <path
        d="M15.5 13.5l.5-3.5h-3.5V7.8c0-1 .5-1.5 1.5-1.5h2V3.2c-.4-.1-1.4-.2-2.6-.2-2.7 0-4.4 1.6-4.4 4.5v2.5H6v3.5h3v8.5h3.5v-8.5h3z"
        fill="#ffffff"
      />
    </svg>
  );
}

export function InstagramIcon({ className = 'w-4 h-4 shrink-0' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <defs>
        <radialGradient id="ig-grad-sidebar" r="150%" cx="30%" cy="107%">
          <stop stopColor="#fdf497" offset="0%" />
          <stop stopColor="#fdf497" offset="5%" />
          <stop stopColor="#fd5949" offset="45%" />
          <stop stopColor="#d6249f" offset="60%" />
          <stop stopColor="#285AEB" offset="90%" />
        </radialGradient>
      </defs>
      <rect width="24" height="24" rx="5.5" fill="url(#ig-grad-sidebar)" />
      <path
        fill="#ffffff"
        d="M12 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"
      />
      <path
        fill="#ffffff"
        fillRule="evenodd"
        d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689-.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073z"
      />
    </svg>
  );
}

export function LinkedInIcon({ className = 'w-4 h-4 shrink-0' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <rect width="24" height="24" rx="5" fill="#0A66C2" />
      <path
        fill="#ffffff"
        d="M7.12 19H4.44V10.4h2.68V19zM5.78 9.22a1.55 1.55 0 1 1 0-3.1 1.55 1.55 0 0 1 0 3.1zM19.56 19h-2.68v-4.18c0-1-.02-2.28-1.39-2.28-1.39 0-1.6 1.09-1.6 2.21V19h-2.68V10.4h2.57v1.17h.04c.36-.68 1.23-1.4 2.54-1.4 2.72 0 3.22 1.79 3.22 4.12V19z"
      />
    </svg>
  );
}

export function YouTubeIcon({ className = 'w-4 h-4 shrink-0' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <rect width="24" height="24" rx="5" fill="#FF0000" />
      <path fill="#ffffff" d="M10 15.5v-7l6 3.5-6 3.5z" />
    </svg>
  );
}

export function XTwitterIcon({ className = 'w-4 h-4 shrink-0' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <rect width="24" height="24" rx="5" fill="#000000" />
      <path
        fill="#ffffff"
        d="M17.2 4.5h2.15l-4.7 5.37 5.53 7.63h-4.33l-3.39-4.44-3.88 4.44H6.33l5.03-5.75L6 4.5h4.44l3.07 4.05L17.2 4.5zm-.75 11.7h1.19L8.85 5.75H7.58l8.87 10.45z"
      />
    </svg>
  );
}

export function TikTokIcon({ className = 'w-4 h-4 shrink-0' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <rect width="24" height="24" rx="5" fill="#000000" />
      <path
        fill="#ffffff"
        d="M17.5 7.2a4.3 4.3 0 0 1-3.2-3.7V3h-2.8v11.8a2.5 2.5 0 0 1-4.4 1.5 2.5 2.5 0 0 1 2-4c.25 0 .5.03.74.1V9.6a5.5 5.5 0 0 0-.74-.05 5.4 5.4 0 0 0-5.4 5.4 5.4 5.4 0 0 0 9.2 3.8 5.3 5.3 0 0 0 1.6-3.8V8.8a7 7 0 0 0 4.1 1.3V7.3c-.4 0-.85-.05-1.1-.1z"
      />
    </svg>
  );
}

export function PinterestIcon({ className = 'w-4 h-4 shrink-0' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <rect width="24" height="24" rx="5" fill="#E60023" />
      <path
        fill="#ffffff"
        d="M12 4.2c-4.31 0-7.8 3.49-7.8 7.8 0 3.31 2.05 6.13 4.96 7.23-.07-.61-.13-1.54.03-2.21l1-4.22s-.25-.51-.25-1.26c0-1.18.68-2.06 1.54-2.06.72 0 1.07.54 1.07 1.2 0 .73-.46 1.82-.71 2.83-.2.85.42 1.54 1.26 1.54 1.51 0 2.68-1.59 2.68-3.89 0-2.03-1.46-3.46-3.55-3.46-2.42 0-3.84 1.81-3.84 3.68 0 .73.28 1.51.63 1.94.07.09.08.16.06.25l-.23.97c-.04.15-.13.18-.3.1-1.12-.52-1.82-2.15-1.82-3.46 0-2.82 2.05-5.41 5.91-5.41 3.1 0 5.52 2.21 5.52 5.17 0 3.09-1.94 5.57-4.64 5.57-.91 0-1.76-.47-2.05-1.03l-.56 2.13c-.2.78-.75 1.76-1.12 2.36.83.25 1.7.39 2.6.39 4.31 0 7.8-3.49 7.8-7.8 0-4.31-3.49-7.8-7.8-7.8z"
      />
    </svg>
  );
}

export function ThreadsIcon({ className = 'w-4 h-4 shrink-0' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 192 192" fill="none">
      <rect width="192" height="192" rx="40" fill="#000000" />
      <path
        fill="#ffffff"
        d="M141.537 88.9883C140.71 88.5919 139.87 88.2109 139.019 87.8456C137.537 60.5382 122.616 44.905 97.4619 44.905C82.6074 44.905 69.8336 51.5977 61.4704 63.705C54.4093 73.9168 51.0478 87.4116 52.0163 101.768C53.7915 128.085 70.3601 147.095 93.9922 147.095C108.318 147.095 120.312 140.751 127.818 129.215L113.821 119.866C108.775 127.625 100.957 131.785 93.9922 131.785C79.8824 131.785 68.8049 118.847 67.433 99.4678C70.6276 100.916 74.0772 102.043 77.7479 102.812C81.9366 103.687 86.3015 104.128 90.7601 104.128C103.11 104.128 113.627 99.7891 120.312 91.9566C126.046 85.2415 128.988 76.2736 128.988 66.0267C128.988 65.6599 128.988 65.2929 128.974 64.9261C133.567 71.4552 135.989 79.7942 135.989 89.9197C135.989 90.8711 135.93 91.808 135.828 92.7303C137.697 91.4363 139.605 90.1718 141.537 88.9883ZM97.4619 60.215C110.158 60.215 116.657 69.8643 116.657 88.8996C112.569 94.6644 105.109 97.808 96.0827 97.808C86.7214 97.808 80.5284 92.5135 80.5284 84.1748C80.5284 70.3601 88.5833 60.215 97.4619 60.215Z"
      />
    </svg>
  );
}

export function GoogleBusinessIcon({ className = 'w-4 h-4 shrink-0' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none">
      <rect width="24" height="24" rx="5" fill="#ffffff" />
      <path
        fill="#4285F4"
        d="M21.5 12.2c0-.6-.05-1.2-.16-1.8H12v3.6h5.3c-.23 1.2-.91 2.3-1.92 2.9v2.4h3.1c1.82-1.7 2.87-4.1 2.87-7.1z"
      />
      <path
        fill="#34A853"
        d="M12 21.8c2.6 0 4.8-.9 6.4-2.4l-3.1-2.4c-.9.6-2 .9-3.3.9-2.5 0-4.6-1.7-5.4-4H3.4v2.5C5 19.6 8.3 21.8 12 21.8z"
      />
      <path
        fill="#FBBC05"
        d="M6.6 13.9c-.2-.6-.3-1.2-.3-1.9s.1-1.3.3-1.9V7.6H3.4C2.8 8.9 2.4 10.4 2.4 12s.4 3.1 1 4.4l3.2-2.5z"
      />
      <path
        fill="#EA4335"
        d="M12 5.8c1.4 0 2.7.5 3.7 1.4l2.8-2.8C16.8 2.8 14.6 2 12 2 8.3 2 5 4.2 3.4 7.4l3.2 2.5c.8-2.3 2.9-4.1 5.4-4.1z"
      />
    </svg>
  );
}

export function getSocialPlatformIcon(name: string, className = 'w-4 h-4 shrink-0') {
  const lower = name.toLowerCase();
  if (lower.includes('facebook')) return <FacebookIcon className={className} />;
  if (lower.includes('instagram')) return <InstagramIcon className={className} />;
  if (lower.includes('linkedin')) return <LinkedInIcon className={className} />;
  if (lower.includes('youtube')) return <YouTubeIcon className={className} />;
  if (lower.includes('twitter') || lower.includes('x (')) return <XTwitterIcon className={className} />;
  if (lower.includes('tiktok')) return <TikTokIcon className={className} />;
  if (lower.includes('pinterest')) return <PinterestIcon className={className} />;
  if (lower.includes('threads')) return <ThreadsIcon className={className} />;
  if (lower.includes('google') || lower.includes('gmb') || lower.includes('business')) {
    return <GoogleBusinessIcon className={className} />;
  }
  return <div className={`rounded-sm bg-blue-500 ${className}`} />;
}
