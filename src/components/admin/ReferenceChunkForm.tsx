import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const ReferenceChunkForm = () => {
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');
  const [chunkNumber, setChunkNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content || !category || !chunkNumber) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsSubmitting(true);
    
    try {
      console.log('Attempting to submit chunk:', {
        content,
        category,
        chunkNumber: parseInt(chunkNumber)
      });

      const { data, error } = await supabase
        .from('story_reference_chunks')
        .insert([
          {
            content,
            category,
            chunk_number: parseInt(chunkNumber)
          }
        ]);

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      console.log('Successfully added chunk:', data);
      toast.success('Reference chunk added successfully');
      
      // Clear form
      setContent('');
      setCategory('');
      setChunkNumber('');
      
    } catch (error: any) {
      console.error('Detailed error:', error);
      toast.error(error.message || 'Failed to add reference chunk');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="category">Category</Label>
        <Input
          id="category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          placeholder="e.g., Story Length"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="chunkNumber">Chunk Number</Label>
        <Input
          id="chunkNumber"
          type="number"
          value={chunkNumber}
          onChange={(e) => setChunkNumber(e.target.value)}
          placeholder="e.g., 1"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="content">Content</Label>
        <Textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Paste your reference chunk content here..."
          className="min-h-[200px]"
        />
      </div>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Adding...' : 'Add Reference Chunk'}
      </Button>
    </form>
  );
};