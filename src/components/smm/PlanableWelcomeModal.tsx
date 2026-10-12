'use client';

import React, { useState, useEffect } from 'react';
import { Check, Star, ArrowRight, X } from 'lucide-react';

interface PlanableWelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgrade?: () => void;
}

export function PlanableWelcomeModal({
  isOpen,
  onClose,
  onUpgrade,
}: PlanableWelcomeModalProps) {
  const [isActivatingPro, setIsActivatingPro] = useState(false);
  const [proActivated, setProActivated] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isPro = localStorage.getItem('seranking_planable_pro_active') === 'true';
      if (isPro) setProActivated(true);
    }
  }, []);

  if (!isOpen) return null;

  const handleActivatePro = () => {
    setIsActivatingPro(true);
    setTimeout(() => {
      setIsActivatingPro(false);
      setProActivated(true);
      if (typeof window !== 'undefined') {
        localStorage.setItem('seranking_planable_pro_active', 'true');
      }
      if (onUpgrade) onUpgrade();
    }, 800);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-[490px] bg-white rounded-2xl shadow-2xl p-6 sm:p-7 space-y-5 text-gray-900 font-sans border border-gray-100 animate-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1.5 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
          title="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="space-y-1 pr-6">
          <h2 className="text-xl sm:text-[22px] font-bold text-[#111827] tracking-tight">
            Welcome to Planable! 🎉
          </h2>
          <p className="text-xs text-[#6B7280]">
            Your account is ready at{' '}
            <a
              href="https://planable.io"
              target="_blank"
              rel="noreferrer"
              className="text-[#2563EB] hover:underline font-medium"
            >
              planable.io
            </a>
          </p>
        </div>

        {/* CARD 1: Planable Free Activated (Light Green) */}
        <div className="bg-[#E7F9ED] border border-[#A7E8BD] rounded-xl p-4 space-y-2.5">
          <div className="flex items-center gap-2 text-[#059669] font-bold text-xs">
            <div className="w-4 h-4 rounded-full bg-[#10B981] flex items-center justify-center text-white shrink-0">
              <Check className="w-2.5 h-2.5 stroke-[3]" />
            </div>
            <span>Planable Free activated</span>
          </div>

          <div className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-[11px] text-[#047857]">
            <div className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-[#10B981] shrink-0" />
              <span>Unlimited workspaces</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-[#10B981] shrink-0" />
              <span>Unlimited users</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-[#10B981] shrink-0" />
              <span>Up to 50 posts</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-[#10B981] shrink-0" />
              <span>Unlimited pages</span>
            </div>
          </div>
        </div>

        {/* CARD 2: Upgrade to Planable Pro (Deep Blue Card) */}
        <div className="bg-[#1D64F2] text-white rounded-xl p-4 sm:p-5 space-y-4 shadow-lg relative overflow-hidden">
          {/* Top Title & Discount Badge */}
          <div className="flex items-start justify-between gap-2">
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5 font-bold text-sm tracking-wide">
                <Star className="w-4 h-4 fill-white text-white" />
                <span>Upgrade to Planable Pro</span>
              </div>
              <p className="text-[10px] text-blue-100 font-normal">
                Available with any SE Ranking subscription.
              </p>
            </div>

            <div className="bg-[#FEF08A] text-[#854D0E] text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 shadow-xs">
              20% off with SE Ranking
            </div>
          </div>

          {/* Pricing Info */}
          <div className="space-y-1">
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black tracking-tight">$0</span>
              <span className="text-[11px] font-semibold text-blue-100">
                subscription.free_trial_for_30_days
              </span>
            </div>
            <div className="text-[9.5px] text-blue-200/90 leading-tight space-y-0.5">
              <p>subscription.free_trial.then $47.2/workspace/subscription.free_trial.per_mon</p>
              <p>subscription.free_trial.cancel_anytime</p>
            </div>
          </div>

          {/* Checklist (2 columns) */}
          <div className="grid grid-cols-2 gap-x-3 gap-y-2 text-[10.5px] text-white/95 pt-1">
            <div className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-white shrink-0 stroke-[2.5]" />
              <span>150 posts/workspace/month</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-white shrink-0 stroke-[2.5]" />
              <span>Unlimited users</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-white shrink-0 stroke-[2.5]" />
              <span>10 social pages/workspace</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-white shrink-0 stroke-[2.5]" />
              <span>3 types of approval</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-white shrink-0 stroke-[2.5]" />
              <span>Calendar, Feed &amp; Grid views</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-white shrink-0 stroke-[2.5]" />
              <span>10 campaigns/workspace</span>
            </div>
          </div>

          {/* Action Button */}
          <button
            type="button"
            onClick={handleActivatePro}
            disabled={isActivatingPro || proActivated}
            className={`w-full py-2.5 px-4 rounded-lg font-bold text-xs transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer ${
              proActivated
                ? 'bg-[#10B981] text-white cursor-default'
                : 'bg-white hover:bg-gray-50 text-[#1D64F2] active:scale-[0.99]'
            }`}
          >
            {isActivatingPro ? (
              <span className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 border-2 border-[#1D64F2] border-t-transparent rounded-full animate-spin" />
                <span>Activating Pro Trial...</span>
              </span>
            ) : proActivated ? (
              <span className="flex items-center gap-1.5">
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Planable Pro Activated!</span>
              </span>
            ) : (
              <span>Add to plan for free</span>
            )}
          </button>
        </div>

        {/* Footnote & Navigation */}
        <div className="space-y-3 pt-1 text-center">
          <p className="text-[11px] text-[#6B7280]">
            Log in to Planable at{' '}
            <a
              href="https://planable.io"
              target="_blank"
              rel="noreferrer"
              className="text-[#2563EB] hover:underline"
            >
              planable.io
            </a>{' '}
            using your SE Ranking account credentials
          </p>

          <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-xs font-semibold">
            <button
              type="button"
              onClick={onClose}
              className="text-[#6B7280] hover:text-[#111827] cursor-pointer transition-colors"
            >
              Back to plans
            </button>

            <a
              href="https://app.planable.io"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#2563EB] hover:text-[#1D4ED8] flex items-center gap-1 cursor-pointer transition-colors"
            >
              <span>Go to Planable</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
