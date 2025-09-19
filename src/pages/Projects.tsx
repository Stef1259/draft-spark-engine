import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { projectStorage } from '@/lib/projectStorage';
import { Project } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Plus, FileText, ArrowRight } from 'lucide-react';

const Projects = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);
  const [title, setTitle] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      if (!session) navigate('/auth');
      if (session?.user) setProjects(projectStorage.getAll(session.user.id));
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      if (!session) navigate('/auth');
      if (session?.user) setProjects(projectStorage.getAll(session.user.id));
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const createProject = () => {
    if (!user) return;
    const p = projectStorage.create(user.id, { title: title.trim() || 'Untitled Project' });
    navigate(`/project/${p.id}`);
  };

  const openProject = (p: Project) => navigate(`/project/${p.id}`);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">Loading...</div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary rounded-lg">
              <FileText className="w-6 h-6 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-semibold text-foreground">Your Projects</h1>
          </div>
          <div className="flex gap-2">
            <Input placeholder="Project title" value={title} onChange={(e) => setTitle(e.target.value)} className="w-56" />
            <Button onClick={createProject} className="flex items-center gap-2"><Plus className="h-4 w-4" />Create</Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-6">
        {projects.length === 0 ? (
          <Card className="bg-editor border-editor-border">
            <CardHeader>
              <CardTitle>No projects yet</CardTitle>
            </CardHeader>
            <CardContent>
              <Button onClick={createProject} className="flex items-center gap-2"><Plus className="h-4 w-4" />Create your first project</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {projects.map(p => (
              <Card key={p.id} className="bg-editor border-editor-border hover:border-primary transition-colors">
                <CardHeader>
                  <CardTitle className="truncate">{p.title || 'Untitled Project'}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-xs text-muted-foreground mb-4">Updated {new Date(p.updatedAt || p.createdAt || '').toLocaleString()}</div>
                  <Button variant="outline" className="flex items-center gap-2" onClick={() => openProject(p)}>
                    Open <ArrowRight className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Projects;


