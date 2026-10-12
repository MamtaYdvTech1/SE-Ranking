'use client';

import React, { useEffect, useState } from 'react';
import ApiDashboardPage from '@/app/api-docs/page';
import ApiWalletPage from '@/app/api-docs/wallet/page';
import ApiMcpPage from '@/app/api-docs/mcp/page';

export default function AdminApiHtmlPage() {
  const [tab, setTab] = useState<'dashboard' | 'mcp' | 'wallet'>('dashboard');

  useEffect(() => {
    const readLocation = () => {
      const hash = window.location.hash || '';
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('tab') || '';
      if (hash.includes('/mcp') || tabParam === 'mcp') {
        setTab('mcp');
      } else if (hash.includes('/wallet') || tabParam === 'wallet') {
        setTab('wallet');
      } else {
        setTab('dashboard');
      }
    };

    readLocation();
    window.addEventListener('hashchange', readLocation);
    window.addEventListener('popstate', readLocation);
    return () => {
      window.removeEventListener('hashchange', readLocation);
      window.removeEventListener('popstate', readLocation);
    };
  }, []);

  if (tab === 'mcp') return <ApiMcpPage />;
  if (tab === 'wallet') return <ApiWalletPage />;
  return <ApiDashboardPage />;
}
