/**
 * Cloudflare Integration Configuration
 * Centralized settings for Cloudflare API, R2 Storage, Turnstile, and Edge CDN
 */

export interface CloudflareConfig {
  accountId: string;
  apiToken: string;
  r2: {
    accessKeyId: string;
    secretAccessKey: string;
    endpoint: string;
    bucketName: string;
    publicUrl: string;
  };
  turnstile: {
    siteKey: string;
    secretKey: string;
  };
}

export function getCloudflareConfig(): CloudflareConfig {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID || '';
  const apiToken = process.env.CLOUDFLARE_API_TOKEN || '';
  
  const accessKeyId = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID || '';
  const secretAccessKey = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY || '';
  const endpoint = process.env.CLOUDFLARE_R2_S3_ENDPOINT || (accountId ? `https://${accountId}.r2.cloudflarestorage.com` : '');
  const bucketName = process.env.CLOUDFLARE_R2_BUCKET_NAME || 'seranking';
  const publicUrl = process.env.NEXT_PUBLIC_CLOUDFLARE_R2_PUBLIC_URL || (endpoint ? `${endpoint}/${bucketName}` : '');

  // Cloudflare Turnstile production site and secret keys
  const turnstileSiteKey = process.env.NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY || '0x4AAAAAAFSBSgnXN7R18grY';
  const turnstileSecretKey = process.env.CLOUDFLARE_TURNSTILE_SECRET_KEY || '0x4AAAAAAFSBSiLCiCpd_VjOh5KBOuopV44';

  return {
    accountId,
    apiToken,
    r2: {
      accessKeyId,
      secretAccessKey,
      endpoint,
      bucketName,
      publicUrl,
    },
    turnstile: {
      siteKey: turnstileSiteKey,
      secretKey: turnstileSecretKey,
    },
  };
}
