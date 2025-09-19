import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Project } from '@/types';
import { Download, FileText, Code } from 'lucide-react';

interface ExportControlsProps {
  project: Project;
}

export const ExportControls = ({ project }: ExportControlsProps) => {
  const exportMarkdown = () => {
    const markdown = project.draftText;
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'article-draft.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const exportJSON = () => {
    const paragraphs = project.draftText.split('\n\n').filter(p => p.trim().length > 0);
    
    const exportData = {
      metadata: {
        exportDate: new Date().toISOString(),
        wordCount: project.draftText.split(' ').length,
        keyPointsCount: project.keyPoints.length,
        sourcesCount: project.sources.length,
        paragraphsCount: paragraphs.length,
        version: '1.0.0'
      },
      project: {
        direction: project.direction,
        keyPoints: project.keyPoints,
        sources: project.sources.map(s => ({
          id: s.id,
          type: s.type,
          name: s.name,
          url: s.url,
        })),
      },
      provenance: {
        paragraphs: paragraphs.map((paragraph, index) => ({
          paragraphNumber: index + 1,
          content: paragraph.substring(0, 100) + '...',
          wordCount: paragraph.split(' ').length,
          sources: project.sources.filter(source => {
            const keywords = paragraph.toLowerCase().split(' ');
            return keywords.some(keyword => 
              source.content.toLowerCase().includes(keyword) && keyword.length > 3
            );
          }).map(s => ({ id: s.id, name: s.name, type: s.type }))
        })),
        quoteMapping: project.quoteMatches.map((match, index) => ({
          quoteId: index + 1,
          quote: match.quote,
          sourceId: match.sourceId,
          sourceName: match.sourceName,
          verified: match.found,
          context: match.context,
          confidence: match.found ? 'high' : 'none'
        })),
      },
      workflow: {
        transcriptLength: project.transcript.length,
        keyPointsExtracted: project.keyPoints.length > 0,
        draftGenerated: project.draftText.length > 0,
        quotesChecked: project.quoteMatches.length > 0,
        sourcesAttached: project.sources.length > 0
      }
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'article-data.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const canExport = project.draftText.trim().length > 0;

  return (
    <Card className="w-full bg-editor border-editor-border shadow-editorial-sm">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg font-medium">
          <Download className="w-5 h-5 text-primary" />
          Export Article
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!canExport ? (
          <div className="text-center py-6 text-muted-foreground">
            <Download className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">Generate a draft to enable export options</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <Button 
                onClick={exportMarkdown}
                className="flex items-center gap-2 h-auto py-3 px-4"
                variant="outline"
              >
                <FileText className="w-5 h-5" />
                <div className="text-left">
                  <div className="font-medium">Export Markdown</div>
                  <div className="text-xs text-muted-foreground">
                    Download as .md file
                  </div>
                </div>
              </Button>
              
              <Button 
                onClick={exportJSON}
                className="flex items-center gap-2 h-auto py-3 px-4"
                variant="outline"
              >
                <Code className="w-5 h-5" />
                <div className="text-left">
                  <div className="font-medium">Export Data</div>
                  <div className="text-xs text-muted-foreground">
                    Download metadata as .json
                  </div>
                </div>
              </Button>
            </div>
            
            <div className="p-3 bg-section border border-border rounded-lg">
              <h4 className="text-sm font-medium mb-2">Export Summary</h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Word count:</span>
                  <Badge variant="outline">{project.draftText.split(' ').length}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Key points:</span>
                  <Badge variant="outline">{project.keyPoints.length}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Sources:</span>
                  <Badge variant="outline">{project.sources.length}</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Quotes checked:</span>
                  <Badge variant="outline">{project.quoteMatches.length}</Badge>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};