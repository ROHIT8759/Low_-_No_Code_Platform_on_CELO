import { exec } from 'child_process';
import { promisify } from 'util';
import { mkdtemp, writeFile, readFile, rm } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';

const execAsync = promisify(exec);

export interface SorobanCompileResult {
  success: boolean;
  wasm?: Buffer;
  wasmHash?: string;
  abi?: any;
  warnings?: string[];
  error?: string;
  details?: string;
}

export class TempDirectoryManager {
  private tempDir: string | null = null;

  
  async create(): Promise<string> {
    try {
      const prefix = join(tmpdir(), 'soroban-compile-');
      this.tempDir = await mkdtemp(prefix);
      return this.tempDir;
    } catch (error: any) {
      throw new Error(`Failed to create temporary directory: ${error.message}`);
    }
  }

  
  async cleanup(): Promise<void> {
    if (this.tempDir) {
      try {
        await rm(this.tempDir, { recursive: true, force: true });
        this.tempDir = null;
      } catch (error: any) {
        console.error(`[TempDirectoryManager] Failed to cleanup ${this.tempDir}:`, error);
        
      }
    }
  }

  
  getPath(): string {
    if (!this.tempDir) {
      throw new Error('Temporary directory not created');
    }
    return this.tempDir;
  }
}

export class SorobanCompiler {
  
  async checkToolchain(): Promise<{ rust: boolean; soroban: boolean }> {
    const result = { rust: false, soroban: false };

    try {
      await execAsync('rustc --version');
      result.rust = true;
    } catch (error) {
      console.warn('[SorobanCompiler] Rust not found');
    }

    try {
      await execAsync('soroban --version');
      result.soroban = true;
    } catch (error) {
      console.warn('[SorobanCompiler] soroban-cli not found');
    }

    return result;
  }

  
  async buildContract(workDir: string, timeout: number = 60000): Promise<string> {
    try {
      const { stdout, stderr } = await execAsync(
        'soroban contract build --release',
        {
          cwd: workDir,
          timeout,
          env: {
            ...process.env,
            CARGO_TARGET_DIR: join(workDir, 'target'),
          },
        }
      );

      return stdout + stderr;
    } catch (error: any) {
      if (error.killed && error.signal === 'SIGTERM') {
        throw new Error(`Compilation timeout after ${timeout}ms`);
      }
      throw new Error(`Build failed: ${error.message}\n${error.stderr || ''}`);
    }
  }

  
  async extractABI(wasmPath: string): Promise<any> {
    try {
      const { stdout } = await execAsync(
        `soroban contract inspect --wasm ${wasmPath} --output json`,
        { timeout: 10000 }
      );

      return JSON.parse(stdout);
    } catch (error: any) {
      throw new Error(`Failed to extract ABI: ${error.message}`);
    }
  }

  
  createCargoToml(contractName: string): string {
    return `[package]
name = "${contractName}"
version = "0.1.0"
edition = "2021"

[lib]
crate-type = ["cdylib"]

[dependencies]
soroban-sdk = "21.0.0"

[dev-dependencies]
soroban-sdk = { version = "21.0.0", features = ["testutils"] }

[profile.release]
opt-level = "z"
overflow-checks = true
debug = 0
strip = "symbols"
debug-assertions = false
panic = "abort"
codegen-units = 1
lto = true

[profile.release-with-logs]
inherits = "release"
debug-assertions = true
`;
  }

  
  validateRustSyntax(code: string): { valid: boolean; error?: string } {
    
    if (!code.trim()) {
      return { valid: false, error: 'Empty source code' };
    }

    
    if (!code.includes('soroban_sdk')) {
      return {
        valid: false,
        error: 'Missing soroban_sdk import. Soroban contracts must use soroban_sdk.',
      };
    }

    
    if (!code.includes('#[contract]') && !code.includes('#[contractimpl]')) {
      return {
        valid: false,
        error: 'Missing #[contract] or #[contractimpl] attribute. Soroban contracts must use these macros.',
      };
    }

    return { valid: true };
  }

  
  getWasmPath(workDir: string, contractName: string): string {
    
    return join(
      workDir,
      'target',
      'wasm32-unknown-unknown',
      'release',
      `${contractName.replace(/-/g, '_')}.wasm`
    );
  }

  
  async readWasm(wasmPath: string): Promise<Buffer> {
    try {
      return await readFile(wasmPath);
    } catch (error: any) {
      throw new Error(`Failed to read WASM file: ${error.message}`);
    }
  }

  
  async writeSourceFile(workDir: string, code: string): Promise<void> {
    const srcDir = join(workDir, 'src');
    const libPath = join(srcDir, 'lib.rs');

    try {
      
      await writeFile(libPath, code, 'utf-8');
    } catch (error: any) {
      throw new Error(`Failed to write source file: ${error.message}`);
    }
  }

  
  async writeCargoToml(workDir: string, contractName: string): Promise<void> {
    const cargoPath = join(workDir, 'Cargo.toml');
    const content = this.createCargoToml(contractName);

    try {
      await writeFile(cargoPath, content, 'utf-8');
    } catch (error: any) {
      throw new Error(`Failed to write Cargo.toml: ${error.message}`);
    }
  }
}

export const sorobanCompiler = new SorobanCompiler();

