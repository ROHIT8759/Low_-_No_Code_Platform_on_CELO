import { create } from "zustand"
import { persist } from "zustand/middleware"
import { isSupabaseAvailable } from "./supabase"

// Simple UUID v4 generator
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}

export interface Block {
  id: string
  type: 
    | "erc20" 
    | "nft" 
    | "mint" 
    | "transfer" 
    | "burn" 
    | "stake" 
    | "withdraw"
    | "pausable"
    | "whitelist"
    | "blacklist"
    | "royalty"
    | "airdrop"
    | "timelock"
    | "multisig"
    | "voting"
    | "snapshot"
    | "permit"
  label: string
  config?: Record<string, any>
  position?: { x: number; y: number }
}

export interface DeployedContract {
  id: string
  contractAddress: string
  contractName: string
  tokenName?: string
  tokenSymbol?: string
  network: "sepolia" | "mainnet"
  networkName: string
  chainId: number
  deployer: string
  deployedAt: string
  transactionHash: string
  contractType: "erc20" | "nft"
  abi: any[]
  solidityCode: string
  blocks: Block[]
  explorerUrl: string
  frontendUrl?: string
  githubRepo?: string
}

export interface Project {
  id: string
  name: string
  blocks: Block[]
  generatedCode?: {
    solidity: string
    frontend: string
  }
  createdAt: string
  updatedAt: string
}

interface BuilderStore {
  currentProject: Project | null
  projects: Project[]
  blocks: Block[]
  selectedBlock: Block | null
  walletAddress: string | null
  walletChainId: number | null
  deployedContracts: DeployedContract[]

  createProject: (name: string) => void
  loadProject: (id: string) => void
  deleteProject: (id: string) => void
  renameProject: (id: string, name: string) => void
  saveProject: () => void
  addBlock: (block: Block) => void
  removeBlock: (id: string) => void
  updateBlock: (id: string, updates: Partial<Block>) => void
  selectBlock: (block: Block | null) => void
  setGeneratedCode: (solidity: string, frontend: string) => void
  clearAll: () => void
  importProject: (projectData: Project) => void
  setWalletAddress: (address: string | null) => void
  setWalletChainId: (chainId: number | null) => void
  addDeployedContract: (contract: DeployedContract) => void
  updateDeployedContract: (id: string, updates: Partial<DeployedContract>) => void
  deleteDeployedContract: (id: string) => void
  getRecentContracts: () => DeployedContract[]
}

export const useBuilderStore = create<BuilderStore>()(
  persist(
    (set, get) => ({
      currentProject: null,
      projects: [],
      blocks: [],
      selectedBlock: null,
      walletAddress: null,
      walletChainId: null,
      deployedContracts: [],

      createProject: (name: string) => {
        const newProject: Project = {
          id: generateUUID(),
          name,
          blocks: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
        set((state) => ({
          currentProject: newProject,
          projects: [...state.projects, newProject],
          blocks: [],
        }))
        
        // Save to cloud if available
        if (isSupabaseAvailable()) {
          import("./supabase-store").then(({ useSupabaseStore }) => {
            const supabaseStore = useSupabaseStore.getState()
            if (supabaseStore.user) {
              supabaseStore.saveProjectToCloud(newProject.id).catch(console.error)
            }
          })
        }
      },

      loadProject: (id: string) => {
        const state = get()
        const project = state.projects.find((p) => p.id === id)
        if (project) {
          set({
            currentProject: project,
            blocks: project.blocks,
            selectedBlock: null,
          })
        }
      },

      deleteProject: (id: string) => {
        set((state) => {
          const updatedProjects = state.projects.filter((p) => p.id !== id)
          const isCurrentProject = state.currentProject?.id === id
          return {
            projects: updatedProjects,
            currentProject: isCurrentProject ? null : state.currentProject,
            blocks: isCurrentProject ? [] : state.blocks,
          }
        })
        
        // Delete from cloud if available
        if (isSupabaseAvailable()) {
          import("./supabase-store").then(({ useSupabaseStore }) => {
            const supabaseStore = useSupabaseStore.getState()
            if (supabaseStore.user) {
              supabaseStore.deleteProjectFromCloud(id).catch(console.error)
            }
          })
        }
      },

      renameProject: (id: string, name: string) => {
        set((state) => ({
          projects: state.projects.map((p) => (p.id === id ? { ...p, name, updatedAt: new Date().toISOString() } : p)),
          currentProject:
            state.currentProject?.id === id
              ? { ...state.currentProject, name, updatedAt: new Date().toISOString() }
              : state.currentProject,
        }))
        
        // Update in cloud if available
        if (isSupabaseAvailable()) {
          import("./supabase-store").then(({ useSupabaseStore }) => {
            const supabaseStore = useSupabaseStore.getState()
            if (supabaseStore.user) {
              supabaseStore.saveProjectToCloud(id).catch(console.error)
            }
          })
        }
      },

      saveProject: () => {
        const currentProjectId = get().currentProject?.id
        set((state) => {
          if (!state.currentProject) return state
          return {
            projects: state.projects.map((p) =>
              p.id === state.currentProject!.id
                ? { ...state.currentProject!, blocks: state.blocks, updatedAt: new Date().toISOString() }
                : p,
            ),
            currentProject: { ...state.currentProject, blocks: state.blocks, updatedAt: new Date().toISOString() },
          }
        })
        
        // Save to cloud if available
        if (currentProjectId && isSupabaseAvailable()) {
          import("./supabase-store").then(({ useSupabaseStore }) => {
            const supabaseStore = useSupabaseStore.getState()
            if (supabaseStore.user) {
              supabaseStore.saveProjectToCloud(currentProjectId).catch(console.error)
            }
          })
        }
      },

      addBlock: (block: Block) =>
        set((state) => ({
          blocks: [...state.blocks, { ...block, id: generateUUID() }],
        })),

      removeBlock: (id: string) =>
        set((state) => ({
          blocks: state.blocks.filter((b) => b.id !== id),
        })),

      updateBlock: (id: string, updates: Partial<Block>) =>
        set((state) => ({
          blocks: state.blocks.map((b) => (b.id === id ? { ...b, ...updates } : b)),
        })),

      selectBlock: (block: Block | null) => set({ selectedBlock: block }),

      setGeneratedCode: (solidity: string, frontend: string) =>
        set((state) => ({
          currentProject: state.currentProject
            ? {
                ...state.currentProject,
                generatedCode: { solidity, frontend },
              }
            : null,
        })),

      clearAll: () =>
        set({
          currentProject: null,
          projects: [],
          blocks: [],
          selectedBlock: null,
        }),

      importProject: (projectData: Project) => {
        set((state) => {
          const newProject = {
            ...projectData,
            id: generateUUID(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }
          return {
            projects: [...state.projects, newProject],
            currentProject: newProject,
            blocks: newProject.blocks,
          }
        })
      },

      setWalletAddress: (address: string | null) => set({ walletAddress: address }),
      setWalletChainId: (chainId: number | null) => set({ walletChainId: chainId }),

      addDeployedContract: (contract: DeployedContract) => {
        set((state) => {
          // Keep only last 5 contracts in local storage
          const newContracts = [contract, ...state.deployedContracts].slice(0, 5)
          return { deployedContracts: newContracts }
        })
        
        // Save to cloud if available (cloud stores all contracts, not just 5)
        if (isSupabaseAvailable()) {
          import("./supabase-store").then(({ useSupabaseStore }) => {
            const supabaseStore = useSupabaseStore.getState()
            if (supabaseStore.user) {
              supabaseStore.saveDeployedContractToCloud(contract.id).catch(console.error)
            }
          })
        }
      },

      updateDeployedContract: (id: string, updates: Partial<DeployedContract>) =>
        set((state) => ({
          deployedContracts: state.deployedContracts.map((c) =>
            c.id === id ? { ...c, ...updates } : c
          ),
        })),

      deleteDeployedContract: (id: string) =>
        set((state) => ({
          deployedContracts: state.deployedContracts.filter((c) => c.id !== id),
        })),

      getRecentContracts: () => {
        const state = get()
        return state.deployedContracts.slice(0, 5)
      },
    }),
    {
      name: "celo-builder-store",
      version: 1,
    },
  ),
)
