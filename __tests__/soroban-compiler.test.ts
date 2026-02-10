import { SorobanCompiler, TempDirectoryManager } from '@/lib/stellar/compiler';
import { existsSync } from 'fs';

describe('SorobanCompiler', () => {
  const compiler = new SorobanCompiler();

  describe('validateRustSyntax', () => {
    test('rejects empty code', () => {
      const result = compiler.validateRustSyntax('');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Empty source code');
    });

    test('rejects code without soroban_sdk import', () => {
      const code = 'fn main() { println!("Hello"); }';
      const result = compiler.validateRustSyntax(code);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('soroban_sdk');
    });

    test('rejects code without contract macro', () => {
      const code = 'use soroban_sdk; fn main() {}';
      const result = compiler.validateRustSyntax(code);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('#[contract]');
    });

    test('accepts valid Soroban contract code', () => {
      const code = `
        use soroban_sdk::{contract, contractimpl};
        
        #[contract]
        pub struct MyContract;
        
        #[contractimpl]
        impl MyContract {
          pub fn hello() -> String {
            String::from("Hello")
          }
        }
      `;
      const result = compiler.validateRustSyntax(code);
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });
  });

  describe('createCargoToml', () => {
    test('creates valid Cargo.toml content', () => {
      const content = compiler.createCargoToml('my-contract');
      expect(content).toContain('[package]');
      expect(content).toContain('name = "my-contract"');
      expect(content).toContain('soroban-sdk');
      expect(content).toContain('[lib]');
      expect(content).toContain('crate-type = ["cdylib"]');
      expect(content).toContain('[profile.release]');
    });

    test('includes optimization settings', () => {
      const content = compiler.createCargoToml('test');
      expect(content).toContain('opt-level = "z"');
      expect(content).toContain('lto = true');
      expect(content).toContain('codegen-units = 1');
    });
  });

  describe('getWasmPath', () => {
    test('generates correct WASM path', () => {
      const path = compiler.getWasmPath('/tmp/test', 'my-contract');
      expect(path).toContain('target');
      expect(path).toContain('wasm32-unknown-unknown');
      expect(path).toContain('release');
      expect(path).toContain('my_contract.wasm');
    });

    test('replaces hyphens with underscores in contract name', () => {
      const path = compiler.getWasmPath('/tmp/test', 'my-test-contract');
      expect(path).toContain('my_test_contract.wasm');
    });
  });
});

describe('TempDirectoryManager', () => {
  test('creates temporary directory', async () => {
    const manager = new TempDirectoryManager();
    const path = await manager.create();
    
    expect(path).toBeDefined();
    expect(typeof path).toBe('string');
    expect(existsSync(path)).toBe(true);
    
    await manager.cleanup();
  });

  test('cleans up temporary directory', async () => {
    const manager = new TempDirectoryManager();
    const path = await manager.create();
    
    expect(existsSync(path)).toBe(true);
    
    await manager.cleanup();
    
    expect(existsSync(path)).toBe(false);
  });

  test('getPath returns created path', async () => {
    const manager = new TempDirectoryManager();
    const createdPath = await manager.create();
    const retrievedPath = manager.getPath();
    
    expect(retrievedPath).toBe(createdPath);
    
    await manager.cleanup();
  });

  test('getPath throws if directory not created', () => {
    const manager = new TempDirectoryManager();
    expect(() => manager.getPath()).toThrow('Temporary directory not created');
  });

  test('cleanup is idempotent', async () => {
    const manager = new TempDirectoryManager();
    await manager.create();
    
    await manager.cleanup();
    await manager.cleanup(); // Should not throw
  });
});

