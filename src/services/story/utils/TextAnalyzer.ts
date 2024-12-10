export class TextAnalyzer {
  static countWords(text: string): number {
    return text.trim().split(/\s+/).length;
  }

  static async analyzeWritingStyle(text: string): Promise<string> {
    // Basic writing style analysis
    const words = text.split(/\s+/);
    const avgWordLength = words.reduce((sum, word) => sum + word.length, 0) / words.length;
    
    if (avgWordLength > 6) return 'formal';
    if (avgWordLength > 4) return 'standard';
    return 'casual';
  }

  static async analyzePacing(chapter: string): Promise<number> {
    const sentences = chapter.split(/[.!?]+/);
    const avgSentenceLength = sentences.reduce((sum, sent) => sum + sent.trim().split(/\s+/).length, 0) / sentences.length;
    
    // Convert average sentence length to a pacing score (1-5)
    if (avgSentenceLength > 20) return 1; // Very slow
    if (avgSentenceLength > 15) return 2;
    if (avgSentenceLength > 10) return 3;
    if (avgSentenceLength > 5) return 4;
    return 5; // Very fast
  }

  static async analyzeDialogueRatio(chapter: string): Promise<number> {
    const dialogueMatches = chapter.match(/["'](?:\\.|[^"'\\])*["']/g) || [];
    const totalWords = this.countWords(chapter);
    const dialogueWords = dialogueMatches.reduce((count, match) => 
      count + this.countWords(match), 0
    );
    
    return totalWords > 0 ? dialogueWords / totalWords : 0;
  }

  static async checkWritingStyle(chapter: string, targetStyle: string): Promise<boolean> {
    const styleAnalysis = await TextAnalyzer.analyzeWritingStyle(chapter);
    return styleAnalysis === targetStyle;
  }

  static async checkDialogueStyle(chapter: string): Promise<boolean> {
    return true;
  }

  static async checkDescriptiveStyle(chapter: string): Promise<boolean> {
    return true;
  }

  static async checkVoiceConsistency(chapter: string): Promise<boolean> {
    return true;
  }
}