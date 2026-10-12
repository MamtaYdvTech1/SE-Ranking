'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { AlertCircle, Loader2, ShieldCheck, RefreshCw } from 'lucide-react';

export type RecaptchaStatus = 'loading' | 'ready' | 'verified' | 'expired' | 'error';

interface GoogleRecaptchaProps {
  onVerify: (token: string) => void;
  onError?: (err: string) => void;
  onExpire?: () => void;
  className?: string;
  id?: string;
  theme?: 'light' | 'dark';
}

declare global {
  interface Window {
    grecaptcha?: {
      render: (
        container: HTMLElement | string,
        parameters: {
          sitekey: string;
          theme?: 'light' | 'dark';
          size?: 'normal' | 'compact';
          tabindex?: number;
          callback?: (response: string) => void;
          'expired-callback'?: () => void;
          'error-callback'?: () => void;
        }
      ) => number;
      reset: (widgetId?: number) => void;
      getResponse: (widgetId?: number) => string;
      ready: (callback: () => void) => void;
    };
    onRecaptchaApiLoaded?: () => void;
  }
}

export function GoogleRecaptcha({
  onVerify,
  onError,
  onExpire,
  className = '',
  id = 'google-recaptcha-widget',
  theme = 'light',
}: GoogleRecaptchaProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<number | null>(null);
  const isRenderedRef = useRef(false);

  const [status, setStatus] = useState<RecaptchaStatus>('loading');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const siteKey =
    process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY ||
    process.env.RECAPTCHA_SITE_KEY ||
    '6Le5qOstAAAAANpDAySWoDVfz-OrmwSVlQtHsF7v';

  const onVerifyRef = useRef(onVerify);
  onVerifyRef.current = onVerify;

  const onErrorRef = useRef(onError);
  onErrorRef.current = onError;

  const onExpireRef = useRef(onExpire);
  onExpireRef.current = onExpire;

  const renderWidget = useCallback(() => {
    if (!containerRef.current || !window.grecaptcha?.render) return;
    if (isRenderedRef.current) return;

    if (!siteKey || siteKey.trim().length === 0) {
      setStatus('error');
      const err = 'Google reCAPTCHA site key is missing. Authentication is restricted.';
      setErrorMessage(err);
      onErrorRef.current?.(err);
      return;
    }

    try {
      containerRef.current.innerHTML = '';
      const wId = window.grecaptcha.render(containerRef.current, {
        sitekey: siteKey.trim(),
        theme,
        callback: (token: string) => {
          setStatus('verified');
          setErrorMessage(null);
          onVerifyRef.current?.(token);
        },
        'expired-callback': () => {
          setStatus('expired');
          setErrorMessage('Verification expired. Please check the box again.');
          onExpireRef.current?.();
        },
        'error-callback': () => {
          setStatus('error');
          const err = 'reCAPTCHA network or challenge error. Please refresh and try again.';
          setErrorMessage(err);
          onErrorRef.current?.(err);
        },
      });

      widgetIdRef.current = wId;
      isRenderedRef.current = true;
      setStatus('ready');
    } catch (e: any) {
      console.error('Failed to render Google reCAPTCHA widget:', e);
      // If already rendered inside this container, ignore duplicate render warning
      if (e?.message && e.message.includes('has already been rendered')) {
        isRenderedRef.current = true;
        setStatus('ready');
      } else {
        setStatus('error');
        setErrorMessage('Failed to initialize Google reCAPTCHA widget.');
        onErrorRef.current?.('Failed to initialize Google reCAPTCHA widget.');
      }
    }
  }, [siteKey, theme]);

  useEffect(() => {
    let isMounted = true;

    // Fail closed if configuration is completely absent
    if (!siteKey || siteKey.trim().length === 0) {
      setStatus('error');
      setErrorMessage('Google reCAPTCHA configuration missing. Authentication failed closed.');
      onErrorRef.current?.('Google reCAPTCHA configuration missing.');
      return;
    }

    const scriptId = 'google-recaptcha-official-v2-script';

    const handleScriptReady = () => {
      if (!isMounted) return;
      if (window.grecaptcha?.ready) {
        window.grecaptcha.ready(() => {
          if (isMounted) renderWidget();
        });
      } else {
        renderWidget();
      }
    };

    if (window.grecaptcha?.render) {
      handleScriptReady();
    } else {
      let existingScript = document.getElementById(scriptId) as HTMLScriptElement | null;
      if (!existingScript) {
        const script = document.createElement('script');
        script.id = scriptId;
        script.src = 'https://www.google.com/recaptcha/api.js?render=explicit';
        script.async = true;
        script.defer = true;
        script.onload = () => handleScriptReady();
        script.onerror = () => {
          if (isMounted) {
            setStatus('error');
            setErrorMessage('Could not load Google reCAPTCHA verification service.');
            onErrorRef.current?.('Failed to load Google reCAPTCHA script.');
          }
        };
        document.head.appendChild(script);
      } else {
        existingScript.addEventListener('load', handleScriptReady);
        const checkInterval = setInterval(() => {
          if (window.grecaptcha?.render) {
            clearInterval(checkInterval);
            handleScriptReady();
          }
        }, 200);
        setTimeout(() => clearInterval(checkInterval), 5000);
      }
    }

    return () => {
      isMounted = false;
    };
  }, [siteKey, renderWidget]);

  const handleManualReset = useCallback(() => {
    if (widgetIdRef.current !== null && window.grecaptcha?.reset) {
      try {
        window.grecaptcha.reset(widgetIdRef.current);
        setStatus('ready');
        setErrorMessage(null);
        onExpireRef.current?.();
      } catch (e) {
        console.error('reCAPTCHA manual reset error:', e);
      }
    }
  }, []);

  return (
    <div
      id={id}
      className={`w-full flex flex-col items-center justify-center my-2 select-none min-h-[78px] ${className}`}
      data-testid="google-recaptcha-container"
    >
      {/* Loading state indicator before official widget appears */}
      {status === 'loading' && (
        <div className="w-[304px] h-[78px] bg-gray-50 border border-gray-200 rounded-md flex items-center justify-center gap-2 text-xs text-gray-500 shadow-2xs">
          <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
          <span>Loading Google reCAPTCHA...</span>
        </div>
      )}

      {/* Official Google reCAPTCHA iframe mount container */}
      <div
        ref={containerRef}
        className="w-[304px] min-h-[78px] flex items-center justify-center relative"
        data-testid="google-recaptcha-mount"
      />

      {/* Error state alert banner */}
      {status === 'error' && errorMessage && (
        <div className="mt-2 w-[304px] p-2 bg-red-50 border border-red-200 rounded-md text-[11px] text-red-700 flex items-start gap-1.5 leading-snug">
          <AlertCircle className="w-3.5 h-3.5 text-red-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span>{errorMessage}</span>
            <button
              type="button"
              onClick={handleManualReset}
              className="mt-1 flex items-center gap-1 font-semibold text-red-800 hover:underline cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Retry verification</span>
            </button>
          </div>
        </div>
      )}

      {/* Expired state alert */}
      {status === 'expired' && (
        <div className="mt-1.5 w-[304px] p-1.5 bg-amber-50 border border-amber-200 rounded text-[11px] text-amber-800 flex items-center justify-between">
          <span>Verification expired. Please re-verify.</span>
          <button
            type="button"
            onClick={handleManualReset}
            className="text-amber-900 font-bold hover:underline cursor-pointer"
          >
            Refresh
          </button>
        </div>
      )}
    </div>
  );
}
