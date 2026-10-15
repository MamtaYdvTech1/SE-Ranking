'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import {
  Upload,
  Check,
  Info,
  ChevronDown,
  Building2,
  Plus,
  ShieldCheck,
  ExternalLink,
  Code2,
  Trash2,
  Search,
  Users,
  Eye,
  EyeOff,
  FileText,
  Mail,
  Sliders,
  Send,
  X,
  Sparkles,
  RotateCcw,
  RotateCw,
  Bold,
  Italic,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  ListOrdered,
  Quote,
  Link as LinkIcon,
} from 'lucide-react';
import { ReportBugModal } from '@/components/modals/ReportBugModal';
import { SEReportBuilderEditor } from '@/components/reports/SEReportBuilderEditor';

export type AgencyViewTab =
  | 'interface-customization'
  | 'personal-domain-names'
  | 'login-page'
  | 'email-settings'
  | 'report-builder'
  | 'lead-generator'
  | 'lead-widgets'
  | 'lead-leads'
  | 'lead-settings'
  | 'users';

export interface LeadWidget {
  id: string;
  name: string;
  type: 'Button' | 'Pop-up' | 'Push notification' | 'Webform' | 'Modal window';
  targetDomain: string;
  created: string;
  leadsCount: number;
  status: 'Active' | 'Paused';
  color?: string;
  text?: string;
  position?: string;
}

interface UserSeat {
  id: string;
  index: number;
  name: string;
  email: string;
  role: 'Owner' | 'Manager' | 'Analyst' | 'Viewer';
}

const LANGUAGES = [
  { code: 'en', name: 'English', flag: 'US' },
  { code: 'de', name: 'Deutsch', flag: 'DE' },
  { code: 'nl', name: 'Nederlands', flag: 'NL' },
  { code: 'fr', name: 'Français', flag: 'FR' },
  { code: 'it', name: 'Italiano', flag: 'IT' },
  { code: 'pt', name: 'Português', flag: 'PT' },
  { code: 'es', name: 'Español', flag: 'ES' },
  { code: 'pl', name: 'Polski', flag: 'PL' },
  { code: 'uk', name: 'Українська', flag: 'UA' },
];

function CountryFlag({ country }: { country: string }) {
  switch (country) {
    case 'US':
      return (
        <svg viewBox="0 0 640 480" className="w-[18px] h-[13px] rounded-[2px] shadow-2xs border border-[#CBD5E1] shrink-0">
          <path fill="#bd3d44" d="M0 0h640v480H0z"/>
          <path stroke="#fff" strokeWidth="37" d="M0 55.5h640M0 129.5h640M0 203.5h640M0 277.5h640M0 351.5h640M0 425.5h640"/>
          <path fill="#192f5d" d="M0 0h256v258.5H0z"/>
          <g fill="#fff">
            <circle cx="28" cy="23" r="8"/>
            <circle cx="70" cy="23" r="8"/>
            <circle cx="112" cy="23" r="8"/>
            <circle cx="154" cy="23" r="8"/>
            <circle cx="196" cy="23" r="8"/>
            <circle cx="238" cy="23" r="8"/>
            <circle cx="49" cy="52" r="8"/>
            <circle cx="91" cy="52" r="8"/>
            <circle cx="133" cy="52" r="8"/>
            <circle cx="175" cy="52" r="8"/>
            <circle cx="217" cy="52" r="8"/>
            <circle cx="28" cy="81" r="8"/>
            <circle cx="70" cy="81" r="8"/>
            <circle cx="112" cy="81" r="8"/>
            <circle cx="154" cy="81" r="8"/>
            <circle cx="196" cy="81" r="8"/>
            <circle cx="238" cy="81" r="8"/>
            <circle cx="49" cy="110" r="8"/>
            <circle cx="91" cy="110" r="8"/>
            <circle cx="133" cy="110" r="8"/>
            <circle cx="175" cy="110" r="8"/>
            <circle cx="217" cy="110" r="8"/>
            <circle cx="28" cy="139" r="8"/>
            <circle cx="70" cy="139" r="8"/>
            <circle cx="112" cy="139" r="8"/>
            <circle cx="154" cy="139" r="8"/>
            <circle cx="196" cy="139" r="8"/>
            <circle cx="238" cy="139" r="8"/>
          </g>
        </svg>
      );
    case 'DE':
      return (
        <svg viewBox="0 0 640 480" className="w-[18px] h-[13px] rounded-[2px] shadow-2xs border border-[#CBD5E1] shrink-0">
          <path fill="#000" d="M0 0h640v160H0z"/>
          <path fill="#d00" d="M0 160h640v160H0z"/>
          <path fill="#ffce00" d="M0 320h640v160H0z"/>
        </svg>
      );
    case 'NL':
      return (
        <svg viewBox="0 0 640 480" className="w-[18px] h-[13px] rounded-[2px] shadow-2xs border border-[#CBD5E1] shrink-0">
          <path fill="#ae1c28" d="M0 0h640v160H0z"/>
          <path fill="#fff" d="M0 160h640v160H0z"/>
          <path fill="#21468b" d="M0 320h640v160H0z"/>
        </svg>
      );
    case 'FR':
      return (
        <svg viewBox="0 0 640 480" className="w-[18px] h-[13px] rounded-[2px] shadow-2xs border border-[#CBD5E1] shrink-0">
          <path fill="#002654" d="M0 0h213.3v480H0z"/>
          <path fill="#fff" d="M213.3 0h213.4v480H213.3z"/>
          <path fill="#ce1126" d="M426.7 0H640v480H426.7z"/>
        </svg>
      );
    case 'IT':
      return (
        <svg viewBox="0 0 640 480" className="w-[18px] h-[13px] rounded-[2px] shadow-2xs border border-[#CBD5E1] shrink-0">
          <path fill="#009246" d="M0 0h213.3v480H0z"/>
          <path fill="#fff" d="M213.3 0h213.4v480H213.3z"/>
          <path fill="#ce2b37" d="M426.7 0H640v480H426.7z"/>
        </svg>
      );
    case 'PT':
      return (
        <svg viewBox="0 0 640 480" className="w-[18px] h-[13px] rounded-[2px] shadow-2xs border border-[#CBD5E1] shrink-0">
          <path fill="#046a38" d="M0 0h256v480H0z"/>
          <path fill="#da291c" d="M256 0h384v480H256z"/>
          <circle cx="256" cy="240" r="75" fill="#fed100"/>
          <circle cx="256" cy="240" r="45" fill="#fff"/>
          <path fill="#da291c" d="M238 215h36v36c0 14-9 22-18 22s-18-8-18-22v-36z"/>
        </svg>
      );
    case 'ES':
      return (
        <svg viewBox="0 0 640 480" className="w-[18px] h-[13px] rounded-[2px] shadow-2xs border border-[#CBD5E1] shrink-0">
          <path fill="#aa151b" d="M0 0h640v120H0zm0 360h640v120H0z"/>
          <path fill="#f1bf00" d="M0 120h640v240H0z"/>
        </svg>
      );
    case 'PL':
      return (
        <svg viewBox="0 0 640 480" className="w-[18px] h-[13px] rounded-[2px] shadow-2xs border border-[#CBD5E1] shrink-0">
          <path fill="#fff" d="M0 0h640v240H0z"/>
          <path fill="#dc143c" d="M0 240h640v240H0z"/>
        </svg>
      );
    case 'UA':
      return (
        <svg viewBox="0 0 640 480" className="w-[18px] h-[13px] rounded-[2px] shadow-2xs border border-[#CBD5E1] shrink-0">
          <path fill="#0057b7" d="M0 0h640v240H0z"/>
          <path fill="#ffd700" d="M0 240h640v240H0z"/>
        </svg>
      );
    default:
      return (
        <div className="w-[18px] h-[13px] rounded-[2px] bg-slate-200 border border-[#CBD5E1]" />
      );
  }
}

function AgencyPackContent({ initialTab = 'interface-customization' }: { initialTab?: AgencyViewTab }) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const tabParam = searchParams ? (searchParams.get('tab') as AgencyViewTab) : null;
  const [activeTab, setActiveTab] = useState<AgencyViewTab>(tabParam || initialTab);

  useEffect(() => {
    if (tabParam && tabParam !== activeTab) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  // Hash listener for admin.user.whitelabel.html#/ and admin.lead_generator.html#/
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.replace('#/', '').replace('#', '').trim();
      const isLeadPath = typeof window !== 'undefined' && window.location.pathname.includes('lead_generator');
      const isWhiteLabelPath = typeof window !== 'undefined' && window.location.pathname.includes('whitelabel');

      if (hash === 'widgets' || hash === 'widget' || hash === 'lead-widgets') {
        setActiveTab('lead-widgets');
      } else if (hash === 'start' || hash === 'lead-generator') {
        setActiveTab('lead-generator');
      } else if (hash === 'leads' || hash === 'lead-leads') {
        setActiveTab('lead-leads');
      } else if (hash === 'settings' || hash === 'lead-settings') {
        setActiveTab('lead-settings');
      } else if (hash === 'reports' || hash === 'report-builder') {
        setActiveTab('report-builder');
      } else if (hash === 'interface-customization') {
        setActiveTab('interface-customization');
      } else if (
        hash === 'personal-domain-names' ||
        hash === 'login-page' ||
        hash === 'login' ||
        hash === 'email-settings' ||
        hash === 'users'
      ) {
        if (hash === 'login') {
          setActiveTab('login-page');
        } else {
          setActiveTab(hash as AgencyViewTab);
        }
      } else if (!hash) {
        if (isLeadPath) {
          setActiveTab('lead-generator');
        } else if (isWhiteLabelPath) {
          setActiveTab('interface-customization');
        }
      }
    };
    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  // Modal states
  const [isBugReportOpen, setIsBugReportOpen] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // ==========================================
  // TAB 1: LOGIN PAGE STATE (Screenshots 1 & 2)
  // ==========================================
  const [loginLogoUrl, setLoginLogoUrl] = useState<string | null>(null);
  const [showCompanyNameOnLogin, setShowCompanyNameOnLogin] = useState(true);
  const [loginColorScheme, setLoginColorScheme] = useState<'dark' | 'light'>('dark');
  const [showLiveHelpWidgets, setShowLiveHelpWidgets] = useState(true);
  const [loginPageLanguage, setLoginPageLanguage] = useState('English');
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);
  const [isLoginModified, setIsLoginModified] = useState(false);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 100 * 1024) {
        alert('File size exceeds 100KB limit.');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        setLoginLogoUrl(base64);
        setIsLoginModified(true);
        // Note: Notification text removed per user request
      };
      reader.readAsDataURL(file);
    }
  };

  const handleResetLoginSettings = async () => {
    setLoginLogoUrl(null);
    setShowCompanyNameOnLogin(true);
    setLoginColorScheme('dark');
    setShowLiveHelpWidgets(true);
    setLoginPageLanguage('English');
    setIsLoginModified(false);
    try {
      await fetch('/api/agency-pack/whitelabel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          loginLogoUrl: null,
          showCompanyNameOnLogin: true,
          loginColorScheme: 'dark',
          showLiveHelpWidgets: true,
          loginPageLanguage: 'English',
        }),
      });
      showToast('Login page settings reset to default.');
    } catch (err) {
      console.error('Error resetting login settings:', err);
    }
  };

  const handleApplyLoginChanges = async () => {
    try {
      const res = await fetch('/api/agency-pack/whitelabel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          loginLogoUrl,
          showCompanyNameOnLogin,
          loginColorScheme,
          showLiveHelpWidgets,
          loginPageLanguage,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setIsLoginModified(false);
        showToast('Login page settings successfully applied!');
      }
    } catch (err) {
      console.error('Failed to apply login settings:', err);
    }
  };

  // ==========================================
  // TAB 2: INTERFACE CUSTOMIZATION STATE (Real Backend)
  // ==========================================
  const [headerName, setHeaderName] = useState('SE Ranking');
  const [headerLogoUrl, setHeaderLogoUrl] = useState<string | null>(null);
  const [companyName, setCompanyName] = useState('SE Ranking');
  const [selectedColor, setSelectedColor] = useState('#1976D2');
  const [customColor, setCustomColor] = useState('1976D2');
  const [footerLogoUrl, setFooterLogoUrl] = useState<string | null>(null);
  const [footerName, setFooterName] = useState('SE Ranking');
  const [showFooterLinks, setShowFooterLinks] = useState(true);
  const [useCustomLinks, setUseCustomLinks] = useState(false);
  const [faviconUrl, setFaviconUrl] = useState<string | null>(null);
  const [customLinks, setCustomLinks] = useState([
    { id: '1', label: 'Report a bug', url: '' },
    { id: '2', label: 'Affiliates', url: 'https://seranking.com/affiliate.html' },
    { id: '3', label: 'API', url: 'https://seranking.com/api.html' },
    { id: '4', label: "What's new", url: 'https://seranking.com/whats-new.html' },
    { id: '5', label: 'Help', url: '' },
  ]);
  const [isInterfaceModified, setIsInterfaceModified] = useState(false);
  const [isSavingInterface, setIsSavingInterface] = useState(false);

  // Exact 8 system colors matching user HTML
  const systemColors = [
    '#1976D2',
    '#093885',
    '#F39C12',
    '#8E44AD',
    '#E74C3C',
    '#2C3E50',
    '#27AE60',
    '#0BA8B3',
  ];

  // Load from backend on mount
  useEffect(() => {
    fetch('/api/agency-pack/whitelabel')
      .then((res) => res.json())
      .then((res) => {
        if (res.data) {
          const d = res.data;
          setHeaderName(d.headerName || 'SE Ranking');
          setHeaderLogoUrl(d.headerLogo || null);
          setCompanyName(d.companyName || 'SE Ranking');
          setSelectedColor(d.selectedColor || '#1976D2');
          setCustomColor(d.customColor || '1976D2');
          setFooterLogoUrl(d.footerLogo === 'default_se_ranking_icon' ? null : d.footerLogo);
          setFooterName(d.footerName || 'SE Ranking');
          setShowFooterLinks(d.showFooterLinks ?? true);
          setUseCustomLinks(d.useCustomLinks ?? false);
          if (d.customLinks && d.customLinks.length > 0) {
            setCustomLinks(d.customLinks);
          }
          setFaviconUrl(d.favicon || null);
          if (d.loginLogoUrl !== undefined) setLoginLogoUrl(d.loginLogoUrl);
          if (d.showCompanyNameOnLogin !== undefined) setShowCompanyNameOnLogin(d.showCompanyNameOnLogin);
          if (d.loginColorScheme !== undefined) setLoginColorScheme(d.loginColorScheme);
          if (d.showLiveHelpWidgets !== undefined) setShowLiveHelpWidgets(d.showLiveHelpWidgets);
          if (d.loginPageLanguage !== undefined) setLoginPageLanguage(d.loginPageLanguage);
          if (d.smtpHost) setSmtpHost(d.smtpHost);
          if (d.smtpPort) setSmtpPort(d.smtpPort);
          if (d.smtpSenderEmail) setSmtpSenderEmail(d.smtpSenderEmail);
          if (d.smtpSenderName) setSmtpSenderName(d.smtpSenderName);
          if (d.useCustomEmailTemplate !== undefined) setUseCustomEmailTemplate(d.useCustomEmailTemplate);
        }
      })
      .catch((err) => console.error('Error fetching whitelabel config:', err));
  }, []);

  const handleUploadImage = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: 'header' | 'footer' | 'favicon'
  ) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 100 * 1024) {
        alert('File size exceeds 100KB limit.');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        if (type === 'header') setHeaderLogoUrl(base64);
        if (type === 'footer') setFooterLogoUrl(base64);
        if (type === 'favicon') setFaviconUrl(base64);
        setIsInterfaceModified(true);
        showToast(`${type.charAt(0).toUpperCase() + type.slice(1)} logo updated. Click Apply Changes to save.`);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleApplyInterfaceChanges = async () => {
    setIsSavingInterface(true);
    try {
      const res = await fetch('/api/agency-pack/whitelabel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          headerName,
          headerLogo: headerLogoUrl,
          companyName,
          selectedColor,
          customColor,
          footerLogo: footerLogoUrl || 'default_se_ranking_icon',
          footerName,
          showFooterLinks,
          useCustomLinks,
          customLinks,
          favicon: faviconUrl,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setIsInterfaceModified(false);
        showToast('White label settings successfully applied!');
      }
    } catch (err) {
      console.error('Failed to save settings:', err);
      showToast('Error saving settings');
    } finally {
      setIsSavingInterface(false);
    }
  };

  const handleResetInterfaceSettings = async () => {
    try {
      const res = await fetch('/api/agency-pack/whitelabel', { method: 'PUT' });
      const data = await res.json();
      if (data.success) {
        setHeaderName('SE Ranking');
        setHeaderLogoUrl(null);
        setCompanyName('SE Ranking');
        setSelectedColor('#1976D2');
        setCustomColor('1976D2');
        setFooterLogoUrl(null);
        setFooterName('SE Ranking');
        setShowFooterLinks(true);
        setUseCustomLinks(false);
        setCustomLinks([
          { id: '1', label: 'Report a bug', url: '' },
          { id: '2', label: 'Affiliates', url: 'https://seranking.com/affiliate.html' },
          { id: '3', label: 'API', url: 'https://seranking.com/api.html' },
          { id: '4', label: "What's new", url: 'https://seranking.com/whats-new.html' },
          { id: '5', label: 'Help', url: '' },
        ]);
        setFaviconUrl(null);
        setIsInterfaceModified(false);
        showToast('White label settings reset to default.');
      }
    } catch (err) {
      console.error('Failed to reset settings:', err);
    }
  };

  // ==========================================
  // TAB 3: PERSONAL DOMAIN NAMES STATE
  // ==========================================
  const [domainInput, setDomainInput] = useState('');
  const [isSslActive, setIsSslActive] = useState(false);
  const [sslVerifying, setSslVerifying] = useState(false);

  const handleActivateSsl = () => {
    if (!domainInput.trim()) return;
    setSslVerifying(true);
    setTimeout(() => {
      setSslVerifying(false);
      setIsSslActive(true);
      showToast(`SSL Certificate issued and active for ${domainInput.trim()}!`);
    }, 1200);
  };

  // ==========================================
  // TAB 4: EMAIL SETTINGS STATE (Real Backend & Google App Password)
  // ==========================================
  const [useCustomEmailTemplate, setUseCustomEmailTemplate] = useState(true);
  const [smtpHost, setSmtpHost] = useState('smtp.gmail.com');
  const [smtpPort, setSmtpPort] = useState('587');
  const [smtpSenderEmail, setSmtpSenderEmail] = useState('reports@seranking.com');
  const [smtpSenderName, setSmtpSenderName] = useState('SE Ranking Reports');
  const [smtpPassword, setSmtpPassword] = useState('');
  const [showSmtpPassword, setShowSmtpPassword] = useState(false);
  const [smtpAuth, setSmtpAuth] = useState(true);
  const [isTestingSmtp, setIsTestingSmtp] = useState(false);
  const [isEmailModified, setIsEmailModified] = useState(false);

  // Email Template states matching mobile screenshot
  const [usePreconfiguredTemplate, setUsePreconfiguredTemplate] = useState(true);
  const [emailLogoUrl, setEmailLogoUrl] = useState<string | null>(null);
  const [emailFromName, setEmailFromName] = useState('');
  const [emailReplyTo, setEmailReplyTo] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailHeader, setEmailHeader] = useState('<p style="font-size: 18px; font-weight: normal; color: #26303a; margin: 0; margin-bottom: 20px;"> Hello! </p>');
  const [emailBody, setEmailBody] = useState('Attached you will find your report on {site}.\n\nArmed with this insight data, you will be able to further improve your website promotion strategy. For detailed analytical reports on your site, visit your project page.');
  const [emailComment, setEmailComment] = useState("If you want to learn more about using the Report Builder, read our Help article.\n\nHere's to higher rankings,\nThe SE Ranking Team");
  const [emailFooter, setEmailFooter] = useState(`<div style="font-size: 18px; font-weight: normal; color: #26303a; margin: 0; margin-bottom: 20px;">\n<a href="https://seranking.com/affiliate.html">Affiliate Program</a> | <a href="https://help.seranking.com/faq">FAQ</a>\n</div>\n<div style="padding: 0; padding-top: 20px; border-top: 1px solid #d7dbdc;">\n<div style="margin-bottom: 20px;">SE Ranking Ltd.</div>\n</div>`);
  const [emailUseOwnSmtp, setEmailUseOwnSmtp] = useState(true);
  const [emailDataManual, setEmailDataManual] = useState(false);
  const [isPreviewEmailOpen, setIsPreviewEmailOpen] = useState(false);

  const handleApplyEmailSettings = async () => {
    try {
      const res = await fetch('/api/agency-pack/whitelabel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          smtpHost,
          smtpPort,
          smtpSenderName,
          smtpSenderEmail,
          smtpPassword,
          useCustomEmailTemplate,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setIsEmailModified(false);
        showToast('Email settings successfully saved with Google App Password!');
      }
    } catch (err) {
      console.error('Failed to save email settings:', err);
      showToast('Error saving email settings');
    }
  };

  const handleTestSmtpConnection = async () => {
    setIsTestingSmtp(true);
    try {
      const res = await fetch('/api/email/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: smtpSenderEmail,
          host: smtpHost,
          port: smtpPort,
          user: smtpSenderEmail,
          pass: smtpPassword,
        }),
      });
      const data = await res.json();
      showToast(data.message || 'SMTP Google App Password connection tested!');
    } catch (err) {
      console.error('Failed to test SMTP:', err);
      showToast('SMTP test finished');
    } finally {
      setIsTestingSmtp(false);
    }
  };

  // ==========================================
  // TAB 5: REPORT BUILDER (WHITE LABEL) STATE (Real Backend)
  // ==========================================
  const [rbHeaderLogo, setRbHeaderLogo] = useState<string | null>(null);
  const [rbCompanyName, setRbCompanyName] = useState('SE Ranking');
  const [rbHeaderColor, setRbHeaderColor] = useState('#1976D2');
  const [rbCustomHeaderColor, setRbCustomHeaderColor] = useState('1976D2');
  const [rbHeaderTextColor, setRbHeaderTextColor] = useState('FFFFFF');
  const [rbCoverLogo, setRbCoverLogo] = useState<string | null>('default_se_ranking');
  const [rbCoverBackground, setRbCoverBackground] = useState<string | null>(null);
  const [rbCoverTextColor, setRbCoverTextColor] = useState('232A32');
  const [rbOrientation, setRbOrientation] = useState<'portrait' | 'landscape'>('portrait');
  const [rbPreviewMode, setRbPreviewMode] = useState<'header' | 'cover'>('header');
  const [isRbModified, setIsRbModified] = useState(false);
  const [isSavingRb, setIsSavingRb] = useState(false);
  const [showRbBanner, setShowRbBanner] = useState(true);
  const [rbSubView, setRbSubView] = useState<'editor' | 'whitelabel'>('editor');

  // Load Report Builder config from backend
  useEffect(() => {
    fetch('/api/agency-pack/report-builder')
      .then((res) => res.json())
      .then((res) => {
        if (res.data) {
          const d = res.data;
          setRbHeaderLogo(d.headerLogo || null);
          setRbCompanyName(d.companyName || 'SE Ranking');
          setRbHeaderColor(d.headerColor || '#1976D2');
          setRbCustomHeaderColor(d.customHeaderColor || '1976D2');
          setRbHeaderTextColor(d.headerTextColor || 'FFFFFF');
          setRbCoverLogo(d.coverPageLogo || 'default_se_ranking');
          setRbCoverBackground(d.coverPageBackground || null);
          setRbCoverTextColor(d.coverPageTextColor || '232A32');
          setRbOrientation(d.orientation || 'portrait');
        }
      })
      .catch((err) => console.error('Error fetching Report Builder config:', err));
  }, []);

  const handleUploadRbImage = async (
    e: React.ChangeEvent<HTMLInputElement>,
    type: 'headerLogo' | 'coverLogo' | 'coverBg'
  ) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const maxKb = type === 'coverBg' ? 1024 : 100;
      if (file.size > maxKb * 1024) {
        showToast(`File size exceeds ${maxKb}KB limit.`);
        return;
      }

      showToast('Uploading file to server...');
      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', type);

        const res = await fetch('/api/agency-pack/upload-logo', {
          method: 'POST',
          body: formData,
        });
        const result = await res.json();

        if (result.success && result.url) {
          const uploadedUrl = result.url;
          if (type === 'headerLogo') {
            setRbHeaderLogo(uploadedUrl);
            setRbPreviewMode('header');
          } else if (type === 'coverLogo') {
            setRbCoverLogo(uploadedUrl);
            setRbPreviewMode('cover');
          } else if (type === 'coverBg') {
            setRbCoverBackground(uploadedUrl);
            setRbPreviewMode('cover');
          }
          setIsRbModified(true);
          showToast('Image uploaded successfully to server!');

          // Real backend auto-save
          await fetch('/api/agency-pack/report-builder', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              [type === 'headerLogo'
                ? 'headerLogo'
                : type === 'coverLogo'
                ? 'coverPageLogo'
                : 'coverPageBackground']: uploadedUrl,
            }),
          });
        } else {
          showToast(result.error || 'Upload failed');
        }
      } catch (err) {
        console.error('Error uploading file:', err);
        showToast('Upload failed. Please check network connection.');
      }
    }
  };

  const handleApplyRbChanges = async () => {
    setIsSavingRb(true);
    try {
      const res = await fetch('/api/agency-pack/report-builder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          headerLogo: rbHeaderLogo,
          companyName: rbCompanyName,
          headerColor: rbHeaderColor,
          customHeaderColor: rbCustomHeaderColor,
          headerTextColor: rbHeaderTextColor,
          coverPageLogo: rbCoverLogo,
          coverPageBackground: rbCoverBackground,
          coverPageTextColor: rbCoverTextColor,
          orientation: rbOrientation,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setIsRbModified(false);
        showToast('Report Builder settings successfully applied!');
      }
    } catch (err) {
      console.error('Failed to save settings:', err);
      showToast('Error saving settings');
    } finally {
      setIsSavingRb(false);
    }
  };

  const handleResetRbSettings = async () => {
    try {
      const res = await fetch('/api/agency-pack/report-builder', { method: 'PUT' });
      const data = await res.json();
      if (data.success) {
        setRbHeaderLogo(null);
        setRbCompanyName('SE Ranking');
        setRbHeaderColor('#1976D2');
        setRbCustomHeaderColor('1976D2');
        setRbHeaderTextColor('FFFFFF');
        setRbCoverLogo('default_se_ranking');
        setRbCoverBackground(null);
        setRbCoverTextColor('232A32');
        setRbOrientation('portrait');
        setIsRbModified(false);
        showToast('Report Builder settings reset to default.');
      }
    } catch (err) {
      console.error('Failed to reset settings:', err);
    }
  };

  // ==========================================
  // TAB 6 & 7: LEAD GENERATOR STATE (Real Backend)
  // ==========================================
  const [widgets, setWidgets] = useState<LeadWidget[]>([]);
  const [isAddWidgetModalOpen, setIsAddWidgetModalOpen] = useState(false);
  const [isAvailableWidgetsOpen, setIsAvailableWidgetsOpen] = useState(true);
  const [newWidgetName, setNewWidgetName] = useState('');
  const [newWidgetType, setNewWidgetType] = useState<LeadWidget['type']>('Button');
  const [newWidgetDomain, setNewWidgetDomain] = useState('https://mywebsite.com');
  const [newWidgetColor, setNewWidgetColor] = useState('#0B69FF');
  const [newWidgetText, setNewWidgetText] = useState('Get Free SEO Audit');
  const [newWidgetPosition, setNewWidgetPosition] = useState('Bottom Right');
  const [embedModalWidget, setEmbedModalWidget] = useState<LeadWidget | null>(null);

  // Load widgets from backend API on mount
  useEffect(() => {
    fetch('/api/agency-pack/lead-generator/widgets')
      .then((res) => res.json())
      .then((json) => {
        if (json.success && json.data?.widgets) {
          setWidgets(json.data.widgets);
        }
      })
      .catch((err) => console.error('Error fetching lead widgets:', err));
  }, []);

  const handleOpenAddWidgetModal = (type: LeadWidget['type']) => {
    setNewWidgetType(type);
    setNewWidgetName(`${type} Widget`);
    setIsAddWidgetModalOpen(true);
  };

  const handleCreateWidget = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const finalType = newWidgetType;
    const nameToSave = newWidgetName.trim() || `${finalType} Widget`;
    const domainToSave = newWidgetDomain.trim() || 'https://mywebsite.com';

    const payload = {
      name: nameToSave,
      type: finalType,
      targetDomain: domainToSave,
      color: newWidgetColor,
      text: newWidgetText,
      position: newWidgetPosition,
      created: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      leadsCount: 0,
      status: 'Active',
    };

    try {
      const res = await fetch('/api/agency-pack/lead-generator/widgets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success && data.allWidgets) {
        setWidgets(data.allWidgets);
      } else if (data.data) {
        setWidgets((prev) => [...prev, data.data]);
      }
      setIsAddWidgetModalOpen(false);
      showToast(`Widget "${nameToSave}" created successfully!`);
    } catch {
      const fallback: LeadWidget = {
        id: `widget_${Date.now()}`,
        name: nameToSave,
        type: finalType,
        targetDomain: domainToSave,
        color: newWidgetColor,
        text: newWidgetText,
        position: newWidgetPosition,
        created: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        leadsCount: 0,
        status: 'Active',
      };
      setWidgets((prev) => [...prev, fallback]);
      setIsAddWidgetModalOpen(false);
      showToast(`Widget "${nameToSave}" created!`);
    }
  };

  const handleDeleteWidget = async (id: string) => {
    try {
      const res = await fetch(`/api/agency-pack/lead-generator/widgets?id=${id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success && data.allWidgets) {
        setWidgets(data.allWidgets);
      } else {
        setWidgets((prev) => prev.filter((w) => w.id !== id));
      }
      showToast('Widget removed successfully.');
    } catch {
      setWidgets((prev) => prev.filter((w) => w.id !== id));
      showToast('Widget removed.');
    }
  };

  // ==========================================
  // TAB 8: USERS STATE
  // ==========================================
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState<'Manager' | 'Analyst' | 'Viewer'>('Manager');
  const [usersList, setUsersList] = useState<UserSeat[]>([
    {
      id: 'u-1',
      index: 1,
      name: 'Suraj Vishwakarma',
      email: 'suraj.vishwakarma@gvilab.com',
      role: 'Owner',
    },
  ]);

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserEmail.trim()) return;

    if (usersList.length >= 3) {
      alert('You have reached the maximum 3 user seats for your current plan.');
      return;
    }

    const newUser: UserSeat = {
      id: `u-${Date.now()}`,
      index: usersList.length + 1,
      name: newUserName.trim(),
      email: newUserEmail.trim(),
      role: newUserRole,
    };

    setUsersList([...usersList, newUser]);
    setNewUserName('');
    setNewUserEmail('');
    setIsAddUserModalOpen(false);
    showToast(`Invitation sent to ${newUser.email}!`);
  };

  const getBreadcrumbTitle = () => {
    switch (activeTab) {
      case 'login-page':
        return 'Login page';
      case 'interface-customization':
        return 'Interface customization';
      case 'personal-domain-names':
        return 'Personal domain names';
      case 'email-settings':
        return 'Email settings';
      case 'report-builder':
        return 'Report Builder';
      case 'lead-generator':
        return 'Start';
      case 'lead-widgets':
        return 'Widgets';
      case 'users':
        return 'Users';
      default:
        return 'Login page';
    }
  };

  return (
    <div className="flex-1 min-h-screen bg-white text-[#1E293B] flex flex-col justify-between font-sans relative">
      {/* Toast notification banner */}
      {toastMessage && (
        <div className="fixed top-14 right-6 z-50 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="bg-[#10B981] text-white px-4 py-2.5 rounded-lg shadow-xl text-xs font-semibold flex items-center gap-2">
            <Check className="w-4 h-4 text-white stroke-[3]" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

      <div>

        {/* Top Breadcrumb Bar matching Screenshot 1 */}
        {activeTab !== 'report-builder' &&
          activeTab !== 'lead-generator' &&
          activeTab !== 'lead-widgets' && (
          <div className="flex items-center justify-between px-8 py-3.5 border-b border-[#E2E8F0] bg-white">
            <div className="flex items-center gap-2 text-xs text-[#64748B]">
              <Link href="/settings" className="hover:text-[#0B69FF] transition-colors">
                Settings
              </Link>
              <span className="text-[#94A3B8]">›</span>
              {activeTab.startsWith('lead') ? (
                <span className="font-normal text-[#64748B]">Lead Generator</span>
              ) : (
                <Link
                  href="/agency-pack?tab=interface-customization"
                  className="hover:text-[#0B69FF] transition-colors"
                >
                  White Label
                </Link>
              )}
              <span className="text-[#94A3B8]">›</span>
              <span className="text-[#1E293B] font-medium">{getBreadcrumbTitle()}</span>
            </div>

            <button
              onClick={() => setIsFeedbackOpen(true)}
              className="text-xs text-[#0B69FF] hover:text-[#0052D4] font-medium transition-colors cursor-pointer"
            >
              Feedback
            </button>
          </div>
        )}

        {/* ============================================================== */}
        {/* VIEW 1: LOGIN PAGE (Exact match to Screenshots 1 & 2)           */}
        {/* ============================================================== */}
        {activeTab === 'login-page' && (
          <div className="p-8 max-w-4xl mx-auto space-y-6">
            {/* Title with info icon */}
            <div className="flex items-center gap-2">
              <h1 className="text-[22px] font-bold text-[#1E293B]">Login page</h1>
              <div className="relative group cursor-pointer">
                <div className="w-4 h-4 rounded-full border border-[#94A3B8] text-[#94A3B8] flex items-center justify-center text-[10px] italic font-serif">
                  i
                </div>
                <div className="absolute left-6 top-1/2 -translate-y-1/2 hidden group-hover:block bg-[#1E293B] text-white text-[11px] rounded py-1 px-2.5 whitespace-nowrap shadow-lg z-20">
                  Customize the appearance and branding of your White Label login page
                </div>
              </div>
            </div>

            {/* APPEARENCE SETTINGS: */}
            <div className="space-y-4 pt-1">
              <div className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">
                APPEARENCE SETTINGS:
              </div>

              {/* Login logo */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-[#1E293B]">Login logo:</label>
                <div className="flex items-center gap-4">
                  {/* Logo preview card with origami ribbons */}
                  <div className="w-[88px] h-[76px] bg-white border border-[#CBD5E1] rounded-[4px] flex items-center justify-center p-2 shadow-2xs">
                    {loginLogoUrl ? (
                      <img src={loginLogoUrl} alt="Logo" className="max-h-full max-w-full object-contain" />
                    ) : (
                      <svg width="42" height="42" viewBox="0 0 32 32" fill="none">
                        <path
                          d="M19.2618 8.02075L14.6489 12.6337C13.7654 13.5172 12.5667 14.0138 11.3171 14.0138H0L12.6275 1.38638C12.8748 1.139 13.2103 1 13.5604 1H18.6116C19.1841 1 19.6482 1.46412 19.6482 2.03662V7.08779C19.6482 7.43789 19.5092 7.77338 19.2618 8.02075Z"
                          fill="#0B69FF"
                        />
                        <path
                          d="M11.1871 29.8199V24.2221C11.1871 23.6496 10.723 23.1855 10.1505 23.1855H4.55273L11.7097 16.0286C12.5931 15.1451 13.7919 14.6484 15.0415 14.6484H26.3585L11.1871 29.8199Z"
                          fill="#0B69FF"
                        />
                      </svg>
                    )}
                  </div>

                  {/* UPDATE LOGO Button & Caption */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-[#F8FAFC] border border-[#CBD5E1] text-[#1E293B] rounded-[4px] text-xs font-bold uppercase tracking-wider cursor-pointer shadow-2xs transition-colors">
                        <Upload className="w-3.5 h-3.5 text-[#1E293B]" />
                        <span>UPDATE LOGO</span>
                        <input
                          type="file"
                          accept=".jpg,.jpeg,.png,.webp,.gif"
                          className="hidden"
                          onChange={handleLogoUpload}
                        />
                      </label>
                      {loginLogoUrl && (
                        <button
                          type="button"
                          onClick={() => {
                            setLoginLogoUrl(null);
                            setIsLoginModified(true);
                          }}
                          className="w-8 h-8 rounded-[4px] border border-[#CBD5E1] hover:border-red-300 bg-white hover:bg-red-50 text-[#EF4444] flex items-center justify-center shadow-2xs transition-colors cursor-pointer"
                          title="Delete logo"
                        >
                          <Trash2 className="w-4 h-4 text-[#EF4444]" />
                        </button>
                      )}
                    </div>
                    <p className="text-[11px] text-[#64748B] italic">
                      Must be JPEG, PNG, WEBP or GIF and cannot exceed 100KB.
                    </p>
                  </div>
                </div>
              </div>

              {/* Show company name on login page */}
              <div className="space-y-1.5 pt-2">
                <label className="block text-xs font-semibold text-[#1E293B]">
                  Show your company name on the login page:
                </label>
                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCompanyNameOnLogin(!showCompanyNameOnLogin);
                      setIsLoginModified(true);
                    }}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-hidden ${
                      showCompanyNameOnLogin ? 'bg-[#0B69FF]' : 'bg-[#CBD5E1]'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-xs transition duration-200 ${
                        showCompanyNameOnLogin ? 'translate-x-4' : 'translate-x-0'
                      }`}
                    />
                  </button>
                  <span className="text-xs font-medium text-[#1E293B]">
                    {showCompanyNameOnLogin ? 'On' : 'Off'}
                  </span>
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-[#E2E8F0] my-5" />

            {/* COLOR SCHEME */}
            <div className="space-y-2.5">
              <div className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">
                COLOR SCHEME
              </div>
              <div className="flex items-center gap-2.5">
                {/* Dark scheme square #2C3A5B */}
                <button
                  type="button"
                  onClick={() => {
                    setLoginColorScheme('dark');
                    setIsLoginModified(true);
                  }}
                  className={`w-7 h-7 rounded-[4px] bg-[#2C3A5B] cursor-pointer transition-all ${
                    loginColorScheme === 'dark'
                      ? 'ring-2 ring-offset-2 ring-[#0B69FF]'
                      : 'border border-[#CBD5E1]'
                  }`}
                  title="Dark Scheme"
                />
                {/* Light scheme square #FFFFFF */}
                <button
                  type="button"
                  onClick={() => {
                    setLoginColorScheme('light');
                    setIsLoginModified(true);
                  }}
                  className={`w-7 h-7 rounded-[4px] bg-white border border-[#334155] cursor-pointer transition-all ${
                    loginColorScheme === 'light' ? 'ring-2 ring-offset-2 ring-[#0B69FF]' : ''
                  }`}
                  title="Light Scheme"
                />
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-[#E2E8F0] my-5" />

            {/* Live help and Feedback widgets */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[#1E293B]">
                Show Live help and Feedback widgets:
              </label>
              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setShowLiveHelpWidgets(!showLiveHelpWidgets);
                    setIsLoginModified(true);
                  }}
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-hidden ${
                    showLiveHelpWidgets ? 'bg-[#0B69FF]' : 'bg-[#CBD5E1]'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-xs transition duration-200 ${
                      showLiveHelpWidgets ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
                <span className="text-xs font-medium text-[#1E293B]">
                  {showLiveHelpWidgets ? 'On' : 'Off'}
                </span>
              </div>
            </div>

            {/* Page language dropdown with real country flags matching Screenshot 2 & 3 */}
            <div className="space-y-1.5 pt-1">
              <label className="block text-xs font-semibold text-[#1E293B]">Page language:</label>
              <div className="max-w-[280px] relative">
                {/* Trigger Button */}
                <button
                  type="button"
                  onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
                  className="w-full flex items-center justify-between px-3 py-2 bg-white border border-[#CBD5E1] hover:border-[#94A3B8] rounded-[4px] text-xs text-[#1E293B] cursor-pointer transition-colors shadow-2xs"
                >
                  <div className="flex items-center gap-2.5">
                    <CountryFlag country={LANGUAGES.find((l) => l.name === loginPageLanguage)?.flag || 'US'} />
                    <span className="font-normal">{loginPageLanguage}</span>
                  </div>
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-[#64748B] transition-transform duration-200 ${
                      isLangDropdownOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {/* Dropdown panel popping up above trigger */}
                {isLangDropdownOpen && (
                  <div className="absolute z-30 bottom-full mb-1 w-full bg-white border border-[#CBD5E1] rounded-[4px] shadow-lg max-h-56 overflow-y-auto py-1 animate-in fade-in duration-100">
                    {LANGUAGES.map((lang) => (
                      <button
                        key={lang.code}
                        type="button"
                        onClick={() => {
                          setLoginPageLanguage(lang.name);
                          setIsLoginModified(true);
                          setIsLangDropdownOpen(false);
                        }}
                        className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs text-left cursor-pointer transition-colors ${
                          loginPageLanguage === lang.name
                            ? 'bg-[#EBF5FF] text-[#0B69FF] font-semibold'
                            : 'text-[#1E293B] hover:bg-[#F8FAFC]'
                        }`}
                      >
                        <CountryFlag country={lang.flag} />
                        <span>{lang.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons matching Screenshot 2 */}
            <div className="flex items-center gap-3 pt-6">
              <button
                type="button"
                onClick={handleResetLoginSettings}
                className="px-4 py-2 border border-[#CBD5E1] hover:bg-[#F8FAFC] text-[#475569] rounded-[4px] text-xs font-bold uppercase tracking-wider cursor-pointer shadow-2xs transition-colors"
              >
                RESET SETTINGS
              </button>
              <button
                type="button"
                disabled={!isLoginModified}
                onClick={handleApplyLoginChanges}
                className={`px-5 py-2 rounded-[4px] text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-2xs transition-colors ${
                  isLoginModified
                    ? 'bg-[#0B69FF] hover:bg-[#0052D4] text-white cursor-pointer'
                    : 'bg-[#E2E8F0] text-[#94A3B8] cursor-not-allowed'
                }`}
              >
                <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>APPLY CHANGES</span>
              </button>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* VIEW 2: INTERFACE CUSTOMIZATION                                */}
        {/* ============================================================== */}
        {activeTab === 'interface-customization' && (
          <div className="section-template section-wrapper__section-content p-6 sm:p-8 max-w-5xl mx-auto font-sans text-[#1E293B]">
            <div className="section-wrapper__content">
              <div className="white-label vue-app">
                <div className="section-wrap interface-customization-section space-y-6">
                  
                  {/* Heading */}
                  <div className="section-wrap__heading flex items-center gap-1.5 text-xl font-medium text-[#1E293B]">
                    <span>Interface customization</span>
                    <div className="se-hint-element-2 se-hint-title-2">
                      <div className="se-hint-element-2__wrapper">
                        <span className="w-4 h-4 rounded-full bg-[#E2E8F0] text-[#64748B] flex items-center justify-center text-[11px] font-serif cursor-help" title="Customize your header, colors, footer and favicon">
                          i
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="section-wrap__content space-y-6">
                    {/* 1. Header settings */}
                    <div className="sub-section sub-section_border border-b border-[#E2E8F0] pb-6 space-y-4">
                      <div className="sub-section__title text-[13px] font-bold text-[#1E293B]">Header settings</div>
                      <div className="sub-section__content">
                        <div className="interface-customization-section__content space-y-4">
                          <div className="input-wrap space-y-1.5">
                            <label className="input-wrap__label block text-[13px] text-[#1E293B]">Header name:</label>
                            <div className="se-input-2 header-name-input max-w-md">
                              <input
                                className="w-full px-3.5 py-2 border border-[#CBD5E1] rounded-[4px] text-[13px] text-[#1E293B] outline-hidden focus:border-[#0B69FF]"
                                type="text"
                                value={headerName}
                                onChange={(e) => {
                                  setHeaderName(e.target.value);
                                  setIsInterfaceModified(true);
                                }}
                              />
                            </div>
                          </div>

                          <div className="input-wrap space-y-1.5">
                            <div className="image-uploader">
                              <div className="image-uploader__title text-[13px] text-[#1E293B] mb-1.5">Header logo:</div>
                              <div className="image-uploader-inner flex items-start gap-4">
                                <div className="image-uploader__view w-28 h-16 bg-[#0B69FF] rounded-[4px] flex items-center justify-center p-2 shrink-0 shadow-2xs overflow-hidden">
                                  {headerLogoUrl ? (
                                    <img className="max-h-full max-w-full object-contain" src={headerLogoUrl} alt="Header logo" />
                                  ) : (
                                    <img className="max-h-full max-w-full object-contain" src="https://online.seranking.com/skin/img/logo/logo_small_white.svg" alt="SE Ranking Logo" />
                                  )}
                                </div>
                                <div className="image-uploader__controls space-y-1">
                                  <label className="inline-flex items-center gap-2 px-3.5 py-2 bg-white hover:bg-[#F8FAFC] border border-[#CBD5E1] text-[#1E293B] rounded-[4px] text-[11px] font-bold uppercase tracking-wider cursor-pointer shadow-2xs transition-colors">
                                    <Upload className="w-3.5 h-3.5 text-[#0F172A]" />
                                    <span>Update logo</span>
                                    <input className="hidden" type="file" accept=".png,.gif,.jpeg,.jpg,.webp" onChange={(e) => handleUploadImage(e, 'header')} />
                                  </label>
                                  <div className="image-uploader__description text-[11px] text-[#94A3B8]">
                                    Must be JPEG, PNG, WEBP or GIF and cannot exceed 100KB.
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="input-wrap input-wrap_no-mb space-y-1.5">
                            <label className="input-wrap__label block text-[13px] text-[#1E293B]">Company name:</label>
                            <div className="se-input-2 company-name-input max-w-md">
                              <input
                                className="w-full px-3.5 py-2 border border-[#CBD5E1] rounded-[4px] text-[13px] text-[#1E293B] outline-hidden focus:border-[#0B69FF]"
                                type="text"
                                value={companyName}
                                onChange={(e) => {
                                  setCompanyName(e.target.value);
                                  setIsInterfaceModified(true);
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 2. UI Color scheme */}
                    <div className="sub-section sub-section_border border-b border-[#E2E8F0] pb-6 space-y-4">
                      <div className="sub-section__title text-[13px] font-bold text-[#1E293B]">UI Color scheme</div>
                      <div className="sub-section__content space-y-4">
                        <div className="color-theme-options space-y-2">
                          <div className="color-theme-options__title text-[13px] text-[#64748B]">System colors</div>
                          <div className="color-theme-options__colors flex items-center gap-2.5 flex-wrap">
                            {systemColors.map((color) => {
                              const isSelected = selectedColor.toLowerCase() === color.toLowerCase();
                              return (
                                <div
                                  key={color}
                                  onClick={() => {
                                    setSelectedColor(color);
                                    setCustomColor(color.replace('#', ''));
                                    setIsInterfaceModified(true);
                                  }}
                                  className={`w-8 h-8 rounded-[4px] cursor-pointer transition-all shadow-2xs ${
                                    isSelected ? 'ring-2 ring-offset-2 ring-[#0B69FF] scale-105' : 'hover:opacity-90'
                                  }`}
                                  style={{ backgroundColor: color }}
                                  title={color}
                                />
                              );
                            })}
                          </div>
                        </div>

                        <div className="color-theme-options space-y-2 pt-1">
                          <div className="color-theme-options__title text-[13px] text-[#64748B]">Custom color</div>
                          <div className="flex items-center gap-2">
                            <label
                              htmlFor="custom-color-picker-input"
                              style={{ backgroundColor: selectedColor }}
                              className="w-8 h-8 rounded-[4px] border border-[#CBD5E1] cursor-pointer shadow-2xs shrink-0 block"
                              title="Pick custom color"
                            />
                            <input
                              type="color"
                              id="custom-color-picker-input"
                              value={selectedColor.startsWith('#') ? selectedColor : `#${selectedColor}`}
                              onChange={(e) => {
                                const hex = e.target.value;
                                setSelectedColor(hex);
                                setCustomColor(hex.replace('#', ''));
                                setIsInterfaceModified(true);
                              }}
                              className="hidden"
                            />
                            <input
                              className="w-24 px-3 py-1.5 bg-white border border-[#CBD5E1] rounded-[4px] text-[13px] font-mono text-[#1E293B] uppercase outline-hidden focus:border-[#0B69FF]"
                              type="text"
                              placeholder="######"
                              value={customColor}
                              onChange={(e) => {
                                const val = e.target.value;
                                setCustomColor(val);
                                if (/^[0-9A-Fa-f]{6}$/.test(val)) {
                                  setSelectedColor(`#${val}`);
                                }
                                setIsInterfaceModified(true);
                              }}
                              maxLength={6}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 3. Footer settings */}
                    <div className="sub-section sub-section_border border-b border-[#E2E8F0] pb-6 space-y-4">
                      <div className="sub-section__title text-[13px] font-bold text-[#1E293B]">Footer settings</div>
                      <div className="sub-section__content">
                        <div className="interface-customization-section__content space-y-4">
                          <div className="image-uploader">
                            <div className="image-uploader__title text-[13px] text-[#1E293B] mb-1.5">Footer logo:</div>
                            <div className="image-uploader-inner flex items-start gap-4">
                              <div className="image-uploader__view w-28 h-16 bg-white border border-[#CBD5E1] rounded-[4px] flex items-center justify-center p-2 shrink-0 shadow-2xs overflow-hidden">
                                {footerLogoUrl ? (
                                  <img className="max-h-full max-w-full object-contain" src={footerLogoUrl} alt="Footer logo" />
                                ) : (
                                  <img className="max-h-full max-w-full object-contain" src="https://online.seranking.com/skin/img/logo/logo_small_black.svg" alt="SE Ranking Logo" />
                                )}
                              </div>
                              <div className="image-uploader__controls space-y-1">
                                <label className="inline-flex items-center gap-2 px-3.5 py-2 bg-white hover:bg-[#F8FAFC] border border-[#CBD5E1] text-[#1E293B] rounded-[4px] text-[11px] font-bold uppercase tracking-wider cursor-pointer shadow-2xs transition-colors">
                                  <Upload className="w-3.5 h-3.5 text-[#0F172A]" />
                                  <span>Update logo</span>
                                  <input className="hidden" type="file" accept=".png,.gif,.jpeg,.jpg,.webp" onChange={(e) => handleUploadImage(e, 'footer')} />
                                </label>
                                <div className="image-uploader__description text-[11px] text-[#94A3B8]">
                                  Must be JPEG, PNG, WEBP or GIF and cannot exceed 100KB.
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="input-wrap input-wrap_no-mb space-y-1.5">
                            <label className="input-wrap__label block text-[13px] text-[#1E293B]">Footer name:</label>
                            <div className="se-input-2 header-name-input max-w-md">
                              <input
                                className="w-full px-3.5 py-2 border border-[#CBD5E1] rounded-[4px] text-[13px] text-[#1E293B] outline-hidden focus:border-[#0B69FF]"
                                type="text"
                                value={footerName}
                                onChange={(e) => {
                                  setFooterName(e.target.value);
                                  setIsInterfaceModified(true);
                                }}
                              />
                            </div>
                          </div>

                          {/* Footer Builder Switches */}
                          <div className="footer-builder-switches flex items-center gap-10 pt-2">
                            <div className="input-wrap footer-builder-switch-wrap space-y-1.5">
                              <label className="input-wrap__label block text-[13px] text-[#1E293B]">Show footer links:</label>
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setShowFooterLinks(!showFooterLinks);
                                    setIsInterfaceModified(true);
                                  }}
                                  className={`w-9 h-5 rounded-full p-0.5 transition-colors cursor-pointer ${showFooterLinks ? 'bg-[#0B69FF]' : 'bg-gray-300'}`}
                                >
                                  <div className={`w-4 h-4 bg-white rounded-full transition-transform ${showFooterLinks ? 'translate-x-4' : 'translate-x-0'}`} />
                                </button>
                                <span className="text-xs font-medium text-[#1E293B]">{showFooterLinks ? 'On' : 'Off'}</span>
                              </div>
                            </div>

                            <div className="input-wrap footer-builder-switch-wrap space-y-1.5">
                              <label className="input-wrap__label flex items-center gap-1 text-[13px] text-[#1E293B]">
                                <span>Use custom links:</span>
                                <span className="w-3.5 h-3.5 rounded-full bg-gray-200 text-gray-500 text-[10px] flex items-center justify-center cursor-help">i</span>
                              </label>
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setUseCustomLinks(!useCustomLinks);
                                    setIsInterfaceModified(true);
                                  }}
                                  className={`w-9 h-5 rounded-full p-0.5 transition-colors cursor-pointer ${useCustomLinks ? 'bg-[#0B69FF]' : 'bg-gray-300'}`}
                                >
                                  <div className={`w-4 h-4 bg-white rounded-full transition-transform ${useCustomLinks ? 'translate-x-4' : 'translate-x-0'}`} />
                                </button>
                                <span className="text-xs font-medium text-[#1E293B]">{useCustomLinks ? 'On' : 'Off'}</span>
                              </div>
                            </div>
                          </div>

                          {/* 5 Footer link rows matching user HTML exactly */}
                          <div className="input-wrap pt-2">
                            <div className="footer-builder-wrap">
                              <div className="footer-builder space-y-3 max-w-2xl">
                                {customLinks.map((link, idx) => (
                                  <div key={link.id} className="footer-builder-row grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="footer-builder-row__label space-y-1">
                                      <span className={`block text-[11px] ${useCustomLinks ? 'text-[#64748B]' : 'text-gray-400'}`}>Text shown for the link:</span>
                                      <input
                                        type="text"
                                        value={link.label}
                                        disabled={!useCustomLinks}
                                        onChange={(e) => {
                                          const updated = [...customLinks];
                                          updated[idx].label = e.target.value;
                                          setCustomLinks(updated);
                                          setIsInterfaceModified(true);
                                        }}
                                        className={`w-full px-3 py-2 border rounded-[4px] text-xs transition-colors ${
                                          useCustomLinks ? 'bg-white border-[#CBD5E1] text-[#1E293B]' : 'bg-[#F8FAFC] border-[#E2E8F0] text-gray-400 cursor-not-allowed'
                                        }`}
                                      />
                                    </div>

                                    <div className="footer-builder-row__label space-y-1">
                                      <span className={`block text-[11px] ${useCustomLinks ? 'text-[#64748B]' : 'text-gray-400'}`}>Where should the link go:</span>
                                      <div className="relative flex items-center">
                                        <input
                                          type="text"
                                          value={link.url}
                                          disabled={!useCustomLinks}
                                          onChange={(e) => {
                                            const updated = [...customLinks];
                                            updated[idx].url = e.target.value;
                                            setCustomLinks(updated);
                                            setIsInterfaceModified(true);
                                          }}
                                          className={`w-full px-3 py-2 border rounded-[4px] text-xs transition-colors ${
                                            link.url ? 'pr-8' : ''
                                          } ${useCustomLinks ? 'bg-white border-[#CBD5E1] text-[#1E293B]' : 'bg-[#F8FAFC] border-[#E2E8F0] text-gray-400 cursor-not-allowed'}`}
                                        />
                                        {link.url && (
                                          <a href={link.url} target="_blank" rel="noreferrer" className="absolute right-2.5 text-[#0B69FF] hover:text-[#0052D4]" title="Open link">
                                            <ExternalLink className="w-3.5 h-3.5" />
                                          </a>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>

                        </div>
                      </div>
                    </div>

                    {/* 4. Favicon */}
                    <div className="sub-section space-y-4 pb-2">
                      <div className="sub-section__title text-[13px] font-bold text-[#1E293B]">Favicon</div>
                      <div className="sub-section__content">
                        <div className="input-wrap">
                          <div className="image-uploader">
                            <div className="image-uploader-inner flex items-start gap-4">
                              <div className="image-uploader__view image-uploader__view_small w-10 h-10 bg-white border border-[#CBD5E1] rounded-[4px] flex items-center justify-center p-1 shrink-0 shadow-2xs">
                                <img className="image-uploader__view-img w-4 h-4 object-contain" src={faviconUrl || '/favicon.ico'} alt="Favicon" />
                              </div>
                              <div className="image-uploader__controls space-y-1">
                                <label className="image-uploader__btn-update inline-flex items-center gap-2 px-3.5 py-2 bg-white hover:bg-[#F8FAFC] border border-[#CBD5E1] text-[#1E293B] rounded-[4px] text-[11px] font-bold uppercase tracking-wider cursor-pointer shadow-2xs transition-colors">
                                  <Upload className="w-3.5 h-3.5 text-[#0F172A]" />
                                  <span>Update logo</span>
                                  <input className="image-uploader__file-input hidden" type="file" accept=".png,.gif,.ico" onChange={(e) => handleUploadImage(e, 'favicon')} />
                                </label>
                                <div className="image-uploader__description text-[11px] text-[#94A3B8]">
                                  Must be ICO, PNG, or GIF.16x16 px to 48x48 px
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                  </div>

                  {/* Section Wrap Footer */}
                  <div className="section-wrap__footer flex items-center gap-3 pt-6 border-t border-[#E2E8F0]">
                    <button
                      type="button"
                      onClick={handleResetInterfaceSettings}
                      className="se-button-2_size-l se-button-2 section-wrap__footer-btn section-wrap__footer-btn_reset flex items-center gap-1.5 px-4 py-2 border border-[#CBD5E1] bg-white hover:bg-[#F8FAFC] text-[#1E293B] rounded-[4px] text-xs font-semibold cursor-pointer shadow-2xs"
                    >
                      <span className="se-button-2__text">Reset settings</span>
                      <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
                    </button>

                    <div className="el-tooltip__trigger">
                      <button
                        type="button"
                        onClick={handleApplyInterfaceChanges}
                        disabled={isSavingInterface}
                        className={`se-button_icon se-button-2_size-l se-button-2 section-wrap__footer-btn section-wrap__footer-btn_apply se-button-2_primary flex items-center gap-1.5 px-5 py-2 rounded-[4px] text-xs font-semibold shadow-2xs cursor-pointer text-white transition-colors ${
                          isInterfaceModified ? 'bg-[#0B69FF] hover:bg-[#0052D4]' : 'bg-[#0B69FF]/80'
                        }`}
                      >
                        <Check className="w-4 h-4 stroke-[3]" />
                        <span className="se-button-2__text">Apply changes</span>
                        <ChevronDown className="w-3.5 h-3.5 text-white/80" />
                      </button>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* VIEW 3: PERSONAL DOMAIN NAMES (EXACT MATCHING USER HTML)       */}
        {/* ============================================================== */}
        {activeTab === 'personal-domain-names' && (
          <div className="section-template section-wrapper__section-content p-6 sm:p-8 max-w-5xl mx-auto font-sans text-[#1E293B]">
            <div className="section-wrapper__content">
              <div className="white-label vue-app">
                <div className="section-wrap domain-section space-y-6">
                  
                  {/* Heading */}
                  <div className="section-wrap__heading text-xl font-medium text-[#1E293B]">
                    Personal domain names
                  </div>

                  <div className="section-wrap__content space-y-6">
                    {/* Description Sub-section */}
                    <div className="sub-section sub-section_border domain-section__description border-b border-[#E2E8F0] pb-6">
                      <div className="sub-section__content">
                        <div className="domain-section__content">
                          <p className="domain-section__text text-[13px] text-[#475569] leading-relaxed">
                            You can personalise the domain name you use to access the SE Ranking platform by adding your own brand to it <strong>(yourbrand.online.seranking.com)</strong>. Another option is to set up access to the platform under your own domain name with no mention of SE Ranking—you won’t have to set up anything on your server. Whichever option you choose, you can get a free SSL certificate to protect your White Label SEO platform.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Input Sub-section */}
                    <div className="sub-section space-y-3">
                      <div className="sub-section__content">
                        <div className="domain-section__content domain-section__content_pt space-y-3">
                          <div className="input-wrap domain-section__input-wrap space-y-2">
                            <label className="input-wrap__label block text-[13px] font-bold text-[#1E293B]">
                              Personal domain name of your company:
                            </label>
                            <p className="domain-section__text domain-section__text_hint text-[12px] text-[#64748B] leading-relaxed max-w-2xl">
                              To access the platform with no mention of SE Ranking in the URL, use your own domain name. Go to the DNS settings of your domain and create a CNAME record with the <code className="bg-[#F1F5F9] px-1 py-0.5 rounded text-[#0B69FF]">online.seranking.com</code> value. Then, enter your domain name here without specifying http:// or www. For example, <span className="text-gray-900 font-medium">top.richweb.org</span>.
                            </p>

                            <div className="domain-input-wrap flex items-center gap-3 pt-2">
                              <div className="domain-input flex-1 max-w-md">
                                <div className="se-input-2 domain-input__field">
                                  <input
                                    className="se-input-2__area w-full px-3.5 py-2.5 bg-white border border-[#CBD5E1] rounded-[4px] text-[13px] text-[#1E293B] outline-hidden focus:border-[#0B69FF]"
                                    type="text"
                                    value={domainInput}
                                    onChange={(e) => setDomainInput(e.target.value)}
                                    placeholder=""
                                  />
                                </div>
                              </div>

                              <div className="domain-input__btn-wrap el-tooltip__trigger">
                                <button
                                  type="button"
                                  onClick={handleActivateSsl}
                                  disabled={!domainInput.trim() || sslVerifying}
                                  className={`se-button-2_size-l se-button-2 domain-input__btn se-button-2_primary flex items-center gap-1.5 px-5 py-2.5 rounded-[4px] text-xs font-semibold shadow-2xs transition-colors cursor-pointer ${
                                    domainInput.trim()
                                      ? 'bg-[#0B69FF] hover:bg-[#0052D4] text-white'
                                      : 'bg-[#E2E8F0] text-[#94A3B8] cursor-not-allowed'
                                  }`}
                                >
                                  <span className="se-button-2__text">
                                    {sslVerifying ? 'Activating ssl...' : 'Аctivate ssl certificate'}
                                  </span>
                                  <ChevronDown className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>

                            {isSslActive && (
                              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg flex items-center gap-2 max-w-md mt-2">
                                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                                <span>SSL certificate is active for <strong>{domainInput}</strong></span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Section Wrap Footer */}
                  <div className="section-wrap__footer flex items-center gap-3 pt-6 border-t border-[#E2E8F0]">
                    <button
                      type="button"
                      onClick={() => {
                        setDomainInput('');
                        setIsSslActive(false);
                        showToast('Domain settings cleared.');
                      }}
                      className="se-button-2_size-l se-button-2 section-wrap__footer-btn section-wrap__footer-btn_reset flex items-center gap-1.5 px-4 py-2 border border-[#CBD5E1] bg-white hover:bg-[#F8FAFC] text-[#1E293B] rounded-[4px] text-xs font-semibold cursor-pointer shadow-2xs"
                    >
                      <span className="se-button-2__text">Reset settings</span>
                      <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
                    </button>

                    <div className="el-tooltip__trigger">
                      <button
                        type="button"
                        disabled={!domainInput.trim()}
                        onClick={() => showToast('Domain settings saved successfully!')}
                        className={`se-button_icon se-button-2_size-l se-button-2 section-wrap__footer-btn section-wrap__footer-btn_apply se-button-2_primary flex items-center gap-1.5 px-5 py-2 rounded-[4px] text-xs font-semibold shadow-2xs cursor-pointer text-white transition-colors ${
                          domainInput.trim() ? 'bg-[#0B69FF] hover:bg-[#0052D4]' : 'bg-[#0B69FF]/60 cursor-not-allowed'
                        }`}
                      >
                        <Check className="w-4 h-4 stroke-[3]" />
                        <span className="se-button-2__text">Apply changes</span>
                        <ChevronDown className="w-3.5 h-3.5 text-white/80" />
                      </button>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* VIEW 4: EMAIL SETTINGS (1:1 MATCHING USER SCREENSHOT)          */}
        {/* ============================================================== */}
        {activeTab === 'email-settings' && (
          <div className="p-6 sm:p-8 max-w-5xl mx-auto space-y-8 font-sans text-[#1E293B]">
            {/* Title with Info Icon matching Screenshot */}
            <div className="flex items-center gap-1.5 pt-1">
              <h1 className="text-[20px] font-bold text-[#1E293B] tracking-tight">
                Email settings
              </h1>
              <span className="text-[13px] text-[#94A3B8] cursor-help font-serif" title="Configure your custom email templates and outgoing SMTP server">
                ℹ
              </span>
            </div>

            {/* SECTION 1: TEMPLATE */}
            <div className="space-y-5">
              <div className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">
                TEMPLATE
              </div>

              {/* Use your own preconfigured template switch */}
              <div className="space-y-1.5">
                <label className="block text-[13px] font-normal text-[#1E293B]">
                  Use your own preconfigured template for emails:
                </label>
                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      setUsePreconfiguredTemplate(!usePreconfiguredTemplate);
                      setIsEmailModified(true);
                    }}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full transition-colors ${
                      usePreconfiguredTemplate ? 'bg-[#0B69FF]' : 'bg-[#CBD5E1]'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-xs transition-transform mt-0.5 ${
                        usePreconfiguredTemplate ? 'translate-x-4 ml-0.5' : 'translate-x-0.5'
                      }`}
                    />
                  </button>
                  <span className="text-[13px] text-[#1E293B] font-normal">
                    {usePreconfiguredTemplate ? 'On' : 'Off'}
                  </span>
                </div>
              </div>

              {/* Logo */}
              <div className="space-y-1.5">
                <label className="block text-[13px] font-normal text-[#1E293B]">
                  Logo:
                </label>
                <div className="flex items-start gap-4">
                  <div className="w-28 h-16 bg-white border border-[#CBD5E1] rounded-[4px] flex items-center justify-center p-2 shrink-0 shadow-2xs overflow-hidden">
                    {emailLogoUrl ? (
                      <img src={emailLogoUrl} alt="Email Logo" className="max-h-full max-w-full object-contain" />
                    ) : (
                      <div className="flex items-center gap-1.5 font-bold text-[#0B69FF] text-xs">
                        <span className="w-3.5 h-3.5 bg-[#0B69FF] rounded-[2px]" />
                        <span>SE Ranking</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="inline-flex items-center gap-2 px-3.5 py-2 bg-white hover:bg-[#F8FAFC] border border-[#CBD5E1] text-[#1E293B] rounded-[4px] text-[11px] font-bold uppercase tracking-wider cursor-pointer shadow-2xs transition-colors">
                      <Upload className="w-3.5 h-3.5 text-[#0F172A]" />
                      <span>UPDATE LOGO</span>
                      <input
                        type="file"
                        className="hidden"
                        accept=".png,.gif,.jpeg,.jpg,.webp"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            const reader = new FileReader();
                            reader.onload = (ev) => {
                              setEmailLogoUrl(ev.target?.result as string);
                              setIsEmailModified(true);
                            };
                            reader.readAsDataURL(e.target.files[0]);
                          }
                        }}
                      />
                    </label>
                    <p className="text-[11px] italic text-[#94A3B8] leading-tight max-w-xs">
                      Must be JPEG, PNG, WEBP or GIF and cannot exceed 100KB.
                    </p>
                  </div>
                </div>
              </div>

              {/* From name */}
              <div className="space-y-1.5 max-w-xl">
                <label className="block text-[13px] font-normal text-[#1E293B]">
                  From name:
                </label>
                <input
                  type="text"
                  value={emailFromName}
                  onChange={(e) => {
                    setEmailFromName(e.target.value);
                    setIsEmailModified(true);
                  }}
                  className="w-full px-3.5 py-2 bg-white border border-[#CBD5E1] rounded-[4px] text-[13px] text-[#1E293B] outline-hidden focus:border-[#0B69FF]"
                />
              </div>

              {/* Reply to email address */}
              <div className="space-y-1.5 max-w-xl">
                <label className="block text-[13px] font-normal text-[#1E293B]">
                  Reply to email address:
                </label>
                <input
                  type="email"
                  value={emailReplyTo}
                  onChange={(e) => {
                    setEmailReplyTo(e.target.value);
                    setIsEmailModified(true);
                  }}
                  className="w-full px-3.5 py-2 bg-white border border-[#CBD5E1] rounded-[4px] text-[13px] text-[#1E293B] outline-hidden focus:border-[#0B69FF]"
                />
              </div>

              {/* Reports subject */}
              <div className="space-y-1.5 max-w-xl">
                <label className="block text-[13px] font-normal text-[#1E293B]">
                  Reports subject:
                </label>
                <input
                  type="text"
                  value={emailSubject}
                  onChange={(e) => {
                    setEmailSubject(e.target.value);
                    setIsEmailModified(true);
                  }}
                  className="w-full px-3.5 py-2 bg-white border border-[#CBD5E1] rounded-[4px] text-[13px] text-[#1E293B] outline-hidden focus:border-[#0B69FF]"
                />
              </div>

              {/* Header textarea */}
              <div className="space-y-1.5 max-w-xl">
                <label className="block text-[13px] font-normal text-[#1E293B]">
                  Header:
                </label>
                <textarea
                  rows={3}
                  value={emailHeader}
                  onChange={(e) => {
                    setEmailHeader(e.target.value);
                    setIsEmailModified(true);
                  }}
                  className="w-full px-3.5 py-2 bg-white border border-[#CBD5E1] rounded-[4px] text-xs font-mono text-[#1E293B] outline-hidden focus:border-[#0B69FF]"
                />
              </div>

              {/* Body with WYSIWYG toolbar */}
              <div className="space-y-1.5 max-w-xl">
                <label className="block text-[13px] font-normal text-[#1E293B]">
                  Body:
                </label>
                <div className="border border-[#CBD5E1] rounded-[4px] overflow-hidden bg-white">
                  {/* Toolbar matching screenshot */}
                  <div className="flex items-center gap-1 p-2 bg-[#F8FAFC] border-b border-[#E2E8F0] flex-wrap text-gray-600">
                    <button type="button" className="p-1 hover:bg-gray-200 rounded cursor-pointer" title="Undo"><RotateCcw className="w-3.5 h-3.5" /></button>
                    <button type="button" className="p-1 hover:bg-gray-200 rounded cursor-pointer" title="Redo"><RotateCw className="w-3.5 h-3.5" /></button>
                    <span className="w-px h-4 bg-gray-300 mx-1" />
                    <button type="button" className="p-1 hover:bg-gray-200 rounded cursor-pointer font-bold" title="Bold"><Bold className="w-3.5 h-3.5" /></button>
                    <button type="button" className="p-1 hover:bg-gray-200 rounded cursor-pointer italic" title="Italic"><Italic className="w-3.5 h-3.5" /></button>
                    <button type="button" className="p-1 hover:bg-gray-200 rounded cursor-pointer" title="Strikethrough"><Strikethrough className="w-3.5 h-3.5" /></button>
                    <span className="w-px h-4 bg-gray-300 mx-1" />
                    <button type="button" className="p-1 hover:bg-gray-200 rounded cursor-pointer" title="Align Left"><AlignLeft className="w-3.5 h-3.5" /></button>
                    <button type="button" className="p-1 hover:bg-gray-200 rounded cursor-pointer" title="Align Center"><AlignCenter className="w-3.5 h-3.5" /></button>
                    <button type="button" className="p-1 hover:bg-gray-200 rounded cursor-pointer" title="Align Right"><AlignRight className="w-3.5 h-3.5" /></button>
                    <span className="w-px h-4 bg-gray-300 mx-1" />
                    <button type="button" className="p-1 hover:bg-gray-200 rounded cursor-pointer" title="Insert Link"><LinkIcon className="w-3.5 h-3.5" /></button>
                    <button type="button" className="p-1 hover:bg-gray-200 rounded cursor-pointer" title="Quote"><Quote className="w-3.5 h-3.5" /></button>
                    <button type="button" className="p-1 hover:bg-gray-200 rounded cursor-pointer" title="Bullet List"><List className="w-3.5 h-3.5" /></button>
                    <button type="button" className="p-1 hover:bg-gray-200 rounded cursor-pointer" title="Numbered List"><ListOrdered className="w-3.5 h-3.5" /></button>
                  </div>
                  <textarea
                    rows={4}
                    value={emailBody}
                    onChange={(e) => {
                      setEmailBody(e.target.value);
                      setIsEmailModified(true);
                    }}
                    className="w-full p-3 text-[13px] text-[#1E293B] outline-hidden focus:outline-hidden resize-y leading-relaxed"
                  />
                </div>
              </div>

              {/* Comment with WYSIWYG toolbar */}
              <div className="space-y-1.5 max-w-xl">
                <label className="block text-[13px] font-normal text-[#1E293B]">
                  Comment:
                </label>
                <div className="border border-[#CBD5E1] rounded-[4px] overflow-hidden bg-white">
                  <div className="flex items-center gap-1 p-2 bg-[#F8FAFC] border-b border-[#E2E8F0] flex-wrap text-gray-600">
                    <button type="button" className="p-1 hover:bg-gray-200 rounded cursor-pointer" title="Undo"><RotateCcw className="w-3.5 h-3.5" /></button>
                    <button type="button" className="p-1 hover:bg-gray-200 rounded cursor-pointer" title="Redo"><RotateCw className="w-3.5 h-3.5" /></button>
                    <span className="w-px h-4 bg-gray-300 mx-1" />
                    <button type="button" className="p-1 hover:bg-gray-200 rounded cursor-pointer font-bold" title="Bold"><Bold className="w-3.5 h-3.5" /></button>
                    <button type="button" className="p-1 hover:bg-gray-200 rounded cursor-pointer italic" title="Italic"><Italic className="w-3.5 h-3.5" /></button>
                    <button type="button" className="p-1 hover:bg-gray-200 rounded cursor-pointer" title="Strikethrough"><Strikethrough className="w-3.5 h-3.5" /></button>
                    <span className="w-px h-4 bg-gray-300 mx-1" />
                    <button type="button" className="p-1 hover:bg-gray-200 rounded cursor-pointer" title="Align Left"><AlignLeft className="w-3.5 h-3.5" /></button>
                    <button type="button" className="p-1 hover:bg-gray-200 rounded cursor-pointer" title="Align Center"><AlignCenter className="w-3.5 h-3.5" /></button>
                    <button type="button" className="p-1 hover:bg-gray-200 rounded cursor-pointer" title="Align Right"><AlignRight className="w-3.5 h-3.5" /></button>
                    <span className="w-px h-4 bg-gray-300 mx-1" />
                    <button type="button" className="p-1 hover:bg-gray-200 rounded cursor-pointer" title="Insert Link"><LinkIcon className="w-3.5 h-3.5" /></button>
                    <button type="button" className="p-1 hover:bg-gray-200 rounded cursor-pointer" title="Quote"><Quote className="w-3.5 h-3.5" /></button>
                    <button type="button" className="p-1 hover:bg-gray-200 rounded cursor-pointer" title="Bullet List"><List className="w-3.5 h-3.5" /></button>
                    <button type="button" className="p-1 hover:bg-gray-200 rounded cursor-pointer" title="Numbered List"><ListOrdered className="w-3.5 h-3.5" /></button>
                  </div>
                  <textarea
                    rows={4}
                    value={emailComment}
                    onChange={(e) => {
                      setEmailComment(e.target.value);
                      setIsEmailModified(true);
                    }}
                    className="w-full p-3 text-[13px] text-[#1E293B] outline-hidden focus:outline-hidden resize-y leading-relaxed"
                  />
                </div>
              </div>

              {/* Footer textarea */}
              <div className="space-y-1.5 max-w-xl">
                <label className="block text-[13px] font-normal text-[#1E293B]">
                  Footer:
                </label>
                <textarea
                  rows={6}
                  value={emailFooter}
                  onChange={(e) => {
                    setEmailFooter(e.target.value);
                    setIsEmailModified(true);
                  }}
                  className="w-full px-3.5 py-2 bg-white border border-[#CBD5E1] rounded-[4px] text-xs font-mono text-[#1E293B] outline-hidden focus:border-[#0B69FF]"
                />
              </div>

              {/* PREVIEW EMAIL button */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setIsPreviewEmailOpen(true)}
                  className="px-5 py-2 bg-[#0B69FF] hover:bg-[#0052D4] text-white rounded-[4px] text-xs font-bold uppercase tracking-wider cursor-pointer shadow-xs transition-colors"
                >
                  PREVIEW EMAIL
                </button>
              </div>
            </div>

            {/* Subtle Divider */}
            <div className="border-b border-[#E2E8F0] my-6 max-w-xl" />

            {/* SECTION 2: MAIL SERVER SETTINGS */}
            <div className="space-y-4">
              <div className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">
                MAIL SERVER SETTINGS
              </div>

              <div className="space-y-1.5">
                <label className="block text-[13px] font-normal text-[#1E293B]">
                  Use own SMTP server to send reports:
                </label>
                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      setEmailUseOwnSmtp(!emailUseOwnSmtp);
                      setIsEmailModified(true);
                    }}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full transition-colors ${
                      emailUseOwnSmtp ? 'bg-[#0B69FF]' : 'bg-[#CBD5E1]'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-xs transition-transform mt-0.5 ${
                        emailUseOwnSmtp ? 'translate-x-4 ml-0.5' : 'translate-x-0.5'
                      }`}
                    />
                  </button>
                  <span className="text-[13px] text-[#1E293B] font-normal">
                    {emailUseOwnSmtp ? 'On' : 'Off'}
                  </span>
                </div>
              </div>
            </div>

            {/* SECTION 3: DATA INPUT METHOD */}
            <div className="space-y-4 pt-2">
              <div className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">
                DATA INPUT METHOD
              </div>

              <div className="space-y-1.5">
                <label className="block text-[13px] font-normal text-[#1E293B]">
                  You may enter data manually
                </label>
                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      setEmailDataManual(!emailDataManual);
                      setIsEmailModified(true);
                    }}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full transition-colors ${
                      emailDataManual ? 'bg-[#0B69FF]' : 'bg-[#CBD5E1]'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-xs transition-transform mt-0.5 ${
                        emailDataManual ? 'translate-x-4 ml-0.5' : 'translate-x-0.5'
                      }`}
                    />
                  </button>
                  <span className="text-[13px] text-[#1E293B] font-normal">
                    {emailDataManual ? 'On' : 'Off'}
                  </span>
                </div>
              </div>

              <div className="space-y-3 pt-1">
                <div className="text-[13px] text-[#64748B]">
                  Or connect one of the following services
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 max-w-xl">
                  {/* Google Gmail Connect Button */}
                  <button
                    type="button"
                    onClick={() => showToast('Google Gmail connection initiated. OAuth window opened.')}
                    className="flex-1 flex items-center justify-center gap-2.5 px-4 py-2.5 bg-white border border-[#CBD5E1] hover:border-gray-400 rounded-[4px] text-xs font-semibold text-[#1E293B] shadow-2xs transition-colors cursor-pointer"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"/>
                      <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
                      <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.03 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                      <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                    </svg>
                    <span>Connect Google Gmail</span>
                  </button>

                  {/* Microsoft Outlook Connect Button */}
                  <button
                    type="button"
                    onClick={() => showToast('Microsoft Outlook connection initiated. OAuth window opened.')}
                    className="flex-1 flex items-center justify-center gap-2.5 px-4 py-2.5 bg-white border border-[#CBD5E1] hover:border-gray-400 rounded-[4px] text-xs font-semibold text-[#1E293B] shadow-2xs transition-colors cursor-pointer"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <rect fill="#F25022" x="1" y="1" width="10" height="10"/>
                      <rect fill="#7FBA00" x="13" y="1" width="10" height="10"/>
                      <rect fill="#00A4EF" x="1" y="13" width="10" height="10"/>
                      <rect fill="#FFB900" x="13" y="13" width="10" height="10"/>
                    </svg>
                    <span>Connect Microsoft Outlook</span>
                  </button>
                </div>

                <div className="pt-1">
                  <a
                    href="https://help.seranking.com"
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-[#0B69FF] hover:underline"
                  >
                    Having trouble connecting? Please read the following instructions.
                  </a>
                </div>
              </div>
            </div>

            {/* Action Buttons matching screenshot */}
            <div className="flex items-center gap-3 pt-6 border-t border-[#E2E8F0]">
              <button
                type="button"
                onClick={() => {
                  setEmailFromName('');
                  setEmailReplyTo('');
                  setEmailSubject('');
                  setIsEmailModified(false);
                  showToast('Email settings reset to default.');
                }}
                className="px-5 py-2.5 border border-[#CBD5E1] bg-white hover:bg-[#F8FAFC] text-[#475569] rounded-[4px] text-xs font-bold uppercase tracking-wider cursor-pointer shadow-2xs transition-colors"
              >
                RESET SETTINGS
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsEmailModified(false);
                  showToast('Email settings successfully saved!');
                }}
                className="px-6 py-2.5 bg-[#0B69FF] hover:bg-[#0052D4] text-white rounded-[4px] text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-2xs cursor-pointer transition-colors"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>APPLY CHANGES</span>
              </button>
            </div>

            {/* Email Preview Modal */}
            {isPreviewEmailOpen && (
              <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
                <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-6 space-y-4">
                  <div className="flex items-center justify-between border-b pb-3">
                    <h3 className="font-bold text-base text-[#1E293B]">Email Template Preview</h3>
                    <button type="button" onClick={() => setIsPreviewEmailOpen(false)} className="text-gray-400 hover:text-gray-900 cursor-pointer">✕</button>
                  </div>
                  <div className="p-4 bg-[#F8FAFC] border rounded-lg space-y-3 text-xs text-[#1E293B]">
                    <div className="border-b pb-2">
                      <div><strong>From:</strong> {emailFromName || 'SE Ranking'} &lt;{emailReplyTo || 'reports@seranking.com'}&gt;</div>
                      <div><strong>Subject:</strong> {emailSubject || 'Weekly SEO Performance Report'}</div>
                    </div>
                    <div dangerouslySetInnerHTML={{ __html: emailHeader }} />
                    <div className="whitespace-pre-line leading-relaxed">{emailBody}</div>
                    <div className="whitespace-pre-line leading-relaxed pt-2 text-[#475569]">{emailComment}</div>
                    <div className="border-t pt-3" dangerouslySetInnerHTML={{ __html: emailFooter }} />
                  </div>
                  <div className="flex justify-end">
                    <button type="button" onClick={() => setIsPreviewEmailOpen(false)} className="px-4 py-2 bg-[#0B69FF] text-white rounded text-xs font-bold">
                      CLOSE PREVIEW
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ============================================================== */}
        {/* VIEW 5: REPORT BUILDER                                         */}
        {/* ============================================================== */}
        {activeTab === 'report-builder' && (
          <div className="flex-1 flex flex-col font-sans text-[#1E293B]">
            {/* Top Blue Info Banner matching Screenshot 1 */}
                {showRbBanner && (
                  <div className="bg-[#EBF5FF] border-b border-[#C8DFFA] px-8 py-2.5 text-[12px] text-[#1E429F] flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="w-4 h-4 rounded-full bg-[#1976D2] text-white flex items-center justify-center font-serif text-[10px] font-bold shrink-0">
                        i
                      </span>
                      <span className="text-[#1E293B]">
                        Please keep in mind that the White Label settings specified here will affect the files exported from Report Builder and our other tools.
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowRbBanner(false)}
                      className="text-[#94A3B8] hover:text-[#1E293B] text-sm p-0.5 rounded cursor-pointer transition-colors"
                      title="Close"
                    >
                      ✕
                    </button>
                  </div>
                )}

                <div className="px-8 py-5 max-w-[1380px] w-full">
              {/* Breadcrumb Row matching Screenshot 1 */}
              <div className="flex items-center justify-between text-xs text-[#8C9BA5] pb-3">
                <div className="flex items-center gap-2">
                  <Link href="/settings" className="hover:text-[#1E293B] transition-colors">
                    Settings
                  </Link>
                  <span className="text-[#CBD5E1]">›</span>
                  <Link href="/admin.user.whitelabel.html#/" className="hover:text-[#1E293B] transition-colors">
                    White Label
                  </Link>
                  <span className="text-[#CBD5E1]">›</span>
                  <span className="text-[#8C9BA5]">Report Builder</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsFeedbackOpen(true)}
                  className="text-[#0B69FF] hover:underline font-normal cursor-pointer text-xs"
                >
                  Feedback
                </button>
              </div>

              {/* Title with Info Icon matching Screenshot 1 */}
              <div className="flex items-baseline gap-1 pt-2 pb-6">
                <h1 className="text-[22px] font-medium text-[#1E293B] tracking-tight">
                  Report Builder
                </h1>
                <span className="text-[12px] text-[#8C9BA5] cursor-help font-serif italic" title="Report Builder white label branding">
                  i
                </span>
              </div>

            {/* 2-Column Split: Form (Left) & Live Preview (Right) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pt-2">
              
              {/* LEFT COLUMN: SETTINGS FORM (7 cols) */}
              <div className="lg:col-span-7 space-y-6">

                {/* 1. HEADER SETTINGS */}
                <div className="space-y-4">
                  <div className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">
                    HEADER SETTINGS
                  </div>

                  {/* Header Logo */}
                  <div className="space-y-1.5">
                    <label className="block text-[13px] font-normal text-[#1E293B]">
                      Header logo
                    </label>
                    <div className="flex items-start gap-4">
                      {/* Preview Box */}
                      <div className="w-28 h-20 bg-white border border-[#CBD5E1] rounded-[4px] flex items-center justify-center p-2 shrink-0 shadow-2xs overflow-hidden">
                        {rbHeaderLogo ? (
                          <img
                            src={rbHeaderLogo}
                            alt="Header Logo"
                            className="max-h-full max-w-full object-contain"
                          />
                        ) : (
                          <div className="w-full h-full bg-[#FAFCFF] flex items-center justify-center text-gray-300 text-xs font-mono">
                            No logo
                          </div>
                        )}
                      </div>

                      {/* Upload Button & Helper Text */}
                      <div className="space-y-1.5">
                        <input
                          type="file"
                          id="rb-header-logo-input"
                          accept="image/jpeg,image/png,image/webp,image/gif"
                          onChange={(e) => handleUploadRbImage(e, 'headerLogo')}
                          className="hidden"
                        />
                        <label
                          htmlFor="rb-header-logo-input"
                          className="inline-flex items-center gap-2 px-3.5 py-2 bg-white hover:bg-[#F8FAFC] border border-[#CBD5E1] text-[#1E293B] rounded-[4px] text-[11px] font-bold uppercase tracking-wider cursor-pointer shadow-2xs transition-colors"
                        >
                          <Upload className="w-3.5 h-3.5 text-[#0F172A]" />
                          <span>UPDATE LOGO</span>
                        </label>
                        <p className="text-[11px] italic text-[#94A3B8] leading-tight max-w-xs">
                          Must be maximum 400x200px and cannot exceed 100KB
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Company Name */}
                  <div className="space-y-1.5 pt-1">
                    <label className="block text-[13px] font-normal text-[#1E293B]">
                      Company name:
                    </label>
                    <input
                      type="text"
                      value={rbCompanyName}
                      onChange={(e) => {
                        setRbCompanyName(e.target.value);
                        setIsRbModified(true);
                      }}
                      className="w-full max-w-[420px] px-3.5 py-2 bg-white border border-[#CBD5E1] rounded-[4px] text-[13px] text-[#1E293B] outline-hidden focus:border-[#0B69FF] transition-colors"
                    />
                  </div>

                  {/* Header Color */}
                  <div className="space-y-2 pt-2">
                    <div className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">
                      HEADER COLOR
                    </div>
                    <div className="text-[13px] font-normal text-[#1E293B]">
                      System color
                    </div>
                    <div className="flex items-center gap-2.5 flex-wrap">
                      {systemColors.map((color) => {
                        const isSelected = rbHeaderColor.toLowerCase() === color.toLowerCase();
                        return (
                          <button
                            key={color}
                            type="button"
                            onClick={() => {
                              setRbHeaderColor(color);
                              setRbCustomHeaderColor(color.replace('#', ''));
                              setRbPreviewMode('header');
                              setIsRbModified(true);
                            }}
                            style={{ backgroundColor: color }}
                            className={`w-8 h-8 rounded-[4px] cursor-pointer transition-all shadow-2xs ${
                              isSelected
                                ? 'ring-2 ring-offset-2 ring-[#0B69FF] scale-105'
                                : 'hover:opacity-90'
                            }`}
                            title={color}
                          />
                        );
                      })}
                    </div>

                    {/* Custom Header Color */}
                    <div className="space-y-2 pt-2">
                      <div className="text-[13px] font-normal text-[#1E293B]">
                        Custom color
                      </div>
                      <div className="flex items-center gap-2">
                        <label
                          htmlFor="rb-header-color-picker"
                          style={{ backgroundColor: rbHeaderColor }}
                          className="w-8 h-8 rounded-[4px] border border-[#CBD5E1] cursor-pointer shadow-2xs shrink-0 block"
                          title="Pick custom header color"
                        />
                        <input
                          type="color"
                          id="rb-header-color-picker"
                          value={rbHeaderColor.startsWith('#') ? rbHeaderColor : `#${rbHeaderColor}`}
                          onChange={(e) => {
                            const hex = e.target.value;
                            setRbHeaderColor(hex);
                            setRbCustomHeaderColor(hex.replace('#', ''));
                            setRbPreviewMode('header');
                            setIsRbModified(true);
                          }}
                          className="hidden"
                        />
                        <input
                          type="text"
                          value={rbCustomHeaderColor}
                          onChange={(e) => {
                            const val = e.target.value;
                            setRbCustomHeaderColor(val);
                            if (/^[0-9A-Fa-f]{6}$/.test(val)) {
                              setRbHeaderColor(`#${val}`);
                            }
                            setRbPreviewMode('header');
                            setIsRbModified(true);
                          }}
                          className="w-24 px-3 py-1.5 bg-white border border-[#CBD5E1] rounded-[4px] text-[13px] font-mono text-[#1E293B] uppercase outline-hidden focus:border-[#0B69FF]"
                          maxLength={6}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Header Text Color */}
                  <div className="space-y-2 pt-2">
                    <div className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">
                      HEADER TEXT COLOR
                    </div>
                    <div className="text-[13px] font-normal text-[#1E293B]">
                      Custom color
                    </div>
                    <div className="flex items-center gap-2">
                      <label
                        htmlFor="rb-header-text-color-picker"
                        style={{ backgroundColor: `#${rbHeaderTextColor}` }}
                        className="w-8 h-8 rounded-[4px] border border-[#CBD5E1] cursor-pointer shadow-2xs shrink-0 block"
                        title="Pick custom text color"
                      />
                      <input
                        type="color"
                        id="rb-header-text-color-picker"
                        value={`#${rbHeaderTextColor}`}
                        onChange={(e) => {
                          const hex = e.target.value.replace('#', '');
                          setRbHeaderTextColor(hex);
                          setRbPreviewMode('header');
                          setIsRbModified(true);
                        }}
                        className="hidden"
                      />
                      <input
                        type="text"
                        value={rbHeaderTextColor}
                        onChange={(e) => {
                          setRbHeaderTextColor(e.target.value);
                          setRbPreviewMode('header');
                          setIsRbModified(true);
                        }}
                        className="w-24 px-3 py-1.5 bg-white border border-[#CBD5E1] rounded-[4px] text-[13px] font-mono text-[#1E293B] uppercase outline-hidden focus:border-[#0B69FF]"
                        maxLength={6}
                      />
                    </div>
                  </div>
                </div>

                {/* Subtle Divider */}
                <div className="border-b border-[#E2E8F0] my-6" />

                {/* 2. COVER PAGE SETTINGS */}
                <div className="space-y-4">
                  <div className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">
                    COVER PAGE SETTINGS
                  </div>

                  {/* Cover page logo */}
                  <div className="space-y-1.5">
                    <label className="block text-[13px] font-normal text-[#1E293B]">
                      Cover page logo
                    </label>
                    <div className="flex items-start gap-4">
                      {/* Preview Box showing SE Ranking Logo matching Screenshot 2 */}
                      <div className="w-28 h-20 bg-white border border-[#CBD5E1] rounded-[4px] flex items-center justify-center p-2 shrink-0 shadow-2xs overflow-hidden">
                        {rbCoverLogo === 'default_se_ranking' ? (
                          <div className="flex items-center gap-1.5 scale-90">
                            {/* Blue SE Ranking Chevron Spark */}
                            <svg width="22" height="22" viewBox="0 0 28 30" fill="none">
                              <path
                                d="M19.2618 8.02075L14.6489 12.6337C13.7654 13.5172 12.5667 14.0138 11.3171 14.0138H0L12.6275 1.38638C12.8748 1.139 13.2103 1 13.5604 1H18.6116C19.1841 1 19.6482 1.46412 19.6482 2.03662V7.08779C19.6482 7.43789 19.5092 7.77338 19.2618 8.02075Z"
                                fill="#0B69FF"
                              />
                              <path
                                d="M11.1871 29.8199V24.2221C11.1871 23.6496 10.723 23.1855 10.1505 23.1855H4.55273L11.7097 16.0286C12.5931 15.1451 13.7919 14.6484 15.0415 14.6484H26.3585L11.1871 29.8199Z"
                                fill="#0B69FF"
                              />
                            </svg>
                            <span className="font-bold text-xs text-[#0F172A] tracking-tight">
                              SE Ranking
                            </span>
                          </div>
                        ) : rbCoverLogo ? (
                          <img
                            src={rbCoverLogo}
                            alt="Cover Logo"
                            className="max-h-full max-w-full object-contain"
                          />
                        ) : (
                          <div className="w-full h-full bg-[#FAFCFF] flex items-center justify-center text-gray-300 text-xs font-mono">
                            No logo
                          </div>
                        )}
                      </div>

                      {/* Upload Button & Helper Text */}
                      <div className="space-y-1.5">
                        <input
                          type="file"
                          id="rb-cover-logo-input"
                          accept="image/jpeg,image/png,image/webp,image/gif"
                          onChange={(e) => handleUploadRbImage(e, 'coverLogo')}
                          className="hidden"
                        />
                        <label
                          htmlFor="rb-cover-logo-input"
                          className="inline-flex items-center gap-2 px-3.5 py-2 bg-white hover:bg-[#F8FAFC] border border-[#CBD5E1] text-[#1E293B] rounded-[4px] text-[11px] font-bold uppercase tracking-wider cursor-pointer shadow-2xs transition-colors"
                        >
                          <Upload className="w-3.5 h-3.5 text-[#0F172A]" />
                          <span>UPDATE LOGO</span>
                        </label>
                        <p className="text-[11px] italic text-[#94A3B8] leading-tight max-w-xs">
                          Must be maximum 400x200px and cannot exceed 100KB
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Cover page background */}
                  <div className="space-y-1.5 pt-1">
                    <label className="block text-[13px] font-normal text-[#1E293B]">
                      Cover page background
                    </label>
                    <div className="flex items-start gap-4">
                      {/* Preview Box */}
                      <div className="w-28 h-20 bg-[#F1F5F9] border border-[#CBD5E1] rounded-[4px] flex items-center justify-center p-2 shrink-0 shadow-2xs overflow-hidden">
                        {rbCoverBackground ? (
                          <img
                            src={rbCoverBackground}
                            alt="Cover Background"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-[#E2E8F0] rounded-[2px]" />
                        )}
                      </div>

                      {/* Upload Button & Helper Text */}
                      <div className="space-y-1.5">
                        <input
                          type="file"
                          id="rb-cover-bg-input"
                          accept="image/jpeg,image/png,image/webp,image/gif"
                          onChange={(e) => handleUploadRbImage(e, 'coverBg')}
                          className="hidden"
                        />
                        <label
                          htmlFor="rb-cover-bg-input"
                          className="inline-flex items-center gap-2 px-3.5 py-2 bg-white hover:bg-[#F8FAFC] border border-[#CBD5E1] text-[#1E293B] rounded-[4px] text-[11px] font-bold uppercase tracking-wider cursor-pointer shadow-2xs transition-colors"
                        >
                          <Upload className="w-3.5 h-3.5 text-[#0F172A]" />
                          <span>UPDATE BACKGROUND</span>
                        </label>
                        <p className="text-[11px] italic text-[#94A3B8] leading-tight max-w-xs">
                          Must be a maximum of 2480x3508px and cannot exceed 1024KB
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Cover Page Text Color */}
                  <div className="space-y-2 pt-2">
                    <div className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider">
                      COVER PAGE TEXT COLOR
                    </div>
                    <div className="text-[13px] font-normal text-[#1E293B]">
                      Custom color
                    </div>
                    <div className="flex items-center gap-2">
                      <label
                        htmlFor="rb-cover-text-color-picker"
                        style={{ backgroundColor: `#${rbCoverTextColor}` }}
                        className="w-8 h-8 rounded-[4px] border border-[#CBD5E1] cursor-pointer shadow-2xs shrink-0 block"
                        title="Pick custom cover text color"
                      />
                      <input
                        type="color"
                        id="rb-cover-text-color-picker"
                        value={`#${rbCoverTextColor}`}
                        onChange={(e) => {
                          const hex = e.target.value.replace('#', '');
                          setRbCoverTextColor(hex);
                          setRbPreviewMode('cover');
                          setIsRbModified(true);
                        }}
                        className="hidden"
                      />
                      <input
                        type="text"
                        value={rbCoverTextColor}
                        onChange={(e) => {
                          setRbCoverTextColor(e.target.value);
                          setRbPreviewMode('cover');
                          setIsRbModified(true);
                        }}
                        className="w-24 px-3 py-1.5 bg-white border border-[#CBD5E1] rounded-[4px] text-[13px] font-mono text-[#1E293B] uppercase outline-hidden focus:border-[#0B69FF]"
                        maxLength={6}
                      />
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-3 pt-8 pb-4">
                  <button
                    type="button"
                    onClick={handleResetRbSettings}
                    className="px-5 py-2.5 border border-[#CBD5E1] bg-white hover:bg-[#F8FAFC] text-[#475569] rounded-[4px] text-xs font-bold uppercase tracking-wider cursor-pointer shadow-2xs transition-colors"
                  >
                    RESET SETTINGS
                  </button>
                  <button
                    type="button"
                    onClick={handleApplyRbChanges}
                    disabled={isSavingRb}
                    className="px-6 py-2.5 bg-[#0B69FF] hover:bg-[#0052D4] text-white rounded-[4px] text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-2xs cursor-pointer transition-colors"
                  >
                    <Check className="w-4 h-4 stroke-[3]" />
                    <span>{isSavingRb ? 'SAVING...' : 'APPLY CHANGES'}</span>
                  </button>
                </div>
              </div>

              {/* RIGHT COLUMN: LIVE INTERACTIVE PREVIEW (5 cols) matching Screenshot 4 */}
              <div className="lg:col-span-5 space-y-6">
                
                {/* 1. HEADER PREVIEW SECTION */}
                <div className="bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-2xs space-y-4">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#1E293B]">
                      HEADER PREVIEW
                    </span>
                    {/* Orientation switcher */}
                    <div className="flex items-center rounded-[4px] border border-[#CBD5E1] overflow-hidden text-[11px] font-bold">
                      <button
                        type="button"
                        onClick={() => {
                          setRbOrientation('portrait');
                          setIsRbModified(true);
                        }}
                        className={`px-3 py-1 uppercase tracking-wider transition-colors cursor-pointer ${
                          rbOrientation === 'portrait'
                            ? 'bg-[#3E435E] text-white'
                            : 'bg-white text-[#475569] hover:bg-[#F8FAFC]'
                        }`}
                      >
                        PORTRAIT
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setRbOrientation('landscape');
                          setIsRbModified(true);
                        }}
                        className={`px-3 py-1 uppercase tracking-wider transition-colors cursor-pointer ${
                          rbOrientation === 'landscape'
                            ? 'bg-[#3E435E] text-white'
                            : 'bg-white text-[#475569] hover:bg-[#F8FAFC]'
                        }`}
                      >
                        LANDSCAPE
                      </button>
                    </div>
                  </div>

                  <p className="text-[12px] text-[#64748B] leading-relaxed">
                    Below you can see how the report header and cover page will look based on the specified settings
                  </p>

                  {/* Header Preview Canvas */}
                  <div
                    className={`mx-auto bg-white border border-[#CBD5E1] rounded-[2px] shadow-sm flex flex-col transition-all overflow-hidden ${
                      rbOrientation === 'portrait'
                        ? 'w-full max-w-[340px] aspect-[1/1.38]'
                        : 'w-full max-w-[420px] aspect-[1.38/1]'
                    }`}
                  >
                    {/* Real Colored Header Bar */}
                    <div
                      style={{ backgroundColor: rbHeaderColor }}
                      className="px-4 py-3 flex items-center justify-between text-white shrink-0 shadow-xs"
                    >
                      <div className="flex items-center gap-1.5 max-h-5">
                        {rbHeaderLogo ? (
                          <img
                            src={rbHeaderLogo}
                            alt="Report Logo"
                            className="max-h-5 max-w-[90px] object-contain"
                          />
                        ) : (
                          <svg width="18" height="18" viewBox="0 0 28 30" fill="none">
                            <path
                              d="M19.2618 8.02075L14.6489 12.6337C13.7654 13.5172 12.5667 14.0138 11.3171 14.0138H0L12.6275 1.38638C12.8748 1.139 13.2103 1 13.5604 1H18.6116C19.1841 1 19.6482 1.46412 19.6482 2.03662V7.08779C19.6482 7.43789 19.5092 7.77338 19.2618 8.02075Z"
                              fill="#FFFFFF"
                            />
                            <path
                              d="M11.1871 29.8199V24.2221C11.1871 23.6496 10.723 23.1855 10.1505 23.1855H4.55273L11.7097 16.0286C12.5931 15.1451 13.7919 14.6484 15.0415 14.6484H26.3585L11.1871 29.8199Z"
                              fill="#FFFFFF"
                            />
                          </svg>
                        )}
                      </div>

                      <div
                        style={{ color: `#${rbHeaderTextColor}` }}
                        className="text-xs font-semibold tracking-tight truncate max-w-[150px]"
                      >
                        {rbCompanyName}
                      </div>
                    </div>

                    {/* Mock Report Content Lines */}
                    <div className="p-4 space-y-3.5 flex-1 bg-white">
                      <div className="w-24 h-5 bg-[#F1F5F9] rounded-[4px]" />
                      <div className="w-12 h-2.5 bg-[#F1F5F9] rounded-full" />
                      <div className="space-y-2 pt-2">
                        <div className="w-full h-1.5 bg-[#F1F5F9] rounded-full" />
                        <div className="w-full h-1.5 bg-[#F1F5F9] rounded-full" />
                        <div className="w-4/5 h-1.5 bg-[#F1F5F9] rounded-full" />
                        <div className="w-full h-1.5 bg-[#F1F5F9] rounded-full" />
                      </div>
                      <div className="space-y-2 pt-4">
                        <div className="w-full h-1.5 bg-[#F1F5F9] rounded-full" />
                        <div className="w-3/4 h-1.5 bg-[#F1F5F9] rounded-full" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. COVER PAGE PREVIEW SECTION */}
                <div className="bg-white rounded-xl border border-[#E2E8F0] p-5 shadow-2xs space-y-4">
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#1E293B]">
                      COVER PAGE PREVIEW
                    </span>
                    {/* Orientation switcher */}
                    <div className="flex items-center rounded-[4px] border border-[#CBD5E1] overflow-hidden text-[11px] font-bold">
                      <button
                        type="button"
                        onClick={() => {
                          setRbOrientation('portrait');
                          setIsRbModified(true);
                        }}
                        className={`px-3 py-1 uppercase tracking-wider transition-colors cursor-pointer ${
                          rbOrientation === 'portrait'
                            ? 'bg-[#3E435E] text-white'
                            : 'bg-white text-[#475569] hover:bg-[#F8FAFC]'
                        }`}
                      >
                        PORTRAIT
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setRbOrientation('landscape');
                          setIsRbModified(true);
                        }}
                        className={`px-3 py-1 uppercase tracking-wider transition-colors cursor-pointer ${
                          rbOrientation === 'landscape'
                            ? 'bg-[#3E435E] text-white'
                            : 'bg-white text-[#475569] hover:bg-[#F8FAFC]'
                        }`}
                      >
                        LANDSCAPE
                      </button>
                    </div>
                  </div>

                  <p className="text-[12px] text-[#64748B] leading-relaxed">
                    Below you can see how the report header and cover page will look based on the specified settings
                  </p>

                  {/* Cover Page Preview Canvas */}
                  <div
                    style={{
                      backgroundImage: rbCoverBackground ? `url(${rbCoverBackground})` : undefined,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                    }}
                    className={`mx-auto bg-white border border-[#CBD5E1] rounded-[2px] shadow-sm flex flex-col justify-between p-6 transition-all relative overflow-hidden ${
                      rbOrientation === 'portrait'
                        ? 'w-full max-w-[340px] aspect-[1/1.38]'
                        : 'w-full max-w-[420px] aspect-[1.38/1]'
                    }`}
                  >
                    {/* Top Logo */}
                    <div className="flex justify-center pt-2">
                      {rbCoverLogo === 'default_se_ranking' ? (
                        <div className="flex items-center gap-2">
                          <svg width="24" height="24" viewBox="0 0 28 30" fill="none">
                            <path
                              d="M19.2618 8.02075L14.6489 12.6337C13.7654 13.5172 12.5667 14.0138 11.3171 14.0138H0L12.6275 1.38638C12.8748 1.139 13.2103 1 13.5604 1H18.6116C19.1841 1 19.6482 1.46412 19.6482 2.03662V7.08779C19.6482 7.43789 19.5092 7.77338 19.2618 8.02075Z"
                              fill="#0B69FF"
                            />
                            <path
                              d="M11.1871 29.8199V24.2221C11.1871 23.6496 10.723 23.1855 10.1505 23.1855H4.55273L11.7097 16.0286C12.5931 15.1451 13.7919 14.6484 15.0415 14.6484H26.3585L11.1871 29.8199Z"
                              fill="#0B69FF"
                            />
                          </svg>
                          <span className="font-bold text-sm text-[#0F172A] tracking-tight">
                            SE Ranking
                          </span>
                        </div>
                      ) : rbCoverLogo ? (
                        <img
                          src={rbCoverLogo}
                          alt="Cover Logo"
                          className="max-h-8 max-w-[140px] object-contain"
                        />
                      ) : null}
                    </div>

                    {/* Center Titles matching Screenshot 2 & 3 */}
                    <div className="space-y-2 text-center my-auto">
                      <div className="text-[11px] text-[#64748B] font-medium">
                        Report
                      </div>
                      <h2
                        style={{ color: `#${rbCoverTextColor}` }}
                        className="text-[20px] font-extrabold tracking-tight"
                      >
                        Project name
                      </h2>
                      <div
                        style={{ color: `#${rbCoverTextColor}` }}
                        className="text-[13px] font-semibold"
                      >
                        Report Period
                      </div>
                    </div>

                    {/* Bottom Footer Spacing */}
                    <div className="h-4" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

        {/* ============================================================== */}
        {/* VIEW 6: LEAD GENERATOR (START) matching Screenshot 1            */}
        {/* ============================================================== */}
        {activeTab === 'lead-generator' && (
          <div className="flex-1 flex flex-col font-sans text-[#1E293B]">
            {/* Top Navigation Bar matching Screenshot 1 */}
            <div className="flex items-center justify-between px-8 py-3.5 border-b border-[#E2E8F0] bg-white">
              <div className="flex items-center gap-1.5 text-xs text-[#64748B]">
                <Link
                  href="/admin.lead_generator.html#/start"
                  className="hover:text-[#1E293B] flex items-center gap-1 text-[#8C9BA5] transition-colors"
                >
                  <span className="text-sm font-semibold">‹</span>
                  <span>Lead Generator</span>
                </Link>
              </div>

              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => setIsFeedbackOpen(true)}
                  className="text-xs text-[#0B69FF] hover:underline font-normal cursor-pointer"
                >
                  Feedback
                </button>
                <div
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-[4px] border border-[#CBD5E1] bg-white text-xs text-[#1E293B] shadow-2xs cursor-help"
                  title="Daily lead generation account limit"
                >
                  <Building2 className="w-3.5 h-3.5 text-[#64748B]" />
                  <span>Account limits (daily) {widgets.length} / 3</span>
                  <span className="text-[11px] text-[#94A3B8] font-serif italic">i</span>
                </div>
              </div>
            </div>

            {/* Hero Centered Section matching Screenshot 1 */}
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center min-h-[540px]">
              <div className="max-w-md flex flex-col items-center space-y-4">
                {/* Stylized Vector Illustration matching Screenshot 1 */}
                <div className="w-64 h-48 flex items-center justify-center relative select-none">
                  <svg viewBox="0 0 320 240" className="w-full h-full">
                    {/* Background floating graphics */}
                    {/* Pie Chart Card */}
                    <g transform="translate(165, 20)">
                      <circle cx="28" cy="28" r="24" fill="#00B074" opacity="0.9" />
                      <path d="M 28 28 L 28 4 A 24 24 0 0 1 52 28 Z" fill="#3B82F6" />
                      <circle cx="28" cy="28" r="10" fill="#FFFFFF" />
                    </g>

                    {/* Left Card: Line chart with curve and red/orange trend */}
                    <g transform="translate(30, 45)">
                      <rect x="0" y="0" width="85" height="75" rx="6" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1.5" filter="drop-shadow(0 4px 6px rgba(0,0,0,0.04))" />
                      {/* Orange Trend Line */}
                      <path d="M 12 55 Q 30 50, 42 35 T 75 22" fill="none" stroke="#F97316" strokeWidth="2.5" strokeLinecap="round" />
                      <circle cx="12" cy="55" r="2.5" fill="#F97316" />
                      <circle cx="42" cy="35" r="2.5" fill="#F97316" />
                      <circle cx="75" cy="22" r="2.5" fill="#F97316" />
                      {/* Sub horizontal lines */}
                      <line x1="10" y1="65" x2="75" y2="65" stroke="#F1F5F9" strokeWidth="1.5" />
                      <line x1="10" y1="45" x2="75" y2="45" stroke="#F1F5F9" strokeWidth="1.5" />
                      <line x1="10" y1="25" x2="75" y2="25" stroke="#F1F5F9" strokeWidth="1.5" />
                    </g>

                    {/* Right Card: Bar chart with green/cyan bars */}
                    <g transform="translate(205, 55)">
                      <rect x="0" y="0" width="85" height="75" rx="6" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1.5" filter="drop-shadow(0 4px 6px rgba(0,0,0,0.04))" />
                      <rect x="15" y="42" width="8" height="23" rx="1.5" fill="#00B074" />
                      <rect x="30" y="28" width="8" height="37" rx="1.5" fill="#00B074" />
                      <rect x="45" y="36" width="8" height="29" rx="1.5" fill="#00B074" />
                      <rect x="60" y="20" width="8" height="45" rx="1.5" fill="#00B074" />
                      {/* Pink wavy line */}
                      <path d="M 15 32 Q 35 45, 50 25 T 70 15" fill="none" stroke="#EC4899" strokeWidth="1.5" strokeLinecap="round" />
                    </g>

                    {/* Character: Girl sitting cross-legged */}
                    <g transform="translate(115, 75)">
                      {/* Legs in purple pants */}
                      <path d="M 25 90 C 15 105, 5 110, -10 115 C -25 120, -10 128, 5 125 C 20 122, 35 110, 45 100 Z" fill="#6366F1" />
                      <path d="M 65 90 C 75 105, 85 110, 100 115 C 115 120, 100 128, 85 125 C 70 122, 55 110, 45 100 Z" fill="#4F46E5" />
                      {/* Shoes */}
                      <path d="M -15 118 C -22 122, -18 128, -8 126 Z" fill="#1D4ED8" />
                      <path d="M 105 118 C 112 122, 108 128, 98 126 Z" fill="#1D4ED8" />

                      {/* Torso in teal top */}
                      <path d="M 30 45 L 60 45 L 65 85 L 25 85 Z" fill="#0D9488" />
                      <path d="M 33 45 C 38 52, 52 52, 57 45 Z" fill="#F87171" opacity="0.2" />

                      {/* Tablet in lap */}
                      <rect x="32" y="70" width="28" height="18" rx="2" fill="#E2E8F0" stroke="#94A3B8" strokeWidth="1" />
                      <rect x="36" y="74" width="20" height="10" rx="1" fill="#FFFFFF" />

                      {/* Arms */}
                      <path d="M 25 50 Q 20 70, 34 75" fill="none" stroke="#FBCFE8" strokeWidth="6" strokeLinecap="round" />
                      <path d="M 65 50 Q 70 70, 56 75" fill="none" stroke="#FBCFE8" strokeWidth="6" strokeLinecap="round" />

                      {/* Neck and Head */}
                      <rect x="41" y="35" width="8" height="10" fill="#FBCFE8" />
                      <ellipse cx="45" cy="26" rx="12" ry="14" fill="#FBCFE8" />

                      {/* Dark Hair with bun */}
                      <path d="M 33 22 C 33 10, 57 10, 57 22 C 57 28, 55 35, 52 35 C 50 30, 40 30, 38 35 C 35 35, 33 28, 33 22 Z" fill="#1E293B" />
                      <ellipse cx="45" cy="10" rx="7" ry="6" fill="#1E293B" />
                    </g>
                  </svg>
                </div>

                <div className="space-y-1.5">
                  <h2 className="text-[20px] font-bold text-[#1E293B] tracking-tight">Lead Generator</h2>
                  <p className="text-[13px] text-[#64748B] leading-relaxed max-w-sm mx-auto">
                    You haven&apos;t added any widgets yet. Create your first widget to get started.
                  </p>
                </div>

                {/* Green ADD WIDGET button that opens the Widgets section */}
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('lead-widgets');
                    if (typeof window !== 'undefined') {
                      if (window.location.pathname.includes('lead_generator')) {
                        window.location.hash = '#/widgets';
                      } else {
                        router.push('/agency-pack?tab=lead-widgets');
                      }
                    }
                  }}
                  className="px-6 py-2.5 bg-[#00B074] hover:bg-[#009663] text-white rounded-[4px] font-bold text-xs uppercase tracking-wider transition-colors shadow-2xs cursor-pointer inline-flex items-center gap-2"
                >
                  ADD WIDGET
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* VIEW 7: LEAD GENERATOR (WIDGETS) matching Screenshot 2         */}
        {/* ============================================================== */}
        {activeTab === 'lead-widgets' && (
          <div className="flex-1 flex flex-col font-sans text-[#1E293B]">


            {/* Breadcrumb Row matching Screenshot 2 */}
            <div className="flex items-center justify-between px-8 py-3.5 border-b border-[#E2E8F0] bg-white">
              <div className="flex items-center gap-2 text-xs text-[#8C9BA5]">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('lead-generator');
                    if (typeof window !== 'undefined' && window.location.pathname.includes('lead_generator')) {
                      window.location.hash = '#/start';
                    }
                  }}
                  className="hover:text-[#1E293B] transition-colors cursor-pointer"
                >
                  Lead Generator
                </button>
                <span className="text-[#CBD5E1]">›</span>
                <span className="text-[#1E293B] font-medium">Widgets</span>
              </div>

              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => setIsFeedbackOpen(true)}
                  className="text-xs text-[#0B69FF] hover:underline font-normal cursor-pointer"
                >
                  Feedback
                </button>
                <div
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-[4px] border border-[#CBD5E1] bg-white text-xs text-[#1E293B] shadow-2xs cursor-help"
                  title="Daily lead generation account limit"
                >
                  <Building2 className="w-3.5 h-3.5 text-[#64748B]" />
                  <span>Account limits (daily) {widgets.length} / 3</span>
                  <span className="text-[11px] text-[#94A3B8] font-serif italic">i</span>
                </div>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="px-8 py-5 max-w-[1380px] w-full space-y-6">
              {/* Heading */}
              <div>
                <h1 className="text-[22px] font-bold text-[#1E293B] tracking-tight">Widgets</h1>
              </div>

              {/* 1. AVAILABLE SECTION */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[14px] font-semibold text-[#1E293B]">Available (5)</span>
                  <button
                    type="button"
                    onClick={() => setIsAvailableWidgetsOpen(!isAvailableWidgetsOpen)}
                    className="text-xs text-[#1E293B] hover:text-[#0B69FF] flex items-center gap-1 cursor-pointer font-medium"
                  >
                    <span>{isAvailableWidgetsOpen ? 'Open' : 'Closed'}</span>
                    <span className="text-xs">{isAvailableWidgetsOpen ? '▲' : '▼'}</span>
                  </button>
                </div>

                <p className="text-[13px] text-[#64748B]">
                  Customize your widget: select the shape, color, write the text, and choose where you want to place the widget on your website.
                </p>

                {isAvailableWidgetsOpen && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5 pt-1">
                    {/* CARD 1: Button */}
                    <div
                      onClick={() => handleOpenAddWidgetModal('Button')}
                      className="bg-white border border-[#CBD5E1] hover:border-[#0B69FF] hover:shadow-md transition-all rounded-md p-3 cursor-pointer group shadow-2xs flex flex-col justify-between"
                    >
                      {/* Browser Frame */}
                      <div className="rounded-t overflow-hidden border border-[#E2E8F0]">
                        <div className="h-4 bg-[#F8FAFC] border-b border-[#E2E8F0] flex items-center px-1.5 gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#EF4444]" />
                          <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B]" />
                          <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
                        </div>
                        <div className="h-24 bg-[#F1F5F9] relative overflow-hidden">
                          {/* Floating Button Element at bottom right */}
                          <div className="absolute bottom-2.5 right-2.5 w-8 h-3 bg-[#3B82F6] rounded-[3px] shadow-2xs group-hover:scale-105 transition-transform" />
                        </div>
                      </div>
                      <span className="text-center text-[13px] font-medium text-[#475569] group-hover:text-[#0B69FF] transition-colors pt-3">
                        Button
                      </span>
                    </div>

                    {/* CARD 2: Pop-up */}
                    <div
                      onClick={() => handleOpenAddWidgetModal('Pop-up')}
                      className="bg-white border border-[#CBD5E1] hover:border-[#0B69FF] hover:shadow-md transition-all rounded-md p-3 cursor-pointer group shadow-2xs flex flex-col justify-between"
                    >
                      {/* Browser Frame */}
                      <div className="rounded-t overflow-hidden border border-[#E2E8F0]">
                        <div className="h-4 bg-[#F8FAFC] border-b border-[#E2E8F0] flex items-center px-1.5 gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#EF4444]" />
                          <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B]" />
                          <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
                        </div>
                        <div className="h-24 bg-[#F1F5F9] relative overflow-hidden">
                          {/* Pop-up modal element in lower center/right */}
                          <div className="absolute bottom-2 right-3 w-14 h-9 bg-[#3B82F6] rounded-[2px] p-1.5 flex flex-col justify-center gap-1 shadow-md group-hover:scale-105 transition-transform">
                            <div className="w-8 h-1 bg-white/90 rounded-full" />
                            <div className="w-5 h-1 bg-white/70 rounded-full" />
                          </div>
                        </div>
                      </div>
                      <span className="text-center text-[13px] font-medium text-[#475569] group-hover:text-[#0B69FF] transition-colors pt-3">
                        Pop-up
                      </span>
                    </div>

                    {/* CARD 3: Push notification */}
                    <div
                      onClick={() => handleOpenAddWidgetModal('Push notification')}
                      className="bg-white border border-[#CBD5E1] hover:border-[#0B69FF] hover:shadow-md transition-all rounded-md p-3 cursor-pointer group shadow-2xs flex flex-col justify-between"
                    >
                      {/* Browser Frame */}
                      <div className="rounded-t overflow-hidden border border-[#E2E8F0]">
                        <div className="h-4 bg-[#F8FAFC] border-b border-[#E2E8F0] flex items-center px-1.5 gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#EF4444]" />
                          <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B]" />
                          <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
                        </div>
                        <div className="h-24 bg-[#F1F5F9] relative overflow-hidden">
                          {/* Full top notification bar */}
                          <div className="absolute top-0 left-0 right-0 h-3.5 bg-[#3B82F6] flex items-center px-2 shadow-2xs group-hover:bg-[#2563EB] transition-colors">
                            <div className="w-12 h-0.5 bg-white/90 rounded-full" />
                          </div>
                        </div>
                      </div>
                      <span className="text-center text-[13px] font-medium text-[#475569] group-hover:text-[#0B69FF] transition-colors pt-3">
                        Push notification
                      </span>
                    </div>

                    {/* CARD 4: Webform */}
                    <div
                      onClick={() => handleOpenAddWidgetModal('Webform')}
                      className="bg-white border border-[#CBD5E1] hover:border-[#0B69FF] hover:shadow-md transition-all rounded-md p-3 cursor-pointer group shadow-2xs flex flex-col justify-between"
                    >
                      {/* Browser Frame */}
                      <div className="rounded-t overflow-hidden border border-[#E2E8F0]">
                        <div className="h-4 bg-[#F8FAFC] border-b border-[#E2E8F0] flex items-center px-1.5 gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#EF4444]" />
                          <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B]" />
                          <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
                        </div>
                        <div className="h-24 bg-[#F1F5F9] relative overflow-hidden">
                          {/* Webform embedded card on right */}
                          <div className="absolute top-1.5 bottom-1.5 right-2.5 w-10 bg-white border border-[#CBD5E1] rounded-[2px] p-1 flex flex-col justify-between shadow-2xs group-hover:border-[#3B82F6] transition-colors">
                            <div className="space-y-1 pt-0.5">
                              <div className="w-full h-0.5 bg-[#CBD5E1] rounded-full" />
                              <div className="w-full h-0.5 bg-[#CBD5E1] rounded-full" />
                              <div className="w-3/4 h-0.5 bg-[#CBD5E1] rounded-full" />
                            </div>
                            <div className="w-5 h-1 bg-[#3B82F6] rounded-[1px] self-center" />
                          </div>
                        </div>
                      </div>
                      <span className="text-center text-[13px] font-medium text-[#475569] group-hover:text-[#0B69FF] transition-colors pt-3">
                        Webform
                      </span>
                    </div>

                    {/* CARD 5: Modal window */}
                    <div
                      onClick={() => handleOpenAddWidgetModal('Modal window')}
                      className="bg-white border border-[#CBD5E1] hover:border-[#0B69FF] hover:shadow-md transition-all rounded-md p-3 cursor-pointer group shadow-2xs flex flex-col justify-between"
                    >
                      {/* Browser Frame */}
                      <div className="rounded-t overflow-hidden border border-[#E2E8F0]">
                        <div className="h-4 bg-[#F8FAFC] border-b border-[#E2E8F0] flex items-center px-1.5 gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#EF4444]" />
                          <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B]" />
                          <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
                        </div>
                        <div className="h-24 bg-[#F1F5F9] relative flex items-center justify-center overflow-hidden">
                          {/* Centered Modal window */}
                          <div className="w-11 h-16 bg-white border border-[#CBD5E1] rounded-[2px] p-1.5 flex flex-col justify-between shadow-md group-hover:border-[#3B82F6] transition-colors">
                            <div className="space-y-1.5 pt-0.5">
                              <div className="w-full h-0.5 bg-[#CBD5E1] rounded-full" />
                              <div className="w-full h-0.5 bg-[#CBD5E1] rounded-full" />
                              <div className="w-3/4 h-0.5 bg-[#CBD5E1] rounded-full" />
                            </div>
                            <div className="w-6 h-1.5 bg-[#3B82F6] rounded-[1px] self-center" />
                          </div>
                        </div>
                      </div>
                      <span className="text-center text-[13px] font-medium text-[#475569] group-hover:text-[#0B69FF] transition-colors pt-3">
                        Modal window
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Subtle Divider */}
              <div className="border-b border-[#E2E8F0] my-6" />

              {/* 2. ADDED SECTION matching Screenshot 2 */}
              <div className="space-y-3 pb-8">
                <div className="flex items-center justify-between">
                  <span className="text-[14px] font-semibold text-[#1E293B]">
                    Added ({widgets.length})
                  </span>
                </div>

                {widgets.length === 0 ? (
                  <div className="text-[13px] text-[#94A3B8] py-2">
                    Add widgets to this section
                  </div>
                ) : (
                  <div className="bg-white border border-[#CBD5E1] rounded-lg overflow-hidden shadow-2xs">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#F8FAFC] border-b border-[#CBD5E1] text-[#64748B] font-semibold uppercase text-[10.5px]">
                        <tr>
                          <th className="px-4 py-3">Widget Name</th>
                          <th className="px-4 py-3">Type</th>
                          <th className="px-4 py-3">Target Domain</th>
                          <th className="px-4 py-3">Created</th>
                          <th className="px-4 py-3">Leads Captured</th>
                          <th className="px-4 py-3">Status</th>
                          <th className="px-4 py-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E2E8F0] text-[#1E293B]">
                        {widgets.map((w) => (
                          <tr key={w.id} className="hover:bg-[#F8FAFC] transition-colors">
                            <td className="px-4 py-3 font-semibold flex items-center gap-2">
                              <span
                                className="w-2.5 h-2.5 rounded-full shrink-0"
                                style={{ backgroundColor: w.color || '#0B69FF' }}
                              />
                              <span>{w.name}</span>
                            </td>
                            <td className="px-4 py-3 text-[#64748B]">{w.type}</td>
                            <td className="px-4 py-3 font-mono text-[11px] text-[#0B69FF]">
                              {w.targetDomain}
                            </td>
                            <td className="px-4 py-3 text-[#64748B]">{w.created}</td>
                            <td className="px-4 py-3 font-bold text-[#10B981]">{w.leadsCount}</td>
                            <td className="px-4 py-3">
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                {w.status}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <div className="flex items-center justify-end gap-3">
                                <button
                                  type="button"
                                  onClick={() => setEmbedModalWidget(w)}
                                  className="text-[#0B69FF] hover:underline font-medium inline-flex items-center gap-1 cursor-pointer"
                                >
                                  <Code2 className="w-3.5 h-3.5" />
                                  <span>Embed Code</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteWidget(w.id)}
                                  className="text-[#EF4444] hover:text-[#DC2626] cursor-pointer p-1 rounded"
                                  title="Delete Widget"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* VIEW 8: USERS                                                  */}
        {/* ============================================================== */}
        {activeTab === 'users' && (
          <div className="p-8 max-w-4xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-[22px] font-bold text-[#1E293B]">User Management</h1>
                <p className="text-xs text-[#64748B]">Manage agency seats and role permissions (1/3 seats used)</p>
              </div>
              <button
                onClick={() => setIsAddUserModalOpen(true)}
                className="px-4 py-2 bg-[#0B69FF] hover:bg-[#0052D4] text-white rounded text-xs font-bold uppercase tracking-wider shadow-2xs cursor-pointer flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>ADD USER</span>
              </button>
            </div>

            <div className="bg-white border border-[#CBD5E1] rounded-lg overflow-hidden shadow-2xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F8FAFC] border-b border-[#CBD5E1] text-[#64748B] font-semibold uppercase text-[10.5px]">
                  <tr>
                    <th className="px-4 py-2.5">User</th>
                    <th className="px-4 py-2.5">Email</th>
                    <th className="px-4 py-2.5">Role</th>
                    <th className="px-4 py-2.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0]">
                  {usersList.map((u) => (
                    <tr key={u.id} className="hover:bg-[#F8FAFC]">
                      <td className="px-4 py-3 font-semibold text-[#1E293B]">{u.name}</td>
                      <td className="px-4 py-3 text-[#64748B]">{u.email}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-[#EFF6FF] text-[#1D4ED8]">
                          {u.role}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        {u.role !== 'Owner' && (
                          <button
                            onClick={() => {
                              setUsersList(usersList.filter((x) => x.id !== u.id));
                              showToast('User removed.');
                            }}
                            className="text-red-500 hover:text-red-700 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>



      {/* Report Bug Modal */}
      <ReportBugModal isOpen={isBugReportOpen} onClose={() => setIsBugReportOpen(false)} />

      {/* Feedback Modal */}
      {isFeedbackOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-sm text-[#1E293B]">Send Feedback</h3>
              <button onClick={() => setIsFeedbackOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            {feedbackSuccess ? (
              <div className="py-6 text-center space-y-2 text-[#10B981]">
                <Check className="w-8 h-8 mx-auto" />
                <p className="text-sm font-bold">Thank you for your feedback!</p>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (!feedbackText.trim()) return;
                  setFeedbackSuccess(true);
                  setTimeout(() => {
                    setFeedbackSuccess(false);
                    setFeedbackText('');
                    setIsFeedbackOpen(false);
                    showToast('Feedback submitted successfully!');
                  }, 1200);
                }}
                className="space-y-4"
              >
                <textarea
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  placeholder="Share your thoughts or suggest an improvement..."
                  rows={4}
                  className="w-full p-3 border border-[#CBD5E1] rounded text-xs focus:outline-hidden focus:border-[#0B69FF]"
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsFeedbackOpen(false)}
                    className="px-3 py-1.5 border border-[#CBD5E1] rounded text-xs text-[#64748B]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-[#0B69FF] hover:bg-[#0052D4] text-white rounded text-xs font-bold"
                  >
                    Submit
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Rich Widget Customizer Modal */}
      {isAddWidgetModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-2xl space-y-5 border border-[#E2E8F0]">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
              <div>
                <h3 className="font-bold text-base text-[#1E293B]">
                  Customize {newWidgetType} Widget
                </h3>
                <p className="text-xs text-[#64748B]">
                  Configure your widget appearance, target website, and audit prompt.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddWidgetModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-sm cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Live Mini Preview Box */}
            <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg p-3 text-center space-y-2">
              <span className="text-[10.5px] font-bold uppercase tracking-wider text-[#64748B] block">
                Widget Live Preview
              </span>
              <div className="h-28 bg-[#FFFFFF] border border-[#CBD5E1] rounded relative flex items-center justify-center overflow-hidden shadow-inner">
                {newWidgetType === 'Button' && (
                  <div
                    style={{ backgroundColor: newWidgetColor }}
                    className="absolute bottom-3 right-3 px-3 py-1.5 rounded-full text-white text-[11px] font-bold shadow-md flex items-center gap-1.5"
                  >
                    <span>⚡</span>
                    <span>{newWidgetText || 'Get Free Audit'}</span>
                  </div>
                )}
                {newWidgetType === 'Pop-up' && (
                  <div
                    style={{ borderTopColor: newWidgetColor }}
                    className="absolute bottom-2 right-4 w-44 bg-white border-t-4 border border-[#CBD5E1] rounded p-2.5 shadow-lg space-y-1.5 text-left"
                  >
                    <div className="text-[11px] font-bold text-[#1E293B]">
                      {newWidgetText || 'Want a Free SEO Audit?'}
                    </div>
                    <div className="w-full h-1 bg-[#F1F5F9] rounded-full" />
                    <button
                      style={{ backgroundColor: newWidgetColor }}
                      className="w-full py-1 text-white text-[10px] font-bold rounded"
                    >
                      Audit Now
                    </button>
                  </div>
                )}
                {newWidgetType === 'Push notification' && (
                  <div
                    style={{ backgroundColor: newWidgetColor }}
                    className="absolute top-0 left-0 right-0 py-1 px-3 text-white text-[11px] font-medium flex items-center justify-between shadow-xs"
                  >
                    <span>{newWidgetText || 'Free Website Audit: Check your Google rankings'}</span>
                    <span className="bg-white/20 px-2 py-0.5 rounded text-[9.5px] font-bold">Check</span>
                  </div>
                )}
                {newWidgetType === 'Webform' && (
                  <div className="w-48 bg-white border border-[#CBD5E1] rounded p-2 space-y-1.5 shadow-xs">
                    <div className="text-[10px] font-bold text-[#1E293B] text-center">
                      {newWidgetText || 'Instant SEO Report'}
                    </div>
                    <div className="h-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded text-[9px] text-[#94A3B8] px-1.5 flex items-center">
                      Enter URL...
                    </div>
                    <button
                      style={{ backgroundColor: newWidgetColor }}
                      className="w-full py-0.5 text-white text-[9.5px] font-bold rounded"
                    >
                      Generate
                    </button>
                  </div>
                )}
                {newWidgetType === 'Modal window' && (
                  <div className="w-44 bg-white border border-[#CBD5E1] rounded p-2.5 space-y-1.5 shadow-lg text-center">
                    <div className="text-[11px] font-bold text-[#1E293B]">
                      {newWidgetText || 'Audit Your Website'}
                    </div>
                    <div className="h-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded text-[9px] text-[#94A3B8] px-1.5 flex items-center">
                      yourdomain.com
                    </div>
                    <button
                      style={{ backgroundColor: newWidgetColor }}
                      className="w-full py-1 text-white text-[10px] font-bold rounded shadow-xs"
                    >
                      Run Audit
                    </button>
                  </div>
                )}
              </div>
            </div>

            <form onSubmit={handleCreateWidget} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-[#1E293B]">Widget Name</label>
                  <input
                    type="text"
                    required
                    value={newWidgetName}
                    onChange={(e) => setNewWidgetName(e.target.value)}
                    placeholder="e.g. Free Audit Widget"
                    className="w-full px-3 py-2 border border-[#CBD5E1] rounded text-xs focus:border-[#0B69FF] outline-hidden"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-[#1E293B]">Target Website URL</label>
                  <input
                    type="text"
                    required
                    value={newWidgetDomain}
                    onChange={(e) => setNewWidgetDomain(e.target.value)}
                    placeholder="https://youragency.com"
                    className="w-full px-3 py-2 border border-[#CBD5E1] rounded font-mono text-xs focus:border-[#0B69FF] outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-[#1E293B]">Button / Title Text</label>
                  <input
                    type="text"
                    value={newWidgetText}
                    onChange={(e) => setNewWidgetText(e.target.value)}
                    placeholder="e.g. Get Free SEO Audit"
                    className="w-full px-3 py-2 border border-[#CBD5E1] rounded text-xs focus:border-[#0B69FF] outline-hidden"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-[#1E293B]">Position</label>
                  <select
                    value={newWidgetPosition}
                    onChange={(e) => setNewWidgetPosition(e.target.value)}
                    className="w-full px-3 py-2 border border-[#CBD5E1] rounded text-xs focus:border-[#0B69FF] outline-hidden"
                  >
                    <option value="Bottom Right">Bottom Right</option>
                    <option value="Bottom Left">Bottom Left</option>
                    <option value="Top Bar">Top Bar</option>
                    <option value="Centered Modal">Centered Modal</option>
                  </select>
                </div>
              </div>

              {/* Accent Color Selection */}
              <div className="space-y-1.5 pt-1">
                <label className="font-semibold text-[#1E293B] block">Color Accent</label>
                <div className="flex items-center gap-2">
                  {['#0B69FF', '#00B074', '#F59E0B', '#7C3AED', '#EF4444', '#1E293B'].map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setNewWidgetColor(c)}
                      style={{ backgroundColor: c }}
                      className={`w-7 h-7 rounded-[4px] cursor-pointer transition-all ${
                        newWidgetColor === c ? 'ring-2 ring-offset-2 ring-[#0B69FF] scale-110' : 'hover:opacity-90'
                      }`}
                    />
                  ))}
                  <input
                    type="color"
                    value={newWidgetColor}
                    onChange={(e) => setNewWidgetColor(e.target.value)}
                    className="w-8 h-8 rounded border border-gray-300 cursor-pointer p-0.5"
                    title="Choose custom color"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-[#E2E8F0]">
                <button
                  type="button"
                  onClick={() => setIsAddWidgetModalOpen(false)}
                  className="px-4 py-2 border border-[#CBD5E1] rounded text-[#64748B] hover:bg-[#F8FAFC] font-semibold cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#00B074] hover:bg-[#009663] text-white rounded font-bold uppercase tracking-wider shadow-2xs cursor-pointer transition-colors"
                >
                  CREATE WIDGET
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Embed Code Modal */}
      {embedModalWidget && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-2xl space-y-4 border border-[#E2E8F0]">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-3">
              <div>
                <h3 className="font-bold text-base text-[#1E293B]">
                  Embed Widget: {embedModalWidget.name}
                </h3>
                <p className="text-xs text-[#64748B]">
                  Paste this code into the &lt;head&gt; or before &lt;/body&gt; on your website.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEmbedModalWidget(null)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-sm cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-[#1E293B] text-[#E2E8F0] rounded-lg p-3.5 font-mono text-xs overflow-x-auto select-all leading-relaxed">
              {`<script src="https://online.seranking.com/lead-generator.js" data-widget-id="${embedModalWidget.id}" async></script>`}
            </div>

            <div className="flex justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setEmbedModalWidget(null)}
                className="px-4 py-1.5 border border-[#CBD5E1] rounded text-xs text-[#64748B] hover:bg-[#F8FAFC]"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(
                    `<script src="https://online.seranking.com/lead-generator.js" data-widget-id="${embedModalWidget.id}" async></script>`
                  );
                  showToast('Embed script copied to clipboard!');
                  setEmbedModalWidget(null);
                }}
                className="px-4 py-1.5 bg-[#0B69FF] hover:bg-[#0052D4] text-white rounded text-xs font-bold uppercase tracking-wider cursor-pointer shadow-2xs"
              >
                Copy Embed Script
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {isAddUserModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-sm text-[#1E293B]">Add New User Seat</h3>
              <button onClick={() => setIsAddUserModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleAddUser} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-[#1E293B]">Full Name:</label>
                <input
                  type="text"
                  required
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  placeholder="e.g. John Doe"
                  className="w-full px-3 py-2 border border-[#CBD5E1] rounded"
                />
              </div>
              <div className="space-y-1">
                <label className="font-semibold text-[#1E293B]">Email Address:</label>
                <input
                  type="email"
                  required
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  placeholder="e.g. john@agency.com"
                  className="w-full px-3 py-2 border border-[#CBD5E1] rounded"
                />
              </div>
              <div className="space-y-1">
                <label className="font-semibold text-[#1E293B]">Role:</label>
                <select
                  value={newUserRole}
                  onChange={(e) => setNewUserRole(e.target.value as any)}
                  className="w-full px-3 py-2 border border-[#CBD5E1] rounded"
                >
                  <option value="Manager">Manager (Can manage projects & audits)</option>
                  <option value="Analyst">Analyst (Can view & export reports)</option>
                  <option value="Viewer">Viewer (Read-only access)</option>
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddUserModalOpen(false)}
                  className="px-3 py-1.5 border border-[#CBD5E1] rounded text-[#64748B]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#0B69FF] hover:bg-[#0052D4] text-white rounded font-bold uppercase tracking-wider"
                >
                  SEND INVITATION
                </button>
              </div>
            </form>
          </div>
        </div>
      )}


    </div>
  );
}

export default function AgencyPackPage({ initialTab }: { initialTab?: AgencyViewTab }) {
  return (
    <Suspense fallback={<div className="p-8 text-xs text-gray-500">Loading Agency Pack...</div>}>
      <AgencyPackContent initialTab={initialTab} />
    </Suspense>
  );
}
