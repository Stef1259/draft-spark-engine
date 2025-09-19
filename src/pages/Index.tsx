import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { User, Session } from "@supabase/supabase-js";
import { TranscriptInput } from "@/components/TranscriptInput";
import { SourceManager } from "@/components/SourceManager";
import { KeyPointsEditor } from "@/components/KeyPointsEditor";
import { StoryDirectionControls } from "@/components/StoryDirectionControls";
import { DraftEditor } from "@/components/DraftEditor";
import { ExportControls } from "@/components/ExportControls";
import { ProjectManager } from "@/components/ProjectManager";
import { Project, Source, KeyPoint, StoryDirection, QuoteMatch } from "@/types";
import { checkQuotesInDraft } from "@/utils/quoteChecker";
import {
  generateMockKeyPoints,
  generateMockDraft,
  mockTranscript,
  mockSources,
} from "@/data/mockData";
import { GeminiService } from "@/lib/geminiService";
import { projectStorage } from "@/lib/projectStorage";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { FileText, Sparkles, LogOut, AlertCircle, ArrowLeft, Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const { id: routeProjectId } = useParams();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Set up auth state listener FIRST
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);

      if (!session) {
        navigate("/auth");
      }
    });

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);

      if (!session) {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  const [project, setProject] = useState<Project>(() => {
    const all = projectStorage.getAll(user?.id || "anon");
    const local = (routeProjectId && all.find(p => p.id === routeProjectId)) || all[0];
    return (
      local || {
        id: "1",
        title: "Untitled Project",
        transcript: "",
        sources: [],
        keyPoints: [],
        direction: {
          tone: "neutral",
          length: "medium",
          angle: "",
        },
        draftText: "",
        quoteMatches: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        versions: [],
      }
    );
  });

  const [isExtracting, setIsExtracting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCheckingQuotes, setIsCheckingQuotes] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!user) {
    // Show a fallback UI while redirecting
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-muted-foreground">
          Redirecting to sign in...
        </div>
      </div>
    );
  }

  const loadDemoData = () => {
    setProject((prev) => {
      const next = { ...prev, transcript: mockTranscript, sources: mockSources, updatedAt: new Date().toISOString() };
      projectStorage.update(user?.id || "anon", next);
      return next;
    });
  };

  const updateTranscript = (transcript: string) => {
    setProject((prev) => {
      const next = { ...prev, transcript, updatedAt: new Date().toISOString() };
      projectStorage.update(user?.id || "anon", next);
      return next;
    });
  };

  const updateSources = (sources: Source[]) => {
    setProject((prev) => {
      const next = { ...prev, sources, updatedAt: new Date().toISOString() };
      projectStorage.update(user?.id || "anon", next);
      return next;
    });
  };

  const updateKeyPoints = (keyPoints: KeyPoint[]) => {
    setProject((prev) => {
      const next = { ...prev, keyPoints, updatedAt: new Date().toISOString() };
      projectStorage.update(user?.id || "anon", next);
      return next;
    });
  };

  const updateDirection = (direction: StoryDirection) => {
    setProject((prev) => {
      const next = { ...prev, direction, updatedAt: new Date().toISOString() };
      projectStorage.update(user?.id || "anon", next);
      return next;
    });
  };

  const updateDraft = (draftText: string) => {
    setProject((prev) => {
      const next = { ...prev, draftText, updatedAt: new Date().toISOString() };
      projectStorage.update(user?.id || "anon", next);
      return next;
    });
  };

  const extractKeyPoints = async () => {
    if (!project.transcript.trim()) {
      alert("Please add a transcript first");
      return;
    }

    setIsExtracting(true);

    try {
      // Try Gemini API first
      if (GeminiService.isConfigured()) {
        const result = await GeminiService.extractKeyPoints(
          project.transcript,
          project.sources
        );

        if (result.success && result.data) {
          updateKeyPoints(result.data);
          return;
        } else {
          console.warn(
            "Gemini API failed, falling back to mock data:",
            result.error
          );
        }
      }

      // Fallback to mock data
      const mockPoints = generateMockKeyPoints();
      updateKeyPoints(mockPoints);
    } catch (error) {
      console.error("Error extracting key points:", error);
      alert("Failed to extract key points. Using mock data instead.");
      // Fallback to mock data
      const mockPoints = generateMockKeyPoints();
      updateKeyPoints(mockPoints);
    } finally {
      setIsExtracting(false);
    }
  };

  const generateDraft = async () => {
    if (project.keyPoints.length === 0) {
      alert("Please extract key points first");
      return;
    }

    setIsGenerating(true);

    try {
      // Try Gemini API first
      if (GeminiService.isConfigured()) {
        const result = await GeminiService.generateDraft(
          project.keyPoints,
          project.direction,
          project.transcript,
          project.sources
        );

        if (result.success && result.data) {
          updateDraft(result.data);
          return;
        } else {
          console.warn(
            "Gemini API failed, falling back to mock data:",
            result.error
          );
        }
      }

      // Fallback to mock data
      const draft = generateMockDraft(
        project.direction.tone,
        project.direction.length,
        project.direction.angle
      );
      updateDraft(draft);
    } catch (error) {
      console.error("Error generating draft:", error);
      alert("Failed to generate draft. Using mock data instead.");
      // Fallback to mock data
      const draft = generateMockDraft(
        project.direction.tone,
        project.direction.length,
        project.direction.angle
      );
      updateDraft(draft);
    } finally {
      setIsGenerating(false);
    }
  };

  const checkQuotes = () => {
    if (!project.draftText.trim()) {
      alert("Please generate a draft first");
      return;
    }

    setIsCheckingQuotes(true);
    setTimeout(() => {
      const matches = checkQuotesInDraft(
        project.draftText,
        project.transcript,
        project.sources
      );
      setProject((prev) => ({ ...prev, quoteMatches: matches }));
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
                <h1 className="text-xl font-semibold text-foreground">
                  Editorial Assistant
                </h1>
                <p className="text-sm text-muted-foreground">
                  Welcome, {user.email}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/projects')}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={loadDemoData}
                className="flex items-center gap-2"
              >
                <Sparkles className="h-4 w-4" />
                Load Demo Data
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => projectStorage.update(user?.id || 'anon', project)}
                className="flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                Save
              </Button>
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
        </div>
      </header>

      {/* API Status Indicator */}
      {!GeminiService.isConfigured() && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mx-4 my-4">
          <div className="flex items-center gap-2 text-yellow-800">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm font-medium">
              Gemini API not configured - using mock data
            </span>
          </div>
          <p className="text-xs text-yellow-700 mt-1">
            Set VITE_GEMINI_API_KEY environment variable to enable real AI
            generation
          </p>
        </div>
      )}

      <main className="container mx-auto px-4 py-8 space-y-8">
        {/* Workflow Steps */}
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <ProjectManager
              userId={user.id}
              current={project}
              onSelect={(p) => setProject(p)}
              onSaveVersion={(label) => projectStorage.addVersion(user.id, project.id, label)}
            />
          </div>
          <div className="lg:col-span-2 space-y-8">
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
          sources={project.sources}
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
            <span>
              AI-powered editorial workflow • Simulated outputs for
              demonstration
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
