import { useMemo, useState } from 'react';
import { Project } from '@/types';
import { projectStorage } from '@/lib/projectStorage';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Save, History } from 'lucide-react';

interface ProjectManagerProps {
  userId: string;
  current?: Project;
  onSelect: (project: Project) => void;
  onSaveVersion: (label: string) => void;
}

export const ProjectManager = ({ userId, current, onSelect, onSaveVersion }: ProjectManagerProps) => {
  const [projects, setProjects] = useState<Project[]>(() => projectStorage.getAll(userId));
  const [newTitle, setNewTitle] = useState('');

  const refresh = () => setProjects(projectStorage.getAll(userId));

  const create = () => {
    const p = projectStorage.create(userId, { title: newTitle.trim() || 'Untitled Project' });
    setNewTitle('');
    refresh();
    onSelect(p);
  };

  const remove = (id: string) => {
    if (current && current.id === id) return;
    projectStorage.remove(userId, id);
    refresh();
  };

  const sorted = useMemo(() => {
    return [...projects].sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || ''));
  }, [projects]);

  return (
    <Card className="w-full bg-editor border-editor-border shadow-editorial-sm">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center justify-between">
          <span>Projects</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex gap-2">
          <Input placeholder="New project title" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} />
          <Button onClick={create} size="sm" className="flex items-center gap-2"><Plus className="h-4 w-4" />New</Button>
        </div>
        <Separator />
        <div className="space-y-2">
          {sorted.map(p => (
            <div key={p.id} className={`flex items-center justify-between p-3 rounded border ${current?.id === p.id ? 'border-primary' : 'border-border'}`}>
              <div>
                <div className="text-sm font-medium">{p.title || 'Untitled Project'}</div>
                <div className="text-xs text-muted-foreground">Updated {new Date(p.updatedAt || p.createdAt || '').toLocaleString()}</div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => onSelect(p)}>Open</Button>
                <Button variant="ghost" size="sm" className="text-destructive" onClick={() => remove(p.id)} disabled={current?.id === p.id}><Trash2 className="h-4 w-4" /></Button>
              </div>
            </div>
          ))}
          {sorted.length === 0 && (
            <div className="text-sm text-muted-foreground">No projects yet. Create one above.</div>
          )}
        </div>

        {current && (
          <div className="mt-4 space-y-2">
            <Separator />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm">
                <History className="h-4 w-4" />
                Versions
                <Badge variant="outline">{current.versions?.length || 0}</Badge>
              </div>
              <Button size="sm" variant="outline" onClick={() => onSaveVersion(`Checkpoint ${new Date().toLocaleString()}`)} className="flex items-center gap-2">
                <Save className="h-4 w-4" /> Save Checkpoint
              </Button>
            </div>
            <div className="space-y-2">
              {(current.versions || []).map(v => (
                <div key={v.id} className="p-2 border rounded">
                  <div className="text-sm font-medium">{v.label}</div>
                  <div className="text-xs text-muted-foreground">{new Date(v.createdAt).toLocaleString()}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};


