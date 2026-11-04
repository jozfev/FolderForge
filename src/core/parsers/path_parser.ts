import { FileNode, createFileNode } from '../models';

function isFile(name: string): boolean {
  const lastDot = name.lastIndexOf('.');
  if (lastDot > 0 && lastDot < name.length - 1) {
    const ext = name.substring(lastDot + 1);
    if (ext.length <= 10 && !ext.includes('/') && !ext.includes('\\')) {
      return true;
    }
  }
  return false;
}

export function parsePathFormat(input: string): { tree: FileNode | null; error?: string; line?: number } {
  const lines = input.split('\n').filter(l => l.trim().length > 0);
  
  if (lines.length === 0) {
    return { tree: null, error: 'Empty input' };
  }

  // Check for absolute paths (not allowed)
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (/^[A-Z]:\\/i.test(line) || (line.startsWith('/') && !line.startsWith('./'))) {
      return { tree: null, error: `Absolute paths are not allowed: "${line}"`, line: i + 1 };
    }
  }

  // Normalize paths: remove trailing slashes, clean up
  const paths = lines
    .map(l => l.trim().replace(/\/+$/, ''))
    .filter(p => p.length > 0);

  if (paths.length === 0) {
    return { tree: null, error: 'No valid paths found' };
  }

  // Sort by depth (number of /) to process parents first
  const sortedPaths = [...paths].sort((a, b) => {
    const depthA = a.split('/').length;
    const depthB = b.split('/').length;
    return depthA - depthB;
  });

  // Build a node map: path -> FileNode
  const nodeMap = new Map<string, FileNode>();

  for (let i = 0; i < sortedPaths.length; i++) {
    const path = sortedPaths[i];
    const parts = path.split('/');
    const name = parts[parts.length - 1];
    const type = isFile(name) ? 'file' : 'directory';

    const node = createFileNode(name, type);
    nodeMap.set(path, node);

    // Find parent path
    if (parts.length > 1) {
      const parentPath = parts.slice(0, -1).join('/');
      const parent = nodeMap.get(parentPath);
      
      if (parent) {
        if (parent.type !== 'directory') {
          return { tree: null, error: `Cannot add child to file "${parent.name}"`, line: i + 1 };
        }
        parent.children.push(node);
      }
    }
  }

  // Find root: the path with fewest parts
  const rootPath = sortedPaths[0];
  const root = nodeMap.get(rootPath);

  if (!root) {
    return { tree: null, error: 'Could not determine root element' };
  }

  return { tree: root };
}

export function detectPathFormat(input: string): boolean {
  const lines = input.split('\n').filter(l => l.trim().length > 0);
  if (lines.length < 2) return false;

  let pathLines = 0;
  let treeCharLines = 0;

  for (const line of lines) {
    const trimmed = line.trim();
    if (/[├└│]/.test(trimmed)) {
      treeCharLines++;
    }
    // Path format: lines contain / and represent full paths (no leading whitespace)
    if (trimmed.includes('/') && !trimmed.startsWith('├') && !trimmed.startsWith('└') && !/^\s/.test(line)) {
      pathLines++;
    }
  }

  // Path format: most lines contain /, no tree chars, no leading whitespace
  return pathLines > lines.length * 0.5 && treeCharLines === 0;
}
