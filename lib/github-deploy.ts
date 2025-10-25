/**
 * GitHub Deployment Utilities
 * 
 * This module provides functionality to deploy frontend projects to GitHub
 * using the GitHub API.
 */

export interface GitHubDeployOptions {
  repoName: string
  repoDescription: string
  files: Record<string, string>
  githubToken: string
  isPrivate?: boolean
}

export interface GitHubDeployResult {
  success: boolean
  repoUrl?: string
  error?: string
  message?: string
}

/**
 * Deploy a frontend project to GitHub
 * Creates a new repository and pushes all files
 */
export async function deployToGitHub(options: GitHubDeployOptions): Promise<GitHubDeployResult> {
  const { repoName, repoDescription, files, githubToken, isPrivate = false } = options

  try {
    // 1. Create repository
    const createRepoResponse = await fetch('https://api.github.com/user/repos', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${githubToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/vnd.github.v3+json'
      },
      body: JSON.stringify({
        name: repoName,
        description: repoDescription,
        private: isPrivate,
        auto_init: true
      })
    })

    if (!createRepoResponse.ok) {
      const error = await createRepoResponse.json()
      throw new Error(error.message || 'Failed to create repository')
    }

    const repoData = await createRepoResponse.json()
    const repoUrl = repoData.html_url
    const ownerLogin = repoData.owner.login
    const defaultBranch = repoData.default_branch || 'main'

    // Wait a bit for repo initialization
    await new Promise(resolve => setTimeout(resolve, 2000))

    // 2. Get the latest commit SHA
    const getRefResponse = await fetch(
      `https://api.github.com/repos/${ownerLogin}/${repoName}/git/ref/heads/${defaultBranch}`,
      {
        headers: {
          'Authorization': `Bearer ${githubToken}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      }
    )

    if (!getRefResponse.ok) {
      throw new Error('Failed to get repository reference')
    }

    const refData = await getRefResponse.json()
    const latestCommitSha = refData.object.sha

    // 3. Get the base tree
    const getCommitResponse = await fetch(
      `https://api.github.com/repos/${ownerLogin}/${repoName}/git/commits/${latestCommitSha}`,
      {
        headers: {
          'Authorization': `Bearer ${githubToken}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      }
    )

    if (!getCommitResponse.ok) {
      throw new Error('Failed to get commit data')
    }

    const commitData = await getCommitResponse.json()
    const baseTreeSha = commitData.tree.sha

    // 4. Create blobs for all files
    const tree = []
    for (const [path, content] of Object.entries(files)) {
      const createBlobResponse = await fetch(
        `https://api.github.com/repos/${ownerLogin}/${repoName}/git/blobs`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${githubToken}`,
            'Content-Type': 'application/json',
            'Accept': 'application/vnd.github.v3+json'
          },
          body: JSON.stringify({
            content: content,
            encoding: 'utf-8'
          })
        }
      )

      if (!createBlobResponse.ok) {
        throw new Error(`Failed to create blob for ${path}`)
      }

      const blobData = await createBlobResponse.json()
      tree.push({
        path: path,
        mode: '100644',
        type: 'blob',
        sha: blobData.sha
      })
    }

    // 5. Create a new tree
    const createTreeResponse = await fetch(
      `https://api.github.com/repos/${ownerLogin}/${repoName}/git/trees`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${githubToken}`,
          'Content-Type': 'application/json',
          'Accept': 'application/vnd.github.v3+json'
        },
        body: JSON.stringify({
          base_tree: baseTreeSha,
          tree: tree
        })
      }
    )

    if (!createTreeResponse.ok) {
      throw new Error('Failed to create tree')
    }

    const treeData = await createTreeResponse.json()

    // 6. Create a new commit
    const createCommitResponse = await fetch(
      `https://api.github.com/repos/${ownerLogin}/${repoName}/git/commits`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${githubToken}`,
          'Content-Type': 'application/json',
          'Accept': 'application/vnd.github.v3+json'
        },
        body: JSON.stringify({
          message: '🚀 Initial frontend deployment from Celo No-Code Platform',
          tree: treeData.sha,
          parents: [latestCommitSha]
        })
      }
    )

    if (!createCommitResponse.ok) {
      throw new Error('Failed to create commit')
    }

    const newCommitData = await createCommitResponse.json()

    // 7. Update the reference
    const updateRefResponse = await fetch(
      `https://api.github.com/repos/${ownerLogin}/${repoName}/git/refs/heads/${defaultBranch}`,
      {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${githubToken}`,
          'Content-Type': 'application/json',
          'Accept': 'application/vnd.github.v3+json'
        },
        body: JSON.stringify({
          sha: newCommitData.sha,
          force: false
        })
      }
    )

    if (!updateRefResponse.ok) {
      throw new Error('Failed to update reference')
    }

    return {
      success: true,
      repoUrl: repoUrl,
      message: `Successfully deployed to GitHub! Repository: ${repoUrl}`
    }

  } catch (error: any) {
    console.error('GitHub deployment error:', error)
    return {
      success: false,
      error: error.message || 'Unknown error occurred during GitHub deployment'
    }
  }
}

/**
 * Validate GitHub token by checking user access
 */
export async function validateGitHubToken(token: string): Promise<boolean> {
  try {
    const response = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    })
    return response.ok
  } catch (error) {
    return false
  }
}

/**
 * Get authenticated user info
 */
export async function getGitHubUser(token: string): Promise<{ login: string; name: string } | null> {
  try {
    const response = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    })
    
    if (response.ok) {
      const data = await response.json()
      return {
        login: data.login,
        name: data.name || data.login
      }
    }
    return null
  } catch (error) {
    return null
  }
}
