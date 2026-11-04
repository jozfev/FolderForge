export type NodeType = 'file' | 'directory';

export interface FileNode {
  name: string;
  type: NodeType;
  children: FileNode[];
  path?: string;
}

export type FormatType = 'tree' | 'indent' | 'path' | 'json' | 'unknown';

export interface ParseResult {
  success: boolean;
  format?: FormatType;
  tree?: FileNode;
  error?: string;
  line?: number;
  stats?: {
    directories: number;
    files: number;
  };
}

export interface ValidationError {
  message: string;
  line?: number;
  type: 'error' | 'warning';
}

export interface HistoryEntry {
  id: string;
  date: string;
  projectName: string;
  destination: string;
  filesCount: number;
  dirsCount: number;
  status: 'success' | 'partial' | 'failed';
}

export interface AppSettings {
  theme: 'dark' | 'light';
  animations: boolean;
  existingFiles: 'skip' | 'overwrite' | 'ask';
  language: 'en' | 'ru';
}

export interface Template {
  id: string;
  name: string;
  description: string;
  content: string;
  format: FormatType;
  isCustom: boolean;
}

export function createFileNode(name: string, type: NodeType, children: FileNode[] = []): FileNode {
  return { name, type, children };
}

export function countNodes(node: FileNode): { directories: number; files: number } {
  let directories = 0;
  let files = 0;

  function traverse(n: FileNode) {
    if (n.type === 'directory') directories++;
    else files++;
    n.children.forEach(traverse);
  }

  traverse(node);
  return { directories, files };
}
