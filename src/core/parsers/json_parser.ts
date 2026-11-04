import { FileNode, createFileNode } from '../models';

function buildTreeFromObject(obj: Record<string, any>): FileNode[] {
  const children: FileNode[] = [];

  for (const [name, value] of Object.entries(obj)) {
    if (value === null || value === undefined) {
      // It's a file
      children.push(createFileNode(name, 'file'));
    } else if (typeof value === 'object' && !Array.isArray(value)) {
      // It's a directory
      const dirNode = createFileNode(name, 'directory');
      dirNode.children = buildTreeFromObject(value);
      children.push(dirNode);
    } else {
      // Treat as file if value is a string or other primitive
      children.push(createFileNode(name, 'file'));
    }
  }

  return children;
}

export function parseJsonFormat(input: string): { tree: FileNode | null; error?: string; line?: number } {
  try {
    const parsed = JSON.parse(input);
    
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
      return { tree: null, error: 'JSON root must be an object' };
    }

    const keys = Object.keys(parsed);
    if (keys.length === 0) {
      return { tree: null, error: 'JSON object is empty' };
    }

    if (keys.length === 1) {
      const rootName = keys[0];
      const rootValue = parsed[rootName];
      
      if (rootValue === null || typeof rootValue !== 'object') {
        return { tree: createFileNode(rootName, 'file') };
      }

      const root = createFileNode(rootName, 'directory');
      root.children = buildTreeFromObject(rootValue);
      return { tree: root };
    }

    // Multiple root keys - create a virtual root
    const root = createFileNode('root', 'directory');
    root.children = buildTreeFromObject(parsed);
    return { tree: root };
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Invalid JSON';
    // Try to extract line number from error
    const lineMatch = msg.match(/position (\d+)/);
    return { tree: null, error: `JSON parse error: ${msg}` };
  }
}

export function detectJsonFormat(input: string): boolean {
  const trimmed = input.trim();
  return (trimmed.startsWith('{') && trimmed.endsWith('}')) || 
         (trimmed.startsWith('[') && trimmed.endsWith(']'));
}
