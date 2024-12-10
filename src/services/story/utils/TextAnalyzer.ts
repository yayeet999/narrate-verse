export type WritingStyle = 'formal' | 'standard' | 'casual';
export type PacingScore = 1 | 2 | 3 | 4 | 5;

export class TextAnalyzer {
  static countWords(text: string): number {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  }

  static async analyzeWritingStyle(text: string): Promise<WritingStyle> {
    const words = text.split(/\s+/).filter(word => word.length > 0);
    if (words.length === 0) return 'standard';
    
    const totalLength = words.reduce((sum, word) => sum + word.length, 0);
    const avgWordLength = totalLength / words.length;
    
    if (avgWordLength > 6) return 'formal';
    if (avgWordLength > 4) return 'standard';
    return 'casual';
  }

  static async analyzePacing(chapter: string): Promise<PacingScore> {
    const sentences = chapter.split(/[.!?]+/).filter(sent => sent.trim().length > 0);
    if (sentences.length === 0) return 3;
    
    const totalWords = sentences.reduce((sum, sent) => 
      sum + sent.trim().split(/\s+/).filter(word => word.length > 0).length, 0
    );
    const avgSentenceLength = totalWords / sentences.length;
    
    if (avgSentenceLength > 20) return 1;
    if (avgSentenceLength > 15) return 2;
    if (avgSentenceLength > 10) return 3;
    if (avgSentenceLength > 5) return 4;
    return 5;
  }

  static async analyzeDialogueRatio(chapter: string): Promise<number> {
    const dialogueMatches = chapter.match(/["'](?:\\.|[^"'\\])*["']/g) || [];
    const totalWords = this.countWords(chapter);
    const dialogueWords = dialogueMatches.reduce((count: number, match) => 
      count + this.countWords(match), 0
    );
    
    return totalWords > 0 ? dialogueWords / totalWords : 0;
  }

  static async checkWritingStyle(chapter: string, targetStyle: WritingStyle): Promise<boolean> {
    const styleAnalysis = await TextAnalyzer.analyzeWritingStyle(chapter);
    return styleAnalysis === targetStyle;
  }

  static async checkDialogueStyle(chapter: string): Promise<{
    isValid: boolean;
    ratio: number;
    recommendation?: string;
  }> {
    const ratio = await this.analyzeDialogueRatio(chapter);
    const isValid = ratio >= 0.2 && ratio <= 0.6;
    
    return {
      isValid,
      ratio,
      recommendation: isValid ? undefined : 
        ratio < 0.2 ? 'Consider adding more dialogue' : 'Consider reducing dialogue'
    };
  }

  static async checkDescriptiveStyle(chapter: string): Promise<{
    isValid: boolean;
    recommendation?: string;
  }> {
    const words = chapter.split(/\s+/).filter(word => word.length > 0);
    const descriptiveWords = words.filter(word => 
      /(?:ly|ful|ous|ish|able|ible)$/.test(word)
    ).length;
    
    const ratio = words.length > 0 ? descriptiveWords / words.length : 0;
    const isValid = ratio >= 0.05 && ratio <= 0.15;
    
    return {
      isValid,
      recommendation: isValid ? undefined :
        ratio < 0.05 ? 'Add more descriptive language' : 'Reduce excessive description'
    };
  }

  static async checkVoiceConsistency(chapter: string): Promise<{
    isConsistent: boolean;
    recommendation?: string;
  }> {
    const style = await this.analyzeWritingStyle(chapter);
    const pacing = await this.analyzePacing(chapter);
    const dialogueAnalysis = await this.checkDialogueStyle(chapter);
    
    const isConsistent = dialogueAnalysis.isValid && 
      (style === 'standard' || style === 'formal') && 
      (pacing >= 2 && pacing <= 4);
    
    return {
      isConsistent,
      recommendation: isConsistent ? undefined :
        'Review for consistent voice, style, and pacing throughout the chapter'
    };
  }
}