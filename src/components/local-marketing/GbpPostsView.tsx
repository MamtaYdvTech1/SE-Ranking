'use client';

import React, { useState, useRef, useEffect } from 'react';
import { AddLocationGoogleModal, ConnectedLocation } from './AddLocationGoogleModal';
import {
  Plus,
  Filter,
  ChevronDown,
  Edit2,
  Trash2,
  ExternalLink,
  X,
  MoreVertical,
  Check,
  Calendar,
  Sparkles,
  ChevronRight,
  Clock,
  MapPin,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { CountryFlag } from '@/components/ui/CountryFlag';

interface GbpPostItem {
  id: string;
  image?: string;
  title: string;
  text: string;
  fullText?: string;
  type: 'Offer' | 'Event' | 'Update';
  status: 'Published' | 'Scheduled' | 'Draft';
  date: string;
  creator?: string;
  ctaText?: string;
  ctaUrl?: string;
  startDate?: string;
  endDate?: string;
  couponCode?: string;
}

interface LocationItem {
  id: string;
  countryCode: string;
  name: string;
  address?: string;
  isDemo?: boolean;
}

export function GbpPostsView() {
  const [posts, setPosts] = useState<GbpPostItem[]>([]);
  const [locations, setLocations] = useState<LocationItem[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<LocationItem | null>(null);
  const [isLocationDropdownOpen, setIsLocationDropdownOpen] = useState(false);
  const [isAddLocationGoogleModalOpen, setIsAddLocationGoogleModalOpen] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});
  const [activeMenuPostId, setActiveMenuPostId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Modals state
  const [isNewPostModalOpen, setIsNewPostModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<GbpPostItem | null>(null);
  const [previewingPost, setPreviewingPost] = useState<GbpPostItem | null>(null);
  const [filterType, setFilterType] = useState<string>('All');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // New/Edit Post Form state
  const [formData, setFormData] = useState({
    title: '',
    text: '',
    type: 'Update' as 'Offer' | 'Event' | 'Update',
    ctaText: 'Learn more',
    ctaUrl: '',
    couponCode: '',
  });

  const locationDropdownRef = useRef<HTMLDivElement>(null);
  const actionMenuRef = useRef<HTMLDivElement>(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/local-marketing');
      if (res.ok) {
        const json = await res.json();
        if (json.data) {
          const locs: LocationItem[] = (json.data.locations || []).map((l: any) => ({
            id: l.id,
            name: l.name,
            countryCode: l.countryCode || 'us',
            address: l.address,
          }));
          setLocations(locs);
          if (locs.length > 0 && !selectedLocation) {
            setSelectedLocation(locs[0]);
          }

          const rawPosts: GbpPostItem[] = (json.data.posts || []).map((p: any) => ({
            id: p.id,
            title: p.title || p.text.slice(0, 50),
            text: p.text,
            fullText: p.text,
            type: p.type || 'Update',
            status: p.status || 'Published',
            date: p.date || 'Recent',
            ctaText: p.ctaText,
            ctaUrl: p.ctaUrl,
            couponCode: p.couponCode,
          }));
          setPosts(rawPosts);
        }
      }
    } catch (e) {
      console.error('Failed to load GBP posts:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Close menus on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        locationDropdownRef.current &&
        !locationDropdownRef.current.contains(e.target as Node)
      ) {
        setIsLocationDropdownOpen(false);
      }
      if (
        actionMenuRef.current &&
        !actionMenuRef.current.contains(e.target as Node)
      ) {
        setActiveMenuPostId(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLocationAdded = (newLoc: ConnectedLocation) => {
    const locItem: LocationItem = {
      id: newLoc.id,
      countryCode: newLoc.countryCode,
      name: newLoc.name,
      address: newLoc.address,
    };
    setLocations([locItem, ...locations]);
    setSelectedLocation(locItem);
    setSuccessToast(`Location ${newLoc.name} created!`);
    setTimeout(() => setSuccessToast(null), 4000);
  };

  const toggleRowExpansion = (id: string) => {
    setExpandedRows((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleOpenEdit = (post: GbpPostItem) => {
    setEditingPost(post);
    setFormData({
      title: post.title,
      text: post.fullText || post.text,
      type: post.type,
      ctaText: post.ctaText || 'Learn more',
      ctaUrl: post.ctaUrl || '',
      couponCode: post.couponCode || '',
    });
    setActiveMenuPostId(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this GBP post?')) return;
    setActiveMenuPostId(null);
    try {
      const res = await fetch(`/api/projects/default/gbp/posts?id=${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setPosts((prev) => prev.filter((p) => p.id !== id));
        setSuccessToast('Post deleted successfully.');
        setTimeout(() => setSuccessToast(null), 3000);
      }
    } catch {
      setPosts((prev) => prev.filter((p) => p.id !== id));
    }
  };

  const handleSavePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.text.trim()) return;

    setIsSaving(true);
    try {
      const res = await fetch('/api/local-marketing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'add_post',
          title: formData.title.trim() || undefined,
          text: formData.text.trim(),
          type: formData.type,
          ctaText: formData.ctaText || undefined,
          ctaUrl: formData.ctaUrl || undefined,
          couponCode: formData.couponCode || undefined,
          locationId: selectedLocation?.id || undefined,
        }),
      });

      if (res.ok) {
        await loadData();
        setIsNewPostModalOpen(false);
        setEditingPost(null);
        setSuccessToast('GBP post saved successfully!');
        setTimeout(() => setSuccessToast(null), 3000);
      }
    } catch (err) {
      console.error('Save post error:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const filteredPosts = posts.filter((p) => {
    if (filterType === 'All') return true;
    return p.type === filterType;
  });

  return (
    <div className="flex-1 max-w-[1400px] w-full mx-auto px-4 sm:px-6 py-4 space-y-4 font-sans">
      {/* Success Toast */}
      {successToast && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-2.5 rounded-lg text-xs font-semibold flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>{successToast}</span>
          </div>
          <button onClick={() => setSuccessToast(null)} className="text-emerald-500 hover:text-emerald-700">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* SUBHEADER: Title & "+ NEW POST" */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <h1 className="text-xl font-bold text-gray-900">GBP Posts</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Manage, schedule, and publish Google Business Profile posts
          </p>
        </div>

        <button
          onClick={() => {
            setFormData({
              title: '',
              text: '',
              type: 'Update',
              ctaText: 'Learn more',
              ctaUrl: '',
              couponCode: '',
            });
            setIsNewPostModalOpen(true);
          }}
          className="px-4 py-2 bg-[#0B69FF] hover:bg-[#0052D4] text-white rounded-md text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5 stroke-[3]" />
          <span>NEW POST</span>
        </button>
      </div>

      {/* LOCATION SELECTOR & ACTIONS */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-gray-200 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="relative" ref={locationDropdownRef}>
            <button
              onClick={() => setIsLocationDropdownOpen(!isLocationDropdownOpen)}
              className="flex items-center gap-2 px-3 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg text-xs font-semibold text-gray-800 transition-colors cursor-pointer"
            >
              <CountryFlag code={selectedLocation?.countryCode || 'us'} size="sm" />
              <span className="truncate max-w-[200px]">
                {selectedLocation?.name || 'All Locations'}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
            </button>

            {isLocationDropdownOpen && (
              <div className="absolute left-0 mt-1.5 w-72 bg-white rounded-xl shadow-xl border border-gray-200 py-1 z-30">
                <div className="px-3 py-2 text-[11px] font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100">
                  Select Location
                </div>
                {locations.length === 0 ? (
                  <div className="px-4 py-3 text-xs text-gray-400 text-center">
                    No locations registered
                  </div>
                ) : (
                  locations.map((loc) => (
                    <button
                      key={loc.id}
                      onClick={() => {
                        setSelectedLocation(loc);
                        setIsLocationDropdownOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 text-xs flex items-center gap-2 hover:bg-gray-50 text-gray-800"
                    >
                      <CountryFlag code={loc.countryCode} size="sm" />
                      <span className="truncate">{loc.name}</span>
                    </button>
                  ))
                )}
                <div className="border-t border-gray-100 p-1.5">
                  <button
                    onClick={() => {
                      setIsLocationDropdownOpen(false);
                      setIsAddLocationGoogleModalOpen(true);
                    }}
                    className="w-full text-center px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-[#1054E2] text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Location</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Filter Type */}
          <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg">
            {(['All', 'Update', 'Offer', 'Event'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setFilterType(t)}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                  filterType === t
                    ? 'bg-white text-gray-900 shadow-2xs font-semibold'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={() => setIsAddLocationGoogleModalOpen(true)}
          className="text-xs font-semibold text-[#1054E2] hover:underline flex items-center gap-1"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Connect New Location</span>
        </button>
      </div>

      {/* POSTS TABLE / EMPTY STATE */}
      {isLoading ? (
        <div className="py-20 text-center bg-white rounded-xl border border-gray-200">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#1054E2] mb-3" />
          <p className="text-xs text-gray-500 font-medium">Loading Google Business Profile posts...</p>
        </div>
      ) : filteredPosts.length === 0 ? (
        <div className="py-16 px-6 text-center bg-white rounded-xl border border-gray-200 shadow-2xs space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-[#1054E2] flex items-center justify-center mx-auto">
            <Calendar className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-gray-900">No GBP posts found</h3>
          <p className="text-xs text-gray-500 max-w-md mx-auto">
            Create updates, special offers, and event announcements to publish directly to Google
            Search and Maps.
          </p>
          <div className="pt-2">
            <button
              onClick={() => setIsNewPostModalOpen(true)}
              className="px-4 py-2 bg-[#1054E2] hover:bg-[#0c44b8] text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
            >
              + Create First Post
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 shadow-2xs overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-gray-500 uppercase tracking-wider font-semibold border-b border-gray-200">
              <tr>
                <th className="py-3 px-4">Post Title & Content</th>
                <th className="py-3 px-4 w-28">Type</th>
                <th className="py-3 px-4 w-28">Status</th>
                <th className="py-3 px-4 w-32">Date</th>
                <th className="py-3 px-4 w-20 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredPosts.map((post) => (
                <tr key={post.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="py-3 px-4">
                    <div className="font-semibold text-gray-900">{post.title}</div>
                    <div className="text-gray-500 text-[11px] mt-0.5 line-clamp-2">{post.text}</div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                      {post.type}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {post.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-500">{post.date}</td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => handleDelete(post.id)}
                      className="p-1 text-gray-400 hover:text-red-600 rounded-md transition-colors"
                      title="Delete post"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* CREATE / EDIT POST MODAL */}
      {isNewPostModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-900">Create New GBP Post</h3>
              <button onClick={() => setIsNewPostModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSavePost} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Post Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Summer Special Offer"
                  className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-lg text-xs text-gray-900 focus:outline-none focus:border-[#1054E2]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Post Content *</label>
                <textarea
                  rows={4}
                  value={formData.text}
                  onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                  placeholder="Write post details, offer descriptions, or announcement text..."
                  className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-lg text-xs text-gray-900 focus:outline-none focus:border-[#1054E2]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Post Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                    className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-lg text-xs text-gray-900 focus:outline-none focus:border-[#1054E2]"
                  >
                    <option value="Update">Update</option>
                    <option value="Offer">Offer</option>
                    <option value="Event">Event</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Call to Action</label>
                  <input
                    type="text"
                    value={formData.ctaText}
                    onChange={(e) => setFormData({ ...formData, ctaText: e.target.value })}
                    placeholder="e.g. Learn more, Book Table"
                    className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-lg text-xs text-gray-900 focus:outline-none focus:border-[#1054E2]"
                  />
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsNewPostModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-5 py-2 bg-[#1054E2] hover:bg-[#0c44b8] text-white rounded-lg text-xs font-bold flex items-center gap-2 disabled:opacity-50"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Publishing...</span>
                    </>
                  ) : (
                    <span>Publish Post</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Location Modal */}
      {isAddLocationGoogleModalOpen && (
        <AddLocationGoogleModal
          isOpen={isAddLocationGoogleModalOpen}
          onClose={() => setIsAddLocationGoogleModalOpen(false)}
          onLocationAdded={handleLocationAdded}
        />
      )}
    </div>
  );
}
