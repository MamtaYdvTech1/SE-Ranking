/**
 * Cloudflare R2 Object Storage Client
 * S3-compatible cloud storage for branding assets, SEO reports, avatars, and audit snapshots.
 */

import {
  S3Client,
  PutObjectCommand,
  ListObjectsV2Command,
  DeleteObjectCommand,
  HeadObjectCommand,
} from '@aws-sdk/client-s3';
import fs from 'fs';
import path from 'path';
import { getCloudflareConfig } from './config';

export interface R2UploadResult {
  success: boolean;
  key: string;
  url: string;
  size: number;
  contentType: string;
  storage: 'cloudflare_r2' | 'local_fallback';
  message: string;
}

export interface R2ObjectItem {
  key: string;
  size: number;
  lastModified: string;
  url: string;
  storage: 'cloudflare_r2' | 'local_fallback';
}

let s3ClientInstance: S3Client | null = null;

export function getR2Client(): S3Client {
  if (s3ClientInstance) return s3ClientInstance;

  const config = getCloudflareConfig();
  s3ClientInstance = new S3Client({
    region: 'auto',
    endpoint: config.r2.endpoint,
    credentials: {
      accessKeyId: config.r2.accessKeyId,
      secretAccessKey: config.r2.secretAccessKey,
    },
    tls: true,
  });

  return s3ClientInstance;
}

/**
 * Upload a file buffer or stream to Cloudflare R2 with automatic fallback
 */
export async function uploadToR2(params: {
  buffer: Buffer;
  key: string;
  contentType: string;
  folder?: string;
}): Promise<R2UploadResult> {
  const config = getCloudflareConfig();
  const folder = params.folder ? `${params.folder.replace(/\/+$/, '')}/` : '';
  const fullKey = `${folder}${params.key}`;

  // Try direct Cloudflare R2 upload first
  try {
    const s3 = getR2Client();
    const command = new PutObjectCommand({
      Bucket: config.r2.bucketName,
      Key: fullKey,
      Body: params.buffer,
      ContentType: params.contentType,
    });

    await s3.send(command);

    const publicUrl = `${config.r2.publicUrl}/${fullKey}`;

    return {
      success: true,
      key: fullKey,
      url: publicUrl,
      size: params.buffer.length,
      contentType: params.contentType,
      storage: 'cloudflare_r2',
      message: 'Successfully uploaded to Cloudflare R2',
    };
  } catch (error: any) {
    console.warn(`[Cloudflare R2] Remote upload failed (${error.message}). Falling back to local storage.`);

    // Local storage fallback for seamless offline or development experience
    try {
      const localDir = path.join(process.cwd(), 'public', 'uploads', params.folder || 'misc');
      if (!fs.existsSync(localDir)) {
        fs.mkdirSync(localDir, { recursive: true });
      }

      const filePath = path.join(localDir, params.key);
      fs.writeFileSync(filePath, params.buffer);

      const localUrl = `/uploads/${params.folder || 'misc'}/${params.key}`;

      return {
        success: true,
        key: fullKey,
        url: localUrl,
        size: params.buffer.length,
        contentType: params.contentType,
        storage: 'local_fallback',
        message: 'Saved to local fallback storage (R2 offline or credentials invalid)',
      };
    } catch (localError: any) {
      throw new Error(`Failed to upload to both R2 and local fallback: ${localError.message}`);
    }
  }
}

/**
 * List files in the Cloudflare R2 bucket or local storage
 */
export async function listR2Files(params?: {
  prefix?: string;
  maxKeys?: number;
}): Promise<R2ObjectItem[]> {
  const config = getCloudflareConfig();
  const items: R2ObjectItem[] = [];

  // 1. Try listing from Cloudflare R2
  try {
    const s3 = getR2Client();
    const command = new ListObjectsV2Command({
      Bucket: config.r2.bucketName,
      Prefix: params?.prefix || '',
      MaxKeys: params?.maxKeys || 50,
    });

    const response = await s3.send(command);

    if (response.Contents) {
      for (const obj of response.Contents) {
        if (obj.Key) {
          items.push({
            key: obj.Key,
            size: obj.Size || 0,
            lastModified: obj.LastModified ? obj.LastModified.toISOString() : new Date().toISOString(),
            url: `${config.r2.publicUrl}/${obj.Key}`,
            storage: 'cloudflare_r2',
          });
        }
      }
    }
  } catch (error: any) {
    console.warn(`[Cloudflare R2] ListObjects failed (${error.message}). Checking local fallback files.`);
  }

  // 2. Also aggregate any local fallback uploads
  try {
    const baseUploadsDir = path.join(process.cwd(), 'public', 'uploads');
    if (fs.existsSync(baseUploadsDir)) {
      const scanDir = (dir: string, prefix = '') => {
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        for (const entry of entries) {
          const fullPath = path.join(dir, entry.name);
          const relKey = prefix ? `${prefix}/${entry.name}` : entry.name;
          if (entry.isDirectory()) {
            scanDir(fullPath, relKey);
          } else {
            const stats = fs.statSync(fullPath);
            // Avoid duplicate if already found in R2
            if (!items.some((i) => i.key === relKey)) {
              items.push({
                key: relKey,
                size: stats.size,
                lastModified: stats.mtime.toISOString(),
                url: `/uploads/${relKey}`,
                storage: 'local_fallback',
              });
            }
          }
        }
      };
      scanDir(baseUploadsDir);
    }
  } catch {
    // Ignore local scan error
  }

  return items;
}

/**
 * Delete a file from Cloudflare R2 (and local fallback)
 */
export async function deleteFromR2(key: string): Promise<{ success: boolean; message: string }> {
  const config = getCloudflareConfig();
  let deletedFromR2 = false;
  let deletedFromLocal = false;

  // Try R2 deletion
  try {
    const s3 = getR2Client();
    const command = new DeleteObjectCommand({
      Bucket: config.r2.bucketName,
      Key: key,
    });
    await s3.send(command);
    deletedFromR2 = true;
  } catch (err: any) {
    console.warn(`[Cloudflare R2] Delete failed on R2: ${err.message}`);
  }

  // Also try local deletion
  try {
    const localPath = path.join(process.cwd(), 'public', 'uploads', key);
    if (fs.existsSync(localPath)) {
      fs.unlinkSync(localPath);
      deletedFromLocal = true;
    }
  } catch {
    // Ignore local error
  }

  return {
    success: true,
    message: deletedFromR2
      ? `Deleted object "${key}" from Cloudflare R2 bucket`
      : deletedFromLocal
      ? `Deleted object "${key}" from local storage fallback`
      : `File "${key}" was removed or not found`,
  };
}

/**
 * Check R2 connectivity health
 */
export async function checkR2Status(): Promise<{
  connected: boolean;
  bucket: string;
  endpoint: string;
  error?: string;
  latencyMs?: number;
}> {
  const config = getCloudflareConfig();
  const startTime = Date.now();

  try {
    const s3 = getR2Client();
    await s3.send(
      new ListObjectsV2Command({
        Bucket: config.r2.bucketName,
        MaxKeys: 1,
      })
    );

    return {
      connected: true,
      bucket: config.r2.bucketName,
      endpoint: config.r2.endpoint,
      latencyMs: Date.now() - startTime,
    };
  } catch (error: any) {
    return {
      connected: false,
      bucket: config.r2.bucketName,
      endpoint: config.r2.endpoint,
      error: error.message || 'Handshake or authentication error',
      latencyMs: Date.now() - startTime,
    };
  }
}
