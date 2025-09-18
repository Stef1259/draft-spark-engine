import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { StoryDirection } from '@/types';
import { Compass } from 'lucide-react';

interface StoryDirectionControlsProps {
  direction: StoryDirection;
  onDirectionChange: (direction: StoryDirection) => void;
}

const lengthLabels = {
  short: '300-500 words',
  medium: '500-800 words',
  long: '800-1200 words'
};

export const StoryDirectionControls = ({ direction, onDirectionChange }: StoryDirectionControlsProps) => {
  const updateDirection = (updates: Partial<StoryDirection>) => {
    onDirectionChange({ ...direction, ...updates });
  };

  return (
    <Card className="w-full bg-editor border-editor-border shadow-editorial-sm">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg font-medium">
          <Compass className="w-5 h-5 text-primary" />
          Story Direction
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Tone & Style
            </label>
            <Select 
              value={direction.tone} 
              onValueChange={(value: 'neutral' | 'storytelling' | 'press-release') => 
                updateDirection({ tone: value })
              }
            >
              <SelectTrigger className="bg-background border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                <SelectItem value="neutral">Neutral & Factual</SelectItem>
                <SelectItem value="storytelling">Narrative & Engaging</SelectItem>
                <SelectItem value="press-release">Professional & Formal</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Choose the overall tone for your article
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Article Length
            </label>
            <div className="space-y-3">
              <Select 
                value={direction.length} 
                onValueChange={(value: 'short' | 'medium' | 'long') => 
                  updateDirection({ length: value })
                }
              >
                <SelectTrigger className="bg-background border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  <SelectItem value="short">Short Article</SelectItem>
                  <SelectItem value="medium">Medium Article</SelectItem>
                  <SelectItem value="long">Long Article</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {lengthLabels[direction.length]}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            Custom Angle or Focus
          </label>
          <Textarea
            placeholder="e.g., Focus on the human impact, emphasize technical innovations, highlight controversy, etc."
            value={direction.angle}
            onChange={(e) => updateDirection({ angle: e.target.value })}
            className="min-h-[80px] resize-none bg-background border-border focus:border-primary"
          />
          <p className="text-xs text-muted-foreground">
            Describe any specific angle, perspective, or focus area for the article
          </p>
        </div>
      </CardContent>
    </Card>
  );
};