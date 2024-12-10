import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { ChevronRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Form } from '@/components/ui/form';
import { supabase } from "@/integrations/supabase/client";
import { TypeLengthStep } from '@/components/blog/TypeLengthStep';
import { AudienceStyleStep } from '@/components/blog/AudienceStyleStep';
import { OptionsStep } from '@/components/blog/OptionsStep';
import { CustomInstructionsStep } from '@/components/blog/CustomInstructionsStep';
import { ReviewStep } from '@/components/blog/ReviewStep';
import { PreviewStep } from '@/components/blog/PreviewStep';
import { 
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import type { BlogParameters, BlogFormStep } from '@/types/blog';

const STEPS: { [key in BlogFormStep]: { title: string; description: string } } = {
  'type-length': { 
    title: 'Basic Settings',
    description: 'Choose your blog type and length'
  },
  'audience-style': {
    title: 'Audience & Style',
    description: 'Define your target audience and content style'
  },
  'options': {
    title: 'Content Options',
    description: 'Customize your blog content features'
  },
  'custom': {
    title: 'Custom Instructions',
    description: 'Add specific requirements'
  },
  'review': {
    title: 'Review',
    description: 'Review your settings'
  },
  'preview': {
    title: 'Preview & Edit',
    description: 'Review and edit generated content'
  }
};

const BlogPost = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<BlogFormStep>('type-length');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState('');

  const form = useForm<BlogParameters>({
    defaultValues: {
      type: 'how_to_guide',
      length: 'medium',
      targetAudience: 'general',
      contentStyle: {
        technicalLevel: 3,
        tone: 3,
        detailLevel: 3
      },
      options: {
        includeStatistics: false,
        addExpertQuotes: false,
        includeExamples: true,
        addVisualElements: true,
        seoOptimization: true
      },
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
            title: `${values.type.replace(/_/g, ' ')} - Draft`,
            content: generatedContent,
            type: 'blog',
            user_id: session.user.id,
            is_published: false
          }
        ]);

      if (saveError) throw saveError;
      toast.success("Blog post saved successfully!");
      navigate('/dashboard/library');
      
    } catch (error) {
      console.error('Error saving blog:', error);
      toast.error("Failed to save blog post");
    }
  };

  const handlePreview = (content: string) => {
    setGeneratedContent(content);
    setCurrentStep('preview');
    setIsGenerating(false);
  };

  const nextStep = () => {
    const steps: BlogFormStep[] = ['type-length', 'audience-style', 'options', 'custom', 'review'];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1]);
    }
  };

  const previousStep = () => {
    const steps: BlogFormStep[] = ['type-length', 'audience-style', 'options', 'custom', 'review'];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1]);
    }
  };

  const handleStepClick = (step: BlogFormStep) => {
    const steps: BlogFormStep[] = ['type-length', 'audience-style', 'options', 'custom', 'review'];
    const currentIndex = steps.indexOf(currentStep);
    const targetIndex = steps.indexOf(step);
    
    // Only allow going back to previous steps
    if (targetIndex < currentIndex) {
      setCurrentStep(step);
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
              <BreadcrumbPage>Blog Post</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="mt-6 space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Create New Blog Post</h1>
          <div className="flex space-x-2 text-sm text-muted-foreground">
            {Object.entries(STEPS).map(([step, { title }], index) => (
              <div key={step} className="flex items-center">
                <button
                  onClick={() => handleStepClick(step as BlogFormStep)}
                  className={`hover:text-foreground ${currentStep === step ? 'text-foreground font-medium' : ''}`}
                >
                  {title}
                </button>
                {index < Object.entries(STEPS).length - 1 && (
                  <ChevronRight className="h-4 w-4 mx-2" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <Card className="p-6">
        <Form {...form}>
          <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
            <AnimatePresence mode="wait">
              {currentStep === 'type-length' && (
                <TypeLengthStep form={form} onNext={() => setCurrentStep('audience-style')} />
              )}
              {currentStep === 'audience-style' && (
                <AudienceStyleStep 
                  form={form} 
                  onBack={() => setCurrentStep('type-length')} 
                  onNext={() => setCurrentStep('options')} 
                />
              )}
              {currentStep === 'options' && (
                <OptionsStep 
                  form={form} 
                  onBack={() => setCurrentStep('audience-style')} 
                  onNext={() => setCurrentStep('custom')} 
                />
              )}
              {currentStep === 'custom' && (
                <CustomInstructionsStep 
                  form={form} 
                  onBack={() => setCurrentStep('options')} 
                  onNext={() => setCurrentStep('review')} 
                />
              )}
              {currentStep === 'review' && (
                <ReviewStep 
                  form={form} 
                  onBack={() => setCurrentStep('custom')} 
                  isGenerating={isGenerating}
                  onPreview={handlePreview}
                />
              )}
              {currentStep === 'preview' && (
                <PreviewStep
                  content={generatedContent}
                  onEdit={setGeneratedContent}
                  onSave={handleSaveContent}
                  onBack={() => setCurrentStep('review')}
                  isLoading={isGenerating}
                />
              )}
            </AnimatePresence>
          </form>
        </Form>
      </Card>
    </div>
  );
};

export default BlogPost;
