import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
import { ReferenceChunkForm } from '@/components/admin/ReferenceChunkForm';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const ReferenceChunks = () => {
  const [isGenerating, setIsGenerating] = useState<string | null>(null);

  const { data: chunks, isLoading, refetch } = useQuery({
    queryKey: ['referenceChunks'],
    queryFn: async () => {
      console.log('Fetching reference chunks...');
      const { data, error } = await supabase
        .from('story_reference_chunks')
        .select('*')
        .order('chunk_number', { ascending: true });
        
      if (error) {
        console.error('Error fetching chunks:', error);
        throw error;
      }
      
      console.log('Fetched chunks:', data);
      return data;
    }
  });

  const generateEmbedding = async (chunkId: string) => {
    try {
      setIsGenerating(chunkId);
      console.log('Generating embedding for chunk:', chunkId);
      
      const { error } = await supabase.functions.invoke('generate-embeddings', {
        body: { chunkId }
      });

      if (error) throw error;
      
      toast.success('Successfully generated embedding');
      refetch(); // Refresh the chunks list
    } catch (error: any) {
      console.error('Error generating embedding:', error);
      toast.error(error.message || 'Failed to generate embedding');
    } finally {
      setIsGenerating(null);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reference Chunks</h1>
          <p className="text-muted-foreground mt-2">
            Manage story reference chunks
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Add New Chunk</h2>
            <ReferenceChunkForm />
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Existing Chunks</h2>
            {isLoading ? (
              <p>Loading chunks...</p>
            ) : chunks?.length ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Number</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Content Preview</TableHead>
                      <TableHead>Embedding</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {chunks.map((chunk) => (
                      <TableRow key={chunk.id}>
                        <TableCell>{chunk.chunk_number}</TableCell>
                        <TableCell>{chunk.category}</TableCell>
                        <TableCell className="max-w-[300px] truncate">
                          {chunk.content}
                        </TableCell>
                        <TableCell>
                          {chunk.embedding ? (
                            <span className="text-green-600">Generated</span>
                          ) : (
                            <span className="text-yellow-600">Missing</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {!chunk.embedding && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => generateEmbedding(chunk.id)}
                              disabled={isGenerating === chunk.id}
                            >
                              {isGenerating === chunk.id ? 'Generating...' : 'Generate Embedding'}
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <p>No chunks added yet.</p>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ReferenceChunks;