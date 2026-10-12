'use client';

import React, { useState } from 'react';
import { X, Globe, Tag, AlertCircle } from 'lucide-react';
import { AddCompetitorModal as ProjectCompetitorModal } from '../competitors/AddCompetitorModal';
import { CompetitorDto } from '@/lib/types';

export interface AddCompetitorModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId?: string;
  analysisId?: string;
  onSuccess: (competitor: CompetitorDto | any) => void;
  currentCount?: number;
}

export function AddCompetitorModal(props: AddCompetitorModalProps) {
  // If projectId is provided, render the project competitor modal requested by user
  if (props.projectId) {
    return (
      <ProjectCompetitorModal
        projectId={props.projectId}
        isOpen={props.isOpen}
        onClose={props.onClose}
        onSuccess={props.onSuccess}
      />
    );
  }

  // Otherwise, render the analysis competitor modal (for AI Search Dashboard)
  return <AnalysisCompetitorModal {...props} />;
}

function AnalysisCompetitorModal({
  isOpen,
  onClose,
  analysisId = '',
  onSuccess,
  currentCount = 0,
}: AddCompetitorModalProps) {
  const [domain, setDomain] = useState('');
  const [brandName, setBrandName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (currentCount >= 5) {
      setError('Maximum 5 competitors allowed per analysis.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/competitors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          domain: domain.trim(),
          brandName: brandName.trim() || undefined,
          analysisId,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to add competitor.');
      }

      onSuccess(data.competitor);
      onClose();
      setDomain('');
      setBrandName('');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full border border-gray-100 overflow-hidden text-gray-900">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/50">
          <div>
            <h3 className="text-base font-semibold text-gray-900">Add Competitor</h3>
            <p className="text-[11px] text-gray-500">{5 - currentCount} slots remaining (max 5)</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-sm">
          {error && (
            <div className="p-3 bg-red-50 text-red-700 rounded-lg text-xs border border-red-200 flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Competitor Domain <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Globe className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
              <input
                type="text"
                required
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                placeholder="e.g. sprotsocial.com"
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-hidden focus:ring-2 focus:ring-[#0B69FF]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Competitor Brand (Optional)
            </label>
            <div className="relative">
              <Tag className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={brandName}
                onChange={(e) => setBrandName(e.target.value)}
                placeholder="e.g. Sprout Social"
                className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-hidden focus:ring-2 focus:ring-[#0B69FF]"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || currentCount >= 5}
              className="px-5 py-2 text-xs font-semibold text-white bg-[#0B69FF] hover:bg-[#005FE0] rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? 'Adding...' : 'Add Competitor'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddCompetitorModal;
