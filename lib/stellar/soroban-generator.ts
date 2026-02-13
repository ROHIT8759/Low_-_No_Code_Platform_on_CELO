import { Block } from "../store";

export interface RustContract {
    lib: string;
    toml: string;
}

export function generateSorobanContract(blocks: Block[]): RustContract {
    
    

    let rustCode = `#![no_std]
use soroban_sdk::{contract, contractimpl, symbol_short, vec, Env, Symbol, Vec};

#[contract]
pub struct Contract;

#[contractimpl]
impl Contract {
`;

    blocks.forEach(block => {
        if (block.type === 'erc20') { 
            rustCode += `
    pub function balance(env: Env, owner: Symbol) -> u32 {
        // ... logic
        0
    }
`;
        }
        
    });

    rustCode += `
}
`;

    return {
        lib: rustCode,
        toml: `[package]
name = "soroban_contract"
version = "0.1.0"
edition = "2021"

[lib]
crate-type = ["cdylib", "rlib"]

[dependencies]
soroban-sdk = "20.0.0"

[dev_dependencies]
soroban-sdk = { version = "20.0.0", features = ["testutils"] }

[features]
testutils = ["soroban-sdk/testutils"]
`,
    };
}
