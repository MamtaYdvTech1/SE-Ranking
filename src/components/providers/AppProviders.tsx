'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ProjectData, AnalysisOverview } from '@/lib/types';
import { getSectionFromPathname } from '@/lib/navigation';
import { useAuth } from '@/context/AuthContext';

export type RailSection =
  | 'projects'
  | 'research'
  | 'backlinks'
  | 'audit'
  | 'ai-search'
  | 'reports'
  | 'content'
  | 'local'
  | 'agency'
  | 'api'
  | 'smm'
  | 'settings';

interface AppContextType {
  activeProject: ProjectData | null;
  setActiveProject: (p: ProjectData | null) => void;
  projects: ProjectData[];
  refreshProjects: () => Promise<void>;
  currentAnalysis: AnalysisOverview | null;
  setCurrentAnalysis: (a: AnalysisOverview | null) => void;
  activeRail: RailSection;
  setActiveRail: (r: RailSection) => void;
  isSidebarCollapsed: boolean;
  setIsSidebarCollapsed: (c: boolean) => void;
  isMobileDrawerOpen: boolean;
  setIsMobileDrawerOpen: (o: boolean) => void;
  hasCreatedProject: boolean;
  setHasCreatedProject: (v: boolean) => void;
  isAddWebsiteModalOpen: boolean;
  setIsAddWebsiteModalOpen: (o: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function useApp(): AppContextType {
  const context = useContext(AppContext);
  if (!context) {
    return {
      activeProject: null,
      setActiveProject: () => {},
      projects: [],
      refreshProjects: async () => {},
      currentAnalysis: null,
      setCurrentAnalysis: () => {},
      activeRail: 'projects',
      setActiveRail: () => {},
      isSidebarCollapsed: false,
      setIsSidebarCollapsed: () => {},
      isMobileDrawerOpen: false,
      setIsMobileDrawerOpen: () => {},
      hasCreatedProject: false,
      setHasCreatedProject: () => {},
      isAddWebsiteModalOpen: false,
      setIsAddWebsiteModalOpen: () => {},
    };
  }
  return context;
}

export function AppProviders({ children }: { children: React.ReactNode }) {
  const { user, isLoading: isAuthLoading } = useAuth();
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 5,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  const [projects, setProjects] = useState<ProjectData[]>([]);
  const [activeProject, setActiveProjectState] = useState<ProjectData | null>(null);
  const [currentAnalysis, setCurrentAnalysis] = useState<AnalysisOverview | null>(null);
  const pathname = usePathname();
  const [activeRail, setActiveRail] = useState<RailSection>(() => {
    const sec = getSectionFromPathname(pathname);
    return (sec as RailSection) || 'projects';
  });

  useEffect(() => {
    if (pathname) {
      const section = getSectionFromPathname(pathname);
      if (section) {
        setActiveRail(section as RailSection);
      }
    }
  }, [pathname]);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [hasCreatedProject, setHasCreatedProjectState] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('se_ranking_has_project');
      if (stored !== null) return stored === 'true';
    }
    return false;
  });
  const [isAddWebsiteModalOpen, setIsAddWebsiteModalOpen] = useState(false);

  const setHasCreatedProject = (v: boolean) => {
    setHasCreatedProjectState(v);
    if (typeof window !== 'undefined') {
      localStorage.setItem('se_ranking_has_project', v ? 'true' : 'false');
    }
  };

  const setActiveProject = (p: ProjectData | null) => {
    queryClient.clear();
    setActiveProjectState(p);
    if (typeof window !== 'undefined') {
      if (p) {
        localStorage.setItem('se_ranking_active_project_id', p.id);
        localStorage.setItem('se_ranking_has_project', 'true');
        setHasCreatedProjectState(true);
      } else {
        localStorage.removeItem('se_ranking_active_project_id');
        localStorage.setItem('se_ranking_has_project', 'false');
        setHasCreatedProjectState(false);
      }
      window.dispatchEvent(new CustomEvent('seranking_project_change', { detail: p }));
    }
  };

  const refreshProjects = async () => {
    if (!user) {
      setProjects([]);
      setActiveProjectState(null);
      setHasCreatedProjectState(false);
      return;
    }
    try {
      const res = await fetch('/api/projects');
      if (res.ok) {
        const data = await res.json();
        const fetched: ProjectData[] = data.projects && Array.isArray(data.projects) ? data.projects : [];
        setProjects(fetched);

        if (fetched.length > 0) {
          const savedId = typeof window !== 'undefined' ? localStorage.getItem('se_ranking_active_project_id') : null;
          const matched = savedId ? fetched.find((p) => p.id === savedId) : null;
          const current = matched || fetched[0];
          setActiveProjectState(current);
          setHasCreatedProjectState(true);
          if (typeof window !== 'undefined') {
            localStorage.setItem('se_ranking_has_project', 'true');
            if (current) {
              localStorage.setItem('se_ranking_active_project_id', current.id);
            }
          }
        } else {
          setActiveProjectState(null);
          setHasCreatedProjectState(false);
          if (typeof window !== 'undefined') {
            localStorage.setItem('se_ranking_has_project', 'false');
            localStorage.removeItem('se_ranking_active_project_id');
          }
        }
      } else {
        setProjects([]);
        setActiveProjectState(null);
        setHasCreatedProjectState(false);
        if (typeof window !== 'undefined') {
          localStorage.setItem('se_ranking_has_project', 'false');
          localStorage.removeItem('se_ranking_active_project_id');
        }
      }
    } catch {
      setProjects([]);
      setActiveProjectState(null);
      setHasCreatedProjectState(false);
      if (typeof window !== 'undefined') {
        localStorage.setItem('se_ranking_has_project', 'false');
        localStorage.removeItem('se_ranking_active_project_id');
      }
    }
  };

  useEffect(() => {
    if (user) {
      refreshProjects();
    } else if (!isAuthLoading) {
      setProjects([]);
      setActiveProjectState(null);
      setHasCreatedProjectState(false);
    }

    const handleAuthChange = () => {
      if (user) {
        refreshProjects();
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('seranking_auth_change', handleAuthChange);
      return () => {
        window.removeEventListener('seranking_auth_change', handleAuthChange);
      };
    }
  }, [user, isAuthLoading]);

  return (
    <QueryClientProvider client={queryClient}>
      <AppContext.Provider
        value={{
          activeProject,
          setActiveProject,
          projects,
          refreshProjects,
          currentAnalysis,
          setCurrentAnalysis,
          activeRail,
          setActiveRail,
          isSidebarCollapsed,
          setIsSidebarCollapsed,
          isMobileDrawerOpen,
          setIsMobileDrawerOpen,
          hasCreatedProject,
          setHasCreatedProject,
          isAddWebsiteModalOpen,
          setIsAddWebsiteModalOpen,
        }}
      >
        {children}
      </AppContext.Provider>
    </QueryClientProvider>
  );
}
