export interface VectorChunk {
  content: string;
  category: string;
  relevanceScore: number;
  metadata: Record<string, any>;
}

export interface ProcessedVectorResults {
  writingGuides: VectorChunk[];
  genreGuides: VectorChunk[];
  characterGuides: VectorChunk[];
  plotStructures: VectorChunk[];
  technicalSpecs: VectorChunk[];
}