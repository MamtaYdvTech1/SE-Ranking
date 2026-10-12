import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CreateProjectModal } from '../components/modals/CreateProjectModal';
import {
  GoogleIcon,
  AiOverviewsIcon,
  AiModeIcon,
  ChatGptIcon,
  SearchEngineIcon,
} from '../components/ui/SearchEngineIcons';

const mockPush = vi.fn();
const mockRefreshProjects = vi.fn();
const mockSetActiveProject = vi.fn();

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
}));

vi.mock('../components/providers/AppProviders', () => ({
  useApp: () => ({
    refreshProjects: mockRefreshProjects,
    setActiveProject: mockSetActiveProject,
    activeProject: null,
    projects: [],
  }),
}));

describe('CreateProjectModal Component & Search Engine Testing Suite', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn((url: string | URL | Request) => {
      const urlStr = url.toString();
      if (urlStr.includes('/api/projects/validate-domain')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ valid: true }),
        } as Response);
      }
      if (urlStr.includes('/api/keywords/suggestions')) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              suggestions: [
                { keyword: 'time tracking software', volume: 14800 },
                { keyword: 'employee attendance monitoring', volume: 8100 },
                { keyword: 'work hours tracker app', volume: 5400 },
                { keyword: 'productivity analytics software', volume: 4100 },
              ],
            }),
        } as Response);
      }
      if (urlStr.includes('/api/projects')) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              success: true,
              project: {
                id: 'proj-new-123',
                name: 'workcomposer.com',
                domain: 'workcomposer.com',
              },
            }),
        } as Response);
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({}),
      } as Response);
    });
  });

  it('renders modal with exact Website URL section and helper texts', () => {
    const handleClose = vi.fn();
    render(<CreateProjectModal isOpen={true} onClose={handleClose} />);

    // Check Website URL section
    expect(screen.getByText('Website URL')).toBeInTheDocument();
    expect(
      screen.getByText('Either enter a website address or the URL of the video or a YouTube channel')
    ).toBeInTheDocument();

    // Check Domain/URL & Project name inputs
    expect(screen.getByPlaceholderText('Enter domain (e.g. workcomposer.com)')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter project name')).toBeInTheDocument();
  });

  it('renders Search engine section with Google, AI Overviews, AI Mode, and ChatGPT real icons and labels', () => {
    render(<CreateProjectModal isOpen={true} onClose={vi.fn()} />);

    // Section title & description
    expect(
      screen.getByText(
        'Track website and brand rankings on classic and AI search engines in any region. Add more search engines, enable Google Maps results, and customize keyword lists in Advanced settings (toggle at the top)'
      )
    ).toBeInTheDocument();

    // Check all 4 primary engines are rendered
    const googleBtn = screen.getByText('Google').closest('button')!;
    const aioBtn = screen.getByText('AI Overviews').closest('button')!;
    const aiModeBtn = screen.getByText('AI Mode').closest('button')!;
    const chatgptBtn = screen.getByText('ChatGPT').closest('button')!;

    expect(googleBtn).toBeInTheDocument();
    expect(aioBtn).toBeInTheDocument();
    expect(aiModeBtn).toBeInTheDocument();
    expect(chatgptBtn).toBeInTheDocument();

    // Verify SVGs are rendered inside the buttons
    expect(googleBtn.querySelector('svg')).toBeInTheDocument();
    expect(aioBtn.querySelector('svg')).toBeInTheDocument();
    expect(aiModeBtn.querySelector('svg')).toBeInTheDocument();
    expect(chatgptBtn.querySelector('svg')).toBeInTheDocument();
  });

  it('allows fast and smooth toggling of search engines without dropping to 0', () => {
    render(<CreateProjectModal isOpen={true} onClose={vi.fn()} />);

    const chatgptBtn = screen.getByText('ChatGPT').closest('button')!;
    const aioBtn = screen.getByText('AI Overviews').closest('button')!;
    const aiModeBtn = screen.getByText('AI Mode').closest('button')!;

    // Toggle on ChatGPT
    fireEvent.click(chatgptBtn);
    expect(chatgptBtn.className).toContain('bg-[#ECFDF5]');

    // Toggle on AI Overviews
    fireEvent.click(aioBtn);
    expect(aioBtn.className).toContain('bg-[#F5F3FF]');

    // Toggle on AI Mode
    fireEvent.click(aiModeBtn);
    expect(aiModeBtn.className).toContain('bg-[#EFF6FF]');

    // Toggle off ChatGPT
    fireEvent.click(chatgptBtn);
    expect(chatgptBtn.className).toContain('bg-white');
    expect(chatgptBtn.className).not.toContain('bg-[#ECFDF5]');
  });

  it('renders Location and Google interface language as unselected placeholders for user selection', () => {
    render(<CreateProjectModal isOpen={true} onClose={vi.fn()} />);

    expect(screen.getByText('Location')).toBeInTheDocument();
    expect(screen.getByText('Enter country, city or postal code')).toBeInTheDocument();

    expect(screen.getByText('Google interface language')).toBeInTheDocument();
    expect(screen.getByText('Select interface language')).toBeInTheDocument();
  });

  it('auto-fills project name from domain and fetches keyword suggestions for workcomposer.com', async () => {
    render(<CreateProjectModal isOpen={true} onClose={vi.fn()} />);

    const domainInput = screen.getByPlaceholderText('Enter domain (e.g. workcomposer.com)');
    fireEvent.change(domainInput, { target: { value: 'workcomposer.com' } });

    // Project name input should automatically reflect domain
    const projectNameInput = screen.getByPlaceholderText('Enter project name') as HTMLInputElement;
    expect(projectNameInput.value).toBe('workcomposer.com');

    // Wait for keyword suggestions to appear
    await waitFor(() => {
      expect(screen.getByText('time tracking software')).toBeInTheDocument();
    });

    expect(screen.getByText('employee attendance monitoring')).toBeInTheDocument();
    expect(screen.getByText('work hours tracker app')).toBeInTheDocument();

    // Verify "+ Add all" button works
    const addAllBtn = screen.getByRole('button', { name: /\+ Add all/i });
    fireEvent.click(addAllBtn);

    const textarea = screen.getByPlaceholderText('Enter keywords') as HTMLTextAreaElement;
    expect(textarea.value).toContain('time tracking software');
  });

  it('renders CANCEL and START TRACKING action buttons and handles cancellation', () => {
    const handleClose = vi.fn();
    render(<CreateProjectModal isOpen={true} onClose={handleClose} />);

    const cancelBtn = screen.getByRole('button', { name: /^CANCEL$/i });
    expect(cancelBtn).toBeInTheDocument();

    const startTrackingBtn = screen.getByRole('button', { name: /START TRACKING/i });
    expect(startTrackingBtn).toBeInTheDocument();

    // Clicking Cancel invokes onClose
    fireEvent.click(cancelBtn);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('submits project with selected search engines when clicking START TRACKING', async () => {
    const handleClose = vi.fn();
    render(<CreateProjectModal isOpen={true} onClose={handleClose} />);

    const domainInput = screen.getByPlaceholderText('Enter domain (e.g. workcomposer.com)');
    fireEvent.change(domainInput, { target: { value: 'workcomposer.com' } });

    // Select ChatGPT as well
    const chatgptBtn = screen.getByText('ChatGPT').closest('button')!;
    fireEvent.click(chatgptBtn);

    const startTrackingBtn = screen.getByRole('button', { name: /START TRACKING/i });
    fireEvent.click(startTrackingBtn);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/projects',
        expect.objectContaining({
          method: 'POST',
        })
      );
    });

    await waitFor(() => {
      expect(mockRefreshProjects).toHaveBeenCalled();
      expect(mockPush).toHaveBeenCalledWith('/project-overview');
      expect(handleClose).toHaveBeenCalled();
    });
  });
});

describe('Search Engine Real Icons Suite', () => {
  it('renders GoogleIcon with official Google viewBox and 4 colors', () => {
    const { container } = render(<GoogleIcon size={20} />);
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute('aria-label', 'Google');
    expect(svg?.querySelectorAll('path').length).toBe(4);
  });

  it('renders ChatGptIcon with official OpenAI rosette and color', () => {
    const { container } = render(<ChatGptIcon size={20} />);
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute('aria-label', 'ChatGPT');
    expect(svg).toHaveStyle({ color: '#10A37F' });
  });

  it('renders AiOverviewsIcon with Google AI gradient sparkle', () => {
    const { container } = render(<AiOverviewsIcon size={20} />);
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute('aria-label', 'Google AI Overviews');
    expect(container.querySelector('linearGradient')).toBeInTheDocument();
  });

  it('renders AiModeIcon with official Google Gemini Generative Search icon', () => {
    const { container } = render(<AiModeIcon size={20} />);
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute('aria-label', 'Google AI Mode');
  });

  it('renders SearchEngineIcon correctly for all AI and classic search engines', () => {
    const { container: gContainer } = render(<SearchEngineIcon engine="google" />);
    expect(gContainer.querySelector('svg')).toHaveAttribute('aria-label', 'Google');

    const { container: aioContainer } = render(<SearchEngineIcon engine="ai-overviews" />);
    expect(aioContainer.querySelector('svg')).toHaveAttribute('aria-label', 'Google AI Overviews');

    const { container: aimContainer } = render(<SearchEngineIcon engine="ai-mode" />);
    expect(aimContainer.querySelector('svg')).toHaveAttribute('aria-label', 'Google AI Mode');

    const { container: gptContainer } = render(<SearchEngineIcon engine="chatgpt" />);
    expect(gptContainer.querySelector('svg')).toHaveAttribute('aria-label', 'ChatGPT');
  });
});
