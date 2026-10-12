import { z } from 'zod';
import { normalizeCountryCode } from '@/lib/countryUtils';

export function normalizeDomain(input: string): string {
  let cleaned = (input || '').trim().toLowerCase();
  cleaned = cleaned.replace(/^https?:\/\//, '');
  cleaned = cleaned.replace(/^www\./, '');
  cleaned = cleaned.replace(/\/.*$/, '');
  return cleaned;
}

export function normalizeUrl(input: string): string {
  let cleaned = (input || '').trim();
  if (!cleaned) return '';
  if (!/^https?:\/\//i.test(cleaned)) {
    cleaned = 'https://' + cleaned;
  }
  return cleaned;
}

export interface DomainValidationResult {
  valid: boolean;
  normalizedDomain: string;
  error?: string;
}

const FAKE_TLDS_AND_DOMAINS = new Set([
  'localhost', 'local', 'test', 'example', 'invalid', 'dummy', 'fake', 'none',
  'test.com', 'example.com', 'fake.com', 'mytest.com', 'domain.com', 'site.com'
]);

const DOMAIN_FORMAT_REGEX = /^(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,24}$/;

export function validateRealDomainFormat(input: string): DomainValidationResult {
  if (!input || typeof input !== 'string') {
    return { valid: false, normalizedDomain: '', error: 'Website URL or domain is required.' };
  }

  const normalized = normalizeDomain(input);

  if (!normalized || normalized.length < 4) {
    return { valid: false, normalizedDomain: normalized, error: 'Domain name is too short. Please enter a real domain (e.g., example.com).' };
  }

  if (normalized.length > 253) {
    return { valid: false, normalizedDomain: normalized, error: 'Domain name exceeds maximum length.' };
  }

  if (!normalized.includes('.')) {
    return { valid: false, normalizedDomain: normalized, error: 'Domain must include a valid extension (e.g. .com, .org, .io).' };
  }

  if (!DOMAIN_FORMAT_REGEX.test(normalized)) {
    return { valid: false, normalizedDomain: normalized, error: 'Invalid domain format. Only letters, numbers, hyphens and dots are allowed.' };
  }

  const parts = normalized.split('.');
  const tld = parts[parts.length - 1].toLowerCase();

  if (/^\d+$/.test(tld) || tld.length < 2) {
    return { valid: false, normalizedDomain: normalized, error: `Invalid extension ".${tld}". Top-level domain cannot be numeric or single letter.` };
  }

  if (FAKE_TLDS_AND_DOMAINS.has(tld) || FAKE_TLDS_AND_DOMAINS.has(normalized)) {
    return { valid: false, normalizedDomain: normalized, error: 'Please enter a genuine, registered website domain.' };
  }

  return { valid: true, normalizedDomain: normalized };
}

import { validateRealEmail } from './email-validator';

export const LoginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required.')
    .transform((val) => val.toLowerCase().trim())
    .refine((val) => validateRealEmail(val, { allowExampleDomains: process.env.NODE_ENV === 'test' }).valid, {
      message: 'Temporary or disposable email addresses (temp mail) are not allowed. Please enter a valid email address.',
    }),
  password: z.string().min(1, 'Password is required.'),
});

export const SignupSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  name: z.string().optional(),
  email: z
    .string()
    .min(1, 'Email is required.')
    .transform((val) => val.toLowerCase().trim())
    .refine((val) => validateRealEmail(val, { allowExampleDomains: process.env.NODE_ENV === 'test' }).valid, {
      message: 'Temporary or disposable email addresses (temp mail) are not allowed. Please enter a valid email address.',
    }),
  password: z.string().min(8, 'Password must be at least 8 characters long.'),
});

export const RegisterSchema = SignupSchema;

export const ForgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required.')
    .transform((val) => val.toLowerCase().trim())
    .refine((val) => validateRealEmail(val, { allowExampleDomains: process.env.NODE_ENV === 'test' }).valid, {
      message: 'Please enter a valid personal or business email address.',
    }),
});

export const ResetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required.'),
  password: z.string().min(8, 'New password must be at least 8 characters long.'),
  confirmPassword: z.string().optional(),
}).refine((data) => !data.confirmPassword || data.password === data.confirmPassword, {
  message: 'Passwords do not match.',
  path: ['confirmPassword'],
});


export const ProjectSchema = z.object({
  name: z.string().min(1, 'Project name is required').max(100),
  websiteUrl: z.string().optional().nullable(),
  domain: z
    .string()
    .min(1, 'Domain is required')
    .refine((val) => validateRealDomainFormat(val).valid, {
      message: 'Please enter a real, valid domain name (e.g. example.com).',
    })
    .transform(normalizeDomain),
  brandName: z.string().optional().nullable(),
  country: z.string().default('India'),
  countryCode: z.string().default('in').transform((val) => normalizeCountryCode(val)?.toLowerCase() || 'in'),
  languageCode: z.string().default('en'),
  searchEngine: z.string().default('google'),
  device: z.enum(['desktop', 'mobile']).default('desktop'),
  weeklyReport: z.boolean().default(false),
  websiteAudit: z.boolean().default(true),
  backlinkReport: z.boolean().default(false),
  color: z.string().optional().nullable(),
});

export type ProjectInput = z.infer<typeof ProjectSchema>;

export const ProjectWizardSchema = z.object({
  general: z.object({
    websiteUrl: z
      .string()
      .min(1, 'Website URL is required')
      .refine((val) => validateRealDomainFormat(val).valid, {
        message: 'Please enter a real, valid website URL (e.g. example.com).',
      }),
    projectName: z.string().min(1, 'Project name is required'),
    groupId: z.string().optional().nullable(),
    projectColor: z.string().optional().nullable(),
    weeklyReport: z.boolean().default(false),
    websiteAudit: z.boolean().default(true),
    backlinkReport: z.boolean().default(false),
  }),
  searchEngines: z.array(
    z.object({
      engine: z.string().default('google'),
      countryCode: z.string().default('in'),
      country: z.string().default('India'),
      languageCode: z.string().default('en'),
      language: z.string().default('English'),
      device: z.enum(['desktop', 'mobile']).default('desktop'),
      location: z.string().optional().nullable(),
    })
  ).default([]),
  keywords: z.array(
    z.object({
      keyword: z.string().min(1),
      group: z.string().default('General'),
      tags: z.array(z.string()).default([]),
    })
  ).default([]),
  prompts: z.array(
    z.object({
      prompt: z.string().min(1),
      engine: z.string().default('ai-overview'),
      topic: z.string().default('Brand Research'),
    })
  ).default([]),
  competitors: z.array(
    z.object({
      domain: z
        .string()
        .min(1)
        .refine((val) => validateRealDomainFormat(val).valid, {
          message: 'Competitor must be a valid real domain (e.g. competitor.com).',
        })
        .transform(normalizeDomain),
      name: z.string().optional(),
    })
  ).default([]),
  analytics: z.object({
    connectGa4: z.boolean().default(false),
    connectGsc: z.boolean().default(false),
    connectGbp: z.boolean().default(false),
  }).default({
    connectGa4: false,
    connectGsc: false,
    connectGbp: false,
  }),
});

export const KeywordAddSchema = z.object({
  keywords: z.union([z.string(), z.array(z.string())]),
  group: z.string().optional().default('General'),
  searchEngine: z.string().optional().default('google'),
  countryCode: z.string().optional().default('in'),
  device: z.enum(['desktop', 'mobile']).optional().default('desktop'),
  tags: z.array(z.string()).optional().default([]),
});

export const CompetitorAddSchema = z.object({
  name: z.string().min(1, 'Competitor name is required'),
  domain: z.string().min(1, 'Domain is required').transform(normalizeDomain),
  notes: z.string().optional().nullable(),
});

export const LocationCreateSchema = z.object({
  name: z.string().min(1, 'Business / location name is required'),
  countryCode: z.string().default('US').transform((val) => normalizeCountryCode(val) || 'US'),
  region: z.string().optional().nullable(),
  city: z.string().min(1, 'City is required'),
  postalCode: z.string().optional().nullable(),
  address: z.string().min(1, 'Address is required'),
  phone: z.string().optional().nullable(),
  category: z.string().optional().nullable(),
  latitude: z.number().optional().nullable(),
  longitude: z.number().optional().nullable(),
  language: z.string().default('en'),
  timezone: z.string().default('UTC'),
});

export const GbpPostCreateSchema = z.object({
  locationId: z.string().optional().nullable(),
  title: z.string().optional().nullable(),
  text: z.string().min(1, 'Post content is required'),
  type: z.enum(['Offer', 'Event', 'Update']).default('Update'),
  status: z.enum(['Draft', 'Scheduled', 'Published']).default('Published'),
  ctaText: z.string().optional().nullable(),
  ctaUrl: z.string().url('Invalid URL format').optional().nullable(),
  couponCode: z.string().optional().nullable(),
  startDate: z.string().optional().nullable(),
  endDate: z.string().optional().nullable(),
});

export const TaskCreateSchema = z.object({
  title: z.string().min(1, 'Task title is required'),
  description: z.string().optional().nullable(),
  priority: z.enum(['High', 'Medium', 'Low']).default('Medium'),
  status: z.enum(['Todo', 'InProgress', 'Review', 'Done']).default('Todo'),
  dueDate: z.string().optional().nullable(),
  assignedToName: z.string().optional().nullable(),
});

export const AnalyzeRequestSchema = z.object({
  domain: z
    .string()
    .min(1, 'Enter a valid website domain or URL.')
    .refine((val) => validateRealDomainFormat(val).valid, {
      message: 'Enter a valid website domain or URL.',
    })
    .transform(normalizeDomain),
  scope: z.enum(['*.domain.com/*', 'domain.com/*', 'Exact URL']).default('*.domain.com/*'),
  country: z.string().min(1, 'Target location is required'),
  countryCode: z.string().min(1, 'Target location code is required'),
  brandName: z.string().optional().nullable(),
  searchType: z.enum(['ai-search', 'google-search']).default('ai-search'),
  projectId: z.string().optional().nullable(),
});

export const CompetitorSchema = z.object({
  domain: z.string().min(1, 'Domain is required').transform(normalizeDomain),
  name: z.string().optional().default(''),
  brandName: z.string().optional().nullable(),
  analysisId: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});
export type AnalyzeRequestInput = z.infer<typeof AnalyzeRequestSchema>;
export type CompetitorInput = z.infer<typeof CompetitorSchema>;
