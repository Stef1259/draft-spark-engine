import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { KeyPoint } from '@/types';
import { GeminiService } from '@/lib/geminiService';
import { Lightbulb, ChevronUp, ChevronDown, Trash2, Sparkles, Bot } from 'lucide-react';

interface KeyPointsEditorProps {
  keyPoints: KeyPoint[];
  onKeyPointsChange: (keyPoints: KeyPoint[]) => void;
  onExtractKeyPoints: () => void;
  isExtracting: boolean;
}

export const KeyPointsEditor = ({ 
  keyPoints, 
  onKeyPointsChange, 
  onExtractKeyPoints,
  isExtracting 
}: KeyPointsEditorProps) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');

  const startEditing = (keyPoint: KeyPoint) => {
    setEditingId(keyPoint.id);
    setEditText(keyPoint.text);
  };

  const saveEdit = () => {
    if (editingId) {
      const updated = keyPoints.map(kp => 
        kp.id === editingId ? { ...kp, text: editText } : kp
      );
      onKeyPointsChange(updated);
      setEditingId(null);
      setEditText('');
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditText('');
  };

  const moveKeyPoint = (id: string, direction: 'up' | 'down') => {
    const currentIndex = keyPoints.findIndex(kp => kp.id === id);
    if (currentIndex === -1) return;

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (newIndex < 0 || newIndex >= keyPoints.length) return;

    const updated = [...keyPoints];
    [updated[currentIndex], updated[newIndex]] = [updated[newIndex], updated[currentIndex]];
    
    // Update order property
    updated.forEach((kp, index) => {
      kp.order = index;
    });

    onKeyPointsChange(updated);
  };

  const removeKeyPoint = (id: string) => {
    const updated = keyPoints.filter(kp => kp.id !== id);
    // Update order property
    updated.forEach((kp, index) => {
      kp.order = index;
    });
    onKeyPointsChange(updated);
  };

  return (
    <Card className="w-full bg-editor border-editor-border shadow-editorial-sm">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-primary" />
            Key Points
          </div>
          <Button 
            onClick={onExtractKeyPoints}
            disabled={isExtracting}
            size="sm"
            className="bg-primary hover:bg-primary-hover"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            {isExtracting ? 'Extracting...' : 'Extract Key Points'}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {keyPoints.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Lightbulb className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No key points extracted yet.</p>
            <p className="text-sm">Add a transcript and click "Extract Key Points" to get started.</p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-4">
              <Badge 
                variant="secondary" 
                className={GeminiService.isConfigured() 
                  ? "bg-green-100 text-green-800 border-green-200" 
                  : "bg-accent/20 text-accent-foreground"
                }
              >
                {GeminiService.isConfigured() ? (
                  <Bot className="w-3 h-3 mr-1" />
                ) : (
                  <Sparkles className="w-3 h-3 mr-1" />
                )}
                {GeminiService.isConfigured() ? 'Real AI Generated' : 'Simulated AI Output'}
              </Badge>
              <span className="text-sm text-muted-foreground">
                {keyPoints.length} key points found
              </span>
            </div>
            
            {keyPoints.map((keyPoint, index) => (
              <div key={keyPoint.id} className="p-4 bg-section border border-border rounded-lg">
                <div className="flex items-start gap-3">
                  <div className="flex flex-col gap-1 mt-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => moveKeyPoint(keyPoint.id, 'up')}
                      disabled={index === 0}
                      className="h-6 w-6 p-0"
                    >
                      <ChevronUp className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => moveKeyPoint(keyPoint.id, 'down')}
                      disabled={index === keyPoints.length - 1}
                      className="h-6 w-6 p-0"
                    >
                      <ChevronDown className="w-3 h-3" />
                    </Button>
                  </div>
                  
                  <div className="flex-1">
                    {editingId === keyPoint.id ? (
                      <div className="space-y-2">
                        <Textarea
                          value={editText}
                          onChange={(e) => setEditText(e.target.value)}
                          className="min-h-[80px] resize-none"
                        />
                        <div className="flex gap-2">
                          <Button size="sm" onClick={saveEdit}>Save</Button>
                          <Button size="sm" variant="outline" onClick={cancelEdit}>Cancel</Button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <p 
                          className="text-sm leading-relaxed cursor-pointer hover:bg-background/50 p-2 rounded"
                          onClick={() => startEditing(keyPoint)}
                        >
                          {keyPoint.text}
                        </p>
                        {keyPoint.source && (
                          <Badge variant="outline" className="mt-2">
                            Source: {keyPoint.source}
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeKeyPoint(keyPoint.id)}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10 mt-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};