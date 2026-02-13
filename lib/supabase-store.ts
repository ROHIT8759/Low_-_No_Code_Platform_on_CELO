import { create } from "zustand"
import { persist } from "zustand/middleware"
import {
  isSupabaseAvailable,
  getOrCreateUser,
  saveProject as saveProjectToSupabase,
  updateProject as updateProjectInSupabase,
  getUserProjects,
  deleteProject as deleteProjectFromSupabase,
  saveDeployedContract,
  getUserDeployedContracts,
  deleteDeployedContract as deleteDeployedContractFromSupabase,
} from "./supabase"

export interface User {
  id: string
  walletAddress: string
  email?: string
  username?: string
}

interface SupabaseStore {
  user: User | null
  isLoadingUser: boolean
  isSyncing: boolean

  
  initializeUser: (walletAddress: string) => Promise<void>
  updateUserProfile: (updates: Partial<User>) => Promise<void>
  logoutUser: () => void

  
  syncProjects: () => Promise<void>
  saveProjectToCloud: (projectId: string) => Promise<void>
  deleteProjectFromCloud: (projectId: string) => Promise<void>

  
  syncDeployedContracts: () => Promise<void>
  saveDeployedContractToCloud: (contractId: string) => Promise<void>
}

export const useSupabaseStore = create<SupabaseStore>()(
  persist(
    (set, get) => ({
      user: null,
      isLoadingUser: false,
      isSyncing: false,

      initializeUser: async (walletAddress: string) => {
        if (!isSupabaseAvailable()) {
          console.log('ℹ️ Supabase not configured - skipping user initialization')
          return
        }

        set({ isLoadingUser: true })
        try {
          const user = await getOrCreateUser(walletAddress)
          if (user) {
            set({
              user: {
                id: user.id,
                walletAddress: user.wallet_address,
                email: user.email || undefined,
                username: user.username || undefined,
              },
            })

            
            await get().syncProjects()
            await get().syncDeployedContracts()
          }
        } catch (error) {
          console.error("Failed to initialize user:", error)
        } finally {
          set({ isLoadingUser: false })
        }
      },

      updateUserProfile: async (updates: Partial<User>) => {
        const { user } = get()
        if (!user) return

        
        set({ user: { ...user, ...updates } })

        
      },

      logoutUser: () => {
        set({ user: null })
      },

      syncProjects: async () => {
        const { user } = get()
        if (!user || !isSupabaseAvailable()) return

        set({ isSyncing: true })
        try {
          const projects = await getUserProjects(user.id)

          
          const { useBuilderStore } = await import("./store")
          const store = useBuilderStore.getState()

          
          const localProjects = projects.map((p) => ({
            id: p.id,
            name: p.name,
            networkType: "stellar" as const,
            blocks: p.blocks,
            generatedCode: {
              solidity: p.solidity_code || "",
              frontend: p.frontend_code || "",
            },
            createdAt: p.created_at,
            updatedAt: p.updated_at,
          }))

          
          
          store.projects = localProjects
        } catch (error) {
          
          
        } finally {
          set({ isSyncing: false })
        }
      },

      saveProjectToCloud: async (projectId: string) => {
        const { user } = get()
        if (!user) {
          console.warn("Cannot save project: User not logged in")
          return
        }

        const { useBuilderStore } = await import("./store")
        const store = useBuilderStore.getState()
        const project = store.projects.find((p) => p.id === projectId)

        if (!project) {
          console.error("Project not found:", projectId)
          return
        }

        try {
          
          const { upsertProject } = await import("./supabase")
          const result = await upsertProject(projectId, user.id, {
            name: project.name,
            description: null,
            blocks: project.blocks,
            contractType: project.blocks.find((b) => b.type === "erc20" || b.type === "nft")?.type || "erc20",
            config: {},
            solidityCode: project.generatedCode?.solidity,
            frontendCode: project.generatedCode?.frontend,
          })

          if (result) {
            console.log("✅ Project saved to cloud:", projectId)
          } else {
            console.warn("⚠️ Project save to cloud returned null (check Supabase configuration)")
          }
        } catch (error: any) {
          
          
        }
      },

      deleteProjectFromCloud: async (projectId: string) => {
        try {
          await deleteProjectFromSupabase(projectId)
          console.log("Project deleted from cloud:", projectId)
        } catch (error) {
          console.error("Failed to delete project from cloud:", error)
        }
      },

      syncDeployedContracts: async () => {
        const { user } = get()
        if (!user) return

        set({ isSyncing: true })
        try {
          const contracts = await getUserDeployedContracts(user.id)

          
          const { useBuilderStore } = await import("./store")
          const store = useBuilderStore.getState()

          
          const localContracts = contracts.map((c) => ({
            id: c.id,
            contractAddress: c.contract_address,
            contractName: c.contract_name,
            tokenName: c.token_name || undefined,
            tokenSymbol: c.token_symbol || undefined,
            network: c.network,
            networkType: "stellar" as const,
            networkName: c.network_name,
            chainId: c.chain_id,
            deployer: c.deployer,
            deployedAt: c.deployed_at,
            transactionHash: c.transaction_hash,
            contractType: c.contract_type,
            abi: c.abi,
            solidityCode: c.solidity_code,
            blocks: c.blocks,
            explorerUrl: c.explorer_url,
            frontendUrl: c.frontend_url || undefined,
            githubRepo: c.github_repo || undefined,
          }))

          store.deployedContracts = localContracts
        } catch (error) {
          console.error("Failed to sync deployed contracts:", error)
        } finally {
          set({ isSyncing: false })
        }
      },

      saveDeployedContractToCloud: async (contractId: string) => {
        const { user } = get()
        if (!user) {
          console.warn("Cannot save contract: User not logged in")
          return
        }

        const { useBuilderStore } = await import("./store")
        const store = useBuilderStore.getState()
        const contract = store.deployedContracts.find((c) => c.id === contractId)

        if (!contract) {
          console.error("Contract not found:", contractId)
          return
        }

        try {
          await saveDeployedContract(user.id, {
            projectId: null,
            ...contract,
          })

          console.log("Contract saved to cloud:", contractId)
        } catch (error) {
          console.error("Failed to save contract to cloud:", error)
        }
      },
    }),
    {
      name: "supabase-storage",
      partialize: (state) => ({
        user: state.user,
      }),
    }
  )
)
