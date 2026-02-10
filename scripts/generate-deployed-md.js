const fs = require('fs')
const path = require('path')

const dataPath = path.join(__dirname, '..', 'data', 'deployed-contracts.json')
const outPath = path.join(__dirname, '..', 'DEPLOYED_CONTRACTS.md')

const explorerByNetwork = {
    sepolia: 'https://celo-sepolia.blockscout.com',
    mainnet: 'https://celoscan.io',
}

function mkLink(text, url) {
    return url ? `[${text}](${url})` : text
}

function generate() {
    if (!fs.existsSync(dataPath)) {
        console.error('No deployed contracts data found at', dataPath)
        process.exit(1)
    }

    const raw = fs.readFileSync(dataPath, 'utf8')
    let items = []
    try {
        items = JSON.parse(raw)
    } catch (e) {
        console.error('Failed to parse JSON:', e.message)
        process.exit(1)
    }

    const header = `# Deployed Contracts\n\nThis file is auto-generated from \`/data/deployed-contracts.json\`.\n\n` +
        `Update the JSON file and re-run \`node scripts/generate-deployed-md.js\` to refresh this page.\n\n` +
        `| Name | Network | Contract Address | Transaction Hash | Deployed At | Frontend | GitHub Repo |\n` +
        `| ---- | ------- | ---------------- | ---------------- | ----------- | -------- | ----------- |\n`

    const rows = items.map((it) => {
        const explorer = explorerByNetwork[it.network] || ''
        const addrUrl = explorer ? `${explorer}/address/${it.contractAddress}` : ''
        const txUrl = explorer ? `${explorer}/tx/${it.transactionHash}` : ''
        const addr = mkLink(it.contractAddress, addrUrl)
        const tx = mkLink(it.transactionHash, txUrl)
        const frontend = it.frontendUrl ? mkLink('dApp', it.frontendUrl) : ''
        const repo = it.githubRepo ? mkLink('repo', it.githubRepo) : ''
        return `| ${it.name || ''} | ${it.network || ''} | ${addr} | ${tx} | ${it.deployedAt || ''} | ${frontend} | ${repo} |`
    }).join('\n')

    const content = header + rows + '\n'
    fs.writeFileSync(outPath, content, 'utf8')
    console.log('Wrote', outPath)
}

generate()
