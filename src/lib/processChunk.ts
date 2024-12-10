import { supabase } from "@/integrations/supabase/client";

interface ChunkData {
  content: string;
  category: string;
  chunkNumber: number;
}

export const processChunk = async (
  chunkContent: string,
  chunkNumber: number
): Promise<void> => {
  console.log(`Starting to process chunk ${chunkNumber}`);
  console.log('Raw chunk content:', chunkContent);

  try {
    // Extract the main sections which will be our category
    const mainSectionsMatch = chunkContent.match(/MAIN SECTIONS: (.*?)\n/);
    if (!mainSectionsMatch) {
      throw new Error('Could not find MAIN SECTIONS in chunk content');
    }

    // Get the first main section as the category
    const mainSections = mainSectionsMatch[1].split(',')[0].trim();
    console.log('Extracted category:', mainSections);

    const chunk: ChunkData = {
      content: chunkContent,
      category: mainSections,
      chunkNumber: chunkNumber
    };

    console.log('Sending chunk to edge function:', chunk);

    const { data, error } = await supabase.functions.invoke('ingest-reference-chunks', {
      body: { chunks: [chunk] }
    });

    if (error) {
      console.error('Error from edge function:', error);
      throw error;
    }

    console.log('Successfully processed chunk. Response:', data);
  } catch (error) {
    console.error('Error processing chunk:', error);
    throw error;
  }
};