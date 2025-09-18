import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Upload, FileText } from 'lucide-react';

interface TranscriptInputProps {
  transcript: string;
  onTranscriptChange: (transcript: string) => void;
}

export const TranscriptInput = ({ transcript, onTranscriptChange }: TranscriptInputProps) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleFileUpload = (file: File) => {
    if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        onTranscriptChange(content);
      };
      reader.readAsText(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  return (
    <Card className="w-full bg-editor border-editor-border shadow-editorial-sm">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg font-medium">
          <FileText className="w-5 h-5 text-primary" />
          Interview Transcript
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div
          className={`relative border-2 border-dashed rounded-lg p-6 transition-colors ${
            isDragging
              ? 'border-primary bg-primary/5'
              : 'border-border hover:border-primary/50'
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <div className="text-center">
            <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground mb-2">
              Drag & drop a text file or click to upload
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = '.txt,text/plain';
                input.onchange = (e) => {
                  const file = (e.target as HTMLInputElement).files?.[0];
                  if (file) handleFileUpload(file);
                };
                input.click();
              }}
            >
              Choose File
            </Button>
          </div>
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            Or paste transcript here:
          </label>
          <Textarea
            placeholder="Paste your interview transcript here..."
            value={transcript}
            onChange={(e) => onTranscriptChange(e.target.value)}
            className="min-h-[200px] resize-none bg-background border-border focus:border-primary"
          />
        </div>
      </CardContent>
    </Card>
  );
};