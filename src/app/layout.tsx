import type { Metadata } from 'next';
import './globals.css';
import { AppProviders } from '@/components/providers/AppProviders';
import { AppShell } from '@/components/layout/AppShell';
import { AuthProvider } from '@/context/AuthContext';
import { ThemeProvider } from '@/context/ThemeContext';

export const metadata: Metadata = {
  title: 'SE Ranking Research Studio | AI Search & Competitive Research',
  description:
    'Monitor domain citations and brand mentions in AI answers, and identify their sources with SE Ranking AI Search Studio.',
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons" />
      </head>
      <body suppressHydrationWarning className="antialiased bg-[#F4F6F9] dark:bg-slate-950 text-gray-900 dark:text-slate-100 min-h-screen font-sans transition-colors duration-150">
        <ThemeProvider>
          <AuthProvider>
            <AppProviders>
              <AppShell>{children}</AppShell>
            </AppProviders>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
