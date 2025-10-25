"use client"

import type React from "react"

import { useBuilderStore } from "@/lib/store"
import { Trash2, ExternalLink, Copy, Code, FileCode, Package, Rocket, Download, Github } from "lucide-react"
import { useState } from "react"
import { generateNextJsFrontend } from "@/lib/frontend-generator"
import { deployToGitHub, validateGitHubToken, getGitHubUser } from "@/lib/github-deploy"

interface ProjectManagerProps {
  isOpen: boolean
  onClose: () => void
}

export function ProjectManager({ isOpen, onClose }: ProjectManagerProps) {
  const deployedContracts = useBuilderStore((state) => state.deployedContracts)
  const deleteDeployedContract = useBuilderStore((state) => state.deleteDeployedContract)
  const updateDeployedContract = useBuilderStore((state) => state.updateDeployedContract)
  const [expandedContract, setExpandedContract] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<"info" | "abi" | "code">("info")
  const [deployingFrontend, setDeployingFrontend] = useState<string | null>(null)
  const [deployingGithub, setDeployingGithub] = useState<string | null>(null)
  const [showGithubModal, setShowGithubModal] = useState(false)
  const [githubToken, setGithubToken] = useState("")
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
    return network === "mainnet" ? "bg-green-500" : "bg-blue-500"
  }

  const getContractTypeBadge = (type: string) => {
    return type === "erc20"
      ? "bg-purple-500/20 text-purple-400 border-purple-500/30"
      : "bg-pink-500/20 text-pink-400 border-pink-500/30"
  }

  const deployFrontend = async (contract: any) => {
    setDeployingFrontend(contract.id)

    try {
      // Ensure we're in the browser
      if (typeof window === 'undefined') {
        throw new Error('This function must run in the browser')
      }

      // Generate frontend files
      const files = generateNextJsFrontend(contract)

      // Dynamically import JSZip only in browser
      const JSZip = (await import('jszip')).default
      const zip = new JSZip()

      // Add all files to zip
      Object.entries(files).forEach(([path, content]) => {
        zip.file(path, content)
      })

      // Generate zip file
      const blob = await zip.generateAsync({ type: 'blob' })

      // Download zip
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
    
    // Validate inputs
    if (!githubToken.trim()) {
      alert('❌ Please enter your GitHub Personal Access Token')
      return
    }

    if (!repoName.trim()) {
      alert('❌ Please enter a repository name')
      return
    }

    // Validate repo name format
    if (!/^[a-zA-Z0-9._-]+$/.test(repoName)) {
      alert('❌ Repository name can only contain letters, numbers, dots, hyphens, and underscores')
      return
    }

    setDeployingGithub(selectedContractForGithub.id)

    try {
      // Validate GitHub token first
      const isValid = await validateGitHubToken(githubToken)
      if (!isValid) {
        throw new Error('Invalid GitHub token. Please check your Personal Access Token.')
      }

      // Get user info
      const userInfo = await getGitHubUser(githubToken)
      if (!userInfo) {
        throw new Error('Failed to get GitHub user information')
      }

      // Generate frontend files
      const files = generateNextJsFrontend(selectedContractForGithub)

      // Deploy to GitHub
      const result = await deployToGitHub({
        repoName: repoName,
        repoDescription: repoDescription,
        files: files,
        githubToken: githubToken,
        isPrivate: isPrivate
      })

      if (result.success && result.repoUrl) {
        // Update the contract with GitHub repo URL
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
      {/* GitHub Deploy Modal */}
      {showGithubModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[60]">
          <div className="bg-slate-900 rounded-lg border-2 border-purple-500/50 w-full max-w-2xl max-h-[90vh] overflow-auto shadow-2xl shadow-purple-500/20">
            <div className="flex items-center justify-between p-6 border-b border-slate-700 sticky top-0 bg-slate-900 z-10">
              <div className="flex items-center gap-3">
                <Github size={28} className="text-purple-400" />
                <div>
                  <h2 className="text-2xl font-bold text-white">Deploy to GitHub</h2>
                  <p className="text-sm text-slate-400 mt-1">Create a new repository with your frontend</p>
                </div>
              </div>
              <button 
                onClick={() => {
                  setShowGithubModal(false)
                  setGithubToken("")
                  setSelectedContractForGithub(null)
                }}
                className="text-slate-400 hover:text-white transition-colors text-2xl"
                disabled={deployingGithub !== null}
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* GitHub Token Input */}
              <div>
                <label className="block text-sm font-semibold text-white mb-2">
                  GitHub Personal Access Token *
                </label>
                <input
                  type="password"
                  value={githubToken}
                  onChange={(e) => setGithubToken(e.target.value)}
                  placeholder="ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                  disabled={deployingGithub !== null}
                />
                <p className="text-xs text-slate-400 mt-2">
                  Create a token at{" "}
                  <a 
                    href="https://github.com/settings/tokens/new?scopes=repo" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-purple-400 hover:text-purple-300 underline"
                  >
                    GitHub Settings
                  </a>
                  {" "}with 'repo' scope
                </p>
              </div>

              {/* Repository Name */}
              <div>
                <label className="block text-sm font-semibold text-white mb-2">
                  Repository Name *
                </label>
                <input
                  type="text"
                  value={repoName}
                  onChange={(e) => setRepoName(e.target.value)}
                  placeholder="my-awesome-dapp"
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                  disabled={deployingGithub !== null}
                />
                <p className="text-xs text-slate-400 mt-2">
                  Only letters, numbers, dots, hyphens, and underscores
                </p>
              </div>

              {/* Repository Description */}
              <div>
                <label className="block text-sm font-semibold text-white mb-2">
                  Description
                </label>
                <textarea
                  value={repoDescription}
                  onChange={(e) => setRepoDescription(e.target.value)}
                  placeholder="A decentralized application for..."
                  rows={3}
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 resize-none"
                  disabled={deployingGithub !== null}
                />
              </div>

              {/* Privacy Toggle */}
              <div className="flex items-center gap-3 p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                <input
                  type="checkbox"
                  id="isPrivate"
                  checked={isPrivate}
                  onChange={(e) => setIsPrivate(e.target.checked)}
                  className="w-5 h-5 text-purple-600 bg-slate-700 border-slate-600 rounded focus:ring-purple-500 focus:ring-2"
                  disabled={deployingGithub !== null}
                />
                <label htmlFor="isPrivate" className="text-white font-medium cursor-pointer">
                  Make repository private
                </label>
              </div>

              {/* Contract Info */}
              {selectedContractForGithub && (
                <div className="p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
                  <div className="text-sm text-blue-300">
                    <div className="font-semibold mb-1">Contract: {selectedContractForGithub.contractName}</div>
                    <div className="text-xs text-blue-400">
                      Network: {selectedContractForGithub.networkName} • Type: {selectedContractForGithub.contractType.toUpperCase()}
                    </div>
                  </div>
                </div>
              )}

              {/* Deploy Button */}
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowGithubModal(false)
                    setGithubToken("")
                    setSelectedContractForGithub(null)
                  }}
                  disabled={deployingGithub !== null}
                  className="flex-1 px-6 py-3 bg-slate-700 hover:bg-slate-600 rounded-lg font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  onClick={deployToGithubHandler}
                  disabled={deployingGithub !== null}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-lg font-bold transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-purple-500/50"
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

    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-card rounded-lg border border-border w-full max-w-6xl max-h-[90vh] overflow-auto">
        <div className="flex items-center justify-between p-6 border-b border-border sticky top-0 bg-card z-10">
          <div>
            <h2 className="text-2xl font-bold text-foreground">📦 Deployed Contracts</h2>
            <p className="text-sm text-muted mt-1">Last 5 deployed contracts with full details</p>
          </div>
          <button onClick={onClose} className="text-muted hover:text-foreground transition-colors text-2xl">
            ✕
          </button>
        </div>

        <div className="p-6">
          {deployedContracts.length === 0 ? (
            <div className="p-12 text-center bg-background border border-border rounded-lg">
              <div className="text-6xl mb-4">📭</div>
              <p className="text-xl font-semibold text-foreground mb-2">No Deployed Contracts Yet</p>
              <p className="text-muted">Deploy your first contract to see it here with full details!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {deployedContracts.map((contract) => (
                <div
                  key={contract.id}
                  className="border border-border rounded-lg bg-background overflow-hidden hover:border-primary/50 transition-all"
                >
                  {/* Contract Header */}
                  <div className="p-5 bg-slate-800/50">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-bold text-foreground">{contract.contractName}</h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${getNetworkBadgeColor(contract.network)} text-white`}>
                            {contract.networkName}
                          </span>
                          <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getContractTypeBadge(contract.contractType)}`}>
                            {contract.contractType.toUpperCase()}
                          </span>
                        </div>

                        {contract.tokenName && (
                          <p className="text-slate-400 mb-2">
                            {contract.tokenName} ({contract.tokenSymbol})
                          </p>
                        )}

                        <div className="flex items-center gap-4 text-sm text-slate-500">
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
                        className="p-2 hover:bg-red-500/20 rounded transition-colors text-red-400 hover:text-red-300"
                        title="Delete contract"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>

                    {/* Contract Address */}
                    <div className="mt-4 p-3 bg-slate-900/50 rounded-lg border border-slate-700">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="text-xs text-slate-500 mb-1">Contract Address</div>
                          <div className="font-mono text-green-400 text-sm break-all">
                            {contract.contractAddress}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => copyToClipboard(contract.contractAddress, "Address")}
                            className="p-2 bg-blue-600 hover:bg-blue-500 rounded transition-colors"
                            title="Copy address"
                          >
                            <Copy size={16} />
                          </button>
                          <a
                            href={contract.explorerUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 bg-purple-600 hover:bg-purple-500 rounded transition-colors"
                            title="View on explorer"
                          >
                            <ExternalLink size={16} />
                          </a>
                        </div>
                      </div>
                    </div>

                    {/* Transaction Hash */}
                    <div className="mt-2 p-3 bg-slate-900/50 rounded-lg border border-slate-700">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="text-xs text-slate-500 mb-1">Transaction Hash</div>
                          <div className="font-mono text-blue-400 text-sm break-all">
                            {contract.transactionHash}
                          </div>
                        </div>
                        <button
                          onClick={() => copyToClipboard(contract.transactionHash, "Transaction Hash")}
                          className="p-2 bg-blue-600 hover:bg-blue-500 rounded transition-colors"
                          title="Copy transaction hash"
                        >
                          <Copy size={16} />
                        </button>
                      </div>
                    </div>

                    {/* Deploy Frontend Button */}
                    <div className="mt-4">
                      <button
                        onClick={() => deployFrontend(contract)}
                        disabled={deployingFrontend === contract.id}
                        className="w-full px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 rounded-lg font-bold transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-green-500/50"
                      >
                        {deployingFrontend === contract.id ? (
                          <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                            <span>Generating Frontend...</span>
                          </>
                        ) : (
                          <>
                            <Rocket size={20} />
                            <span>Deploy Frontend (Next.js)</span>
                            <Download size={18} />
                          </>
                        )}
                      </button>
                      <p className="text-xs text-slate-500 mt-2 text-center">
                        Downloads a complete Next.js app with contract integration
                      </p>
                    </div>

                    {/* Deploy to GitHub Button */}
                    <div className="mt-3">
                      <button
                        onClick={() => openGithubDeployModal(contract)}
                        disabled={deployingGithub === contract.id}
                        className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 rounded-lg font-bold transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-purple-500/50"
                      >
                        {deployingGithub === contract.id ? (
                          <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                            <span>Deploying to GitHub...</span>
                          </>
                        ) : (
                          <>
                            <Github size={20} />
                            <span>Deploy to GitHub</span>
                          </>
                        )}
                      </button>
                      {contract.githubRepo && (
                        <a
                          href={contract.githubRepo}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-2 mt-2 text-xs text-purple-400 hover:text-purple-300 transition-colors"
                        >
                          <ExternalLink size={12} />
                          <span>View on GitHub</span>
                        </a>
                      )}
                      <p className="text-xs text-slate-500 mt-2 text-center">
                        Creates a GitHub repository with your complete dApp
                      </p>
                    </div>
                  </div>

                  {/* Expandable Details */}
                  <div className="border-t border-border">
                    <button
                      onClick={() => setExpandedContract(expandedContract === contract.id ? null : contract.id)}
                      className="w-full p-4 text-left hover:bg-slate-800/30 transition-colors flex items-center justify-between"
                    >
                      <span className="font-semibold text-foreground">
                        {expandedContract === contract.id ? "▼" : "▶"} View Details (ABI, Code, Blocks)
                      </span>
                    </button>

                    {expandedContract === contract.id && (
                      <div className="p-5 bg-slate-900/30">
                        {/* Tabs */}
                        <div className="flex gap-2 mb-4 border-b border-border">
                          <button
                            onClick={() => setActiveTab("info")}
                            className={`px-4 py-2 font-medium transition-colors ${activeTab === "info"
                                ? "text-primary border-b-2 border-primary"
                                : "text-muted hover:text-foreground"
                              }`}
                          >
                            <Package className="inline mr-2" size={16} />
                            Blocks Info
                          </button>
                          <button
                            onClick={() => setActiveTab("abi")}
                            className={`px-4 py-2 font-medium transition-colors ${activeTab === "abi"
                                ? "text-primary border-b-2 border-primary"
                                : "text-muted hover:text-foreground"
                              }`}
                          >
                            <FileCode className="inline mr-2" size={16} />
                            Contract ABI
                          </button>
                          <button
                            onClick={() => setActiveTab("code")}
                            className={`px-4 py-2 font-medium transition-colors ${activeTab === "code"
                                ? "text-primary border-b-2 border-primary"
                                : "text-muted hover:text-foreground"
                              }`}
                          >
                            <Code className="inline mr-2" size={16} />
                            Solidity Code
                          </button>
                        </div>

                        {/* Tab Content */}
                        <div className="max-h-96 overflow-auto">
                          {activeTab === "info" && (
                            <div className="space-y-3">
                              <h4 className="font-semibold text-foreground mb-3">Contract Blocks ({contract.blocks.length})</h4>
                              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                {contract.blocks.map((block, index) => (
                                  <div
                                    key={block.id}
                                    className="p-3 bg-slate-800 border border-slate-700 rounded-lg"
                                  >
                                    <div className="text-xs text-slate-500">Block {index + 1}</div>
                                    <div className="font-semibold text-foreground capitalize">{block.type}</div>
                                    <div className="text-xs text-slate-400 mt-1">{block.label}</div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {activeTab === "abi" && (
                            <div>
                              <div className="flex items-center justify-between mb-3">
                                <h4 className="font-semibold text-foreground">Contract ABI</h4>
                                <button
                                  onClick={() => copyToClipboard(JSON.stringify(contract.abi, null, 2), "ABI")}
                                  className="px-3 py-1 bg-blue-600 hover:bg-blue-500 rounded text-sm transition-colors flex items-center gap-2"
                                >
                                  <Copy size={14} />
                                  Copy ABI
                                </button>
                              </div>
                              <pre className="bg-slate-950 p-4 rounded-lg text-xs text-green-400 overflow-auto border border-slate-700 font-mono">
                                {JSON.stringify(contract.abi, null, 2)}
                              </pre>
                            </div>
                          )}

                          {activeTab === "code" && (
                            <div>
                              <div className="flex items-center justify-between mb-3">
                                <h4 className="font-semibold text-foreground">Solidity Source Code</h4>
                                <button
                                  onClick={() => copyToClipboard(contract.solidityCode, "Code")}
                                  className="px-3 py-1 bg-blue-600 hover:bg-blue-500 rounded text-sm transition-colors flex items-center gap-2"
                                >
                                  <Copy size={14} />
                                  Copy Code
                                </button>
                              </div>
                              <pre className="bg-slate-950 p-4 rounded-lg text-xs text-blue-400 overflow-auto border border-slate-700 font-mono">
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
    </>
  )
}
