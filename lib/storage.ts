import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  HeadObjectCommand,
  S3ClientConfig,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { createHash } from 'crypto';
import { gzip, gunzip } from 'zlib';
import { promisify } from 'util';

const gzipAsync = promisify(gzip);
const gunzipAsync = promisify(gunzip);

/**
 * S3 Artifact Storage Service
 * 
 * Provides storage operations for:
 * - EVM bytecode (compressed)
 * - Stellar WASM files
 * - Artifact metadata
 */

// S3 client configuration
const s3Config: S3ClientConfig = {
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY
    ? {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      }
    : undefined,
  endpoint: process.env.S3_ENDPOINT, // For S3-compatible services like MinIO
  forcePathStyle: process.env.S3_FORCE_PATH_STYLE === 'true', // Required for MinIO
};

// S3 client instance
const s3Client = new S3Client(s3Config);

// Bucket name from environment
const BUCKET_NAME = process.env.S3_BUCKET_NAME || 'contract-artifacts';

/**
 * Artifact types
 */
export type ArtifactType = 'evm' | 'stellar' | 'metadata';

/**
 * Storage paths for different artifact types
 */
const STORAGE_PATHS = {
  evm: 'artifacts/evm/',
  stellar: 'artifacts/stellar/',
  metadata: 'artifacts/metadata/',
} as const;

/**
 * Artifact Storage Service
 */
export class ArtifactStorage {
  private bucket: string;

  constructor(bucketName?: string) {
    this.bucket = bucketName || BUCKET_NAME;
  }

  /**
   * Compute SHA-256 hash of content
   */
  private computeHash(content: Buffer): string {
    return createHash('sha256').update(content).digest('hex');
  }

  /**
   * Get storage key for artifact
   */
  private getStorageKey(type: ArtifactType, identifier: string, extension: string): string {
    const path = STORAGE_PATHS[type];
    return `${path}${identifier}.${extension}`;
  }

  /**
   * Store EVM bytecode (compressed)
   * @param bytecode Hex string of bytecode
   * @returns Object with artifactId (hash) and storage key
   */
  async storeEVMBytecode(bytecode: string): Promise<{ artifactId: string; key: string }> {
    try {
      // Remove 0x prefix if present
      const cleanBytecode = bytecode.startsWith('0x') ? bytecode.slice(2) : bytecode;
      const bytecodeBuffer = Buffer.from(cleanBytecode, 'hex');

      // Compute hash before compression
      const hash = this.computeHash(bytecodeBuffer);

      // Compress bytecode
      const compressed = await gzipAsync(bytecodeBuffer);

      // Store in S3
      const key = this.getStorageKey('evm', hash, 'bytecode.gz');
      const command = new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: compressed,
        ContentType: 'application/gzip',
        ContentEncoding: 'gzip',
        Metadata: {
          'original-size': bytecodeBuffer.length.toString(),
          'compressed-size': compressed.length.toString(),
          'hash': hash,
        },
      });

      await s3Client.send(command);

      return { artifactId: hash, key };
    } catch (error) {
      console.error('[Storage] Error storing EVM bytecode:', error);
      throw new Error(`Failed to store EVM bytecode: ${error}`);
    }
  }

  /**
   * Retrieve EVM bytecode (decompressed)
   * @param artifactId Hash of the bytecode
   * @returns Hex string of bytecode
   */
  async retrieveEVMBytecode(artifactId: string): Promise<string> {
    try {
      const key = this.getStorageKey('evm', artifactId, 'bytecode.gz');
      const command = new GetObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });

      const response = await s3Client.send(command);
      
      if (!response.Body) {
        throw new Error('Empty response body');
      }

      // Convert stream to buffer
      const compressed = await this.streamToBuffer(response.Body);

      // Decompress
      const decompressed = await gunzipAsync(compressed);

      // Return as hex string with 0x prefix
      return '0x' + decompressed.toString('hex');
    } catch (error) {
      console.error(`[Storage] Error retrieving EVM bytecode ${artifactId}:`, error);
      throw new Error(`Failed to retrieve EVM bytecode: ${error}`);
    }
  }

  /**
   * Store Stellar WASM file
   * @param wasm WASM binary data
   * @returns Object with artifactId (hash) and storage key
   */
  async storeStellarWASM(wasm: Buffer): Promise<{ artifactId: string; key: string }> {
    try {
      // Compute hash
      const hash = this.computeHash(wasm);

      // Store in S3
      const key = this.getStorageKey('stellar', hash, 'wasm');
      const command = new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: wasm,
        ContentType: 'application/wasm',
        Metadata: {
          'size': wasm.length.toString(),
          'hash': hash,
        },
      });

      await s3Client.send(command);

      return { artifactId: hash, key };
    } catch (error) {
      console.error('[Storage] Error storing Stellar WASM:', error);
      throw new Error(`Failed to store Stellar WASM: ${error}`);
    }
  }

  /**
   * Retrieve Stellar WASM file
   * @param artifactId Hash of the WASM
   * @returns WASM binary data
   */
  async retrieveStellarWASM(artifactId: string): Promise<Buffer> {
    try {
      const key = this.getStorageKey('stellar', artifactId, 'wasm');
      const command = new GetObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });

      const response = await s3Client.send(command);
      
      if (!response.Body) {
        throw new Error('Empty response body');
      }

      return await this.streamToBuffer(response.Body);
    } catch (error) {
      console.error(`[Storage] Error retrieving Stellar WASM ${artifactId}:`, error);
      throw new Error(`Failed to retrieve Stellar WASM: ${error}`);
    }
  }

  /**
   * Store artifact metadata
   * @param artifactId Artifact identifier
   * @param metadata Metadata object
   */
  async storeMetadata(artifactId: string, metadata: any): Promise<string> {
    try {
      const key = this.getStorageKey('metadata', artifactId, 'json');
      const command = new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: JSON.stringify(metadata, null, 2),
        ContentType: 'application/json',
      });

      await s3Client.send(command);

      return key;
    } catch (error) {
      console.error(`[Storage] Error storing metadata for ${artifactId}:`, error);
      throw new Error(`Failed to store metadata: ${error}`);
    }
  }

  /**
   * Retrieve artifact metadata
   * @param artifactId Artifact identifier
   * @returns Metadata object
   */
  async retrieveMetadata(artifactId: string): Promise<any> {
    try {
      const key = this.getStorageKey('metadata', artifactId, 'json');
      const command = new GetObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });

      const response = await s3Client.send(command);
      
      if (!response.Body) {
        throw new Error('Empty response body');
      }

      const buffer = await this.streamToBuffer(response.Body);
      return JSON.parse(buffer.toString('utf-8'));
    } catch (error) {
      console.error(`[Storage] Error retrieving metadata for ${artifactId}:`, error);
      throw new Error(`Failed to retrieve metadata: ${error}`);
    }
  }

  /**
   * Generate signed URL for artifact retrieval
   * @param artifactId Artifact identifier
   * @param type Artifact type
   * @param expiresIn Expiration time in seconds (default: 3600 = 1 hour)
   * @returns Signed URL
   */
  async generateSignedUrl(
    artifactId: string,
    type: ArtifactType,
    expiresIn: number = 3600
  ): Promise<string> {
    try {
      const extension = type === 'evm' ? 'bytecode.gz' : type === 'stellar' ? 'wasm' : 'json';
      const key = this.getStorageKey(type, artifactId, extension);

      const command = new GetObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });

      const signedUrl = await getSignedUrl(s3Client, command, { expiresIn });
      return signedUrl;
    } catch (error) {
      console.error(`[Storage] Error generating signed URL for ${artifactId}:`, error);
      throw new Error(`Failed to generate signed URL: ${error}`);
    }
  }

  /**
   * Delete artifact
   * @param artifactId Artifact identifier
   * @param type Artifact type
   */
  async deleteArtifact(artifactId: string, type: ArtifactType): Promise<void> {
    try {
      const extension = type === 'evm' ? 'bytecode.gz' : type === 'stellar' ? 'wasm' : 'json';
      const key = this.getStorageKey(type, artifactId, extension);

      const command = new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });

      await s3Client.send(command);
    } catch (error) {
      console.error(`[Storage] Error deleting artifact ${artifactId}:`, error);
      throw new Error(`Failed to delete artifact: ${error}`);
    }
  }

  /**
   * Check if artifact exists
   * @param artifactId Artifact identifier
   * @param type Artifact type
   * @returns True if artifact exists
   */
  async exists(artifactId: string, type: ArtifactType): Promise<boolean> {
    try {
      const extension = type === 'evm' ? 'bytecode.gz' : type === 'stellar' ? 'wasm' : 'json';
      const key = this.getStorageKey(type, artifactId, extension);

      const command = new HeadObjectCommand({
        Bucket: this.bucket,
        Key: key,
      });

      await s3Client.send(command);
      return true;
    } catch (error: any) {
      if (error.name === 'NotFound' || error.$metadata?.httpStatusCode === 404) {
        return false;
      }
      console.error(`[Storage] Error checking existence of ${artifactId}:`, error);
      throw error;
    }
  }

  /**
   * Helper: Convert stream to buffer
   */
  private async streamToBuffer(stream: any): Promise<Buffer> {
    const chunks: Uint8Array[] = [];
    
    for await (const chunk of stream) {
      chunks.push(chunk);
    }
    
    return Buffer.concat(chunks);
  }

  /**
   * Store generic artifact (auto-detects type)
   * @param content Artifact content (Buffer or string)
   * @param type Artifact type
   * @returns Artifact ID
   */
  async store(content: Buffer | string, type: ArtifactType): Promise<string> {
    if (type === 'evm') {
      const bytecode = typeof content === 'string' ? content : content.toString('hex');
      const result = await this.storeEVMBytecode(bytecode);
      return result.artifactId;
    } else if (type === 'stellar') {
      const buffer = Buffer.isBuffer(content) ? content : Buffer.from(content, 'hex');
      const result = await this.storeStellarWASM(buffer);
      return result.artifactId;
    } else {
      throw new Error(`Unsupported artifact type: ${type}`);
    }
  }

  /**
   * Retrieve generic artifact
   * @param artifactId Artifact identifier
   * @param type Artifact type
   * @returns Artifact content
   */
  async retrieve(artifactId: string, type: ArtifactType): Promise<Buffer | string> {
    if (type === 'evm') {
      return await this.retrieveEVMBytecode(artifactId);
    } else if (type === 'stellar') {
      return await this.retrieveStellarWASM(artifactId);
    } else if (type === 'metadata') {
      const metadata = await this.retrieveMetadata(artifactId);
      return JSON.stringify(metadata);
    } else {
      throw new Error(`Unsupported artifact type: ${type}`);
    }
  }

  /**
   * Retrieve EVM artifact with metadata
   * @param artifactId Artifact identifier
   * @returns Object with bytecode and metadata
   */
  async retrieveEVMArtifact(artifactId: string): Promise<{ bytecode: string; metadata?: any } | null> {
    try {
      const bytecode = await this.retrieveEVMBytecode(artifactId);
      
      // Try to retrieve metadata if it exists
      let metadata;
      try {
        metadata = await this.retrieveMetadata(artifactId);
      } catch (error) {
        // Metadata is optional
        metadata = undefined;
      }

      return { bytecode, metadata };
    } catch (error) {
      console.error(`[Storage] Error retrieving EVM artifact ${artifactId}:`, error);
      return null;
    }
  }

  /**
   * Retrieve Stellar artifact with metadata
   * @param artifactId Artifact identifier
   * @returns Object with WASM and metadata
   */
  async retrieveStellarArtifact(artifactId: string): Promise<{ wasm: Buffer; metadata?: any } | null> {
    try {
      const wasm = await this.retrieveStellarWASM(artifactId);
      
      // Try to retrieve metadata if it exists
      let metadata;
      try {
        metadata = await this.retrieveMetadata(artifactId);
      } catch (error) {
        // Metadata is optional
        metadata = undefined;
      }

      return { wasm, metadata };
    } catch (error) {
      console.error(`[Storage] Error retrieving Stellar artifact ${artifactId}:`, error);
      return null;
    }
  }
}

// Export singleton instance
export const storage = new ArtifactStorage();

// Export utility functions
export { s3Client };
