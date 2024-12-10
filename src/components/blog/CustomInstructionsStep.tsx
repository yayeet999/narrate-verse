import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { FormField, FormItem, FormLabel, FormDescription } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';

export const CustomInstructionsStep = ({ form, onBack, onNext }: { form: any; onBack: () => void; onNext: () => void }) => {
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
