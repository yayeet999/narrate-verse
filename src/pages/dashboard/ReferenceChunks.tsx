import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
import { ReferenceChunkForm } from '@/components/admin/ReferenceChunkForm';
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const ReferenceChunks = () => {
  const { data: chunks, isLoading } = useQuery({
    queryKey: ['referenceChunks'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('story_reference_chunks')
        .select('*')
        .order('chunk_number');
        
      if (error) throw error;
      return data;
    }
  });

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