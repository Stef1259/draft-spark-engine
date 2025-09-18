import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { QuoteMatch } from '@/types';
import { FileText, Sparkles, CheckCircle, AlertCircle } from 'lucide-react';

interface DraftEditorProps {
  draftText: string;
  onDraftChange: (draft: string) => void;
  onGenerateDraft: () => void;
  isGenerating: boolean;
  quoteMatches: QuoteMatch[];
  onCheckQuotes: () => void;
  isCheckingQuotes: boolean;
}

export const DraftEditor = ({ 
  draftText, 
  onDraftChange, 
  onGenerateDraft,
  isGenerating,
  quoteMatches,
  onCheckQuotes,
  isCheckingQuotes
}: DraftEditorProps) => {
  return (
    <Card className="w-full bg-editor border-editor-border shadow-editorial-sm">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Article Draft
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={onGenerateDraft}
              disabled={isGenerating}
              size="sm"
              className="bg-primary hover:bg-primary-hover"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              {isGenerating ? 'Generating...' : 'Generate Draft'}
            </Button>
            {draftText && (
              <Button 
                onClick={onCheckQuotes}
                disabled={isCheckingQuotes}
                variant="outline"
                size="sm"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                {isCheckingQuotes ? 'Checking...' : 'Check Quotes'}
              </Button>
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!draftText ? (
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No draft generated yet.</p>
            <p className="text-sm">Add key points and story direction, then click "Generate Draft".</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <Badge variant="secondary" className="bg-accent/20 text-accent-foreground">
                <Sparkles className="w-3 h-3 mr-1" />
                Simulated AI Output
              </Badge>
              <span className="text-sm text-muted-foreground">
                {draftText.split(' ').length} words
              </span>
            </div>
            
            <Textarea
              value={draftText}
              onChange={(e) => onDraftChange(e.target.value)}
              className="min-h-[400px] resize-none bg-background border-border focus:border-primary font-serif leading-relaxed"
              placeholder="Your article draft will appear here..."
            />
            
            {quoteMatches.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-accent" />
                  Quote Verification Results
                </h4>
                <div className="space-y-2">
                  {quoteMatches.map((match, index) => (
                    <div 
                      key={index} 
                      className={`p-3 rounded-lg border ${
                        match.found 
                          ? 'bg-accent/10 border-accent/30' 
                          : 'bg-destructive/10 border-destructive/30'
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        {match.found ? (
                          <CheckCircle className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
                        )}
                        <div className="flex-1 space-y-1">
                          <p className="text-sm font-medium">
                            "{match.quote}"
                          </p>
                          {match.found ? (
                            <div>
                              <p className="text-xs text-muted-foreground">
                                Found in {match.sourceName}:
                              </p>
                              <p className="text-xs bg-background p-2 rounded border mt-1">
                                ...{match.context}...
                              </p>
                            </div>
                          ) : (
                            <p className="text-xs text-destructive">
                              Quote not found in any sources
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};