import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { FormField, FormItem, FormLabel } from '@/components/ui/form';

export const PreviewStep = ({ 
  content, 
  onEdit, 
  onSave, 
  onBack,
  isLoading 
}: { 
  content: string;
  onEdit: (content: string) => void;
  onSave: () => void;
  onBack: () => void;
  isLoading?: boolean;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-2xl font-bold">Preview & Edit</h2>
        <p className="text-muted-foreground">Review and edit your generated content before saving</p>
      </div>

      <FormField
        name="preview"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Generated Content</FormLabel>
            <Textarea
              value={content}
              onChange={(e) => onEdit(e.target.value)}
              className="min-h-[400px] font-mono text-sm"
              placeholder="Your generated content will appear here..."
              disabled={isLoading}
            />
          </FormItem>
        )}
      />

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button onClick={onSave} disabled={isLoading}>
          Save Content
        </Button>
      </div>
    </motion.div>
  );
};