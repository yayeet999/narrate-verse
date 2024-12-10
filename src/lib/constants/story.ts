export const STORY_LENGTHS = {
  SHORT: {
    value: '5-10',
    label: '5-10 pages (2-4 major scenes)',
    tokenCount: 3000, // ~2000 words
    wordCount: 2000,  // kept for backwards compatibility
    scenesRange: { min: 2, max: 4 }
  },
  MEDIUM: {
    value: '10-20',
    label: '10-20 pages (4-8 scenes)',
    tokenCount: 6000, // ~4000 words
    wordCount: 4000,  // kept for backwards compatibility
    scenesRange: { min: 4, max: 8 }
  },
  LONG: {
    value: '20-30',
    label: '20-30 pages (6-12 scenes)',
    tokenCount: 9000, // ~6000 words
    wordCount: 6000,  // kept for backwards compatibility
    scenesRange: { min: 6, max: 12 }
  }
} as const;

// Helper function to get token count from length value
export const getTokenCountForLength = (length: string): number => {
  const lengthEntry = Object.values(STORY_LENGTHS).find(l => l.value === length);
  return lengthEntry?.tokenCount || 6000; // Default to medium length if not found
};

// Helper function to get word count from length value (kept for backwards compatibility)
export const getWordCountForLength = (length: string): number => {
  const lengthEntry = Object.values(STORY_LENGTHS).find(l => l.value === length);
  return lengthEntry?.wordCount || 4000; // Default to medium length if not found
};