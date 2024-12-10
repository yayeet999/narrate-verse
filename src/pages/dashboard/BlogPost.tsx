import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Form, FormField, FormItem, FormLabel, FormDescription } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import type { BlogParameters, BlogFormStep } from '@/types/blog';

const BLOG_LENGTHS = {
  short: 800,
  medium: 1200,
  long: 2000
};

// Step Components
const TypeLengthStep = ({ form, onNext }: { form: any; onNext: () => void }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-2xl font-bold">Basic Blog Settings</h2>
        <p className="text-muted-foreground">Choose your blog type and length</p>
      </div>

      <FormField
        control={form.control}
        name="type"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Blog Type</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <SelectTrigger>
                <SelectValue placeholder="Select blog type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="how_to_guide">How-To Guide</SelectItem>
                <SelectItem value="industry_news">Industry News</SelectItem>
                <SelectItem value="analysis">Analysis</SelectItem>
                <SelectItem value="opinion">Opinion</SelectItem>
                <SelectItem value="listicle">Listicle</SelectItem>
              </SelectContent>
            </Select>
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="length"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Blog Length</FormLabel>
            <div className="grid grid-cols-3 gap-4">
              {Object.entries(BLOG_LENGTHS).map(([key, value]) => (
                <Button
                  key={key}
                  type="button"
                  variant={field.value === key ? "default" : "outline"}
                  className="w-full"
                  onClick={() => field.onChange(key)}
                >
                  {value} words
                </Button>
              ))}
            </div>
          </FormItem>
        )}
      />

      <div className="flex justify-end">
        <Button onClick={onNext}>Next Step</Button>
      </div>
    </motion.div>
  );
};

const AudienceStyleStep = ({ form, onBack, onNext }: { form: any; onBack: () => void; onNext: () => void }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-2xl font-bold">Audience & Style</h2>
        <p className="text-muted-foreground">Define your target audience and content style</p>
      </div>

      <FormField
        control={form.control}
        name="targetAudience"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Target Audience</FormLabel>
            <div className="grid grid-cols-2 gap-4">
              {['beginner', 'intermediate', 'expert', 'general'].map((audience) => (
                <Button
                  key={audience}
                  type="button"
                  variant={field.value === audience ? "default" : "outline"}
                  className="w-full capitalize"
                  onClick={() => field.onChange(audience)}
                >
                  {audience}
                </Button>
              ))}
            </div>
          </FormItem>
        )}
      />

      <div className="space-y-4">
        <h3 className="font-semibold">Content Style</h3>
        
        <FormField
          control={form.control}
          name="contentStyle.technicalLevel"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Technical Level</FormLabel>
              <Slider
                value={[field.value]}
                onValueChange={([value]) => field.onChange(value)}
                max={5}
                min={1}
                step={1}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Casual</span>
                <span>Very Technical</span>
              </div>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="contentStyle.tone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tone</FormLabel>
              <Slider
                value={[field.value]}
                onValueChange={([value]) => field.onChange(value)}
                max={5}
                min={1}
                step={1}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Conversational</span>
                <span>Professional</span>
              </div>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="contentStyle.detailLevel"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Detail Level</FormLabel>
              <Slider
                value={[field.value]}
                onValueChange={([value]) => field.onChange(value)}
                max={5}
                min={1}
                step={1}
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Overview</span>
                <span>In-depth</span>
              </div>
            </FormItem>
          )}
        />
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>Back</Button>
        <Button onClick={onNext}>Next Step</Button>
      </div>
    </motion.div>
  );
};

const OptionsStep = ({ form, onBack, onNext }: { form: any; onBack: () => void; onNext: () => void }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-2xl font-bold">Content Options</h2>
        <p className="text-muted-foreground">Customize your blog content features</p>
      </div>

      <div className="space-y-4">
        {[
          { name: 'includeStatistics', label: 'Include Statistics', description: 'Add relevant data and statistics' },
          { name: 'addExpertQuotes', label: 'Expert Quotes', description: 'Include quotes from industry experts' },
          { name: 'includeExamples', label: 'Real Examples', description: 'Add real-world examples' },
          { name: 'addVisualElements', label: 'Visual Elements', description: 'Suggest places for images/diagrams' },
          { name: 'seoOptimization', label: 'SEO Optimization', description: 'Optimize for search engines' },
        ].map((option) => (
          <FormField
            key={option.name}
            control={form.control}
            name={`options.${option.name}`}
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">{option.label}</FormLabel>
                  <FormDescription>{option.description}</FormDescription>
                </div>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormItem>
            )}
          />
        ))}
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>Back</Button>
        <Button onClick={onNext}>Next Step</Button>
      </div>
    </motion.div>
  );
};

const CustomInstructionsStep = ({ form, onBack, onNext }: { form: any; onBack: () => void; onNext: () => void }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-2xl font-bold">Custom Instructions</h2>
        <p className="text-muted-foreground">Add any specific instructions or requirements</p>
      </div>

      <FormField
        control={form.control}
        name="customInstructions"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Additional Instructions</FormLabel>
            <FormDescription>
              Provide any specific topics, focus areas, or requirements for your blog post.
            </FormDescription>
            <Textarea
              {...field}
              placeholder="Example: Focus on recent developments in AI, include industry trends from the last 6 months..."
              className="h-32"
            />
          </FormItem>
        )}
      />

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>Back</Button>
        <Button onClick={onNext}>Review Settings</Button>
      </div>
    </motion.div>
  );
};

const ReviewStep = ({ form, onBack, isGenerating }: { form: any; onBack: () => void; isGenerating: boolean }) => {
  const values = form.getValues();
  
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-2xl font-bold">Review Settings</h2>
        <p className="text-muted-foreground">Review your blog settings before generation</p>
      </div>

      <div className="space-y-4">
        <Card className="p-4">
          <h3 className="font-semibold">Basic Settings</h3>
          <dl className="mt-2 space-y-1">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Type:</dt>
              <dd className="capitalize">{values.type.replace(/_/g, ' ')}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Length:</dt>
              <dd>{BLOG_LENGTHS[values.length]} words</dd>
            </div>
          </dl>
        </Card>

        <Card className="p-4">
          <h3 className="font-semibold">Style & Audience</h3>
          <dl className="mt-2 space-y-1">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Target Audience:</dt>
              <dd className="capitalize">{values.targetAudience}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Technical Level:</dt>
              <dd>{values.contentStyle.technicalLevel}/5</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Tone:</dt>
              <dd>{values.contentStyle.tone}/5</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Detail Level:</dt>
              <dd>{values.contentStyle.detailLevel}/5</dd>
            </div>
          </dl>
        </Card>

        <Card className="p-4">
          <h3 className="font-semibold">Selected Options</h3>
          <ul className="mt-2 space-y-1">
            {Object.entries(values.options)
              .filter(([_, value]) => value)
              .map(([key]) => (
                <li key={key} className="text-muted-foreground capitalize">
                  ✓ {key.replace(/([A-Z])/g, ' $1').trim()}
                </li>
              ))}
          </ul>
        </Card>

        {values.customInstructions && (
          <Card className="p-4">
            <h3 className="font-semibold">Custom Instructions</h3>
            <p className="mt-2 text-muted-foreground">{values.customInstructions}</p>
          </Card>
        )}
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>Back</Button>
        <Button type="submit" disabled={isGenerating}>
          {isGenerating ? (
            <>
              <div className="animate-spin mr-2">⚪</div>
              Generating...
            </>
          ) : (
            'Generate Blog'
          )}
        </Button>
      </div>
    </motion.div>
  );
};

const BlogPost = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<BlogFormStep>('type-length');
  const [isGenerating, setIsGenerating] = useState(false);

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

  const onSubmit = async (data: BlogParameters) => {
    console.log('Submitting blog parameters:', data);
    setIsGenerating(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        toast.error("You must be logged in to create content");
        return;
      }

      // First, create the content entry
      const { data: content, error: contentError } = await supabase
        .from('content')
        .insert([
          {
            title: `${data.type.replace(/_/g, ' ')} - Draft`,
            content: JSON.stringify(data), // Store parameters for now, will be replaced with generated content
            type: 'blog',
            user_id: session.user.id,
            is_published: false
          }
        ])
        .select()
        .single();

      if (contentError) throw contentError;

      // TODO: Integrate with Perplexity API for content generation
      // For now, just show success and redirect
      toast.success("Blog parameters saved successfully!");
      navigate('/dashboard/library');
      
    } catch (error) {
      console.error('Error creating blog:', error);
      toast.error("Failed to create blog post");
    } finally {
      setIsGenerating(false);
    }
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

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Card className="p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <AnimatePresence mode="wait">
              {currentStep === 'type-length' && (
                <TypeLengthStep form={form} onNext={nextStep} />
              )}
              {currentStep === 'audience-style' && (
                <AudienceStyleStep form={form} onBack={previousStep} onNext={nextStep} />
              )}
              {currentStep === 'options' && (
                <OptionsStep form={form} onBack={previousStep} onNext={nextStep} />
              )}
              {currentStep === 'custom' && (
                <CustomInstructionsStep form={form} onBack={previousStep} onNext={nextStep} />
              )}
              {currentStep === 'review' && (
                <ReviewStep form={form} onBack={previousStep} isGenerating={isGenerating} />
              )}
            </AnimatePresence>
          </form>
        </Form>
      </Card>
    </div>
  );
};

export default BlogPost;
