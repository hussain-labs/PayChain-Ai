// ─────────────────────────────────────────────────────────────────────────────
// PayChain AI — Wallet / Address Utilities
// Pure functions for normalising and validating EVM wallet addresses.
// No web3 library dependency — keeps the backend lean.
// ─────────────────────────────────────────────────────────────────────────────

/** EVM address regex: 0x followed by 40 hex chars */
const EVM_ADDRESS_RE = /^0x[0-9a-fA-F]{40}$/

/**
 * Returns true if the string is a syntactically valid EVM address.
 * Does NOT check checksum — use viem/ethers on the frontend for that.
 */
export function isValidAddress(address) {
  return typeof address === 'string' && EVM_ADDRESS_RE.test(address)
}

/**
 * Normalise an address to lowercase for consistent DB storage.
 * Throws if the address is invalid.
 */
export function normaliseAddress(address) {
  if (!isValidAddress(address)) {
    throw new Error(`Invalid EVM address: "${address}"`)
  }
  return address.toLowerCase()
}

/**
 * Shorten an address for display  →  0x1234…abcd
 */
export function shortAddress(address, prefixLen = 6, suffixLen = 4) {
  if (!address || address.length < prefixLen + suffixLen + 2) return address
  return `${address.slice(0, prefixLen)}…${address.slice(-suffixLen)}`
}

/**
 * Generate a deterministic merchant ID from a wallet address.
 * Pattern matches the Phase 1 mock:  merchant_0x8f3a
 */
export function merchantIdFromWallet(address) {
  const norm = address.toLowerCase()
  return `merchant_${norm.slice(0, 6)}`
}

/**
 * Basic DID format validation.
 * Accepts:  did:ethr:0x…  or  did:pkh:eip155:1:0x…
 */
export function isValidDID(did) {
  return typeof did === 'string' && did.startsWith('did:') && did.length > 8
}
