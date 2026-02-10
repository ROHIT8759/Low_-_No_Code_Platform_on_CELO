# Wallet Connection Test Cases

## Test Environment Setup

- Browser: Chrome/Firefox with MetaMask installed
- Network: Celo Alfajores Testnet (Chain ID: 44787)
- Application URL: http://localhost:3000/builder

## Manual Test Cases

### Test Case 1: Wallet Connection Before Preview Modal Opens

**Objective:** Verify that the preview modal detects an already-connected wallet

**Steps:**

1. Open http://localhost:3000/builder in browser
2. Connect your MetaMask wallet using the navbar "Connect Wallet" button
3. Approve the connection in MetaMask
4. Verify wallet address shows in navbar (e.g., "0x1234...5678")
5. Click "Preview" button to open the preview modal

**Expected Results:**

- ✅ Preview modal should automatically detect the connected wallet
- ✅ Contract interaction buttons should be enabled (if contract is deployed)
- ✅ Wallet address should display correctly in the preview interface
- ✅ No "Connect Wallet" button should appear (wallet already connected)

**Status:** ⬜ Not Tested | ✅ Passed | ❌ Failed

---

### Test Case 2: Wallet Connection After Preview Modal Opens

**Objective:** Verify that users can connect wallet from within the preview modal

**Steps:**

1. Open http://localhost:3000/builder in browser (without connecting wallet first)
2. Click "Preview" button to open the preview modal
3. In the preview modal, click the "Connect Wallet" button
4. Approve the connection in MetaMask popup
5. Verify the network is Celo Alfajores (Chain ID: 44787)

**Expected Results:**

- ✅ MetaMask popup should appear requesting connection
- ✅ After approval, wallet address should display in preview modal
- ✅ Success notification: "✅ Wallet connected!"
- ✅ If wrong network, should prompt to switch to Celo Alfajores
- ✅ Contract interaction buttons should become enabled

**Status:** ⬜ Not Tested | ✅ Passed | ❌ Failed

---

### Test Case 3: Check Balance Feature

**Objective:** Verify that the balance checker works correctly

**Prerequisites:**

- Wallet must be connected
- Contract must be deployed (have a valid contract address)

**Steps:**

1. Connect wallet (using either Test Case 1 or 2)
2. In preview modal, find the "Balance" feature section
3. Enter a valid Ethereum address (e.g., your wallet address)
4. Click "Check Balance" button
5. Wait for response

**Expected Results:**

- ✅ Loading indicator should appear during check
- ✅ Balance should display (e.g., "1000 tokens" or "0 tokens")
- ✅ Success notification with balance details
- ❌ If error occurs, clear error message should show

**Test Data:**

- Your wallet address: [FILL IN]
- Expected balance: [FILL IN]
- Actual balance shown: [FILL IN]

**Status:** ⬜ Not Tested | ✅ Passed | ❌ Failed

---

### Test Case 4: Transfer Tokens (ERC20)

**Objective:** Verify token transfer functionality for ERC20 contracts

**Prerequisites:**

- Wallet must be connected
- ERC20 contract must be deployed
- Wallet must have some tokens

**Steps:**

1. Connect wallet in preview modal
2. Find the "Transfer" feature section
3. Enter recipient address (use a test address or your second wallet)
4. Enter amount to transfer (e.g., "10")
5. Click "Transfer" button
6. Approve transaction in MetaMask
7. Wait for confirmation

**Expected Results:**

- ✅ Transaction popup should appear in MetaMask
- ✅ After approval, transaction should be submitted
- ✅ Success notification: "✅ Transfer successful!"
- ✅ Balance should update after transfer
- ❌ If insufficient balance, should show error

**Test Data:**

- Recipient address: [FILL IN]
- Amount to transfer: [FILL IN]
- Transaction hash: [FILL IN]

**Status:** ⬜ Not Tested | ✅ Passed | ❌ Failed

---

### Test Case 5: Transfer NFT (ERC721)

**Objective:** Verify NFT transfer functionality for ERC721 contracts

**Prerequisites:**

- Wallet must be connected
- ERC721 contract must be deployed
- Wallet must own an NFT

**Steps:**

1. Connect wallet in preview modal
2. Find the "Transfer" feature section (should be NFT mode)
3. Enter recipient address
4. Enter token ID to transfer (e.g., "1")
5. Click "Transfer NFT" button
6. Approve transaction in MetaMask
7. Wait for confirmation

**Expected Results:**

- ✅ MetaMask should show NFT transfer transaction
- ✅ After approval, transaction should be submitted
- ✅ Success notification: "✅ Transfer successful!"
- ❌ If not NFT owner, should show error

**Test Data:**

- Recipient address: [FILL IN]
- Token ID: [FILL IN]
- Transaction hash: [FILL IN]

**Status:** ⬜ Not Tested | ✅ Passed | ❌ Failed

---

### Test Case 6: No MetaMask Installed

**Objective:** Verify proper handling when MetaMask is not installed

**Steps:**

1. Open browser without MetaMask extension (or disable it)
2. Open http://localhost:3000/builder
3. Try to connect wallet from preview modal

**Expected Results:**

- ✅ Error notification: "❌ No Web3 wallet detected!"
- ✅ Should suggest installing MetaMask
- ✅ May open MetaMask download page

**Status:** ⬜ Not Tested | ✅ Passed | ❌ Failed

---

### Test Case 7: Wrong Network (Not Celo Alfajores)

**Objective:** Verify network switching functionality

**Steps:**

1. Connect MetaMask but switch to Ethereum Mainnet (or any other network)
2. Open preview modal and try to connect wallet
3. Observe the behavior

**Expected Results:**

- ✅ Should detect wrong network
- ✅ Should prompt user to switch to Celo Alfajores
- ✅ MetaMask should show network switch request
- ✅ After switching, connection should complete

**Status:** ⬜ Not Tested | ✅ Passed | ❌ Failed

---

### Test Case 8: Wallet Persistence After Modal Close

**Objective:** Verify wallet state persists when closing/reopening modal

**Steps:**

1. Connect wallet in preview modal
2. Close the preview modal
3. Reopen the preview modal
4. Check wallet connection status

**Expected Results:**

- ✅ Wallet should remain connected
- ✅ No need to reconnect again
- ✅ Contract should be immediately available

**Status:** ⬜ Not Tested | ✅ Passed | ❌ Failed

---

### Test Case 9: No Contract Deployed

**Objective:** Verify behavior when no contract is deployed

**Steps:**

1. Create a new project (or clear deployed contract address)
2. Connect wallet in preview modal
3. Try to use contract features (Balance, Transfer, etc.)

**Expected Results:**

- ✅ Should show warning: "⚠️ No contract deployed yet"
- ✅ Contract features should be disabled or show appropriate message
- ✅ Should suggest deploying contract first

**Status:** ⬜ Not Tested | ✅ Passed | ❌ Failed

---

## Automated Test Cases (Future)

### Unit Tests

- [ ] Test wallet address parsing from window.ethereum
- [ ] Test balance formatting (wei to ether conversion)
- [ ] Test address validation

### Integration Tests

- [ ] Test full wallet connection flow
- [ ] Test contract interaction with mock contract
- [ ] Test error handling for failed transactions

---

## Test Results Summary

| Test Case                | Status | Notes |
| ------------------------ | ------ | ----- |
| TC1: Wallet Before Modal | ⬜     |       |
| TC2: Wallet After Modal  | ⬜     |       |
| TC3: Check Balance       | ⬜     |       |
| TC4: Transfer ERC20      | ⬜     |       |
| TC5: Transfer NFT        | ⬜     |       |
| TC6: No MetaMask         | ⬜     |       |
| TC7: Wrong Network       | ⬜     |       |
| TC8: Wallet Persistence  | ⬜     |       |
| TC9: No Contract         | ⬜     |       |

---

## Bug Tracker

| Bug ID | Description | Severity | Status |
| ------ | ----------- | -------- | ------ |
| -      | -           | -        | -      |

---

## Testing Notes

**Tester Name:** ********\_\_\_********
**Date:** ********\_\_\_********
**Browser:** ********\_\_\_********
**MetaMask Version:** ********\_\_\_********
**Application Version:** ********\_\_\_********

**Additional Observations:**
