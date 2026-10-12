'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ShieldAlert, Loader2, RefreshCw } from 'lucide-react';

export type RecaptchaStatus = 'loading' | 'ready' | 'verified' | 'expired' | 'error';

interface GoogleRecaptchaProps {
  onVerify: (token: string) => void;
  onError?: (err: string) => void;
  onExpire?: () => void;
  className?: string;
  id?: string;
}

declare global {
  interface Window {
    grecaptcha?: {
      render: (
        container: HTMLElement | string,
        options: {
          sitekey: string;
          callback: (token: string) => void;
          'error-callback'?: () => void;
          'expired-callback'?: () => void;
          theme?: 'light' | 'dark';
          size?: 'normal' | 'compact';
        }
      ) => number;
      reset: (widgetId?: number) => void;
      ready: (callback: () => void) => void;
    };
    __onGoogleRecaptchaLoad?: () => void;
  }
}

const DEFAULT_RECAPTCHA_SITE_KEY = '6LeM0ugtAAAAAI2KNBe5VmDfNzN2xbKwJPcnUqAS';

export function GoogleRecaptcha({
  onVerify,
  onError,
  onExpire,
  className = '',
  id = 'google-recaptcha-container',
}: GoogleRecaptchaProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<number | null>(null);

  const [status, setStatus] = useState<RecaptchaStatus>('loading');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const siteKey =
    process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || DEFAULT_RECAPTCHA_SITE_KEY;

  const onVerifyRef = useRef(onVerify);
  onVerifyRef.current = onVerify;

  const onErrorRef = useRef(onError);
  onErrorRef.current = onError;

  const onExpireRef = useRef(onExpire);
  onExpireRef.current = onExpire;

  const renderWidget = useCallback(() => {
    if (!mountRef.current) return;
    if (widgetIdRef.current !== null) return; // Already rendered

    if (!window.grecaptcha || typeof window.grecaptcha.render !== 'function') {
      return;
    }

    // If the mount element already contains grecaptcha elements, avoid re-rendering
    if (mountRef.current.childElementCount > 0) {
      setStatus('ready');
      return;
    }

    try {
      const widgetId = window.grecaptcha.render(mountRef.current, {
        sitekey: siteKey,
        theme: 'light',
        size: 'normal',
        callback: (token: string) => {
          setStatus('verified');
          setErrorMessage(null);
          onVerifyRef.current?.(token);
        },
        'error-callback': () => {
          const err =
            'Google reCAPTCHA verification error. If running locally, please ensure 127.0.0.1 or localhost is added to your Google reCAPTCHA admin console.';
          setStatus('error');
          setErrorMessage(err);
          onErrorRef.current?.(err);
        },
        'expired-callback': () => {
          setStatus('expired');
          onExpireRef.current?.();
        },
      });

      widgetIdRef.current = widgetId;
      setStatus('ready');
      setErrorMessage(null);
    } catch (err: any) {
      if (err?.message?.includes?.('already been rendered')) {
        setStatus('ready');
        return;
      }
      console.warn('[reCAPTCHA render notice]:', err);
      setStatus('error');
      setErrorMessage(err?.message || 'Failed to render Google reCAPTCHA widget.');
      onErrorRef.current?.(err?.message || 'Render failed');
    }
  }, [siteKey]);

  useEffect(() => {
    let isMounted = true;
    let fallbackTimeout: NodeJS.Timeout;

    if (!siteKey) {
      setStatus('error');
      setErrorMessage('Google reCAPTCHA site key is not configured.');
      onErrorRef.current?.('Missing site key');
      return;
    }

    // Define the global callback expected by Google reCAPTCHA api.js
    window.__onGoogleRecaptchaLoad = () => {
      if (isMounted) {
        renderWidget();
      }
    };

    if (window.grecaptcha && typeof window.grecaptcha.render === 'function') {
      // Script is already loaded and ready
      window.grecaptcha.ready(() => {
        if (isMounted) renderWidget();
      });
    } else {
      // Official Google script tag loader
      const scriptId = 'google-recaptcha-v2-api-script';
      let script = document.getElementById(scriptId) as HTMLScriptElement | null;

      if (!script) {
        script = document.createElement('script');
        script.id = scriptId;
        script.src = 'https://www.google.com/recaptcha/api.js?onload=__onGoogleRecaptchaLoad&render=explicit';
        script.async = true;
        script.defer = true;
        script.onerror = () => {
          if (isMounted) {
            setStatus('error');
            setErrorMessage(
              'Could not load Google reCAPTCHA script. Please check your network connection or ad blocker.'
            );
            onErrorRef.current?.('Script load error');
          }
        };
        document.head.appendChild(script);
      } else {
        // Script tag already injected
        if (window.grecaptcha && typeof window.grecaptcha.ready === 'function') {
          window.grecaptcha.ready(() => {
            if (isMounted) renderWidget();
          });
        }
      }

      // Safety timeout: if Google script doesn't initialize within 6 seconds
      fallbackTimeout = setTimeout(() => {
        if (isMounted && widgetIdRef.current === null) {
          if (window.grecaptcha && typeof window.grecaptcha.render === 'function') {
            renderWidget();
          } else {
            setStatus('error');
            setErrorMessage(
              'Google reCAPTCHA initialization timed out. Please check your network connection.'
            );
          }
        }
      }, 6000);
    }

    return () => {
      isMounted = false;
      clearTimeout(fallbackTimeout);
    };
  }, [siteKey, renderWidget]);

  const handleRetry = () => {
    setErrorMessage(null);
    if (widgetIdRef.current !== null && window.grecaptcha?.reset) {
      try {
        window.grecaptcha.reset(widgetIdRef.current);
        setStatus('ready');
        return;
      } catch {
        // Fallback to reload
      }
    }
    setStatus('loading');
    widgetIdRef.current = null;
    if (mountRef.current) {
      mountRef.current.innerHTML = '';
    }
    if (window.grecaptcha && typeof window.grecaptcha.render === 'function') {
      renderWidget();
    }
  };

  return (
    <div className={`w-full flex flex-col items-center justify-center my-1.5 ${className}`}>
      {/* Loading state indicator */}
      {status === 'loading' && (
        <div className="flex items-center justify-center gap-2 text-xs text-gray-500 py-3 min-h-[74px] w-full">
          <Loader2 className="w-4 h-4 animate-spin text-[#7C3AED]" />
          <span>Connecting Google reCAPTCHA...</span>
        </div>
      )}

      {/* Error state notice */}
      {status === 'error' && (
        <div className="w-full max-w-[320px] p-2 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center justify-between my-1">
          <span className="truncate">{errorMessage || 'Google reCAPTCHA connection issue.'}</span>
          <button
            type="button"
            onClick={handleRetry}
            className="text-[#7C3AED] hover:underline font-semibold flex items-center gap-1 cursor-pointer ml-2 shrink-0"
          >
            <RefreshCw className="w-3 h-3" />
            Retry
          </button>
        </div>
      )}

      {/* Expired state notice */}
      {status === 'expired' && (
        <p className="text-[11px] text-amber-700 font-medium text-center my-1">
          Verification expired. Please check the reCAPTCHA box again.
        </p>
      )}

      {/* Dedicated clean DOM container for Google reCAPTCHA genuine widget */}
      <div
        id={id}
        ref={mountRef}
        className={`flex justify-center items-center min-h-[74px] max-w-full overflow-hidden ${status === 'error' ? 'hidden' : 'block'}`}
      />
    </div>
  );
}
