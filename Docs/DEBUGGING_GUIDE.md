# 🔍 Debugging Guide: Blocks and Wallet Address Issues

## Issue Summary
The blocks and wallet address are not displaying/calling properly in the preview modal.

## Quick Debugging Steps

### 1. **Open Browser DevTools**
- Press `F12` or right-click → "Inspect"
- Go to the **Console** tab
- Keep it open while testing

### 2. **Click "Preview & Interact" Button**
- Navigate to the Project Manager
- Find any deployed contract
- Click the "Preview & Interact" button
- **Check the console immediately** for debug logs

### 3. **What Debug Logs to Look For**

#### In the Main Console:
```
Rendering ContractPreviewModal with: {
  contract: "YourContractName",
  blocks: 5,  ← Should show number > 0
  walletAddress: "0x123...",  ← Should show your wallet
  contractAddress: "0xabc..."
}
```

#### Inside the Preview Modal (iframe):
```
=== ContractPreviewModal Debug ===
Contract object received: {
  name: "YourContractName",
  address: "0xabc...",
  type: "token",  ← or "nft"
  hasBlocks: true  ← CRITICAL: Should be true
  blocksArray: [...]  ← Should show array of blocks
  blocksLength: 5  ← Should be > 0
  blockTypes: ["mint", "burn", ...]  ← Should list block types
}
Wallet address received: "0x123..."  ← Should have value
===================================

🔍 Checking for features in blocks:
  ✓ Found mint block
  ✓ Found burn block
  ...
```

---

## Common Issues & Solutions

### Issue 1: `hasBlocks: false` or `blocksLength: 0`
**Problem:** Blocks are not being passed to the modal

**Debug Steps:**
1. Check the main console log `Rendering ContractPreviewModal with:`
2. If `blocks: 0`, then blocks weren't saved with the contract
3. Check in your Project Manager: Are the blocks showing in the contract definition?

**Solution:**
- Make sure you added blocks when creating the contract
- Check that the deployed contracts have the `blocks` field saved

---

### Issue 2: Blocks are passed but features aren't showing
**Problem:** `blocksArray` exists but `Features extracted: []` is empty

**Debug Steps:**
1. Look at `blockTypes` in the debug log
2. Check if the block type names match the feature names (case-sensitive)

**Current Block Type Mapping:**
```javascript
"mint" → "Mint"
"burn" → "Burn"
"stake" → "Stake"
"withdraw" → "Withdraw"
"pausable" → "Pause/Unpause"
"whitelist" → "Whitelist"
"blacklist" → "Blacklist"
"royalty" → "Royalties"
"airdrop" → "Airdrop"
"voting" → "Voting"
"snapshot" → "Snapshot"
"timelock" → "Timelock"
```

**Solution:**
- Block type names must be lowercase and match exactly
- If blocks exist but features are empty, there's a mismatch in type names

---

### Issue 3: Wallet address not connecting
**Problem:** Wallet shows as disconnected in preview

**Debug Steps:**
1. Look for messages like:
   - `✅ Auto-connected with wallet: 0x...` (Good!)
   - `⚠️ No wallet detected` (MetaMask not installed/enabled)
   - `📱 Wallet accounts available: []` (MetaMask not connected)
   - `ℹ️ No current accounts, but parent provided: 0x...` (Address provided but not connected)

2. Check `PASSED_WALLET from parent:` log
   - Should show the wallet address passed from ProjectManager
   - If empty, wallet wasn't passed properly

**Solution for No Wallet:**
- Install MetaMask or another Web3 wallet
- Make sure it's connected to the correct network (Celo Testnet/Mainnet)
- Make sure you have an account in the wallet

**Solution for Wallet Not Auto-Connecting:**
- Even if not auto-connected, click "🦊 Connect Wallet" button
- This will trigger `connectWallet()` function
- Check console for connection attempt logs

---

## Complete Console Log Timeline

### When You Click Preview Button:
```
1. "Rendering ContractPreviewModal with: {...}"  ← ProjectManager
2. "=== ContractPreviewModal Debug ===" ← Inside modal component
3. "Contract object received: {...}"
4. "Wallet address received: ..."
5. "Features extracted: [...]"
6. "⏳ Loading Web3 libraries..." ← If ethers.js still loading
7. "📱 Wallet accounts available: [...]" ← Auto-connect check
8. "✅ Auto-connected with wallet: 0x..." ← Success!
9. "🔍 Checking for features in blocks:" ← Feature detection
10. "  ✓ Found mint block" ← For each found feature
```

---

## Network Configuration

The preview checks these networks:
- **Celo Testnet**: `0xaef5...` (Alfajores)
- **Celo Mainnet**: `0xf47c...`

Make sure your MetaMask is set to the correct network.

---

## What to Report

If the issue persists, copy the console output from:
1. Main console (after clicking Preview)
2. All logs starting with `===` until `===================================`
3. Any error messages (in red)

And share:
- What block types you expect to see
- What the console actually shows
- Whether MetaMask is connected or not

---

## Files Modified
- `components/contract-preview-modal.tsx` - Added enhanced debugging
- `components/project-manager.tsx` - Added console logging

Run `npm run build` to ensure changes are compiled.
