import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Source } from '@/types';
import { Link, Upload, Trash2, ExternalLink } from 'lucide-react';

interface SourceManagerProps {
  sources: Source[];
  onSourcesChange: (sources: Source[]) => void;
}

export const SourceManager = ({ sources, onSourcesChange }: SourceManagerProps) => {
  const [urlInput, setUrlInput] = useState('');
  const [isLoadingUrl, setIsLoadingUrl] = useState(false);

  const addUrlSource = async () => {
    if (!urlInput.trim()) return;
    
    setIsLoadingUrl(true);
    // Mock URL source addition
    const newSource: Source = {
      id: Date.now().toString(),
      type: 'url',
      name: new URL(urlInput).hostname,
      content: `Mock content from ${urlInput}. This would typically be scraped or fetched content.`,
      url: urlInput,
    };
    
    setTimeout(() => {
      onSourcesChange([...sources, newSource]);
      setUrlInput('');
      setIsLoadingUrl(false);
    }, 1000);
  };

  const addPdfSource = (file: File) => {
    const newSource: Source = {
      id: Date.now().toString(),
      type: 'pdf',
      name: file.name,
      content: `Mock extracted content from ${file.name}. This would typically be PDF text extraction.`,
    };
    onSourcesChange([...sources, newSource]);
  };

  const removeSource = (id: string) => {
    onSourcesChange(sources.filter(s => s.id !== id));
  };

  return (
    <Card className="w-full bg-editor border-editor-border shadow-editorial-sm">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg font-medium">
          <Link className="w-5 h-5 text-primary" />
          Supporting Sources
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs defaultValue="url" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="url">Add URL</TabsTrigger>
            <TabsTrigger value="pdf">Upload PDF</TabsTrigger>
          </TabsList>
          
          <TabsContent value="url" className="space-y-2">
            <div className="flex gap-2">
              <Input
                placeholder="https://example.com/article"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                className="flex-1"
              />
              <Button 
                onClick={addUrlSource}
                disabled={!urlInput.trim() || isLoadingUrl}
                size="sm"
              >
                {isLoadingUrl ? 'Loading...' : 'Add URL'}
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="pdf" className="space-y-2">
            <div className="border-2 border-dashed border-border rounded-lg p-4 text-center">
              <Upload className="w-6 h-6 mx-auto text-muted-foreground mb-2" />
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const input = document.createElement('input');
                  input.type = 'file';
                  input.accept = '.pdf';
                  input.onchange = (e) => {
                    const file = (e.target as HTMLInputElement).files?.[0];
                    if (file) addPdfSource(file);
                  };
                  input.click();
                }}
              >
                Choose PDF File
              </Button>
            </div>
          </TabsContent>
        </Tabs>

        {sources.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-foreground">Added Sources:</h4>
            <div className="space-y-2">
              {sources.map((source) => (
                <div key={source.id} className="flex items-center justify-between p-3 bg-section border border-border rounded-lg">
                  <div className="flex items-center gap-2">
                    <Badge variant={source.type === 'pdf' ? 'secondary' : 'outline'}>
                      {source.type.toUpperCase()}
                    </Badge>
                    <span className="text-sm font-medium truncate max-w-[200px]">
                      {source.name}
                    </span>
                    {source.url && (
                      <a
                        href={source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:text-primary-hover"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeSource(source.id)}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};