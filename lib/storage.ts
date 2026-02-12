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

const s3Config: S3ClientConfig = {
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY
    ? {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      }
    : undefined,
  endpoint: process.env.S3_ENDPOINT, 
  forcePathStyle: process.env.S3_FORCE_PATH_STYLE === 'true', 
};

const s3Client = new S3Client(s3Config);

const BUCKET_NAME = process.env.S3_BUCKET_NAME || 'contract-artifacts';

export type ArtifactType = 'evm' | 'stellar' | 'metadata';

const STORAGE_PATHS = {
  evm: 'artifacts/evm/',
  stellar: 'artifacts/stellar/',
  metadata: 'artifacts/metadata/',
} as const;

export class ArtifactStorage {
  private bucket: string;

  constructor(bucketName?: string) {
    this.bucket = bucketName || BUCKET_NAME;
  }

  
  private computeHash(content: Buffer): string {
    return createHash('sha256').update(content).digest('hex');
  }

  
  private getStorageKey(type: ArtifactType, identifier: string, extension: string): string {
    const path = STORAGE_PATHS[type];
    return `${path}${identifier}.${extension}`;
  }

  
  async storeEVMBytecode(bytecode: string): Promise<{ artifactId: string; key: string }> {
    try {
      
      const cleanBytecode = bytecode.startsWith('0x') ? bytecode.slice(2) : bytecode;
      const bytecodeBuffer = Buffer.from(cleanBytecode, 'hex');

      
      const hash = this.computeHash(bytecodeBuffer);

      
      const compressed = await gzipAsync(bytecodeBuffer);

      
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

      
      const compressed = await this.streamToBuffer(response.Body);

      
      const decompressed = await gunzipAsync(compressed);

      
      return '0x' + decompressed.toString('hex');
    } catch (error) {
      console.error(`[Storage] Error retrieving EVM bytecode ${artifactId}:`, error);
      throw new Error(`Failed to retrieve EVM bytecode: ${error}`);
    }
  }

  
  async storeStellarWASM(wasm: Buffer): Promise<{ artifactId: string; key: string }> {
    try {
      
      const hash = this.computeHash(wasm);

      
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

  
  private async streamToBuffer(stream: any): Promise<Buffer> {
    const chunks: Uint8Array[] = [];
    
    for await (const chunk of stream) {
      chunks.push(chunk);
    }
    
    return Buffer.concat(chunks);
  }

  
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

  
  async retrieveEVMArtifact(artifactId: string): Promise<{ bytecode: string; metadata?: any } | null> {
    try {
      const bytecode = await this.retrieveEVMBytecode(artifactId);
      
      
      let metadata;
      try {
        metadata = await this.retrieveMetadata(artifactId);
      } catch (error) {
        
        metadata = undefined;
      }

      return { bytecode, metadata };
    } catch (error) {
      console.error(`[Storage] Error retrieving EVM artifact ${artifactId}:`, error);
      return null;
    }
  }

  
  async retrieveStellarArtifact(artifactId: string): Promise<{ wasm: Buffer; metadata?: any } | null> {
    try {
      const wasm = await this.retrieveStellarWASM(artifactId);
      
      
      let metadata;
      try {
        metadata = await this.retrieveMetadata(artifactId);
      } catch (error) {
        
        metadata = undefined;
      }

      return { wasm, metadata };
    } catch (error) {
      console.error(`[Storage] Error retrieving Stellar artifact ${artifactId}:`, error);
      return null;
    }
  }
}

export const storage = new ArtifactStorage();

export { s3Client };
