'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Check,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Plus,
  Download,
  Info,
  Clock,
  Filter,
  CheckCircle2,
  FileText,
  Lock,
  MessageSquare,
  Link2,
  Search,
  X,
  Sparkles,
} from 'lucide-react';
import { useApp } from '@/components/providers/AppProviders';
import { ProjectNotesModal } from '@/components/modals/ProjectNotesModal';
import { FeedbackModal } from '@/components/modals/FeedbackModal';

interface TaskItem {
  id: string;
  stepId: number;
  title: string;
  priority: 'High' | 'Medium' | 'Low';
  description: string;
  actionUrl?: string;
  actionText?: string;
  status: 'todo' | 'done' | 'ignored';
  commentsCount: number;
  expanded?: boolean;
}

const INITIAL_STEPS = [
  { id: 1, title: 'Step 1: Introduction & Setup', total: 5 },
  { id: 2, title: 'Step 2: Technical SEO improvements', total: 21 },
  { id: 3, title: 'Step 3: Keyword and Competitor Research', total: 10 },
  { id: 4, title: 'Step 4: Content Audit & Creation', total: 7 },
  { id: 5, title: 'Step 5: On-page SEO', total: 9 },
  { id: 6, title: 'Step 6: Link building strategy', total: 8 },
  { id: 7, title: 'Step 7: Local SEO management', total: 5 },
];

const INITIAL_TASKS: TaskItem[] = [
  {
    id: 't-1',
    stepId: 1,
    title: 'Learn about SEO',
    priority: 'Medium',
    description:
      'Get familiar with the basic SEO concepts: read articles in our blog or join SE Ranking Academy to expand your SEO knowledge. It is recommended to have a basic understanding of SEO concepts to be able to fully utilize our Marketing Plan tool.',
    actionUrl: 'https://seranking.com/blog/',
    actionText: 'SE Ranking Blog',
    status: 'todo',
    commentsCount: 0,
  },
  {
    id: 't-2',
    stepId: 2,
    title: 'Check errors in Google Search Console',
    priority: 'Medium',
    description:
      'Go to the Indexing and Experience sections in GSC. Review your report(s) to find out if there are any issues and what URL(s) are affected. Start with checking "Not indexed pages" in the Indexing report, as well as issues in the Experience report. After fixing these issues, let Google know by clicking the "Validate" button.',
    status: 'todo',
    commentsCount: 0,
  },
  {
    id: 't-3',
    stepId: 3,
    title: 'Understand your top pages by traffic and ranked keywords',
    priority: 'Medium',
    description:
      'Not all pages on your website are equally effective, so you should know which pages generate the most organic traffic. To find out the top pages and keywords your website ranks for, insert your domain into the Competitive Research, hit "Analyze," and head over to The Organic Traffic Research > Keywords / Pages tabs. Sort your pages by traffic by clicking on the corresponding column\'s header. If you have already connected Google Analytics and/or Google Search Console to the SE Ranking platform, head over to your project -> "Analytics & Traffic" section to get even more precise analytical data.',
    actionUrl: '/research',
    actionText: 'Competitive Research',
    status: 'todo',
    commentsCount: 0,
  },
  {
    id: 't-4',
    stepId: 4,
    title: 'Ensure your current site’s content is up to date',
    priority: 'Medium',
    description:
      'Check if your content is accurate and relevant; otherwise, update it. Search engines notice changes in the indexed pages. If your content stays up-to-date, this is a sign that your site is alive and well. You may want to focus on updating your top-performing pages and deleting and/or redirecting really outdated posts—if there are any. Pages that used to rank high but have fallen off might also be worth tending to. They may regain their positions after you update them.',
    status: 'todo',
    commentsCount: 0,
  },
  {
    id: 't-5',
    stepId: 5,
    title: 'Check and optimize internal linking',
    priority: 'Medium',
    description:
      'Make sure the links on the page bring value to a user, work properly, and that their anchors are both relevant to the page’s content and descriptive for pages they lead to. Double-check your page content for 404 links. If there are some links that are then redirected, it is recommended to update them with the direct ones. To speed up the process, you can identify any broken and redirected links by using the On-Page SEO Checker.',
    actionUrl: '/on-page-seo-checker',
    actionText: 'On-Page SEO Checker',
    status: 'todo',
    commentsCount: 0,
  },
  {
    id: 't-6',
    stepId: 6,
    title: 'Analyze your backlink profile',
    priority: 'Medium',
    description:
      'High-quality backlinks boost the website’s trust and improve rankings, increase referral traffic, and also improve brand awareness. Use the Backlink Checker to get a full picture of your backlink profile. Check your Domain Trust score to know your authority. Analyze the number and quality of referring domains and backlinks you have. Typically, the greater amount of high-quality referral domains a website has, the greater the likelihood it has of reaching the top of Google. Go to the Backlinks section to analyze your backlinks using over 15 parameters, including the Domain Trust score, target URL, anchor texts, backlink toxicity, and others.',
    actionUrl: '/backlinks-monitor',
    actionText: 'Backlink Monitor',
    status: 'todo',
    commentsCount: 0,
  },
  {
    id: 't-7',
    stepId: 7,
    title: 'Audit your GMB profile',
    priority: 'Medium',
    description:
      'A well-optimized Google Business Profile (GBP) will help you connect with new potential customers and enhance your digital presence on the web. In your GBP, you should provide as accurate information as possible about your business locations. To make it easy for users to contact you, ensure that you specified the right address, website URL, and phone number. You can check and manage this data within the Local Marketing. In addition, take advantage of category-specific features like adding a menu or indicating that you provide a free first consultation, etc. This will help you attract more customers to your website, and increase the number of phone calls and direction requests.',
    actionUrl: '/local-marketing',
    actionText: 'Local Marketing',
    status: 'todo',
    commentsCount: 0,
  },
];

export default function MarketingPlanPage() {
  const { activeProject } = useApp();
  const displayDomain = activeProject?.domain
    ? activeProject.domain.replace(/^https?:\/\//, '').replace(/\/$/, '')
    : 'workcomposer.com';

  const [tasks, setTasks] = useState<TaskItem[]>(INITIAL_TASKS);
  const [filterMode, setFilterMode] = useState<'category' | 'priority' | 'status'>('category');
  const [expandedDetails, setExpandedDetails] = useState<Record<string, boolean>>({});

  // Modals
  const [isNotesOpen, setIsNotesOpen] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [newTaskStep, setNewTaskStep] = useState(1);
  const [newTaskPriority, setNewTaskPriority] = useState<'High' | 'Medium' | 'Low'>('Medium');

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const doneCount = tasks.filter((t) => t.status === 'done').length;
  const todoCount = 65 - doneCount; // Total 65 matching user exact numbers
  const ignoredCount = tasks.filter((t) => t.status === 'ignored').length;
  const progressPercent = Math.round((doneCount / 65) * 100);

  const toggleTaskStatus = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const nextStatus = t.status === 'done' ? 'todo' : 'done';
          showToast(
            nextStatus === 'done'
              ? `Task "${t.title}" marked as Done!`
              : `Task "${t.title}" reopened as To Do`
          );
          return { ...t, status: nextStatus };
        }
        return t;
      })
    );
  };

  const toggleDetails = (id: string) => {
    setExpandedDetails((p) => ({ ...p, [id]: !p[id] }));
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const newTask: TaskItem = {
      id: `custom-task-${Date.now()}`,
      stepId: newTaskStep,
      title: newTaskTitle.trim(),
      priority: newTaskPriority,
      description: newTaskDesc.trim() || 'Custom marketing task added by user.',
      status: 'todo',
      commentsCount: 0,
    };

    setTasks([newTask, ...tasks]);
    setNewTaskTitle('');
    setNewTaskDesc('');
    setIsNewTaskModalOpen(false);
    showToast('New marketing task created!');
  };

  return (
    <div className="min-h-screen bg-[#F0F2F5] pb-24 text-gray-800 text-sm">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-[#1E293B] text-white px-4 py-2.5 rounded-lg shadow-xl text-xs font-medium flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-150">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}


      {/* Header bar matching user prompt */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-14 flex items-center justify-between gap-4">
            {/* Left: Domain & Section */}
            <div className="flex items-center gap-3 min-w-0">
              <Link
                href="/project-overview"
                className="text-xs font-semibold text-gray-500 hover:text-gray-900 transition-colors"
              >
                {displayDomain}
              </Link>
              <span className="text-gray-300">/</span>
              <h1 className="font-bold text-gray-900 text-sm">Marketing Plan</h1>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => showToast('Exported Marketing Plan checklist (PDF/CSV)')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 text-xs font-bold shadow-2xs transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-gray-500" />
                <span>Export</span>
              </button>

              <button
                type="button"
                onClick={() => setIsNotesOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 text-xs font-bold shadow-2xs transition-colors cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5 text-gray-500" />
                <span>Notes (49)</span>
              </button>

              <button
                type="button"
                onClick={() => setIsFeedbackOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 text-xs font-bold shadow-2xs transition-colors cursor-pointer"
              >
                <MessageSquare className="w-3.5 h-3.5 text-gray-500" />
                <span>Feedback</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        {/* Top Progress & Metrics Summary Card */}
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-2xs">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 divide-y md:divide-y-0 md:divide-x divide-gray-100">
            {/* Progress metric */}
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full border-4 border-gray-100 flex items-center justify-center relative">
                <span className="text-sm font-black text-gray-900">{progressPercent}%</span>
              </div>
              <div>
                <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Plan Progress</div>
                <div className="text-2xl font-black text-gray-900 mt-0.5">
                  {doneCount} <span className="text-xs text-gray-400 font-normal">/ 65</span>
                </div>
                <div className="text-xs text-gray-500">Total progress {progressPercent}%</div>
              </div>
            </div>

            {/* Task Status */}
            <div className="pt-4 md:pt-0 md:pl-6 space-y-2">
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">TASK STATUS</div>
              <div className="flex items-center gap-6">
                <div>
                  <div className="text-[11px] text-gray-500">To Do</div>
                  <div className="text-xl font-black text-gray-900">{todoCount}</div>
                </div>
                <div>
                  <div className="text-[11px] text-gray-500">Done</div>
                  <div className="text-xl font-black text-emerald-600">{doneCount}</div>
                </div>
                <div>
                  <div className="text-[11px] text-gray-500">Ignored</div>
                  <div className="text-xl font-black text-gray-400">{ignoredCount}</div>
                </div>
              </div>
            </div>

            {/* Task Priority */}
            <div className="pt-4 md:pt-0 md:pl-6 space-y-2">
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">TASK PRIORITY</div>
              <div className="flex items-center gap-6">
                <div>
                  <div className="text-[11px] text-gray-500">High</div>
                  <div className="text-xl font-black text-rose-600">0</div>
                </div>
                <div>
                  <div className="text-[11px] text-gray-500">Medium</div>
                  <div className="text-xl font-black text-amber-600">{todoCount}</div>
                </div>
                <div>
                  <div className="text-[11px] text-gray-500">Low</div>
                  <div className="text-xl font-black text-blue-600">0</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Bar: Filters & Add new task button */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setFilterMode('priority')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                filterMode === 'priority'
                  ? 'bg-gray-900 text-white shadow-xs'
                  : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
              }`}
            >
              By priority
            </button>
            <button
              type="button"
              onClick={() => setFilterMode('category')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                filterMode === 'category'
                  ? 'bg-gray-900 text-white shadow-xs'
                  : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
              }`}
            >
              By category
            </button>
            <button
              type="button"
              onClick={() => setFilterMode('status')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                filterMode === 'status'
                  ? 'bg-gray-900 text-white shadow-xs'
                  : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
              }`}
            >
              By statuses
            </button>
          </div>

          <button
            type="button"
            onClick={() => setIsNewTaskModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-[#7C3AED] to-[#8B5CF6] hover:from-[#6D28D9] hover:to-[#7C3AED] text-white text-xs font-bold rounded-lg shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add new task</span>
          </button>
        </div>

        {/* 7 Steps List */}
        <div className="space-y-4">
          {INITIAL_STEPS.map((step) => {
            const stepTasks = tasks.filter((t) => t.stepId === step.id);
            const stepDoneCount = stepTasks.filter((t) => t.status === 'done').length;

            return (
              <div key={step.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-2xs">
                {/* Step Header */}
                <div className="px-5 py-3.5 bg-gray-50/70 border-b border-gray-200 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-gray-900 text-sm">{step.title}</span>
                    <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-gray-200/80 text-gray-700">
                      {stepDoneCount}/{step.total}
                    </span>
                  </div>
                </div>

                {/* Step Tasks */}
                <div className="divide-y divide-gray-100">
                  {stepTasks.length === 0 ? (
                    <div className="p-4 text-xs text-gray-400 italic">No tasks currently under this step.</div>
                  ) : (
                    stepTasks.map((task) => {
                      const isDone = task.status === 'done';
                      const isExpanded = !!expandedDetails[task.id];

                      return (
                        <div key={task.id} className={`p-4 transition-colors ${isDone ? 'bg-gray-50/40' : 'hover:bg-blue-50/20'}`}>
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-start gap-3 min-w-0">
                              {/* Checkbox */}
                              <button
                                type="button"
                                onClick={() => toggleTaskStatus(task.id)}
                                className={`mt-0.5 w-4 h-4 rounded border flex items-center justify-center transition-colors cursor-pointer shrink-0 ${
                                  isDone
                                    ? 'bg-emerald-600 border-emerald-600 text-white'
                                    : 'bg-white border-gray-300 hover:border-gray-400'
                                }`}
                              >
                                {isDone && <Check className="w-3 h-3 stroke-[3]" />}
                              </button>

                              {/* Title and details */}
                              <div className="space-y-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className={`font-bold text-xs ${isDone ? 'line-through text-gray-400' : 'text-gray-900'}`}>
                                    {task.title}
                                  </span>
                                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                    {task.priority}
                                  </span>
                                </div>

                                <p className="text-xs text-gray-600 leading-relaxed max-w-4xl">
                                  {task.description}
                                </p>

                                <div className="flex items-center gap-4 pt-1 text-xs">
                                  <button
                                    type="button"
                                    onClick={() => toggleDetails(task.id)}
                                    className="text-[#7C3AED] font-semibold hover:underline cursor-pointer flex items-center gap-0.5"
                                  >
                                    <span>{isExpanded ? 'Hide details' : 'Show details'}</span>
                                    {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                                  </button>

                                  {task.actionUrl && (
                                    <Link
                                      href={task.actionUrl}
                                      className="text-gray-600 hover:text-gray-900 font-medium inline-flex items-center gap-1"
                                    >
                                      <span>{task.actionText || 'Open Tool'}</span>
                                      <ExternalLink className="w-3 h-3 text-gray-400" />
                                    </Link>
                                  )}
                                </div>

                                {/* Expanded details accordion */}
                                {isExpanded && (
                                  <div className="mt-2 p-3 bg-blue-50/50 border border-blue-100 rounded-lg text-xs space-y-1.5 animate-in fade-in duration-100">
                                    <div className="font-bold text-gray-800">Best Practices for this step:</div>
                                    <ul className="list-disc list-inside text-gray-600 space-y-1 pl-1">
                                      <li>Document the baseline state before implementing modifications.</li>
                                      <li>Cross-reference recommendations with Google Search Console reports.</li>
                                      <li>Recheck ranking volatility 7-14 days after changes are indexed.</li>
                                    </ul>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Right Status / Badge */}
                            <div className="shrink-0 flex items-center gap-2">
                              <span className="text-xs text-gray-400">None</span>
                              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-gray-100 text-gray-500">
                                0
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add New Task Modal */}
      {isNewTaskModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <Plus className="w-4 h-4 text-[#7C3AED]" />
                <span>Add Marketing Plan Task</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsNewTaskModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-3 text-xs">
              <div>
                <label className="block text-gray-700 font-bold mb-1">Task Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Audit XML sitemap for broken URLs"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7C3AED] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-1">Step Category</label>
                <select
                  value={newTaskStep}
                  onChange={(e) => setNewTaskStep(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7C3AED] focus:outline-none"
                >
                  {INITIAL_STEPS.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-1">Priority</label>
                <select
                  value={newTaskPriority}
                  onChange={(e) => setNewTaskPriority(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7C3AED] focus:outline-none"
                >
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-1">Description / Instructions</label>
                <textarea
                  rows={3}
                  placeholder="Provide step-by-step guidance on how to accomplish this task..."
                  value={newTaskDesc}
                  onChange={(e) => setNewTaskDesc(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#7C3AED] focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsNewTaskModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-gradient-to-r from-[#7C3AED] to-[#8B5CF6] hover:from-[#6D28D9] hover:to-[#7C3AED] text-white text-xs font-bold rounded-lg shadow-xs cursor-pointer"
                >
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Project Notes Modal */}
      <ProjectNotesModal isOpen={isNotesOpen} onClose={() => setIsNotesOpen(false)} />

      {/* Feedback Modal */}
      <FeedbackModal isOpen={isFeedbackOpen} onClose={() => setIsFeedbackOpen(false)} />
    </div>
  );
}
