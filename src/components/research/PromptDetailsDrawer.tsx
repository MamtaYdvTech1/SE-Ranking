'use client';

import React from 'react';
import { X, Sparkles, ExternalLink, Calendar, Check, AlertCircle } from 'lucide-react';
import { PromptItem } from '@/lib/types';

interface PromptDetailsDrawerProps {
  prompt: PromptItem | null;
  onClose: () => void;
}

export function PromptDetailsDrawer({ prompt, onClose }: PromptDetailsDrawerProps) {
  if (!prompt) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-2xs">
      <div className="bg-white w-full max-w-xl h-full shadow-2xl flex flex-col justify-between text-gray-900 border-l border-gray-200 animate-in slide-in-from-right duration-200">
        {/* Drawer Header */}
        <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/60">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-purple-100 text-purple-800 uppercase tracking-wide">
                {prompt.engine}
              </span>
              <span
                className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                  prompt.visibility === 'Visible'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                {prompt.visibility}
              </span>
            </div>
            <h3 className="font-semibold text-gray-900 text-sm mt-1.5">{prompt.topic}</h3>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-sm">
          {/* Full Prompt */}
          <div>
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Prompt Query
            </h4>
            <div className="p-3.5 bg-gray-50 rounded-lg border border-gray-200 font-medium text-gray-800 leading-relaxed">
              &quot;{prompt.prompt}&quot;
            </div>
          </div>

          {/* AI Generated Answer */}
          <div>
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-purple-600" />
              <span>AI Answer Metadata</span>
            </h4>
            <div className="p-4 bg-purple-50/40 rounded-lg border border-purple-100 text-gray-800 leading-relaxed space-y-2 text-xs">
              <p>{prompt.fullAnswer || 'No raw answer text recorded for this search engine execution.'}</p>
              {prompt.answerDate && (
                <div className="flex items-center gap-1.5 text-gray-500 text-[11px] pt-2 border-t border-purple-100/60">
                  <Calendar className="w-3.5 h-3.5 text-gray-400" />
                  <span>Captured on {prompt.answerDate}</span>
                </div>
              )}
            </div>
          </div>

          {/* Presence Flags */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 rounded-lg border border-gray-200 bg-white">
              <span className="text-[11px] text-gray-500 block mb-1">Brand Mention</span>
              <span className={`font-semibold text-xs flex items-center gap-1 ${prompt.mention ? 'text-emerald-600' : 'text-gray-400'}`}>
                {prompt.mention ? <Check className="w-3.5 h-3.5" /> : null}
                {prompt.mention ? 'Mentioned' : 'None'}
              </span>
            </div>

            <div className="p-3 rounded-lg border border-gray-200 bg-white">
              <span className="text-[11px] text-gray-500 block mb-1">Domain Link</span>
              <span className={`font-semibold text-xs flex items-center gap-1 ${prompt.link ? 'text-emerald-600' : 'text-gray-400'}`}>
                {prompt.link ? <Check className="w-3.5 h-3.5" /> : null}
                {prompt.link ? 'Linked' : 'None'}
              </span>
            </div>

            <div className="p-3 rounded-lg border border-gray-200 bg-white">
              <span className="text-[11px] text-gray-500 block mb-1">Sponsored Ads</span>
              <span className={`font-semibold text-xs ${prompt.ads ? 'text-amber-600' : 'text-gray-400'}`}>
                {prompt.ads ? 'Present' : 'None'}
              </span>
            </div>
          </div>

          {/* Competitors Found */}
          {prompt.competitors && prompt.competitors.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Competitors Identified in Answer
              </h4>
              <div className="flex flex-wrap gap-2">
                {prompt.competitors.map((comp) => (
                  <span
                    key={comp}
                    className="px-2.5 py-1 rounded-md text-xs bg-gray-100 text-gray-700 font-medium border border-gray-200"
                  >
                    {comp}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 bg-gray-50 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
