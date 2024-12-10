import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BLOG_LENGTHS } from '@/lib/constants';

export const TypeLengthStep = ({ form, onNext }: { form: any; onNext: () => void }) => {
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
