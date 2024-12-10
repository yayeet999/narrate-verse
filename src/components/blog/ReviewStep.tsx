import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { BLOG_LENGTHS } from '@/lib/constants';

export const ReviewStep = ({ form, onBack, isGenerating }: { form: any; onBack: () => void; isGenerating: boolean }) => {
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
