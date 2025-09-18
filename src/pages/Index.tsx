import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Session } from '@supabase/supabase-js';
import { TranscriptInput } from '@/components/TranscriptInput';
import { SourceManager } from '@/components/SourceManager';
import { KeyPointsEditor } from '@/components/KeyPointsEditor';
import { StoryDirectionControls } from '@/components/StoryDirectionControls';
import { DraftEditor } from '@/components/DraftEditor';
import { ExportControls } from '@/components/ExportControls';
import { Project, Source, KeyPoint, StoryDirection, QuoteMatch } from '@/types';
import { checkQuotesInDraft } from '@/utils/quoteChecker';
import { generateMockKeyPoints, generateMockDraft } from '@/data/mockData';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { FileText, Sparkles, LogOut } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const Index = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
        
        if (!session) {
          navigate('/auth');
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      
      if (!session) {
        navigate('/auth');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect to auth
  }
  const [project, setProject] = useState<Project>({
    id: '1',
    transcript: '',
    sources: [],
    keyPoints: [],
    direction: {
      tone: 'neutral',
      length: 'medium',
      angle: ''
    },
    draftText: '',
    quoteMatches: []
  });

  const [isExtracting, setIsExtracting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCheckingQuotes, setIsCheckingQuotes] = useState(false);

  const updateTranscript = (transcript: string) => {
    setProject(prev => ({ ...prev, transcript }));
  };

  const updateSources = (sources: Source[]) => {
    setProject(prev => ({ ...prev, sources }));
  };

  const updateKeyPoints = (keyPoints: KeyPoint[]) => {
    setProject(prev => ({ ...prev, keyPoints }));
  };

  const updateDirection = (direction: StoryDirection) => {
    setProject(prev => ({ ...prev, direction }));
  };

  const updateDraft = (draftText: string) => {
    setProject(prev => ({ ...prev, draftText }));
  };

  const extractKeyPoints = () => {
    if (!project.transcript.trim()) {
      alert('Please add a transcript first');
      return;
    }

    setIsExtracting(true);
    setTimeout(() => {
      const mockPoints = generateMockKeyPoints();
      updateKeyPoints(mockPoints);
      setIsExtracting(false);
    }, 2000);
  };

  const generateDraft = () => {
    if (project.keyPoints.length === 0) {
      alert('Please extract key points first');
      return;
    }

    setIsGenerating(true);
    setTimeout(() => {
      const draft = generateMockDraft(
        project.direction.tone,
        project.direction.length,
        project.direction.angle
      );
      updateDraft(draft);
      setIsGenerating(false);
    }, 3000);
  };

  const checkQuotes = () => {
    if (!project.draftText.trim()) {
      alert('Please generate a draft first');
      return;
    }

    setIsCheckingQuotes(true);
    setTimeout(() => {
      const matches = checkQuotesInDraft(
        project.draftText,
        project.transcript,
        project.sources
      );
      setProject(prev => ({ ...prev, quoteMatches: matches }));
      setIsCheckingQuotes(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-primary rounded-lg">
                <FileText className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-foreground">Editorial Assistant</h1>
                <p className="text-sm text-muted-foreground">Welcome, {user.email}</p>
              </div>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleSignOut}
              className="flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Workflow Steps */}
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Step 1: Transcript Input */}
          <TranscriptInput 
            transcript={project.transcript}
            onTranscriptChange={updateTranscript}
          />

          {/* Step 2: Source Management */}
          <SourceManager 
            sources={project.sources}
            onSourcesChange={updateSources}
          />
        </div>

        <Separator className="my-8" />

        {/* Step 3: Key Points Extraction */}
        <KeyPointsEditor 
          keyPoints={project.keyPoints}
          onKeyPointsChange={updateKeyPoints}
          onExtractKeyPoints={extractKeyPoints}
          isExtracting={isExtracting}
        />

        <Separator className="my-8" />

        {/* Step 4: Story Direction */}
        <StoryDirectionControls 
          direction={project.direction}
          onDirectionChange={updateDirection}
        />

        <Separator className="my-8" />

        {/* Step 5: Draft Generation & Editing */}
        <DraftEditor 
          draftText={project.draftText}
          onDraftChange={updateDraft}
          onGenerateDraft={generateDraft}
          isGenerating={isGenerating}
          quoteMatches={project.quoteMatches}
          onCheckQuotes={checkQuotes}
          isCheckingQuotes={isCheckingQuotes}
        />

        <Separator className="my-8" />

        {/* Step 6: Export */}
        <ExportControls project={project} />
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-section/50 py-6 mt-16">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Sparkles className="w-4 h-4" />
            <span>AI-powered editorial workflow • Simulated outputs for demonstration</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
