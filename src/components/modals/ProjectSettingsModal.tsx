'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Search,
  Check,
  ChevronDown,
  Globe,
  Settings,
  Trash2,
  ExternalLink,
  Plus,
  Sparkles,
  KeyRound,
  Users,
  BarChart2,
  HelpCircle,
} from 'lucide-react';
import { CountryFlag } from '@/components/ui/CountryFlag';
import { GoogleLogo } from '@/components/ui/GoogleLogo';
import { SeRankingLogo } from '@/components/ui/SeRankingLogo';

interface ProjectSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: string;
  projectName?: string;
  projectDomain?: string;
  onSave?: (data: any) => void;
}

export function ProjectSettingsModal({
  isOpen,
  onClose,
  initialTab = 'general',
  projectName = '',
  projectDomain = '',
  onSave,
}: ProjectSettingsModalProps) {
  const [activeTab, setActiveTab] = useState(initialTab);

  // Form states - General
  const [websiteUrl, setWebsiteUrl] = useState(projectDomain ? `https://${projectDomain}` : '');
  const [domainType, setDomainType] = useState('*.domain/* (Recommended)');
  const [name, setName] = useState(projectName || `https://${projectDomain}/`);
  const [group, setGroup] = useState('No group selected');
  const [projectColor, setProjectColor] = useState('#374151');
  const [backlinkReport, setBacklinkReport] = useState(true);
  const [projectStatusActive, setProjectStatusActive] = useState(true);

  // Search Engines Tab states
  const [selectedEngineToAdd, setSelectedEngineToAdd] = useState<'Google' | 'AI Overviews' | 'ChatGPT'>('Google');
  const [engineCountry, setEngineCountry] = useState('India');
  const [engineLang, setEngineLang] = useState('English');
  const [addedEngines, setAddedEngines] = useState([
    { id: '1', name: 'Google India', location: 'India', lang: 'EN', type: 'Google' },
  ]);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab, isOpen]);

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

  const handleApply = () => {
    if (onSave) {
      onSave({
        websiteUrl,
        domainType,
        name,
        group,
        projectColor,
        backlinkReport,
        projectStatusActive,
        addedEngines,
      });
    }
    onClose();
  };

  const menuItems = [
    { id: 'general', label: 'General information', icon: Settings },
    { id: 'engines', label: 'Search engines', icon: Search },
    { id: 'keywords', label: 'Keywords', icon: KeyRound },
    { id: 'prompts', label: 'Prompts', icon: Sparkles },
    { id: 'competitors', label: 'Competitors', icon: Users },
    { id: 'analytics', label: 'Statistics and Analytics services', icon: BarChart2 },
  ];

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-2xs flex items-center justify-center p-2 sm:p-6 animate-in fade-in duration-150 font-sans"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl h-[92vh] max-h-[820px] flex overflow-hidden border border-gray-200 animate-in zoom-in-95 duration-150">
        {/* ===================== LEFT BLUE SIDEBAR (Screenshot 4) ===================== */}
        <div className="w-64 sm:w-72 bg-[#1976D2] text-white flex flex-col justify-between p-6 shrink-0 select-none">
          <div>
            {/* White SE Ranking Logo */}
            <div className="flex items-center gap-2 mb-8">
              <svg className="w-6 h-6 fill-white" viewBox="0 0 24 24">
                <path d="M12 2L2 19.5h20L12 2zm0 4l6.5 11.5h-13L12 6z" />
              </svg>
              <span className="font-bold text-base tracking-wide text-white">SE Ranking</span>
            </div>

            {/* Project Domain & Settings Title */}
            <div className="mb-6">
              <h2 className="text-xl font-bold text-white break-all leading-tight">
                {name || `https://${projectDomain}/`}
              </h2>
              <p className="text-blue-100 text-sm font-medium mt-1">Settings</p>
            </div>

            {/* Menu Items */}
            <nav className="space-y-1.5">
              {menuItems.map((item) => {
                const isActive = activeTab === item.id;
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-full text-xs font-semibold transition-all cursor-pointer text-left ${
                      isActive
                        ? 'bg-white text-[#1976D2] shadow-sm'
                        : 'text-white/90 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Project Status Toggle at Bottom */}
          <div className="pt-4 border-t border-white/20 flex items-center justify-between text-xs">
            <span className="text-white/90 font-medium flex items-center gap-1">
              <span>Project status:</span>
              <span className="text-white/70 italic">i</span>
            </span>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-white">
                {projectStatusActive ? 'Active' : 'Paused'}
              </span>
              <button
                type="button"
                onClick={() => setProjectStatusActive(!projectStatusActive)}
                className={`w-10 h-5 rounded-full transition-colors relative cursor-pointer ${
                  projectStatusActive ? 'bg-white' : 'bg-white/30'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full transition-transform absolute top-0.5 ${
                    projectStatusActive
                      ? 'right-0.5 bg-[#1976D2]'
                      : 'left-0.5 bg-white'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* ===================== RIGHT MAIN CONTENT AREA ===================== */}
        <div className="flex-1 flex flex-col justify-between bg-white overflow-hidden">
          {/* Header */}
          <div className="px-8 py-5 border-b border-gray-100 flex items-center justify-between">
            <h1 className="text-xl font-bold text-gray-900">
              {menuItems.find((m) => m.id === activeTab)?.label}
            </h1>
            <button
              type="button"
              onClick={onClose}
              className="flex items-center gap-1.5 text-xs font-bold text-gray-400 hover:text-gray-700 transition-colors cursor-pointer"
            >
              <span>ESC</span>
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Scrollable Form Body */}
          <div className="flex-1 overflow-y-auto px-8 py-6 text-xs text-gray-800 space-y-6">
            {activeTab === 'general' && (
              <>
                {/* Section: Set up website */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-bold text-gray-900">Set up website</h3>
                    <p className="text-gray-500 text-xs mt-1 leading-relaxed max-w-2xl">
                      Track the ranking positions of your site in real time in all major search engines. You are free to customize the project parameter and position tracking settings according to your requirements
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5 flex items-center gap-1">
                        <span>Website URL</span>
                        <span className="text-gray-400 italic">i</span>
                      </label>
                      <input
                        type="text"
                        value={websiteUrl}
                        onChange={(e) => setWebsiteUrl(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs text-gray-900 bg-white focus:outline-hidden focus:border-[#1976D2]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5 flex items-center gap-1">
                        <span>Domain type</span>
                        <span className="text-gray-400 italic">i</span>
                      </label>
                      <select
                        value={domainType}
                        onChange={(e) => setDomainType(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs text-gray-900 bg-white focus:outline-hidden focus:border-[#1976D2] cursor-pointer"
                      >
                        <option value="*.domain/* (Recommended)">*.domain/* (Recommended)</option>
                        <option value="domain/*">domain/* (Exact domain)</option>
                        <option value="https://exact.url">Exact URL</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 pt-1">
                    <div className="md:col-span-6">
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5 flex items-center gap-1">
                        <span>Project name</span>
                        <span className="text-gray-400 italic">i</span>
                      </label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs text-gray-900 bg-white focus:outline-hidden focus:border-[#1976D2]"
                      />
                    </div>

                    <div className="md:col-span-4">
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5 flex items-center gap-1">
                        <span>Group</span>
                        <span className="text-gray-400 italic">i</span>
                      </label>
                      <select
                        value={group}
                        onChange={(e) => setGroup(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs text-gray-900 bg-white focus:outline-hidden focus:border-[#1976D2] cursor-pointer"
                      >
                        <option value="No group selected">No group selected</option>
                        <option value="SEO Priority">SEO Priority</option>
                        <option value="Clients">Clients</option>
                      </select>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-xs font-semibold text-gray-700 mb-1.5 flex items-center gap-1">
                        <span>Project color</span>
                        <span className="text-gray-400 italic">i</span>
                      </label>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-8 h-8 rounded-lg border border-gray-300 shadow-2xs cursor-pointer"
                          style={{ backgroundColor: projectColor }}
                          title="Current color"
                        />
                        <input
                          type="color"
                          value={projectColor}
                          onChange={(e) => setProjectColor(e.target.value)}
                          className="w-7 h-7 rounded border-0 cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section: Additional settings */}
                <div className="pt-4 border-t border-gray-100 space-y-3">
                  <div>
                    <h3 className="text-sm font-bold text-gray-900">Additional settings</h3>
                    <p className="text-gray-500 text-xs mt-0.5">
                      Select additional options to enable for the project
                    </p>
                  </div>

                  <div className="flex items-center gap-3 pt-1">
                    <button
                      type="button"
                      onClick={() => setBacklinkReport(!backlinkReport)}
                      className={`w-10 h-5 rounded-full transition-colors relative cursor-pointer ${
                        backlinkReport ? 'bg-[#1976D2]' : 'bg-gray-300'
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-0.5 ${
                          backlinkReport ? 'right-0.5' : 'left-0.5'
                        }`}
                      />
                    </button>
                    <span className="text-xs font-medium text-gray-800 flex items-center gap-1">
                      <span>Backlink report</span>
                      <span className="text-gray-400 italic">i</span>
                    </span>
                  </div>
                </div>

                {/* Section: Delete project */}
                <div className="pt-4 border-t border-gray-100 space-y-3">
                  <div>
                    <h3 className="text-sm font-bold text-gray-900">Delete project</h3>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (confirm('Are you sure you want to delete this project?')) {
                        onClose();
                      }
                    }}
                    className="px-4 py-2 border border-gray-300 hover:bg-red-50 hover:border-red-300 hover:text-red-600 text-gray-700 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer transition-colors shadow-2xs"
                  >
                    <Trash2 className="w-4 h-4 text-gray-500" />
                    <span>DELETE PROJECT</span>
                  </button>
                </div>
              </>
            )}

            {/* Other tabs support */}
            {activeTab === 'engines' && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-gray-900">Tracked Search Engines</h3>
                <div className="space-y-2">
                  {addedEngines.map((eng) => (
                    <div key={eng.id} className="p-3 bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <GoogleLogo className="w-4 h-4" />
                        <CountryFlag code="IN" name="India" size="sm" />
                        <span className="font-bold text-gray-900">{eng.name}</span>
                        <span className="text-gray-500">({eng.lang})</span>
                      </div>
                      <span className="text-emerald-600 text-xs font-semibold">Active</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'keywords' && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-gray-900">Keywords Management</h3>
                <p className="text-gray-500 text-xs">2 active keywords tracked in Google India.</p>
                <div className="p-3 bg-gray-50 rounded-lg font-mono text-xs text-gray-700 space-y-1">
                  <div>1. {projectDomain ? `https://${projectDomain}` : 'Primary keyword'}</div>
                  <div>2. {projectName || 'Brand keyword'}</div>
                </div>
              </div>
            )}

            {activeTab === 'prompts' && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-gray-900">AI Prompt Settings</h3>
                <p className="text-gray-500 text-xs">Configure tracking prompts for ChatGPT and Google AI Overviews.</p>
              </div>
            )}

            {activeTab === 'competitors' && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-gray-900">Tracked Competitors</h3>
                <p className="text-gray-500 text-xs">Manage competitor domains compared in rankings and market share.</p>
              </div>
            )}

            {activeTab === 'analytics' && (
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-gray-900">Statistics and Analytics Services</h3>
                <p className="text-gray-500 text-xs">Connect Google Analytics 4 and Google Search Console.</p>
              </div>
            )}
          </div>

          {/* Footer Bar (Screenshot 4) */}
          <div className="px-8 py-4 border-t border-gray-200 flex items-center justify-between bg-white">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg text-xs font-bold uppercase tracking-wider cursor-pointer transition-colors shadow-2xs"
            >
              BACK TO PROJECT
            </button>
            <button
              type="button"
              onClick={handleApply}
              className="px-6 py-2 bg-[#1976D2] hover:bg-[#1565C0] text-white rounded-lg text-xs font-bold uppercase tracking-wider cursor-pointer transition-colors shadow-xs"
            >
              APPLY
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
