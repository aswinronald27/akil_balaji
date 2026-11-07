/**
 * Similarity calculation utility using tokenized Jaccard similarity and keyword boosting.
 */
function tokenize(str) {
  if (!str || typeof str !== 'string') return [];
  return str
    .toLowerCase()
    .replace(/[^a-z0-9\s_-]/g, ' ')
    .split(/\s+/)
    .filter(token => token.length > 2);
}

function calculateSimilarity(textA, textB) {
  const tokensA = new Set(tokenize(textA));
  const tokensB = new Set(tokenize(textB));

  if (tokensA.size === 0 || tokensB.size === 0) return 0;

  let intersectionCount = 0;
  tokensA.forEach(t => {
    if (tokensB.has(t)) intersectionCount++;
  });

  const unionSize = new Set([...tokensA, ...tokensB]).size;
  if (unionSize === 0) return 0;

  const rawScore = intersectionCount / unionSize;

  // Scale and boost to realistic AI similarity range (0.4 to 0.98 for matching terms)
  const boostedScore = Math.min(0.98, rawScore * 1.8 + 0.15);
  return Math.round(boostedScore * 100) / 100;
}

module.exports = {
  tokenize,
  calculateSimilarity,
};
