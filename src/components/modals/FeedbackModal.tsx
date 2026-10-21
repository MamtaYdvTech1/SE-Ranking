'use client';

import React, { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  sectionTitle?: string;
}

export function FeedbackModal({ isOpen, onClose }: FeedbackModalProps) {
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedback.trim()) return;

    setIsSubmitting(true);
    setTimeout(() => {
      try {
        const stored = localStorage.getItem('se_ranking_user_feedback');
        const list = stored ? JSON.parse(stored) : [];
        list.push({
          id: `fb-${Date.now()}`,
          feedback: feedback.trim(),
          url: typeof window !== 'undefined' ? window.location.href : '',
          date: new Date().toISOString(),
        });
        localStorage.setItem('se_ranking_user_feedback', JSON.stringify(list));
      } catch (err) {
        // ignore
      }

      setIsSubmitting(false);
      setIsSent(true);

      setTimeout(() => {
        setIsSent(false);
        setFeedback('');
        onClose();
      }, 900);
    }, 500);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/45 flex items-center justify-center p-4 animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="bg-white rounded-lg shadow-2xl w-full max-w-[500px] p-6 relative border border-gray-100 animate-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
      >
        {/* Header : "Tell us what you think" with X button */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[17px] font-semibold text-[#1E2532]">
            Tell us what you think
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 cursor-pointer p-1 transition-colors"
            title="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[13px] font-normal text-[#232E3D] mb-2.5">
              How useful is this section?
            </label>
            <textarea
              rows={5}
              required
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Your feedback"
              className="w-full p-3.5 border border-[#D0D7DE] rounded-md text-[13px] text-[#1E2532] placeholder:text-gray-400 focus:outline-hidden focus:border-[#7C3AED] font-normal leading-relaxed bg-white resize-none transition-colors"
              autoFocus
            />
          </div>

          {/* Action Buttons : CANCEL and SEND */}
          <div className="flex items-center justify-end gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-[#D0D7DE] hover:bg-gray-50 text-[#232E3D] text-[12px] font-semibold tracking-wider rounded cursor-pointer transition-colors uppercase"
            >
              CANCEL
            </button>

            <button
              type="submit"
              disabled={isSubmitting || !feedback.trim() || isSent}
              className="px-6 py-2 bg-[#7C3AED] hover:bg-[#6D28D9] disabled:bg-purple-300 disabled:cursor-not-allowed text-white text-[12px] font-semibold tracking-wider rounded cursor-pointer transition-colors uppercase shadow-xs flex items-center justify-center gap-1.5 min-w-[76px]"
            >
              {isSent ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>SENT</span>
                </>
              ) : isSubmitting ? (
                <span>SENDING...</span>
              ) : (
                <span>SEND</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
