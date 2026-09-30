/**
 * Mock AI summarizer.
 * In production this would call an LLM provider (OpenAI, Anthropic, etc).
 * Here we produce a deterministic extractive summary from the content body
 * so the pipeline is fully testable without API keys or network access.
 */

const TONE_PREFIXES = {
  neutral: '',
  professional: 'Key points: ',
  casual: "Here's the gist — ",
  academic: 'Summary: ',
};

const LENGTH_SENTENCE_MAP = { short: 1, medium: 2, long: 3 };

/**
 * Extract the first N sentences from text, preserving the tone prefix.
 */
function extractSentences(text, count) {
  const sentences = text
    .replace(/\s+/g, ' ')
    .trim()
    .split(/(?<=[.!?])\s+/)
    .filter(Boolean);
  return sentences.slice(0, count).join(' ');
}

/**
 * Run a mock summarization.
 * @param {string} body  - the content body to summarize
 * @param {object} opts  - { tone, length }
 * @returns {{ output: string, latencyMs: number }}
 */
export function runMockSummarization(body, opts = {}) {
  const tone = TONE_PREFIXES[opts.tone] !== undefined ? opts.tone : 'neutral';
  const lengthKey = LENGTH_SENTENCE_MAP[opts.length] !== undefined ? opts.length : 'medium';
  const sentenceCount = LENGTH_SENTENCE_MAP[lengthKey];

  const start = Date.now();

  // Simulate variable processing time (50–250 ms)
  const simulatedDelay = 50 + Math.floor(Math.random() * 200);
  // Busy-wait is fine here because the delay is tiny; in production this would be an async API call.
  const end = start + simulatedDelay;

  const prefix = TONE_PREFIXES[tone];
  const summary = extractSentences(body || '', sentenceCount) || '(No content to summarize.)';

  return {
    output: prefix + summary,
    latencyMs: end - start,
  };
}
