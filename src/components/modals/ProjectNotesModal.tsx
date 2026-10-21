'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  X,
  Search,
  Plus,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  FileText,
  Calendar,
  Sparkles,
  CheckCircle2,
  Info,
  Trash2,
  ExternalLink,
  Download,
  RotateCcw,
  Check,
} from 'lucide-react';

export interface NoteItem {
  id: string;
  title: string;
  description: string;
  date: string;
  category: string;
  section: string;
  shownInChart: boolean;
  externalUrl?: string;
}

export const INITIAL_GOOGLE_NOTES: NoteItem[] = [
  {
    id: 'n0',
    title: 'suraj notes',
    description: 'hiii i m suraj notes',
    date: 'Oct-09 2026',
    category: 'Project note',
    section: 'Rankings',
    shownInChart: true,
  },
  {
    id: 'n1',
    title: 'September 2026 spam update',
    description: "This is the fourth spam update of 2026, launched about five weeks after the August update ended. It started on September 24, 2026, and is still rolling out. Google says this one may take up to two weeks to roll out. The update applies globally and to all languages. Google hasn't said whether it targets any specific spam policy or tactic. If your rankings or traffic shift in late September or early October, this update is a likely cause.",
    date: 'Sep-24 2026',
    category: 'Google update',
    section: 'Rankings',
    shownInChart: true,
  },
  {
    id: 'n2',
    title: 'August 2026 spam update',
    description: "This is the third spam update of 2026, launched less than two months after the June spam update. It ran from August 18, 2026, to August 21, 2026, lasting about 2 days and 16 hours. Like previous spam updates, it applied globally across all languages and targeted sites that violate Google's existing spam policies. SE Ranking's analysis of 100,000 keywords in US search results found that 16.71% of pages ranking in the TOP 10 before the update dropped out of the TOP 100. Volatility hit all 20 industries tracked. It peaked in fashion and beauty, while YMYL niches such as real estate and healthcare were among the most stable.",
    date: 'Aug-18 2026',
    category: 'Google update',
    section: 'Rankings',
    shownInChart: true,
  },
  {
    id: 'n3',
    title: 'June 2026 spam update',
    description: "This is the second spam update of 2026, arriving just over three weeks after the May 2026 core update finished. It started on June 24, 2026, and completed two days later on June 26, 2026. Google released it as a standard spam update that applies globally and to all languages. The update aimed to improve Google's automated spam-detection systems, including SpamBrain, so sites that violated existing spam policies were most likely to be affected. Google notes that recovery can take months, because its systems need time to confirm that a site now complies.",
    date: 'Jun-24 2026',
    category: 'Google update',
    section: 'Rankings',
    shownInChart: true,
  },
  {
    id: 'n4',
    title: 'May 2026 Google Core Update',
    description: "This is the second core update of 2026. It started on May 21, 2026, and finished approximately 12 days later on June 2, 2026. As with other core updates, Google described it as a regular update designed to better surface relevant, satisfying content for searchers from all types of sites, with changes being broad and not targeted at specific sites or pages. This was a global update that impacted all regions and languages. SE Ranking’s analysis across 100K keywords found that nearly 20% of pages ranking in the TOP 10 before the update dropped out of the TOP 100.",
    date: 'May-21 2026',
    category: 'Google update',
    section: 'Rankings',
    shownInChart: true,
  },
  {
    id: 'n5',
    title: 'March 2026 core update',
    description: "This is the first core update of 2026, launching just three days after the March 2026 spam update completed. It started on March 27, 2026, and finished approximately 12 days later on April 8, 2026. As with other core updates, Google refined its core ranking systems to better surface relevant, satisfying content for searchers across all site types. Changes are broad and not targeted at specific sites or pages. The update was global and impacted all regions and languages. Volatility analysis by SE Ranking across 100,000 keywords found that the March 2026 updates (Core and Spam) produced greater ranking shifts than the December 2025 core update. 24% of the TOP 10 pages dropped out of the TOP 100 after the March 2026 updates, compared with 15% after December.",
    date: 'Mar-27 2026',
    category: 'Google update',
    section: 'Rankings',
    shownInChart: true,
  },
  {
    id: 'n6',
    title: 'March 2026 spam update',
    description: "This is the first spam update of 2026 and the first since August 2025. It launched on March 24, 2026, and completed the following day in under 24 hours, making it the fastest spam update ever recorded on Google’s Search Status Dashboard. Google described it as a normal spam update that applies globally across all languages, with no new spam policy categories introduced. Sites violating Google's existing spam policies may have been affected.",
    date: 'Mar-24 2026',
    category: 'Google update',
    section: 'Rankings',
    shownInChart: true,
  },
  {
    id: 'n7',
    title: 'February 2026 Discover core update',
    description: "This is the first confirmed Google Search update of 2026 and the first core update in Google’s history to target Google Discover exclusively. It started on February 5, 2026, and completed approximately 22 days later on February 27, 2026. Google described it as a broad update to the systems that surface articles in Discover, with improvements aimed at showing more locally relevant content, reducing sensational and clickbait material, and prioritizing in-depth, original, and timely content from sites with demonstrated topical expertise. At launch, the update applied only to English-language users in the US, with plans to expand to all countries and languages in the future.",
    date: 'Feb-05 2026',
    category: 'Google update',
    section: 'Rankings',
    shownInChart: true,
  },
  {
    id: 'n8',
    title: 'December 2025 core update',
    description: "This is the third and final core update of 2025. It started on December 11, 2025, and completed 18 days later on December 29, 2025. Google described it as a regular update designed to better surface relevant, satisfying content for searchers from all types of sites, with changes being broad and global across all regions and languages. Volatility was most pronounced in the first few days after launch and again around December 20. SE Ranking’s analysis of SERP data across 100,000 keywords showed that nearly 15% of pages holding top 10 positions before the update fell out of the top 100 entirely.",
    date: 'Dec-11 2025',
    category: 'Google update',
    section: 'Rankings',
    shownInChart: true,
  },
  {
    id: 'n9',
    title: 'August 2025 Spam Update',
    description: "This is the first spam update of 2025 and the first in eight months, following December 2024’s update. Google described it as a normal spam update that will roll out globally across all languages. While it hasn’t specified which types of spam are being targeted, sites violating Google’s spam policies may be affected. The rollout is expected to take a few weeks to complete.",
    date: 'Aug-27 2025',
    category: 'Google update',
    section: 'Rankings',
    shownInChart: true,
  },
  {
    id: 'n10',
    title: 'June 2025 Google Core Update',
    description: "This is the second core update of 2025. It began on June 30, 2025, and took more than 16 days to complete, finishing on July 17, 2025. Google described this as a regular update aimed at fine-tuning multiple elements of the core ranking system to present searchers with more relevant results from a wide range of websites. This was a global update that impacted all regions and languages.",
    date: 'Jun-30 2025',
    category: 'Google update',
    section: 'Rankings',
    shownInChart: true,
  },
  {
    id: 'n11',
    title: 'March 2025 Google Core Update',
    description: "This is the first core update of 2025 and the first since December 2024. It started on March 13, 2025, and finished approximately 14 days later on March 27, 2025. As with other core updates, Google refined its core ranking systems to better surface relevant, satisfying content for searchers across all site types. According to Google, these changes are broad and do not target specific sites or individual web pages.",
    date: 'Mar-13 2025',
    category: 'Google update',
    section: 'Rankings',
    shownInChart: true,
  },
  {
    id: 'n12',
    title: 'December 2024 Spam Update',
    description: "This is the third spam update in 2024. It was launched just a day after Google completed the December 2024 core update. While the specific type of spam targeted by this update remains unclear, Google emphasizes that only sites violating its spam policies will be affected. The update applies globally, across all languages, and is expected to roll out over about one week.",
    date: 'Dec-19 2024',
    category: 'Google update',
    section: 'Rankings',
    shownInChart: true,
  },
  {
    id: 'n13',
    title: 'December 2024 Google Core Update',
    description: "This core update started just one week after the complete rollout of the November Core Update. According to Google, the reason behind this timing is that this update addresses different systems within the core algorithm compared to the previous one. The rollout is expected to take two weeks.",
    date: 'Dec-12 2024',
    category: 'Google update',
    section: 'Rankings',
    shownInChart: true,
  },
  {
    id: 'n14',
    title: 'November 2024 Core Update',
    description: "The third core update of 2024 started rolling out on November 11 and ended on December 5. Like other recent core updates, it was designed to promote truly useful content instead of content created for SEO purposes.",
    date: 'Nov-11 2024',
    category: 'Google update',
    section: 'Rankings',
    shownInChart: true,
  },
  {
    id: 'n15',
    title: 'August 2024 Core Update',
    description: "The purpose of this long-awaited core update is to promote useful content from smaller, independent publishers as opposed to established authoritative websites that dominated the SERPs after the September 2023 Core Update. Early evidence shows that websites severely affected by the September 2023 Core Update are recovering. The rollout may take up to a month, and, being a core update, it might affect all content types throughout all regions and languages.",
    date: 'Aug-15 2024',
    category: 'Google update',
    section: 'Rankings',
    shownInChart: true,
  },
  {
    id: 'n16',
    title: 'June 2024 Spam Update',
    description: "Much like the May Spam update, this spam update targeted websites that abused their reputation and relied only on manual actions. The update took 7 days to roll out, from June 20, 2024, to June 27, 2024.",
    date: 'Jul-01 2024',
    category: 'Google update',
    section: 'Rankings',
    shownInChart: true,
  },
  {
    id: 'n17',
    title: 'May 2024 Site Reputation Abuse Update',
    description: "This update targets top-rated websites that host third-party content lacking close oversight and offering low value to readers. This content relies on the hosting domain’s strong ranking signals and will probably not perform well in search otherwise. The update started on May 6th with manual actions. The algorithmic part of the update will follow soon.",
    date: 'May-06 2024',
    category: 'Google update',
    section: 'Rankings',
    shownInChart: true,
  },
  {
    id: 'n18',
    title: 'March 2024 Core Update',
    description: "This is the first core update of 2024. It will affect multiple core systems, making this update much more complex than the previous core algorithm updates. According to Google, the point of this update was to refine Google’s ranking systems to further emphasize the importance of quality content. The search giant now rewards more traffic to high-quality, helpful content while simultaneously demoting low-quality pages. This will have an influence on sites created to rank for very specific search queries. The rollout may take up to a month, and, being a core update, it might affect all content types throughout all regions and languages.",
    date: 'Mar-05 2024',
    category: 'Google update',
    section: 'Rankings',
    shownInChart: true,
  },
  {
    id: 'n19',
    title: 'March 2024 Spam Update',
    description: "This update combines the following three key elements: scaled content abuse, expired domain abuse, and site reputation abuse. The first targets low-value content produced in bulk that was created solely to manipulate rankings. The second element focuses on repurposing expired domains to boost the visibility of low-quality pages. After the announcement, site owners can expect both automated and manual actions to be taken in response to these spam tactics. The site reputation abuse spam update will go into effect on May 5. From then on, Google will initiate automated and manual penalties to all third-party content that is produced primarily to win rankings and lacks oversight from the website owner.",
    date: 'Mar-05 2024',
    category: 'Google update',
    section: 'Rankings',
    shownInChart: true,
  },
  {
    id: 'n20',
    title: 'November 2023 Reviews Update',
    description: "This algorithm update was released shortly after the November Core Update. It further fine tunes Google’s ability to prioritize quality review-related content in search. Google stated that this is the last time an update to the review algorithm was publicly announced. The reviews system will continue to be improved at a regular and ongoing pace, with no notifications made to the SEO community.",
    date: 'Nov-08 2023',
    category: 'Google update',
    section: 'Rankings',
    shownInChart: true,
  },
  {
    id: 'n21',
    title: 'November 2023 Core Update',
    description: "The November 2023 core update was announced on November 2, rolling out alongside the October 2023 core update aftermath. Google emphasized improvements to its primary search quality systems to surface helpful content across all topics and niches.",
    date: 'Nov-02 2023',
    category: 'Google update',
    section: 'Rankings',
    shownInChart: true,
  },
  {
    id: 'n22',
    title: 'October 2023 Spam Update',
    description: "Google rolled out the October 2023 spam update to combat cloaking, hacked sites, auto-generated spam, and scraped content in multiple languages including Turkish, Vietnamese, Indonesian, Hindi, and Chinese.",
    date: 'Oct-05 2023',
    category: 'Google update',
    section: 'Rankings',
    shownInChart: true,
  },
  {
    id: 'n23',
    title: 'October 2023 Core Update',
    description: "A major broad core algorithm update rolled out globally across all regions, aiming to reward comprehensive, authoritative web pages and demote thin affiliate content.",
    date: 'Oct-05 2023',
    category: 'Google update',
    section: 'Rankings',
    shownInChart: true,
  },
  {
    id: 'n24',
    title: 'September 2023 Helpful Content Update',
    description: "Updated Google's classifier to better identify content created primarily for search engine rankings rather than people. Relaxed guidance on AI content while strengthening penalties on third-party hosted content.",
    date: 'Sep-14 2023',
    category: 'Google update',
    section: 'Rankings',
    shownInChart: true,
  },
  {
    id: 'n25',
    title: 'August 2023 Core Update',
    description: "The second broad core algorithm update of 2023, rolling out over 16 days with widespread fluctuations across retail, tech, and informational websites.",
    date: 'Aug-22 2023',
    category: 'Google update',
    section: 'Rankings',
    shownInChart: true,
  },
  {
    id: 'n26',
    title: 'April 2023 Reviews Update',
    description: "Expanded reviews system beyond products to include services, businesses, destinations, and media, prioritizing first-hand experience and original testing.",
    date: 'Apr-12 2023',
    category: 'Google update',
    section: 'Rankings',
    shownInChart: true,
  },
  {
    id: 'n27',
    title: 'March 2023 Core Update',
    description: "First broad core update of 2023, impacting SERP features, snippet selections, and organic rankings across all global languages.",
    date: 'Mar-15 2023',
    category: 'Google update',
    section: 'Rankings',
    shownInChart: true,
  },
  {
    id: 'n28',
    title: 'February 2023 Product Reviews Update',
    description: "Applied globally to English, Spanish, German, French, Italian, Vietnamese, Indonesian, Russian, and Portuguese review pages.",
    date: 'Feb-21 2023',
    category: 'Google update',
    section: 'Rankings',
    shownInChart: true,
  },
  {
    id: 'n29',
    title: 'December 2022 Link Spam Update',
    description: "Leveraged SpamBrain AI to detect both purchased links and sites used exclusively for passing outgoing unnatural links.",
    date: 'Dec-14 2022',
    category: 'Google update',
    section: 'Rankings',
    shownInChart: true,
  },
  {
    id: 'n30',
    title: 'December 2022 Helpful Content Update',
    description: "Expanded the helpful content system globally across all languages, identifying signals of content created without genuine expert oversight.",
    date: 'Dec-05 2022',
    category: 'Google update',
    section: 'Rankings',
    shownInChart: true,
  },
  {
    id: 'n31',
    title: 'October 2022 Spam Update',
    description: "Global spam update powered by enhanced SpamBrain detection algorithms to mitigate search manipulation.",
    date: 'Oct-19 2022',
    category: 'Google update',
    section: 'Rankings',
    shownInChart: true,
  },
  {
    id: 'n32',
    title: 'September 2022 Product Reviews Update',
    description: "Fifth iteration of the product reviews update, refining criteria for high quality evaluation and comparative benchmarking.",
    date: 'Sep-20 2022',
    category: 'Google update',
    section: 'Rankings',
    shownInChart: true,
  },
  {
    id: 'n33',
    title: 'September 2022 Core Update',
    description: "Broad core algorithm adjustments finished in under two weeks with moderate volatility observed in competitive commercial verticals.",
    date: 'Sep-12 2022',
    category: 'Google update',
    section: 'Rankings',
    shownInChart: true,
  },
  {
    id: 'n34',
    title: 'August 2022 Helpful Content Update',
    description: "Introduced the site-wide signal targeting unhelpful content, rewarding creators focusing on user satisfaction over keyword stuffing.",
    date: 'Aug-25 2022',
    category: 'Google update',
    section: 'Rankings',
    shownInChart: true,
  },
  {
    id: 'n35',
    title: 'July 2022 Product Reviews Update',
    description: "Refined detection for authentic product testing, requiring evidence such as original photos, benchmarks, and quantitative measurements.",
    date: 'Jul-27 2022',
    category: 'Google update',
    section: 'Rankings',
    shownInChart: true,
  },
  {
    id: 'n36',
    title: 'May 2022 Core Update',
    description: "Broad core algorithm update that caused substantial visibility swings across ecommerce and publisher domains.",
    date: 'May-25 2022',
    category: 'Google update',
    section: 'Rankings',
    shownInChart: true,
  },
  {
    id: 'n37',
    title: 'March 2022 Product Reviews Update',
    description: "Enhanced guidance for multi-product roundup lists and direct product comparisons.",
    date: 'Mar-23 2022',
    category: 'Google update',
    section: 'Rankings',
    shownInChart: true,
  },
  {
    id: 'n38',
    title: 'December 2021 Product Reviews Update',
    description: "Added criteria rewarding verified buyer quotes, pros and cons breakdowns, and multiple merchant purchase links.",
    date: 'Dec-01 2021',
    category: 'Google update',
    section: 'Rankings',
    shownInChart: true,
  },
  {
    id: 'n39',
    title: 'November 2021 Core Update',
    description: "High impact core update released ahead of the holiday shopping season, shifting visibility across retail and SaaS platforms.",
    date: 'Nov-17 2021',
    category: 'Google update',
    section: 'Rankings',
    shownInChart: true,
  },
  {
    id: 'n40',
    title: 'November 2021 Spam Update',
    description: "Standard targeted algorithm rollout aimed at curbing web spam and low-trust link networks.",
    date: 'Nov-03 2021',
    category: 'Google update',
    section: 'Rankings',
    shownInChart: true,
  },
  {
    id: 'n41',
    title: 'July 2021 Link Spam Update',
    description: "Nullified link value from affiliate schemes, guest post campaigns, and sponsored placements lacking proper rel attributes.",
    date: 'Jul-26 2021',
    category: 'Google update',
    section: 'Rankings',
    shownInChart: true,
  },
  {
    id: 'n42',
    title: 'July 2021 Core Update',
    description: "Second installment of the two-part summer core algorithm update, stabilizing ranking redistributions from the June update.",
    date: 'Jul-01 2021',
    category: 'Google update',
    section: 'Rankings',
    shownInChart: true,
  },
  {
    id: 'n43',
    title: 'June 2021 Spam Update Part 2',
    description: "Concluded the dual-phase June spam mitigation initiative.",
    date: 'Jun-28 2021',
    category: 'Google update',
    section: 'Rankings',
    shownInChart: true,
  },
  {
    id: 'n44',
    title: 'June 2021 Spam Update Part 1',
    description: "First phase of the targeted algorithmic spam update rolled out over a single week.",
    date: 'Jun-23 2021',
    category: 'Google update',
    section: 'Rankings',
    shownInChart: true,
  },
  {
    id: 'n45',
    title: 'June 2021 Page Experience Update',
    description: "Officially incorporated Core Web Vitals (LCP, FID, CLS) and HTTPS into mobile ranking factors.",
    date: 'Jun-15 2021',
    category: 'Google update',
    section: 'Rankings',
    shownInChart: true,
  },
  {
    id: 'n46',
    title: 'June 2021 Core Update',
    description: "Part one of the summer broad core update, triggering widespread SERP recalibrations across informational queries.",
    date: 'Jun-02 2021',
    category: 'Google update',
    section: 'Rankings',
    shownInChart: true,
  },
  {
    id: 'n47',
    title: 'April 2021 Product Reviews Update',
    description: "Initial launch of the dedicated product review system to prioritize in-depth expert evaluations over thin summaries.",
    date: 'Apr-08 2021',
    category: 'Google update',
    section: 'Rankings',
    shownInChart: true,
  },
  {
    id: 'n48',
    title: 'December 2020 Core Update',
    description: "Significant global core algorithm release producing major position swings across health, finance, and ecommerce verticals.",
    date: 'Dec-03 2020',
    category: 'Google update',
    section: 'Rankings',
    shownInChart: true,
  },
  {
    id: 'n49',
    title: 'May 2020 Core Update',
    description: "Second core update of 2020, occurring during the global shift in search behavior with prominent volatility across all search sectors.",
    date: 'May-04 2020',
    category: 'Google update',
    section: 'Rankings',
    shownInChart: true,
  },
];

interface ProjectNotesModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectDomain?: string;
  siteName?: string;
  onNotesCountChange?: (count: number) => void;
  onOpenCreateNote?: (date?: string) => void;
}

export function ProjectNotesModal({
  isOpen,
  onClose,
  projectDomain,
  siteName,
  onNotesCountChange,
}: ProjectNotesModalProps) {
  const activeDomain = siteName || projectDomain || 'workcomposer.com';
  const storageKey = `se_ranking_project_notes_${activeDomain}`;

  const [notes, setNotes] = useState<NoteItem[]>(INITIAL_GOOGLE_NOTES);
  const [hasLoadedStorage, setHasLoadedStorage] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedSection, setSelectedSection] = useState('All');
  const [expandedNoteIds, setExpandedNoteIds] = useState<Record<string, boolean>>({});

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [notesPerPage, setNotesPerPage] = useState(20);

  // Notification Toast state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Create Note Modal state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [noteType, setNoteType] = useState<'project' | 'keyword'>('project');
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [newDate, setNewDate] = useState(() => {
    return new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
    });
  });
  const [newCategory, setNewCategory] = useState('SEO');
  const [newSection, setNewSection] = useState('Rankings');
  const [newShowInChart, setNewShowInChart] = useState(true);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setNotes(parsed);
          onNotesCountChange?.(parsed.length);
        }
      } else {
        localStorage.setItem(storageKey, JSON.stringify(INITIAL_GOOGLE_NOTES));
        onNotesCountChange?.(INITIAL_GOOGLE_NOTES.length);
      }
    } catch (e) {
      console.error('Failed to load notes from localStorage', e);
    }
    setHasLoadedStorage(true);
  }, [storageKey]);

  // Persist to localStorage whenever notes change
  useEffect(() => {
    if (!hasLoadedStorage) return;
    try {
      localStorage.setItem(storageKey, JSON.stringify(notes));
      onNotesCountChange?.(notes.length);
    } catch (e) {
      console.error('Failed to save notes to localStorage', e);
    }
  }, [notes, storageKey, hasLoadedStorage]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2800);
  };

  const toggleExpand = (id: string) => {
    setExpandedNoteIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleShownInChart = (id: string) => {
    setNotes((prev) =>
      prev.map((n) => {
        if (n.id === id) {
          const nextState = !n.shownInChart;
          showToast(`Note "${n.title.substring(0, 30)}..." chart visibility: ${nextState ? 'ON' : 'OFF'}`);
          return { ...n, shownInChart: nextState };
        }
        return n;
      })
    );
  };

  const handleDeleteNote = (id: string, title: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
    showToast(`Deleted "${title.substring(0, 30)}..."`);
  };

  const handleResetDefaults = () => {
    if (window.confirm('Reset all notes back to the default Google Updates list?')) {
      setNotes(INITIAL_GOOGLE_NOTES);
      showToast('Notes reset to default Google algorithm updates.');
    }
  };

  const handleExportCSV = () => {
    const headers = ['Title', 'Date', 'Category', 'Section', 'Shown In Chart', 'Description', 'External URL'];
    const rows = filteredNotes.map((n) => [
      `"${n.title.replace(/"/g, '""')}"`,
      `"${n.date}"`,
      `"${n.category}"`,
      `"${n.section}"`,
      n.shownInChart ? 'Yes' : 'No',
      `"${n.description.replace(/"/g, '""')}"`,
      `"${n.externalUrl || ''}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${activeDomain}_notes_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Exported notes to CSV successfully.');
  };

  // Dynamic Categories from all current notes
  const availableCategories = useMemo(() => {
    const cats = new Set(notes.map((n) => n.category));
    return ['All', ...Array.from(cats)];
  }, [notes]);

  // Filtered Notes
  const filteredNotes = useMemo(() => {
    return notes.filter((n) => {
      const q = search.trim().toLowerCase();
      const matchesSearch =
        !q ||
        n.title.toLowerCase().includes(q) ||
        n.description.toLowerCase().includes(q) ||
        n.section.toLowerCase().includes(q) ||
        n.category.toLowerCase().includes(q) ||
        n.date.toLowerCase().includes(q);

      const matchesCategory = selectedCategory === 'All' || n.category === selectedCategory;
      const matchesSection = selectedSection === 'All' || n.section === selectedSection;

      return matchesSearch && matchesCategory && matchesSection;
    });
  }, [notes, search, selectedCategory, selectedSection]);

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(filteredNotes.length / notesPerPage));
  const activePage = Math.min(currentPage, totalPages);
  const startIndex = (activePage - 1) * notesPerPage;
  const endIndex = Math.min(startIndex + notesPerPage, filteredNotes.length);
  const paginatedNotes = filteredNotes.slice(startIndex, endIndex);

  // Reset page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedCategory, selectedSection, notesPerPage]);

  const handleCreateNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const item: NoteItem = {
      id: `custom_${Date.now()}`,
      title: newTitle.trim(),
      description: newDesc.trim() || 'Custom optimization note for project tracking.',
      date:
        newDate.trim() ||
        new Date().toLocaleDateString('en-US', {
          month: 'short',
          day: '2-digit',
          year: 'numeric',
        }),
      category: noteType === 'project' ? newCategory || 'Project' : 'Keyword',
      section: newSection,
      shownInChart: newShowInChart,
      externalUrl: newUrl.trim() || undefined,
    };

    setNotes([item, ...notes]);
    setIsCreateOpen(false);
    setNewTitle('');
    setNewDesc('');
    setNewUrl('');
    showToast(`Created note "${item.title.substring(0, 30)}..." successfully!`);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-3 md:p-6 animate-in fade-in duration-150 font-sans"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl h-[92vh] max-h-[820px] flex flex-col overflow-hidden border border-gray-200 animate-in zoom-in-95 duration-150 relative">
        {/* Floating Toast Notification inside Modal */}
        {toastMessage && (
          <div className="absolute top-4 right-14 z-50 bg-[#1E293B] text-white px-3.5 py-2 rounded-lg shadow-lg text-xs font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-top-2 border border-gray-700">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Top Header */}
        <div className="px-6 py-3.5 border-b border-gray-200 flex items-center justify-between select-none bg-white">
          <div className="flex items-center gap-2.5">
            <span className="font-bold text-gray-900 text-sm">{activeDomain}</span>
            <span className="text-gray-300">/</span>
            <span className="text-gray-700 font-semibold text-sm">Notes</span>
            <span className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full font-bold">
              {notes.length} total
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleExportCSV}
              className="hidden sm:flex items-center gap-1.5 text-xs text-gray-600 hover:text-gray-900 font-medium px-2.5 py-1 rounded hover:bg-gray-100 transition-colors cursor-pointer"
              title="Export notes to CSV"
            >
              <Download className="w-3.5 h-3.5 text-gray-500" />
              <span>Export CSV</span>
            </button>

            <button
              type="button"
              onClick={handleResetDefaults}
              className="hidden sm:flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-800 font-medium px-2 py-1 rounded hover:bg-gray-100 transition-colors cursor-pointer"
              title="Reset default updates"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
              title="Close notes"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Action Controls Bar */}
        <div className="px-6 py-3 border-b border-gray-100 bg-gray-50/70 flex items-center justify-between gap-3 flex-wrap text-xs select-none">
          <div className="flex items-center gap-2.5 flex-1 min-w-[260px]">
            {/* Search Input */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-lg w-full max-w-xs focus-within:border-[#7C3AED] shadow-2xs">
              <Search className="w-3.5 h-3.5 text-gray-400 shrink-0" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search notes, algorithms, dates..."
                className="w-full text-xs text-gray-800 placeholder:text-gray-400 bg-transparent focus:outline-hidden"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="text-gray-400 hover:text-gray-600 p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Select category */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs text-gray-700 font-medium focus:outline-hidden focus:border-[#7C3AED] cursor-pointer shadow-2xs"
            >
              <option value="All">All Categories ({notes.length})</option>
              {availableCategories
                .filter((c) => c !== 'All')
                .map((cat) => (
                  <option key={cat} value={cat}>
                    {cat} ({notes.filter((n) => n.category === cat).length})
                  </option>
                ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsCreateOpen(true)}
              className="px-4 py-2 bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded-lg text-xs font-bold shadow-2xs flex items-center gap-1.5 transition-all cursor-pointer hover:shadow-xs active:scale-98"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create a note</span>
            </button>
          </div>
        </div>

        {/* Notes Table */}
        <div className="flex-1 overflow-y-auto">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-600 font-semibold border-b border-gray-200 text-left select-none sticky top-0 bg-gray-50 z-10 shadow-2xs">
                <th className="py-2.5 px-6">Title &amp; Details</th>
                <th className="py-2.5 px-4 w-32">Date</th>
                <th className="py-2.5 px-4 w-36">Category</th>
                <th className="py-2.5 px-4 w-28">Section</th>
                <th className="py-2.5 px-4 w-32 text-center">Shown in chart</th>
                <th className="py-2.5 px-4 w-16 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginatedNotes.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-gray-400">
                    <FileText className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                    <p className="font-semibold text-gray-600">No notes found</p>
                    <p className="text-[11px] text-gray-400 mt-1">
                      {search ? `Try adjusting your search for "${search}"` : 'Create your first project note above'}
                    </p>
                  </td>
                </tr>
              ) : (
                paginatedNotes.map((note) => {
                  const isExpanded = !!expandedNoteIds[note.id];
                  return (
                    <tr key={note.id} className="hover:bg-blue-50/20 transition-colors group">
                      <td className="py-3.5 px-6 align-top">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-gray-900 text-[13px]">{note.title}</span>
                          {note.externalUrl && (
                            <a
                              href={note.externalUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-blue-500 hover:text-blue-700"
                              title="Open external link"
                            >
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                        <div className="text-gray-600 mt-1 leading-relaxed text-xs">
                          {isExpanded || note.description.length <= 160
                            ? note.description
                            : `${note.description.substring(0, 160)}...`}
                        </div>
                        {note.description.length > 160 && (
                          <button
                            type="button"
                            onClick={() => toggleExpand(note.id)}
                            className="text-[#7C3AED] hover:underline font-semibold text-[11px] mt-1 cursor-pointer inline-flex items-center gap-0.5"
                          >
                            <span>{isExpanded ? 'Show less' : 'Show more'}</span>
                            {isExpanded ? (
                              <ChevronUp className="w-3 h-3" />
                            ) : (
                              <ChevronDown className="w-3 h-3" />
                            )}
                          </button>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-gray-600 align-top whitespace-nowrap font-medium">
                        {note.date}
                      </td>
                      <td className="py-3.5 px-4 text-gray-700 align-top whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded text-[11px] font-semibold border ${
                            note.category === 'Google update'
                              ? 'bg-amber-50 text-amber-800 border-amber-200'
                              : note.category === 'SEO'
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : note.category === 'Project'
                              ? 'bg-purple-50 text-purple-700 border-purple-200'
                              : note.category === 'Keyword'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-gray-100 text-gray-800 border-gray-200'
                          }`}
                        >
                          {note.category}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-gray-600 align-top whitespace-nowrap font-medium">
                        {note.section}
                      </td>
                      <td className="py-3.5 px-4 text-center align-top whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => toggleShownInChart(note.id)}
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border transition-all cursor-pointer ${
                            note.shownInChart
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                              : 'bg-gray-100 text-gray-400 border-gray-200 hover:bg-gray-200'
                          }`}
                          title={`Click to toggle chart visibility (${note.shownInChart ? 'Shown' : 'Hidden'})`}
                        >
                          {note.shownInChart && <Check className="w-3 h-3" />}
                          <span>{note.shownInChart ? 'On' : 'Off'}</span>
                        </button>
                      </td>
                      <td className="py-3.5 px-4 text-center align-top whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => handleDeleteNote(note.id, note.title)}
                          className="p-1 rounded text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                          title="Delete note"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Dynamic Table Footer with Real Pagination */}
        <div className="px-6 py-3 border-t border-gray-200 bg-gray-50 flex items-center justify-between text-xs text-gray-600 select-none flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <span>
              Showing{' '}
              <strong className="text-gray-900 font-semibold">
                {filteredNotes.length === 0 ? 0 : startIndex + 1} - {endIndex}
              </strong>{' '}
              of <strong className="text-gray-900 font-semibold">{filteredNotes.length}</strong> notes
            </span>

            {/* Jump to Page */}
            <div className="flex items-center gap-1.5 ml-3">
              <span className="text-gray-500">Go to page:</span>
              <select
                value={activePage}
                onChange={(e) => setCurrentPage(Number(e.target.value))}
                className="bg-white border border-gray-300 rounded px-2 py-0.5 text-xs text-gray-900 font-bold focus:outline-hidden focus:border-[#7C3AED] cursor-pointer"
              >
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Notes per page */}
            <div className="flex items-center gap-1.5">
              <span className="text-gray-500">Notes per page:</span>
              <select
                value={notesPerPage}
                onChange={(e) => setNotesPerPage(Number(e.target.value))}
                className="bg-white border border-gray-300 rounded px-2 py-0.5 text-xs text-gray-900 font-bold focus:outline-hidden focus:border-[#7C3AED] cursor-pointer"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>

            {/* Next / Prev Controls */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={activePage <= 1}
                className="p-1 rounded border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                title="Previous page"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>

              <span className="px-2 font-semibold text-gray-700">
                {activePage} / {totalPages}
              </span>

              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={activePage >= totalPages}
                className="p-1 rounded border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                title="Next page"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Create Note Sub-Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-60 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6 space-y-4 border border-gray-200 animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="flex items-center justify-between pb-1">
              <h4 className="font-bold text-gray-900 text-base">Create a note</h4>
              <button
                type="button"
                onClick={() => setIsCreateOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer p-1"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Segmented Control Pill: [ PROJECT NOTE | KEYWORD NOTE ] */}
            <div className="flex bg-[#EFEFF4] p-1 rounded-full text-xs font-bold tracking-wide select-none">
              <button
                type="button"
                onClick={() => setNoteType('project')}
                className={`flex-1 py-1.5 px-4 rounded-full text-center transition-all cursor-pointer ${
                  noteType === 'project'
                    ? 'bg-[#484263] text-white shadow-xs'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                PROJECT NOTE
              </button>
              <button
                type="button"
                onClick={() => setNoteType('keyword')}
                className={`flex-1 py-1.5 px-4 rounded-full text-center transition-all cursor-pointer ${
                  noteType === 'keyword'
                    ? 'bg-[#484263] text-white shadow-xs'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                KEYWORD NOTE
              </button>
            </div>

            <form onSubmit={handleCreateNote} className="space-y-4 pt-1">
              {/* Note Title */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Note title:</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Launched new landing page or algorithm shift"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-lg text-xs text-gray-800 focus:outline-none focus:border-[#7C3AED] transition-colors"
                />
              </div>

              {/* Note Text */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1.5">Note text:</label>
                <textarea
                  rows={4}
                  placeholder="Add detailed notes, expected impact, changes made..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-lg text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#7C3AED] resize-none leading-relaxed transition-colors"
                />
              </div>

              {/* Category & Section Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Category:</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-lg text-xs text-gray-800 focus:outline-none focus:border-[#7C3AED] cursor-pointer"
                  >
                    <option value="SEO">SEO</option>
                    <option value="Content">Content</option>
                    <option value="Technical">Technical</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Competitors">Competitors</option>
                    <option value="Google update">Google update</option>
                    <option value="Project">Project</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Section:</label>
                  <select
                    value={newSection}
                    onChange={(e) => setNewSection(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-lg text-xs text-gray-800 focus:outline-none focus:border-[#7C3AED] cursor-pointer"
                  >
                    <option value="Rankings">Rankings</option>
                    <option value="Competitors">Competitors</option>
                    <option value="Overview">Overview</option>
                    <option value="Analytics">Analytics</option>
                    <option value="Site Audit">Site Audit</option>
                    <option value="Backlinks">Backlinks</option>
                  </select>
                </div>
              </div>

              {/* External URL + Date Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">External URL:</label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={newUrl}
                    onChange={(e) => setNewUrl(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-lg text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#7C3AED] transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Date:</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={newDate}
                      onChange={(e) => setNewDate(e.target.value)}
                      className="w-full px-3.5 py-2.5 pl-9 bg-white border border-gray-300 rounded-lg text-xs text-gray-800 focus:outline-none focus:border-[#7C3AED] transition-colors"
                    />
                    <Calendar className="w-4 h-4 text-gray-400 absolute left-3 top-2.5 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Show in chart toggle */}
              <label className="flex items-center gap-2.5 text-xs text-gray-700 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={newShowInChart}
                  onChange={(e) => setNewShowInChart(e.target.checked)}
                  className="rounded text-[#7C3AED] focus:ring-[#7C3AED] w-4 h-4"
                />
                <span className="font-medium">Show this note marker on tracking charts</span>
              </label>

              {/* Info Helper Note */}
              <div className="flex items-center gap-2 text-xs text-gray-500 py-1">
                <Info className="w-4 h-4 text-gray-400 shrink-0" />
                <span>This note will appear on the &quot;Detailed&quot; chart and historical timeline.</span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-xs font-bold text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#7C3AED] hover:bg-[#6D28D9] text-white rounded-lg text-xs font-bold shadow-xs transition-colors cursor-pointer"
                >
                  Create note
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
