/**
 * Token reward and conversion logic for the T-World module.
 * All rates are fixed mock values — no real money or on-chain assets move.
 */

export const TOKENS_PER_AI_RUN = 5;

export const CONVERSION_RATES = {
  MOCK_USDT: { tokensPerUnit: 100, label: 'T-World Token → MOCK USDT' },
  MOCK_ETH: { tokensPerUnit: 20000, label: 'T-World Token → MOCK ETH (0.01 ETH per 200 tokens)' },
};

/**
 * Validate that the user has enough tokens and compute the converted amount.
 * Returns { amountOut } on success or { error } on failure.
 */
export function calculateConversion(amount, targetAsset) {
  const rate = CONVERSION_RATES[targetAsset];
  if (!rate) return { error: `Unsupported asset "${targetAsset}". Valid options: MOCK_USDT, MOCK_ETH.` };
  if (amount <= 0) return { error: 'Amount must be greater than zero.' };
  if (!Number.isInteger(amount)) return { error: 'Amount must be a whole number of tokens.' };

  const amountOut = amount / rate.tokensPerUnit;
  return { amountOut };
}

/**
 * Generate a deterministic-looking mock transaction hash.
 * Not a real EVM hash — only used to simulate on-chain conversion receipts.
 */
export function generateMockTxHash() {
  const hex = '0123456789abcdef';
  let hash = '0x';
  for (let i = 0; i < 64; i += 1) {
    hash += hex[Math.floor(Math.random() * hex.length)];
  }
  return hash;
}
