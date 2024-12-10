import { supabase } from "@/integrations/supabase/client";

interface ChunkData {
  content: string;
  context: string;
  mainSections: string[];
  relatedParameters: string[];
}

export const processChunk = async (
  chunkContent: string,
  chunkNumber: number
): Promise<void> => {
  console.log(`Processing chunk ${chunkNumber}`);

  try {
    // Parse the chunk content
    const lines = chunkContent.split('\n');
    const contextLine = lines.find(line => line.startsWith('CONTEXT:'));
    const mainSectionsLine = lines.find(line => line.startsWith('MAIN SECTIONS:'));
    const relatedParamsLine = lines.find(line => line.startsWith('RELATED PARAMETERS:'));

    const chunk = {
      content: chunkContent,
      category: mainSectionsLine?.split(':')[1]?.trim() || 'Uncategorized',
      chunkNumber: chunkNumber
    };

    console.log('Sending chunk to edge function:', chunk);

    const { data, error } = await supabase.functions.invoke('ingest-reference-chunks', {
      body: { chunks: [chunk] }
    });

    if (error) {
      throw error;
    }

    console.log('Successfully processed chunk:', data);
  } catch (error) {
    console.error('Error processing chunk:', error);
    throw error;
  }
};