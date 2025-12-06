import { z } from "zod";

/**
 * Storage configuration for file uploads
 * Supports S3-compatible storage (AWS S3, Cloudflare R2, MinIO, etc.)
 */
export const storageConfigSchema = z.object({
  /**
   * The bucket endpoint URL
   * e.g., "https://s3.amazonaws.com" or "https://storage.railway.app"
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

  /**
   * URL style for S3 requests
   * - "virtual-hosted": bucket.endpoint/path (Railway, newer AWS S3)
   * - "path": endpoint/bucket/path (older style, some S3-compatible services)
   * Default: "virtual-hosted"
   */
  urlStyle: z
    .enum(["virtual-hosted", "path"])
    .optional()
    .default("virtual-hosted"),
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

  /**
   * Fetch a file from the bucket with authentication
   * Returns the Response object for streaming
   */
  fetch(bucketPath: string): Promise<Response>;
}

// =============================================================================
// AWS Signature V4 Implementation
// =============================================================================

async function sha256(message: ArrayBuffer | string): Promise<ArrayBuffer> {
  const encoder = new TextEncoder();
  const data = typeof message === "string" ? encoder.encode(message) : message;
  return await crypto.subtle.digest("SHA-256", data);
}

function toHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function hmacSha256(
  key: ArrayBuffer | string,
  message: string
): Promise<ArrayBuffer> {
  const encoder = new TextEncoder();
  const keyData = typeof key === "string" ? encoder.encode(key) : key;
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  return await crypto.subtle.sign("HMAC", cryptoKey, encoder.encode(message));
}

async function getSignatureKey(
  secretKey: string,
  dateStamp: string,
  region: string,
  service: string
): Promise<ArrayBuffer> {
  const kDate = await hmacSha256("AWS4" + secretKey, dateStamp);
  const kRegion = await hmacSha256(kDate, region);
  const kService = await hmacSha256(kRegion, service);
  const kSigning = await hmacSha256(kService, "aws4_request");
  return kSigning;
}

interface SignedHeaders {
  Authorization: string;
  "x-amz-date": string;
  "x-amz-content-sha256": string;
  [key: string]: string;
}

async function signRequest(
  method: string,
  url: URL,
  headers: Record<string, string>,
  body: ArrayBuffer,
  accessKeyId: string,
  secretAccessKey: string,
  region: string,
  service: string = "s3"
): Promise<SignedHeaders> {
  const now = new Date();
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, "");
  const dateStamp = amzDate.slice(0, 8);

  // Hash the payload
  const payloadHash = toHex(await sha256(body));

  // Create canonical headers
  const host = url.host;
  const signedHeadersList = ["host", "x-amz-content-sha256", "x-amz-date"];
  if (headers["Content-Type"]) {
    signedHeadersList.push("content-type");
  }
  signedHeadersList.sort();

  const canonicalHeaders = signedHeadersList
    .map((h) => {
      if (h === "host") return `host:${host}`;
      if (h === "x-amz-date") return `x-amz-date:${amzDate}`;
      if (h === "x-amz-content-sha256")
        return `x-amz-content-sha256:${payloadHash}`;
      if (h === "content-type")
        return `content-type:${headers["Content-Type"]}`;
      return `${h}:${headers[h]}`;
    })
    .join("\n");

  const signedHeaders = signedHeadersList.join(";");

  // Create canonical request
  const canonicalUri = url.pathname;
  const canonicalQuerystring = url.search.slice(1); // Remove leading ?

  const canonicalRequest = [
    method,
    canonicalUri,
    canonicalQuerystring,
    canonicalHeaders + "\n",
    signedHeaders,
    payloadHash,
  ].join("\n");

  // Create string to sign
  const algorithm = "AWS4-HMAC-SHA256";
  const credentialScope = `${dateStamp}/${region}/${service}/aws4_request`;
  const stringToSign = [
    algorithm,
    amzDate,
    credentialScope,
    toHex(await sha256(canonicalRequest)),
  ].join("\n");

  // Calculate signature
  const signingKey = await getSignatureKey(
    secretAccessKey,
    dateStamp,
    region,
    service
  );
  const signature = toHex(await hmacSha256(signingKey, stringToSign));

  // Create authorization header
  const authorizationHeader = [
    `${algorithm} Credential=${accessKeyId}/${credentialScope}`,
    `SignedHeaders=${signedHeaders}`,
    `Signature=${signature}`,
  ].join(", ");

  return {
    Authorization: authorizationHeader,
    "x-amz-date": amzDate,
    "x-amz-content-sha256": payloadHash,
  };
}

/**
 * Creates a storage client for S3-compatible storage
 */
export const createStorageClient = (config: StorageConfig): StorageClient => {
  const validatedConfig = storageConfigSchema.parse(config);
  const useVirtualHosted = validatedConfig.urlStyle === "virtual-hosted";

  /**
   * Build the S3 URL based on the configured URL style
   */
  const buildS3Url = (bucketPath: string): URL => {
    if (useVirtualHosted) {
      // Virtual-hosted style: https://bucket.endpoint/path
      const endpointUrl = new URL(validatedConfig.endpoint);
      const virtualHostedUrl = `${endpointUrl.protocol}//${validatedConfig.bucket}.${endpointUrl.host}/${bucketPath}`;
      return new URL(virtualHostedUrl);
    } else {
      // Path style: https://endpoint/bucket/path
      return new URL(
        `${validatedConfig.endpoint}/${validatedConfig.bucket}/${bucketPath}`
      );
    }
  };

  const getPublicUrl = (bucketPath: string): string => {
    if (validatedConfig.publicUrl) {
      return `${validatedConfig.publicUrl}/${bucketPath}`;
    }
    return buildS3Url(bucketPath).toString();
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

    // Create the upload URL using the configured URL style
    const uploadUrl = buildS3Url(bucketPath);

    // Get file content as ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();

    // Sign the request with AWS Signature V4
    const headers: Record<string, string> = {
      "Content-Type": contentType,
    };

    const signedHeaders = await signRequest(
      "PUT",
      uploadUrl,
      headers,
      arrayBuffer,
      validatedConfig.accessKeyId,
      validatedConfig.secretAccessKey,
      validatedConfig.region || "auto"
    );

    const response = await fetch(uploadUrl.toString(), {
      method: "PUT",
      headers: {
        ...headers,
        ...signedHeaders,
      },
      body: arrayBuffer,
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      throw new Error(
        `Upload failed: ${response.status} ${response.statusText}${
          errorText ? ` - ${errorText}` : ""
        }`
      );
    }

    return {
      url: getPublicUrl(bucketPath),
      bucketPath,
      filename,
    };
  };

  const deleteFile = async (bucketPath: string): Promise<void> => {
    const deleteUrl = buildS3Url(bucketPath);

    // Sign the DELETE request
    const signedHeaders = await signRequest(
      "DELETE",
      deleteUrl,
      {},
      new ArrayBuffer(0),
      validatedConfig.accessKeyId,
      validatedConfig.secretAccessKey,
      validatedConfig.region || "auto"
    );

    const response = await fetch(deleteUrl.toString(), {
      method: "DELETE",
      headers: signedHeaders,
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

  const fetchFile = async (bucketPath: string): Promise<Response> => {
    const fileUrl = buildS3Url(bucketPath);

    // Sign the GET request
    const signedHeaders = await signRequest(
      "GET",
      fileUrl,
      {},
      new ArrayBuffer(0),
      validatedConfig.accessKeyId,
      validatedConfig.secretAccessKey,
      validatedConfig.region || "auto"
    );

    return fetch(fileUrl.toString(), {
      method: "GET",
      headers: signedHeaders,
    });
  };

  return {
    upload,
    delete: deleteFile,
    getSignedUrl,
    getPublicUrl,
    fetch: fetchFile,
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
