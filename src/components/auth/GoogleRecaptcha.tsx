'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ShieldCheck, Loader2, RefreshCw, Sparkles, X } from 'lucide-react';
import { BusBicycleImageSelector, VehicleCategoryTarget } from '@/components/verification/BusBicycleImageSelector';

export type RecaptchaStatus = 'loading' | 'ready' | 'verified' | 'expired' | 'error';

interface GoogleRecaptchaProps {
  onVerify: (token: string, provider?: 'google_recaptcha' | 'visual_challenge') => void;
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
  const [verifiedProvider, setVerifiedProvider] = useState<'google_recaptcha' | 'visual_challenge' | null>(null);
  const [isVisualModalOpen, setIsVisualModalOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<VehicleCategoryTarget>('bicycle');

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
    if (widgetIdRef.current !== null) return;

    if (!window.grecaptcha || typeof window.grecaptcha.render !== 'function') {
      return;
    }

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
          setVerifiedProvider('google_recaptcha');
          setErrorMessage(null);
          onVerifyRef.current?.(token, 'google_recaptcha');
        },
        'error-callback': () => {
          const err = 'Google reCAPTCHA verification issue. You can verify using the Visual Challenge below.';
          setStatus('error');
          setErrorMessage(err);
          onErrorRef.current?.(err);
        },
        'expired-callback': () => {
          setStatus('expired');
          setVerifiedProvider(null);
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

    window.__onGoogleRecaptchaLoad = () => {
      if (isMounted) {
        renderWidget();
      }
    };

    if (window.grecaptcha && typeof window.grecaptcha.render === 'function') {
      window.grecaptcha.ready(() => {
        if (isMounted) renderWidget();
      });
    } else {
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
              'Could not connect to Google reCAPTCHA. Please use the visual verification challenge below.'
            );
            onErrorRef.current?.('Script load error');
          }
        };
        document.head.appendChild(script);
      } else {
        if (window.grecaptcha && typeof window.grecaptcha.ready === 'function') {
          window.grecaptcha.ready(() => {
            if (isMounted) renderWidget();
          });
        }
      }

      fallbackTimeout = setTimeout(() => {
        if (isMounted && widgetIdRef.current === null) {
          if (window.grecaptcha && typeof window.grecaptcha.render === 'function') {
            renderWidget();
          } else {
            setStatus('error');
            setErrorMessage(
              'Google reCAPTCHA connection timed out. You can verify using the visual image challenge.'
            );
          }
        }
      }, 5000);
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
        // Fallback
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

  const handleVisualChallengeComplete = (selectedIds: string[], isCorrect: boolean, token?: string) => {
    if (isCorrect && token) {
      setStatus('verified');
      setVerifiedProvider('visual_challenge');
      setErrorMessage(null);
      setIsVisualModalOpen(false);
      onVerifyRef.current?.(token, 'visual_challenge');
    }
  };

  return (
    <div className={`w-full flex flex-col items-center justify-center my-1.5 ${className}`}>
      {/* Verified State Banner */}
      {status === 'verified' ? (
        <div className="w-full max-w-[320px] p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between shadow-2xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-semibold">
              {verifiedProvider === 'visual_challenge'
                ? 'Human verified via Visual Vehicle Challenge'
                : 'Google reCAPTCHA verification passed'}
            </span>
          </div>
          <button
            type="button"
            onClick={() => {
              setStatus('ready');
              setVerifiedProvider(null);
              onExpireRef.current?.();
            }}
            className="text-xs text-emerald-700 hover:text-emerald-900 underline ml-2 cursor-pointer shrink-0"
          >
            Reset
          </button>
        </div>
      ) : (
        <>
          {/* Loading state indicator */}
          {status === 'loading' && (
            <div className="flex items-center justify-center gap-2 text-xs text-gray-500 py-3 min-h-[74px] w-full">
              <Loader2 className="w-4 h-4 animate-spin text-[#7C3AED]" />
              <span>Connecting Google reCAPTCHA...</span>
            </div>
          )}

          {/* Error notice */}
          {status === 'error' && (
            <div className="w-full max-w-[340px] p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs flex flex-col gap-1.5 my-1">
              <div className="flex items-center justify-between">
                <span className="font-medium text-[11px]">{errorMessage || 'Google reCAPTCHA connection issue.'}</span>
                <button
                  type="button"
                  onClick={handleRetry}
                  className="text-[#7C3AED] hover:underline font-semibold flex items-center gap-1 cursor-pointer shrink-0 text-[11px]"
                >
                  <RefreshCw className="w-3 h-3" />
                  Retry
                </button>
              </div>
            </div>
          )}

          {/* Expired state notice */}
          {status === 'expired' && (
            <p className="text-[11px] text-amber-700 font-medium text-center my-1">
              Verification expired. Please check the reCAPTCHA box again.
            </p>
          )}

          {/* Dedicated clean DOM container for Google reCAPTCHA widget */}
          <div
            id={id}
            ref={mountRef}
            className={`flex justify-center items-center min-h-[74px] max-w-full overflow-hidden ${status === 'error' ? 'hidden' : 'block'}`}
          />

          {/* Alternative Visual Vehicle Challenge Toggle (Cycles, Bikes, Cars, Buses) */}
          <div className="pt-2 flex items-center justify-center">
            <button
              type="button"
              onClick={() => setIsVisualModalOpen(true)}
              className="inline-flex items-center gap-1.5 text-xs text-[#7C3AED] hover:text-[#6D28D9] font-medium hover:underline cursor-pointer bg-purple-50/70 hover:bg-purple-50 px-3 py-1.5 rounded-lg border border-purple-100 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#7C3AED]" />
              <span>Or verify with Visual Vehicle Challenge (Cycles, Bikes, Cars, Buses)</span>
            </button>
          </div>
        </>
      )}

      {/* Visual Vehicle Challenge Modal */}
      {isVisualModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
          <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl p-5 border border-purple-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#7C3AED]" />
                <h3 className="text-sm font-bold text-gray-900">
                  Visual Verification Challenge
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsVisualModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 cursor-pointer"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Category selection tabs */}
            <div className="flex items-center gap-1.5 py-3 overflow-x-auto">
              {(
                [
                  { key: 'bicycle', label: 'Cycles / Bicycles' },
                  { key: 'bike', label: 'Bikes / Motorcycles' },
                  { key: 'car', label: 'Cars' },
                  { key: 'bus', label: 'Buses' },
                ] as const
              ).map((cat) => (
                <button
                  key={cat.key}
                  type="button"
                  onClick={() => setActiveCategory(cat.key)}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg transition-colors cursor-pointer shrink-0 ${
                    activeCategory === cat.key
                      ? 'bg-[#7C3AED] text-white shadow-2xs'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            <BusBicycleImageSelector
              key={activeCategory}
              targetCategory={activeCategory}
              onSelectionChange={handleVisualChallengeComplete}
            />
          </div>
        </div>
      )}
    </div>
  );
}
