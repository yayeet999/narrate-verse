import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { FormField, FormItem, FormLabel, FormDescription } from '@/components/ui/form';
import { Switch } from "@/components/ui/switch";

export const OptionsStep = ({ form, onBack, onNext }: { form: any; onBack: () => void; onNext: () => void }) => {
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
