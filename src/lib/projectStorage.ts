import { Project } from '@/types';

const STORAGE_KEY = 'editorial_projects_v1';

export const projectStorage = {
  getAll(userId: string): Project[] {
    const raw = localStorage.getItem(`${STORAGE_KEY}:${userId}`);
    if (!raw) return [];
    try {
      return JSON.parse(raw) as Project[];
    } catch {
      return [];
    }
  },

  saveAll(userId: string, projects: Project[]) {
    localStorage.setItem(`${STORAGE_KEY}:${userId}`, JSON.stringify(projects));
  },

  create(userId: string, partial?: Partial<Project>): Project {
    const projects = this.getAll(userId);
    const now = new Date().toISOString();
    const project: Project = {
      id: crypto.randomUUID(),
      title: partial?.title || 'Untitled Project',
      transcript: partial?.transcript || '',
      sources: partial?.sources || [],
      keyPoints: partial?.keyPoints || [],
      direction: partial?.direction || { tone: 'neutral', length: 'medium', angle: '' },
      draftText: partial?.draftText || '',
      quoteMatches: partial?.quoteMatches || [],
      createdAt: now,
      updatedAt: now,
      versions: [],
    };
    projects.unshift(project);
    this.saveAll(userId, projects);
    return project;
  },

  update(userId: string, updated: Project) {
    const projects = this.getAll(userId).map(p => p.id === updated.id ? { ...updated, updatedAt: new Date().toISOString() } : p);
    this.saveAll(userId, projects);
  },

  remove(userId: string, projectId: string) {
    const projects = this.getAll(userId).filter(p => p.id !== projectId);
    this.saveAll(userId, projects);
  },

  get(userId: string, projectId: string): Project | undefined {
    return this.getAll(userId).find(p => p.id === projectId);
  },

  addVersion(userId: string, projectId: string, label: string) {
    const projects = this.getAll(userId);
    const idx = projects.findIndex(p => p.id === projectId);
    if (idx === -1) return;
    const p = projects[idx];
    const version = {
      id: crypto.randomUUID(),
      label,
      createdAt: new Date().toISOString(),
      draftText: p.draftText,
      keyPoints: p.keyPoints,
      direction: p.direction,
    };
    p.versions = [version, ...(p.versions || [])].slice(0, 10);
    p.updatedAt = new Date().toISOString();
    projects[idx] = p;
    this.saveAll(userId, projects);
  }
};


