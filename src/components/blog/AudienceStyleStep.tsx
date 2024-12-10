import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Slider } from '@/components/ui/slider';

export const AudienceStyleStep = ({ form, onBack, onNext }: { form: any; onBack: () => void; onNext: () => void }) => {
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