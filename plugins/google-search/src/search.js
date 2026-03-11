import { createClient, DEFAULT_MODEL, GROUNDING_TOOL } from './client.js';

/**
 * @param {object} response - Gemini generateContent response
 * @returns {string} text with citation links injected
 */
export function addCitations(response) {
  let text = response.text;
  const supports = response.candidates[0]?.groundingMetadata?.groundingSupports;
  const chunks = response.candidates[0]?.groundingMetadata?.groundingChunks;

  if (!supports || !chunks) {
    return text;
  }

  const sortedSupports = [...supports].sort(
    (a, b) => (b.segment?.endIndex ?? 0) - (a.segment?.endIndex ?? 0),
  );

  for (const support of sortedSupports) {
    const endIndex = support.segment?.endIndex;
    if (endIndex === undefined || !support.groundingChunkIndices?.length) {
      continue;
    }

    const citationLinks = support.groundingChunkIndices
      .map(i => {
        const uri = chunks[i]?.web?.uri;
        if (uri) {
          return `[${i + 1}](${uri})`;
        }
        return null;
      })
      .filter(Boolean);

    if (citationLinks.length > 0) {
      const citationString = citationLinks.join(', ');
      text = text.slice(0, endIndex) + citationString + text.slice(endIndex);
    }
  }

  return text;
}

/**
 * @param {string} query - search query
 * @param {object} [options]
 * @param {string} [options.model] - model name (default: gemini-3-flash-preview)
 * @returns {Promise<string>} search result text with citations
 */
export async function search(query, options = {}) {
  const ai = createClient();
  const model = options.model || DEFAULT_MODEL;

  const config = {
    tools: [GROUNDING_TOOL],
  };

  let response;
  try {
    response = await ai.models.generateContent({
      model,
      contents: query,
      config,
    });
  } catch (err) {
    const status = err?.status || err?.code;
    if (status === 429) {
      throw new Error(`Gemini API quota exceeded. Check your plan at https://ai.google.dev/gemini-api/docs/rate-limits`);
    }
    throw err;
  }

  if (!response.text) {
    return '';
  }

  return addCitations(response);
}
