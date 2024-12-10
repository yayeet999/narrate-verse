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
  console.log('=== Processing Chunk ===');
  console.log('Chunk Number:', chunkNumber);
  console.log('Raw chunk content:', chunkContent);

  try {
    // First, validate the chunk has the expected format
    if (!chunkContent.includes('MAIN SECTIONS:')) {
      console.error('Chunk does not contain MAIN SECTIONS marker');
      throw new Error('Invalid chunk format: Missing MAIN SECTIONS');
    }

    // Extract the main sections with a more flexible regex
    const mainSectionsMatch = chunkContent.match(/MAIN SECTIONS:[\s]*([^\n]+)/);
    console.log('Main sections match result:', mainSectionsMatch);

    if (!mainSectionsMatch || !mainSectionsMatch[1]) {
      console.error('Failed to match MAIN SECTIONS pattern');
      console.error('Content received:', chunkContent);
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

    console.log('Prepared chunk data:', chunk);

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