/**
 * Simple fuzzy matching algorithm
 * Returns a score based on how well the query matches the text
 */
export function fuzzyMatch(query, text) {
  query = query.toLowerCase();
  text = text.toLowerCase();
  
  // Exact match
  if (text === query) return 1000;
  
  // Contains exact query
  if (text.includes(query)) return 500;
  
  // Start with query
  if (text.startsWith(query)) return 750;
  
  let score = 0;
  let queryIndex = 0;
  let textIndex = 0;
  let consecutiveMatches = 0;
  
  while (queryIndex < query.length && textIndex < text.length) {
    if (query[queryIndex] === text[textIndex]) {
      score += 10;
      consecutiveMatches++;
      
      // Bonus for consecutive matches
      if (consecutiveMatches > 1) {
        score += consecutiveMatches * 5;
      }
      
      // Bonus for matching at word boundaries
      if (textIndex === 0 || text[textIndex - 1] === ' ') {
        score += 15;
      }
      
      queryIndex++;
    } else {
      consecutiveMatches = 0;
    }
    textIndex++;
  }
  
  // Penalize if not all query characters were found
  if (queryIndex < query.length) {
    score = score * (queryIndex / query.length);
  }
  
  // Bonus for shorter text (more relevant)
  score += Math.max(0, 50 - text.length);
  
  return score;
}

/**
 * Search tools with fuzzy matching
 */
export function searchTools(query, tools) {
  if (!query) return [];
  
  const results = tools.map(tool => ({
    ...tool,
    score: Math.max(
      fuzzyMatch(query, tool.name),
      fuzzyMatch(query, tool.category) * 0.5, // Category matches are less important
      tool.keywords ? Math.max(...tool.keywords.map(k => fuzzyMatch(query, k) * 0.7)) : 0
    )
  }));
  
  // Filter out very low scores and sort by score
  return results
    .filter(result => result.score > 20)
    .sort((a, b) => b.score - a.score)
    .map(({ score, ...tool }) => tool); // Remove score from final output
}

/**
 * Highlight matching characters in text
 */
export function highlightMatch(text, query) {
  if (!query) return text;
  
  const regex = new RegExp(`(${query.split('').join('.*?')})`, 'gi');
  return text.replace(regex, '<mark>$1</mark>');
}