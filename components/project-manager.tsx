"use client"

import type React from "react"

import { useBuilderStore } from "@/lib/store"
import { Trash2, ExternalLink, Copy, Code, FileCode, Package, Rocket, Download, Github, Eye } from "lucide-react"
import { useState } from "react"
import { generateNextJsFrontend } from "@/lib/frontend-generator"
import { deployToGitHub, validateGitHubToken, getGitHubUser } from "@/lib/github-deploy"
import { ContractPreviewModal } from "./contract-preview-modal"

interface ProjectManagerProps {
  isOpen: boolean
  onClose: () => void
}

export function ProjectManager({ isOpen, onClose }: ProjectManagerProps) {
  const deployedContracts = useBuilderStore((state) => state.deployedContracts)
  const deleteDeployedContract = useBuilderStore((state) => state.deleteDeployedContract)
  const updateDeployedContract = useBuilderStore((state) => state.updateDeployedContract)
  const walletAddress = useBuilderStore((state) => state.walletAddress)
  const [expandedContract, setExpandedContract] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<"info" | "abi" | "code">("info")
  const [deployingFrontend, setDeployingFrontend] = useState<string | null>(null)
  const [deployingGithub, setDeployingGithub] = useState<string | null>(null)
  const [showGithubModal, setShowGithubModal] = useState(false)
  const [githubToken, setGithubToken] = useState("")
  const [previewContract, setPreviewContract] = useState<any>(null)
  const [repoName, setRepoName] = useState("")
  const [repoDescription, setRepoDescription] = useState("")
  const [isPrivate, setIsPrivate] = useState(false)
  const [selectedContractForGithub, setSelectedContractForGithub] = useState<any>(null)

  if (!isOpen) return null

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => {
      alert(`${label} copied to clipboard!`)
    })
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString()
  }

  const getNetworkBadgeColor = (network: string) => {
    return network === "mainnet"
      ? "bg-primary/20 text-emerald-200 border border-primary/30"
      : "bg-[var(--surface-2)] text-zinc-300 border border-white/[0.12]"
  }

  const getContractTypeBadge = (type: string) => {
    return type === "erc20"
      ? "bg-[var(--surface-2)] text-zinc-300 border-white/[0.12]"
      : "bg-[var(--surface-2)] text-zinc-300 border-white/[0.12]"
  }

  const deployFrontend = async (contract: any) => {
    setDeployingFrontend(contract.id)

    try {
      
      if (typeof window === 'undefined') {
        throw new Error('This function must run in the browser')
      }

      
      const files = generateNextJsFrontend(contract)

      
      const JSZip = (await import('jszip')).default
      const zip = new JSZip()

      
      Object.entries(files).forEach(([path, content]) => {
        zip.file(path, content)
      })

      
      const blob = await zip.generateAsync({ type: 'blob' })

      
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${contract.contractName.toLowerCase().replace(/\s+/g, '-')}-frontend.zip`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      alert('✅ Frontend generated! Extract the zip and run:\n\nnpm install\nnpm run dev')
    } catch (error) {
      console.error('Frontend generation error:', error)
      alert('❌ Failed to generate frontend. Check console for details.')
    } finally {
      setDeployingFrontend(null)
    }
  }

  const openGithubDeployModal = (contract: any) => {
    setSelectedContractForGithub(contract)
    setRepoName(`${contract.contractName.toLowerCase().replace(/\s+/g, '-')}-dapp`)
    setRepoDescription(`Frontend dApp for ${contract.contractName} smart contract on ${contract.networkName}`)
    setShowGithubModal(true)
  }

  const deployToGithubHandler = async () => {
    if (!selectedContractForGithub) return

    
    if (!githubToken.trim()) {
      alert('❌ Please enter your GitHub Personal Access Token')
      return
    }

    if (!repoName.trim()) {
      alert('❌ Please enter a repository name')
      return
    }

    
    if (!/^[a-zA-Z0-9._-]+$/.test(repoName)) {
      alert('❌ Repository name can only contain letters, numbers, dots, hyphens, and underscores')
      return
    }

    setDeployingGithub(selectedContractForGithub.id)

    try {
      
      const isValid = await validateGitHubToken(githubToken)
      if (!isValid) {
        throw new Error('Invalid GitHub token. Please check your Personal Access Token.')
      }

      
      const userInfo = await getGitHubUser(githubToken)
      if (!userInfo) {
        throw new Error('Failed to get GitHub user information')
      }

      
      const files = generateNextJsFrontend(selectedContractForGithub)

      
      const result = await deployToGitHub({
        repoName: repoName,
        repoDescription: repoDescription,
        files: files,
        githubToken: githubToken,
        isPrivate: isPrivate
      })

      if (result.success && result.repoUrl) {
        
        updateDeployedContract(selectedContractForGithub.id, {
          githubRepo: result.repoUrl
        })

        alert(`✅ ${result.message}\n\n🔗 Repository: ${result.repoUrl}\n\n📝 Next steps:\n1. Clone the repository\n2. Run: npm install\n3. Run: npm run dev\n4. Deploy to Vercel/Netlify for production`)

        setShowGithubModal(false)
        setGithubToken("")
        setSelectedContractForGithub(null)
      } else {
        throw new Error(result.error || 'Unknown error')
      }

    } catch (error: any) {
      console.error('GitHub deployment error:', error)
      alert(`❌ Failed to deploy to GitHub\n\nError: ${error.message}`)
    } finally {
      setDeployingGithub(null)
    }
  }

  return (
    <>
      {}
      {showGithubModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[60] animate-fade-in">
          <div className="bg-[var(--surface-0)] rounded-2xl border border-white/[0.1] w-full max-w-2xl max-h-[90vh] overflow-auto shadow-2xl animate-scale-in">
            <div className="flex items-center justify-between p-6 border-b border-white/[0.08] sticky top-0 bg-[var(--surface-1)] z-10">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/20">
                  <Github size={28} className="text-primary" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Deploy to GitHub</h2>
                  <p className="text-sm text-zinc-400 mt-1">Create a new repository with your frontend</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowGithubModal(false)
                  setGithubToken("")
                  setSelectedContractForGithub(null)
                }}
                className="text-zinc-400 hover:text-white hover:bg-[var(--surface-2)] rounded-lg p-2 transition-all text-xl"
                disabled={deployingGithub !== null}
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-6">
              {}
              <div>
                <label className="block text-sm font-semibold text-white mb-2">
                  GitHub Personal Access Token *
                </label>
                <input
                  type="password"
                  value={githubToken}
                  onChange={(e) => setGithubToken(e.target.value)}
                  placeholder="ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                  className="w-full px-4 py-3 bg-[var(--surface-1)] border border-white/[0.08] rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/20 transition-all"
                  disabled={deployingGithub !== null}
                />
                <p className="text-xs text-zinc-400 mt-2">
                  Create a token at{" "}
                  <a
                    href="https://github.com/settings/tokens/new?scopes=repo"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:text-emerald-300 underline transition-colors"
                  >
                    GitHub Settings
                  </a>
                  {" "}with 'repo' scope
                </p>
              </div>

              {}
              <div>
                <label className="block text-sm font-semibold text-white mb-2">
                  Repository Name *
                </label>
                <input
                  type="text"
                  value={repoName}
                  onChange={(e) => setRepoName(e.target.value)}
                  placeholder="my-awesome-dapp"
                  className="w-full px-4 py-3 bg-[var(--surface-1)] border border-white/[0.08] rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/20 transition-all"
                  disabled={deployingGithub !== null}
                />
                <p className="text-xs text-zinc-400 mt-2">
                  Only letters, numbers, dots, hyphens, and underscores
                </p>
              </div>

              {}
              <div>
                <label className="block text-sm font-semibold text-white mb-2">
                  Description
                </label>
                <textarea
                  value={repoDescription}
                  onChange={(e) => setRepoDescription(e.target.value)}
                  placeholder="A decentralized application for..."
                  rows={3}
                  className="w-full px-4 py-3 bg-[var(--surface-1)] border border-white/[0.08] rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:border-primary/60 focus:ring-2 focus:ring-primary/20 resize-none transition-all"
                  disabled={deployingGithub !== null}
                />
              </div>

              {}
              <div className="flex items-center gap-3 p-4 bg-[var(--surface-1)] rounded-lg border border-white/[0.08]">
                <input
                  type="checkbox"
                  id="isPrivate"
                  checked={isPrivate}
                  onChange={(e) => setIsPrivate(e.target.checked)}
                  className="w-5 h-5 text-primary bg-[var(--surface-2)] border-white/[0.2] rounded focus:ring-primary focus:ring-2 transition-all"
                  disabled={deployingGithub !== null}
                />
                <label htmlFor="isPrivate" className="text-white font-medium cursor-pointer">
                  Make repository private
                </label>
              </div>

              {}
              {selectedContractForGithub && (
                <div className="p-4 bg-primary/10 border border-primary/30 rounded-lg">
                  <div className="text-sm text-emerald-200">
                    <div className="font-semibold mb-1">Contract: {selectedContractForGithub.contractName}</div>
                    <div className="text-xs text-emerald-300">
                      Network: {selectedContractForGithub.networkName} • Type: {selectedContractForGithub.contractType.toUpperCase()}
                    </div>
                  </div>
                </div>
              )}

              {}
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowGithubModal(false)
                    setGithubToken("")
                    setSelectedContractForGithub(null)
                  }}
                  disabled={deployingGithub !== null}
                  className="flex-1 px-6 py-3 bg-[var(--surface-2)] hover:bg-[var(--surface-3)] rounded-lg font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  onClick={deployToGithubHandler}
                  disabled={deployingGithub !== null}
                  className="flex-1 px-6 py-3 bg-primary hover:bg-primary/90 rounded-lg font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/30"
                >
                  {deployingGithub ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Deploying...</span>
                    </>
                  ) : (
                    <>
                      <Github size={20} />
                      <span>Deploy to GitHub</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
        <div className="bg-[var(--surface-0)] rounded-2xl border border-white/[0.1] w-full max-w-6xl max-h-[90vh] overflow-auto shadow-2xl animate-scale-in">
          <div className="flex items-center justify-between p-6 border-b border-white/[0.08] sticky top-0 bg-[var(--surface-1)] z-10 backdrop-blur-sm">
            <div>
              <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                📦 Deployed Contracts
              </h2>
              <p className="text-sm text-zinc-400 mt-1">Last 5 deployed contracts with full details</p>
            </div>
            <button onClick={onClose} className="text-zinc-400 hover:text-white hover:bg-[var(--surface-2)] rounded-lg p-2 transition-all text-2xl">
              ✕
            </button>
          </div>

          <div className="p-6">
            {deployedContracts.length === 0 ? (
              <div className="p-12 text-center bg-[var(--surface-1)] border border-white/[0.08] rounded-2xl">
                <div className="text-6xl mb-4 animate-bounce">📭</div>
                <p className="text-xl font-semibold text-white mb-2">No Deployed Contracts Yet</p>
                <p className="text-zinc-400">Deploy your first contract to see it here with full details!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {deployedContracts.map((contract) => (
                  <div
                    key={contract.id}
                    className="border border-white/[0.08] rounded-lg bg-[var(--surface-1)] overflow-hidden hover:border-white/[0.16] transition-all duration-200"
                  >
                    {}
                    <div className="p-5 bg-[var(--surface-1)]">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2 flex-wrap">
                            <h3 className="text-xl font-bold text-white">{contract.contractName}</h3>
                            <span className={`px-3 py-1 rounded-md text-xs font-medium ${getNetworkBadgeColor(contract.network)}`}>
                              {contract.networkName}
                            </span>
                            <span className={`px-3 py-1 rounded-md text-xs font-medium border ${getContractTypeBadge(contract.contractType)}`}>
                              {contract.contractType.toUpperCase()}
                            </span>
                          </div>

                          {contract.tokenName && (
                            <p className="text-zinc-400 mb-2">
                              {contract.tokenName} ({contract.tokenSymbol})
                            </p>
                          )}

                          <div className="flex items-center gap-4 text-sm text-zinc-500">
                            <span>📅 {formatDate(contract.deployedAt)}</span>
                            <span>👤 {contract.deployer.slice(0, 6)}...{contract.deployer.slice(-4)}</span>
                            <span>🧱 {contract.blocks.length} blocks</span>
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            if (confirm(`Delete contract ${contract.contractName}?`)) {
                              deleteDeployedContract(contract.id)
                            }
                          }}
                          className="p-2 hover:bg-red-500/10 rounded-lg transition-all text-zinc-400 hover:text-red-400"
                          title="Delete contract"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>

                      {}
                      <div className="mt-4 p-3 bg-[var(--surface-0)] rounded-lg border border-white/[0.08]">
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="text-xs text-zinc-500 mb-1">Contract Address</div>
                            <div className="font-mono text-zinc-300 text-sm break-all">
                              {contract.contractAddress}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => copyToClipboard(contract.contractAddress, "Address")}
                              className="p-2 bg-[var(--surface-2)] hover:bg-[var(--surface-3)] rounded-lg transition-all"
                              title="Copy address"
                            >
                              <Copy size={16} />
                            </button>
                            <a
                              href={contract.explorerUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 bg-[var(--surface-2)] hover:bg-[var(--surface-3)] rounded-lg transition-all"
                              title="View on explorer"
                            >
                              <ExternalLink size={16} />
                            </a>
                          </div>
                        </div>
                      </div>

                      {}
                      <div className="mt-2 p-3 bg-[var(--surface-0)] rounded-lg border border-white/[0.08]">
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="text-xs text-zinc-500 mb-1">Transaction Hash</div>
                            <div className="font-mono text-zinc-300 text-sm break-all">
                              {contract.transactionHash}
                            </div>
                          </div>
                          <button
                            onClick={() => copyToClipboard(contract.transactionHash, "Transaction Hash")}
                            className="p-2 bg-[var(--surface-2)] hover:bg-[var(--surface-3)] rounded-lg transition-all"
                            title="Copy transaction hash"
                          >
                            <Copy size={16} />
                          </button>
                        </div>
                      </div>

                      {}
                      <div className="mt-4 flex flex-col gap-3">
                        {}
                        <button
                          onClick={() => {
                            console.log('Opening preview for contract:', {
                              name: contract.contractName,
                              address: contract.contractAddress,
                              blocksCount: contract.blocks?.length || 0,
                              blockTypes: contract.blocks?.map((b: any) => b.type) || [],
                            })
                            setPreviewContract(contract)
                          }}
                          className="w-full px-6 py-3 bg-primary hover:bg-primary/90 rounded-lg font-medium transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/30"
                        >
                          <Eye size={18} className="text-white" />
                          <span className="text-white font-semibold">Preview & Interact</span>
                        </button>

                        {}
                        <div className="flex flex-col md:flex-row gap-3">
                          {}
                          <button
                            onClick={() => deployFrontend(contract)}
                            disabled={deployingFrontend === contract.id}
                            className="flex-1 px-6 py-3 bg-[var(--surface-2)] hover:bg-[var(--surface-3)] rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 border border-white/[0.08]"
                          >
                            {deployingFrontend === contract.id ? (
                              <>
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                <span className="text-white">Generating...</span>
                              </>
                            ) : (
                              <>
                                <Rocket size={18} className="text-zinc-300" />
                                <span className="text-white whitespace-nowrap">Deploy Frontend</span>
                                <Download size={16} className="text-zinc-300" />
                              </>
                            )}
                          </button>

                          {}
                          <button
                            onClick={() => openGithubDeployModal(contract)}
                            disabled={deployingGithub === contract.id}
                            className="flex-1 px-6 py-3 bg-[var(--surface-2)] hover:bg-[var(--surface-3)] rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 border border-white/[0.08]"
                          >
                            {deployingGithub === contract.id ? (
                              <>
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                <span className="text-white">Deploying...</span>
                              </>
                            ) : (
                              <>
                                <Github size={18} className="text-zinc-300" />
                                <span className="text-white whitespace-nowrap">Deploy to GitHub</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>

                      {}
                      <div className="mt-2 flex flex-col md:flex-row gap-2 text-xs text-zinc-500">
                        <p className="flex-1">Downloads a complete Next.js app</p>
                        <p className="flex-1">Creates a GitHub repository with your dApp</p>
                      </div>

                      {}
                      {contract.githubRepo && (
                        <a
                          href={contract.githubRepo}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-2 mt-2 text-xs text-zinc-400 hover:text-zinc-300 transition-colors"
                        > <ExternalLink size={12} />
                          <span>View on GitHub</span>
                        </a>
                      )}
                    </div>

                    {}
                    <div className="border-t border-white/[0.08]">
                      <button
                        onClick={() => setExpandedContract(expandedContract === contract.id ? null : contract.id)}
                        className="w-full p-4 text-left hover:bg-[var(--surface-2)] transition-all flex items-center justify-between"
                      >
                        <span className="font-medium text-zinc-300">
                          {expandedContract === contract.id ? "▼" : "▶"} View Details (ABI, Code, Blocks)
                        </span>
                      </button>

                      {expandedContract === contract.id && (
                        <div className="p-5 bg-[var(--surface-0)]">
                          {}
                          <div className="flex gap-2 mb-4 border-b border-white/[0.08]">
                            <button
                              onClick={() => setActiveTab("info")}
                              className={`px-4 py-2 font-medium transition-all ${activeTab === "info"
                                ? "text-white border-b-2 border-white/50"
                                : "text-zinc-400 hover:text-zinc-300"
                                }`}
                            >
                              <Package className="inline mr-2" size={16} />
                              Blocks Info
                            </button>
                            <button
                              onClick={() => setActiveTab("abi")}
                              className={`px-4 py-2 font-medium transition-all ${activeTab === "abi"
                                ? "text-white border-b-2 border-white/50"
                                : "text-zinc-400 hover:text-zinc-300"
                                }`}
                            >
                              <FileCode className="inline mr-2" size={16} />
                              Contract ABI
                            </button>
                            <button
                              onClick={() => setActiveTab("code")}
                              className={`px-4 py-2 font-medium transition-all ${activeTab === "code"
                                ? "text-white border-b-2 border-white/50"
                                : "text-zinc-400 hover:text-zinc-300"
                                }`}
                            >
                              <Code className="inline mr-2" size={16} />
                              Solidity Code
                            </button>
                          </div>

                          {}
                          <div className="max-h-96 overflow-auto">
                            {activeTab === "info" && (
                              <div className="space-y-3">
                                <h4 className="font-semibold text-white mb-3">Contract Blocks ({contract.blocks.length})</h4>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                  {contract.blocks.map((block, index) => (
                                    <div
                                      key={block.id}
                                      className="p-3 bg-[var(--surface-1)] border border-white/[0.08] rounded-lg hover:bg-[var(--surface-2)] transition-all"
                                    >
                                      <div className="text-xs text-zinc-500">Block {index + 1}</div>
                                      <div className="font-semibold text-white capitalize">{block.type}</div>
                                      <div className="text-xs text-zinc-400 mt-1">{block.label}</div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {activeTab === "abi" && (
                              <div>
                                <div className="flex items-center justify-between mb-3">
                                  <h4 className="font-semibold text-white">Contract ABI</h4>
                                  <button
                                    onClick={() => copyToClipboard(JSON.stringify(contract.abi, null, 2), "ABI")}
                                    className="px-3 py-1 bg-[var(--surface-2)] hover:bg-[var(--surface-3)] rounded-lg text-sm transition-all flex items-center gap-2"
                                  >
                                    <Copy size={14} />
                                    Copy ABI
                                  </button>
                                </div>
                                <pre className="bg-[var(--surface-0)] p-4 rounded-lg text-xs text-zinc-300 overflow-auto border border-white/[0.08] font-mono">
                                  {JSON.stringify(contract.abi, null, 2)}
                                </pre>
                              </div>
                            )}

                            {activeTab === "code" && (
                              <div>
                                <div className="flex items-center justify-between mb-3">
                                  <h4 className="font-semibold text-white">Solidity Source Code</h4>
                                  <button
                                    onClick={() => copyToClipboard(contract.solidityCode || "", "Code")}
                                    className="px-3 py-1 bg-[var(--surface-2)] hover:bg-[var(--surface-3)] rounded-lg text-sm transition-all flex items-center gap-2"
                                  >
                                    <Copy size={14} />
                                    Copy Code
                                  </button>
                                </div>
                                <pre className="bg-[var(--surface-0)] p-4 rounded-lg text-xs text-zinc-300 overflow-auto border border-white/[0.08] font-mono">
                                  {contract.solidityCode}
                                </pre>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {}
      {previewContract && (
        <>
          {console.log('🚀 Rendering ContractPreviewModal with (from Supabase):', {
            contract: previewContract.contractName,
            blocks: previewContract.blocks?.length || 0,
            abi: previewContract.abi?.length || 0,
            abiTypes: previewContract.abi ? {
              functions: previewContract.abi.filter((item: any) => item.type === 'function').length,
              events: previewContract.abi.filter((item: any) => item.type === 'event').length,
              constructor: previewContract.abi.filter((item: any) => item.type === 'constructor').length,
            } : 'NO_ABI',
            walletAddress: walletAddress,
            contractAddress: previewContract.contractAddress,
            network: previewContract.network,
            hasSolidityCode: !!previewContract.solidityCode,
          })}
          <ContractPreviewModal
            isOpen={true}
            onClose={() => setPreviewContract(null)}
            contract={previewContract}
            walletAddress={walletAddress}
          />
        </>
      )}
    </>
  )
}
