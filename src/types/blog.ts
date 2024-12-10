export type BlogParameters = {
  type: 'how_to_guide' | 'industry_news' | 'analysis' | 'opinion' | 'listicle';
  length: 'short' | 'medium' | 'long';
  targetAudience: 'beginner' | 'intermediate' | 'expert' | 'general';
  contentStyle: {
    technicalLevel: number;
    tone: number;
    detailLevel: number;
  };
  options: {
    includeStatistics: boolean;
    addExpertQuotes: boolean;
    includeExamples: boolean;
    addVisualElements: boolean;
    seoOptimization: boolean;
  };
  customInstructions?: string;
};

export type BlogFormStep = 
  | 'type-length'
  | 'audience-style'
  | 'options'
  | 'custom'
  | 'review'
  | 'preview';