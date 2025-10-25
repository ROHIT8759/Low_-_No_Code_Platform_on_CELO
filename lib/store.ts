import { create } from "zustand"
import { persist } from "zustand/middleware"

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
          id: Date.now().toString(),
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
      },

      renameProject: (id: string, name: string) => {
        set((state) => ({
          projects: state.projects.map((p) => (p.id === id ? { ...p, name, updatedAt: new Date().toISOString() } : p)),
          currentProject:
            state.currentProject?.id === id
              ? { ...state.currentProject, name, updatedAt: new Date().toISOString() }
              : state.currentProject,
        }))
      },

      saveProject: () => {
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
      },

      addBlock: (block: Block) =>
        set((state) => ({
          blocks: [...state.blocks, { ...block, id: Date.now().toString() }],
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
            id: Date.now().toString(),
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

      addDeployedContract: (contract: DeployedContract) =>
        set((state) => {
          // Keep only last 5 contracts
          const newContracts = [contract, ...state.deployedContracts].slice(0, 5)
          return { deployedContracts: newContracts }
        }),

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
