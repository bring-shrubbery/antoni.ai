import { z } from "zod";

/**
 * Storage configuration for file uploads
 * Supports S3-compatible storage (AWS S3, Cloudflare R2, MinIO, etc.)
 */
export const storageConfigSchema = z.object({
  /**
   * The bucket endpoint URL
   * e.g., "https://s3.amazonaws.com" or "https://<account>.r2.cloudflarestorage.com"
   */
  endpoint: z.url(),

  /**
   * The bucket name
   */
  bucket: z.string(),

  /**
   * Access key ID for authentication
   */
  accessKeyId: z.string(),

  /**
   * Secret access key for authentication
   */
  secretAccessKey: z.string(),

  /**
   * AWS region (optional for some S3-compatible services)
   */
  region: z.string().optional().default("auto"),

  /**
   * Public URL prefix for accessing files
   * e.g., "https://cdn.example.com" or "https://<bucket>.s3.amazonaws.com"
   */
  publicUrl: z.string().url().optional(),

  /**
   * Path prefix for all uploads within the bucket
   * e.g., "cms/uploads" -> files stored as "cms/uploads/filename.jpg"
   */
  pathPrefix: z.string().optional().default("cms"),
});

export type StorageConfig = z.infer<typeof storageConfigSchema>;

let storageInstance: StorageClient | null = null;

export interface UploadResult {
  url: string;
  bucketPath: string;
  filename: string;
}

export interface StorageClient {
  /**
   * Upload a file to the storage bucket
   */
  upload(
    file: File | Blob,
    options?: {
      filename?: string;
      contentType?: string;
      folder?: string;
    }
  ): Promise<UploadResult>;

  /**
   * Delete a file from the storage bucket
   */
  delete(bucketPath: string): Promise<void>;

  /**
   * Get a signed URL for temporary access
   */
  getSignedUrl(bucketPath: string, expiresIn?: number): Promise<string>;

  /**
   * Get the public URL for a file
   */
  getPublicUrl(bucketPath: string): string;
}

/**
 * Creates a storage client for S3-compatible storage
 */
export const createStorageClient = (config: StorageConfig): StorageClient => {
  const validatedConfig = storageConfigSchema.parse(config);

  const getPublicUrl = (bucketPath: string): string => {
    if (validatedConfig.publicUrl) {
      return `${validatedConfig.publicUrl}/${bucketPath}`;
    }
    return `${validatedConfig.endpoint}/${validatedConfig.bucket}/${bucketPath}`;
  };

  const generatePath = (filename: string, folder?: string): string => {
    const prefix = validatedConfig.pathPrefix;
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 8);
    const safeFilename = filename.replace(/[^a-zA-Z0-9.-]/g, "_");

    const parts = [prefix, folder, `${timestamp}-${randomId}-${safeFilename}`]
      .filter(Boolean)
      .join("/");

    return parts;
  };

  const upload = async (
    file: File | Blob,
    options?: {
      filename?: string;
      contentType?: string;
      folder?: string;
    }
  ): Promise<UploadResult> => {
    const filename =
      options?.filename || (file instanceof File ? file.name : "file");
    const contentType =
      options?.contentType || file.type || "application/octet-stream";
    const bucketPath = generatePath(filename, options?.folder);

    // Create the upload URL
    const uploadUrl = `${validatedConfig.endpoint}/${validatedConfig.bucket}/${bucketPath}`;

    // Get file content as ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();

    // Create authorization header using AWS Signature Version 4
    // For simplicity, we'll use a basic PUT request
    // In production, you'd want to use proper AWS4 signing or an SDK
    const response = await fetch(uploadUrl, {
      method: "PUT",
      headers: {
        "Content-Type": contentType,
        "Content-Length": String(arrayBuffer.byteLength),
        // Note: In production, you'd add proper AWS4 signature headers here
        // For now, this assumes the bucket allows public uploads or uses presigned URLs
      },
      body: arrayBuffer,
    });

    if (!response.ok) {
      throw new Error(
        `Upload failed: ${response.status} ${response.statusText}`
      );
    }

    return {
      url: getPublicUrl(bucketPath),
      bucketPath,
      filename,
    };
  };

  const deleteFile = async (bucketPath: string): Promise<void> => {
    const deleteUrl = `${validatedConfig.endpoint}/${validatedConfig.bucket}/${bucketPath}`;

    const response = await fetch(deleteUrl, {
      method: "DELETE",
      // Note: In production, add proper AWS4 signature headers
    });

    if (!response.ok && response.status !== 404) {
      throw new Error(
        `Delete failed: ${response.status} ${response.statusText}`
      );
    }
  };

  const getSignedUrl = async (
    bucketPath: string,
    _expiresIn: number = 3600
  ): Promise<string> => {
    // In a full implementation, this would generate a presigned URL
    // For now, return the public URL
    // TODO: Implement proper presigned URL generation
    return getPublicUrl(bucketPath);
  };

  return {
    upload,
    delete: deleteFile,
    getSignedUrl,
    getPublicUrl,
  };
};

/**
 * Initialize the storage client
 */
export const initStorage = (config: StorageConfig): StorageClient => {
  storageInstance = createStorageClient(config);
  return storageInstance;
};

/**
 * Get the current storage client
 */
export const getStorage = (): StorageClient => {
  if (!storageInstance) {
    throw new Error(
      "Storage not initialized. Call initStorage() first or pass storage config to createCMS()."
    );
  }
  return storageInstance;
};

/**
 * Set an external storage client (useful for testing)
 */
export const setStorage = (client: StorageClient): void => {
  storageInstance = client;
};
