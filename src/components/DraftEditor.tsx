import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { QuoteMatch, Source } from '@/types';
import { GeminiService } from '@/lib/geminiService';
import { FileText, Sparkles, CheckCircle, AlertCircle, Link, Bot } from 'lucide-react';

interface DraftEditorProps {
  draftText: string;
  onDraftChange: (draft: string) => void;
  onGenerateDraft: () => void;
  isGenerating: boolean;
  quoteMatches: QuoteMatch[];
  onCheckQuotes: () => void;
  isCheckingQuotes: boolean;
  sources?: Source[];
}

export const DraftEditor = ({ 
  draftText, 
  onDraftChange, 
  onGenerateDraft,
  isGenerating,
  quoteMatches,
  onCheckQuotes,
  isCheckingQuotes,
  sources = []
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
                {draftText.split(' ').length} words
              </span>
            </div>
            
            <div className="space-y-4">
              <Textarea
                value={draftText}
                onChange={(e) => onDraftChange(e.target.value)}
                className="min-h-[400px] resize-none bg-background border-border focus:border-primary font-serif leading-relaxed"
                placeholder="Your article draft will appear here..."
              />
              
              {/* Source Mapping for Paragraphs */}
              {sources.length > 0 && draftText && (
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
                    <Link className="w-4 h-4 text-accent" />
                    Source Mapping
                  </h4>
                  <div className="grid gap-2">
                    {draftText.split('\n\n').map((paragraph, index) => {
                      if (paragraph.trim().length === 0) return null;
                      
                      // Simple heuristic: assign sources based on paragraph content
                      const relevantSources = sources.filter(source => {
                        const keywords = paragraph.toLowerCase().split(' ');
                        return keywords.some(keyword => 
                          source.content.toLowerCase().includes(keyword) && keyword.length > 3
                        );
                      });
                      
                      return (
                        <HoverCard key={index}>
                          <HoverCardTrigger asChild>
                            <div className="p-3 bg-section border border-border rounded-lg cursor-pointer hover:bg-accent/5 transition-colors">
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium">Paragraph {index + 1}</span>
                                <Badge variant="outline" className="text-xs">
                                  {relevantSources.length} source{relevantSources.length !== 1 ? 's' : ''}
                                </Badge>
                              </div>
                              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                {paragraph.substring(0, 100)}...
                              </p>
                            </div>
                          </HoverCardTrigger>
                          <HoverCardContent className="w-80">
                            <div className="space-y-2">
                              <h4 className="text-sm font-medium">Supporting Sources:</h4>
                              {relevantSources.length > 0 ? (
                                <div className="space-y-2">
                                  {relevantSources.map((source) => (
                                    <div key={source.id} className="p-2 bg-background border rounded text-xs">
                                      <div className="font-medium">{source.name}</div>
                                      <div className="text-muted-foreground">
                                        {source.type.toUpperCase()} • {source.content.substring(0, 80)}...
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-xs text-muted-foreground">
                                  No specific sources mapped to this paragraph
                                </p>
                              )}
                            </div>
                          </HoverCardContent>
                        </HoverCard>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
            
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