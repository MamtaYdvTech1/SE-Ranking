'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Building2, Plus, FolderKanban, Calendar, Users, RefreshCw, X } from 'lucide-react';
import { SkeletonLoader } from '@/components/admin/ui/SkeletonLoader';
import { ErrorState } from '@/components/admin/ui/ErrorState';
import { EmptyState } from '@/components/admin/ui/EmptyState';

interface Workspace {
  id: string;
  name: string;
  color?: string;
  createdAt: string;
  projects: {
    id: string;
    name: string;
    domain: string;
    status: string;
    country: string;
    user?: { id: string; name?: string; email: string };
    _count: { keywords: number; auditIssues: number };
  }[];
}

export default function AdminWorkspacesPage() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [color, setColor] = useState('#3B82F6');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const fetchWorkspaces = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/workspaces');
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || 'Failed to fetch workspaces');
      }
      setWorkspaces(json.data || []);
    } catch (err: any) {
      setError(err?.message || 'Could not load client workspaces');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWorkspaces();
  }, [fetchWorkspaces]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    setCreateError(null);
    try {
      const res = await fetch('/api/admin/workspaces', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), color }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.message || 'Failed to create workspace');
      }
      setName('');
      setIsModalOpen(false);
      fetchWorkspaces();
    } catch (err: any) {
      setCreateError(err?.message || 'Error creating workspace');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-100 flex items-center gap-2.5">
            Clients & Workspaces
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Organize multi-tenant client portfolios, manage agency workspaces, and assign projects.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchWorkspaces}
            disabled={isLoading}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 transition"
            title="Refresh workspaces"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition shadow-md shadow-blue-500/20"
          >
            <Plus className="w-4 h-4" />
            <span>Create Workspace</span>
          </button>
        </div>
      </div>

      {/* 4 States */}
      {isLoading && <SkeletonLoader type="table" rows={4} />}

      {error && !isLoading && (
        <ErrorState title="Failed to load workspaces" message={error} onRetry={fetchWorkspaces} />
      )}

      {!isLoading && !error && workspaces.length === 0 && (
        <EmptyState
          icon={Building2}
          title="No Workspaces Created"
          description="Create your first client workspace to bundle projects and assign dedicated SEO owners."
          actionLabel="Create Workspace"
          onAction={() => setIsModalOpen(true)}
        />
      )}

      {!isLoading && !error && workspaces.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {workspaces.map((ws) => (
            <div
              key={ws.id}
              className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm space-y-4 hover:border-slate-700/80 transition shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-3.5 h-3.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: ws.color || '#3B82F6' }}
                  />
                  <h3 className="text-sm font-bold text-slate-100">{ws.name}</h3>
                </div>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700/60">
                  {ws.projects.length} {ws.projects.length === 1 ? 'Project' : 'Projects'}
                </span>
              </div>

              {/* Projects in workspace */}
              <div className="space-y-1.5 pt-1">
                {ws.projects.length === 0 ? (
                  <div className="text-[11px] text-slate-500 italic py-2">
                    No projects assigned to this workspace yet.
                  </div>
                ) : (
                  ws.projects.slice(0, 3).map((p) => (
                    <div
                      key={p.id}
                      className="p-2 rounded-lg bg-slate-950/40 border border-slate-800/60 flex items-center justify-between text-xs"
                    >
                      <div className="truncate font-medium text-slate-300">{p.domain}</div>
                      <span className="text-[10px] text-slate-500">
                        {p._count.keywords} kw
                      </span>
                    </div>
                  ))
                )}
                {ws.projects.length > 3 && (
                  <div className="text-[11px] text-blue-400 font-medium pl-1">
                    +{ws.projects.length - 3} more projects
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-500">
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  <span>Created {new Date(ws.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Workspace Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl bg-[#0f1423] border border-slate-700 p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-100">Create New Workspace</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {createError && (
              <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300">
                {createError}
              </div>
            )}

            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-slate-300 mb-1">Workspace Name</label>
                <input
                  type="text"
                  placeholder="e.g. Enterprise Client Group"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block font-medium text-slate-300 mb-1">Color Tag</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-9 h-9 rounded-lg bg-transparent border-0 cursor-pointer"
                  />
                  <span className="font-mono text-slate-400">{color}</span>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !name.trim()}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold transition disabled:opacity-50"
                >
                  {isSubmitting ? 'Creating...' : 'Create Workspace'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
