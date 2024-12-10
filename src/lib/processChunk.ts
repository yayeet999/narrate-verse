import { supabase } from "@/integrations/supabase/client";

export async function processChunk(chunk: {
  number: number;
  content: string;
  category: string;
}) {
  console.log(`Processing chunk ${chunk.number}...`);
  
  const { data, error } = await supabase.functions.invoke('ingest-reference-chunks', {
    body: { chunks: [chunk] }
  });

  if (error) {
    console.error('Error processing chunk:', error);
    throw error;
  }

  console.log('Chunk processed successfully:', data);
  return data;
}