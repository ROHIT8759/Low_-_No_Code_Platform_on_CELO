import { createHash } from 'crypto';
import 'server-only';
import { gzip, gunzip } from 'zlib';
import { promisify } from 'util';
import { mkdir, writeFile, readFile, unlink, access } from 'fs/promises';
import { join } from 'path';

const gzipAsync = promisify(gzip);
const gunzipAsync = promisify(gunzip);

const STORAGE_ROOT = process.env.ARTIFACT_STORAGE_PATH || join(process.cwd(), '.artifacts');

export type ArtifactType = 'stellar' | 'metadata';

const STORAGE_PATHS = {
  stellar: 'artifacts/stellar/',
  metadata: 'artifacts/metadata/',
} as const;

export class ArtifactStorage {
  private storageRoot: string;

  constructor(storageRoot?: string) {
    this.storageRoot = storageRoot || STORAGE_ROOT;
  }

  
  private computeHash(content: Buffer): string {
    return createHash('sha256').update(content).digest('hex');
  }

  
  private getStorageKey(type: ArtifactType, identifier: string, extension: string): string {
    const path = STORAGE_PATHS[type];
    return `${path}${identifier}.${extension}`;
  }

  
  private getFilePath(key: string): string {
    return join(this.storageRoot, key);
  }

  
  private async ensureDir(filePath: string): Promise<void> {
    const dir = filePath.substring(0, filePath.lastIndexOf('/') > -1 ? filePath.lastIndexOf('/') : filePath.lastIndexOf('\\'));
    await mkdir(dir, { recursive: true });
  }

  async storeStellarWASM(wasm: Buffer): Promise<{ artifactId: string; key: string }> {
    try {
      const hash = this.computeHash(wasm);

      
      const key = this.getStorageKey('stellar', hash, 'wasm');
      const filePath = this.getFilePath(key);
      await this.ensureDir(filePath);
      await writeFile(filePath, wasm);

      return { artifactId: hash, key };
    } catch (error) {
      console.error('[Storage] Error storing Stellar WASM:', error);
      throw new Error(`Failed to store Stellar WASM: ${error}`);
    }
  }

  
  async retrieveStellarWASM(artifactId: string): Promise<Buffer> {
    try {
      const key = this.getStorageKey('stellar', artifactId, 'wasm');
      const filePath = this.getFilePath(key);

      return await readFile(filePath);
    } catch (error) {
      console.error(`[Storage] Error retrieving Stellar WASM ${artifactId}:`, error);
      throw new Error(`Failed to retrieve Stellar WASM: ${error}`);
    }
  }

  
  async storeMetadata(artifactId: string, metadata: any): Promise<string> {
    try {
      const key = this.getStorageKey('metadata', artifactId, 'json');
      const filePath = this.getFilePath(key);
      await this.ensureDir(filePath);
      await writeFile(filePath, JSON.stringify(metadata, null, 2), 'utf-8');

      return key;
    } catch (error) {
      console.error(`[Storage] Error storing metadata for ${artifactId}:`, error);
      throw new Error(`Failed to store metadata: ${error}`);
    }
  }

  
  async retrieveMetadata(artifactId: string): Promise<any> {
    try {
      const key = this.getStorageKey('metadata', artifactId, 'json');
      const filePath = this.getFilePath(key);

      const data = await readFile(filePath, 'utf-8');
      return JSON.parse(data);
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
    const extension = type === 'stellar' ? 'wasm' : 'json';
    const key = this.getStorageKey(type, artifactId, extension);
    return `file://${this.getFilePath(key)}`;
  }

  
  async deleteArtifact(artifactId: string, type: ArtifactType): Promise<void> {
    try {
      const extension = type === 'stellar' ? 'wasm' : 'json';
      const key = this.getStorageKey(type, artifactId, extension);
      const filePath = this.getFilePath(key);

      await unlink(filePath);
    } catch (error) {
      console.error(`[Storage] Error deleting artifact ${artifactId}:`, error);
      throw new Error(`Failed to delete artifact: ${error}`);
    }
  }

  
  async exists(artifactId: string, type: ArtifactType): Promise<boolean> {
    try {
      const extension = type === 'stellar' ? 'wasm' : 'json';
      const key = this.getStorageKey(type, artifactId, extension);
      const filePath = this.getFilePath(key);

      await access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  
  async store(content: Buffer | string, type: ArtifactType): Promise<string> {
    if (type === 'stellar') {
      const buffer = Buffer.isBuffer(content) ? content : Buffer.from(content, 'hex');
      const result = await this.storeStellarWASM(buffer);
      return result.artifactId;
    } else {
      throw new Error(`Unsupported artifact type: ${type}`);
    }
  }

  
  async retrieve(artifactId: string, type: ArtifactType): Promise<Buffer | string> {
    if (type === 'stellar') {
      return await this.retrieveStellarWASM(artifactId);
    } else if (type === 'metadata') {
      const metadata = await this.retrieveMetadata(artifactId);
      return JSON.stringify(metadata);
    } else {
      throw new Error(`Unsupported artifact type: ${type}`);
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
