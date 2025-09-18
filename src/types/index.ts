export interface Source {
  id: string;
  type: 'pdf' | 'url';
  name: string;
  content: string;
  url?: string;
}

export interface KeyPoint {
  id: string;
  text: string;
  order: number;
  source?: string;
}

export interface StoryDirection {
  tone: 'neutral' | 'storytelling' | 'press-release';
  length: 'short' | 'medium' | 'long';
  angle: string;
}

export interface QuoteMatch {
  quote: string;
  sourceText: string;
  sourceId: string;
  sourceName: string;
  context: string;
  found: boolean;
}

export interface Project {
  id: string;
  transcript: string;
  sources: Source[];
  keyPoints: KeyPoint[];
  direction: StoryDirection;
  draftText: string;
  quoteMatches: QuoteMatch[];
}