import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { ChevronRight } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { Card } from '@/components/ui/card';
import { Form } from '@/components/ui/form';
import { 
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

type StoryFormData = {
  title: string;
  genre: string;
  targetAudience: string;
  length: 'short' | 'medium' | 'long';
  plotStructure: string;
  customInstructions?: string;
};

const StoryPost = () => {
  const navigate = useNavigate();
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState('');

  const form = useForm<StoryFormData>({
    defaultValues: {
      title: '',
      genre: 'fantasy',
      targetAudience: 'general',
      length: 'medium',
      plotStructure: 'three_act',
      customInstructions: ''
    }
  });

  const handleSaveContent = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        toast.error("You must be logged in to save content");
        return;
      }

      const values = form.getValues();
      const { error: saveError } = await supabase
        .from('content')
        .insert([
          {
            title: values.title || 'Untitled Story',
            content: generatedContent,
            type: 'story',
            user_id: session.user.id,
            is_published: false
          }
        ]);

      if (saveError) throw saveError;
      toast.success("Story saved successfully!");
      navigate('/dashboard/library');
      
    } catch (error) {
      console.error('Error saving story:', error);
      toast.error("Failed to save story");
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink onClick={() => navigate('/dashboard')}>Dashboard</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator>
              <ChevronRight className="h-4 w-4" />
            </BreadcrumbSeparator>
            <BreadcrumbItem>
              <BreadcrumbLink onClick={() => navigate('/dashboard/create')}>Create</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator>
              <ChevronRight className="h-4 w-4" />
            </BreadcrumbSeparator>
            <BreadcrumbItem>
              <BreadcrumbPage>Short Story</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="mt-6 space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Create New Story</h1>
          <p className="text-muted-foreground">
            Craft your next captivating short story
          </p>
        </div>
      </div>

      <Card className="p-6">
        <Form {...form}>
          <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
            <p className="text-center text-muted-foreground">Story creation form coming soon...</p>
          </form>
        </Form>
      </Card>
    </div>
  );
};

export default StoryPost;