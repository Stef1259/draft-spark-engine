import { Source, QuoteMatch } from '@/types';

export const findQuotesInText = (text: string): string[] => {
  // Find text within quotes - matches both single and double quotes
  // Also handles block quotes and emphasized text
  const quoteRegex = /["']([^"']{10,}?)["']|"([^"]{10,}?)"|'([^']{10,}?)'/g;
  const quotes: string[] = [];
  let match;
  
  while ((match = quoteRegex.exec(text)) !== null) {
    const quote = match[1] || match[2] || match[3];
    if (quote && quote.trim().length > 10) {
      quotes.push(quote.trim());
    }
  }
  
  return quotes;
};

export const findQuoteInSource = (
  quote: string, 
  sourceText: string, 
  contextLength: number = 30
): { found: boolean; context?: string } => {
  // Normalize both texts for comparison
  const normalizeText = (text: string) => 
    text.toLowerCase()
      .replace(/[.,;:!?""'']/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  
  const normalizedQuote = normalizeText(quote);
  const normalizedSource = normalizeText(sourceText);
  
  // Try to find the quote in the source
  const index = normalizedSource.indexOf(normalizedQuote);
  
  if (index === -1) {
    return { found: false };
  }
  
  // Extract context around the found quote
  const words = sourceText.split(/\s+/);
  const normalizedWords = words.map(normalizeText);
  
  // Find the word index where the quote starts
  let startWordIndex = -1;
  for (let i = 0; i <= normalizedWords.length - normalizedQuote.split(' ').length; i++) {
    const windowText = normalizedWords.slice(i, i + normalizedQuote.split(' ').length).join(' ');
    if (windowText === normalizedQuote) {
      startWordIndex = i;
      break;
    }
  }
  
  if (startWordIndex === -1) {
    // Fallback: just show some context around the character position
    const charStart = Math.max(0, sourceText.toLowerCase().indexOf(normalizedQuote) - contextLength);
    const charEnd = Math.min(sourceText.length, charStart + normalizedQuote.length + contextLength * 2);
    return { 
      found: true, 
      context: sourceText.slice(charStart, charEnd) 
    };
  }
  
  // Extract context with full words
  const contextStart = Math.max(0, startWordIndex - contextLength);
  const contextEnd = Math.min(words.length, startWordIndex + normalizedQuote.split(' ').length + contextLength);
  const context = words.slice(contextStart, contextEnd).join(' ');
  
  return { found: true, context };
};

export const checkQuotesInDraft = (
  draftText: string, 
  transcript: string, 
  sources: Source[]
): QuoteMatch[] => {
  const quotes = findQuotesInText(draftText);
  const matches: QuoteMatch[] = [];
  
  // Combine transcript and sources into searchable content
  const searchableSources = [
    { id: 'transcript', name: 'Interview Transcript', content: transcript },
    ...sources.map(s => ({ id: s.id, name: s.name, content: s.content }))
  ];
  
  for (const quote of quotes) {
    let bestMatch: QuoteMatch | null = null;
    
    // Check each source for the quote
    for (const source of searchableSources) {
      const result = findQuoteInSource(quote, source.content);
      
      if (result.found) {
        bestMatch = {
          quote,
          sourceText: source.content,
          sourceId: source.id,
          sourceName: source.name,
          context: result.context || '',
          found: true,
        };
        break; // Use the first match found
      }
    }
    
    // If no match found, create a "not found" entry
    if (!bestMatch) {
      bestMatch = {
        quote,
        sourceText: '',
        sourceId: '',
        sourceName: '',
        context: '',
        found: false,
      };
    }
    
    matches.push(bestMatch);
  }
  
  return matches;
};