'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    // 1. Call server logout endpoint to invalidate DB session
    fetch('/api/auth/logout', { method: 'POST' }).catch(() => null);

    // 2. Clear all auth cookies
    if (typeof document !== 'undefined') {
      const cookiesToClear = [
        'seranking_session',
        'seranking_auth_status',
        'user_email',
        'user_name',
        'user_domain',
        'seranking_user',
        'se_auth_token',
        'auth_token',
        'token',
      ];
      for (const name of cookiesToClear) {
        document.cookie = `${name}=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT;`;
      }
    }

    // 3. Clear all auth storage
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('token');
      localStorage.removeItem('seranking_auth_status');
      sessionStorage.removeItem('seranking_auth_status');
      localStorage.removeItem('seranking_user');
      localStorage.removeItem('user_email');
      localStorage.removeItem('user_name');
      localStorage.removeItem('user_domain');
      localStorage.removeItem('se_ranking_has_project');
      localStorage.removeItem('se_ranking_active_project_id');
      localStorage.removeItem('se_ranking_paused_projects');
      localStorage.removeItem('se_ranking_starred_projects');
      localStorage.removeItem('se_ranking_project_groups');
      localStorage.removeItem('seranking_tour_completed');
      window.dispatchEvent(new CustomEvent('seranking_auth_change'));
    }

    // 4. Redirect to home landing page (Start Free Trial & Sign In)
    const timer = setTimeout(() => {
      window.location.href = '/';
    }, 350);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col items-center justify-center p-6 text-center select-none">
      <div className="w-10 h-10 rounded-full bg-blue-50 text-[#0B69FF] flex items-center justify-center mb-4">
        <Loader2 className="w-5 h-5 animate-spin" />
      </div>
      <h2 className="text-lg font-bold text-gray-900">Signing out...</h2>
      <p className="text-xs text-gray-500 mt-1">Please wait while your session is cleared.</p>
    </div>
  );
}
