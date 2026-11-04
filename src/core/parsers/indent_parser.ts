import { FileNode, createFileNode } from '../models';

function isFile(name: string): boolean {
  const lastDot = name.lastIndexOf('.');
  if (lastDot > 0 && lastDot < name.length - 1) {
    return true;
  }
  return false;
}

export function parseIndentFormat(input: string): { tree: FileNode | null; error?: string; line?: number } {
  const lines = input.split('\n').filter(l => l.trim().length > 0);
  
  if (lines.length === 0) {
    return { tree: null, error: 'Empty input' };
  }

  // Detect indent unit
  let indentUnit = 4; // default
  const indents: number[] = [];
  
  for (const line of lines) {
    const match = line.match(/^(\s+)/);
    if (match) {
      indents.push(match[1].length);
    }
  }

  if (indents.length > 0) {
    // Find GCD of all indents
    const gcd = (a: number, b: number): number => b === 0 ? a : gcd(b, a % b);
    let g = indents[0];
    for (let i = 1; i < indents.length; i++) {
      g = gcd(g, indents[i]);
    }
    if (g > 0) indentUnit = g;
  }

  // Parse lines into structured data
  interface ParsedLine {
    depth: number;
    name: string;
    lineNum: number;
  }

  const parsed: ParsedLine[] = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const match = line.match(/^(\s*)(.*)/);
    if (!match) continue;
    
    const indent = match[1].length;
    const name = match[2].trim().replace(/\/\s*$/, '');
    
    if (!name) continue;

    const depth = Math.round(indent / indentUnit);
    parsed.push({ depth, name, lineNum: i + 1 });
  }

  if (parsed.length === 0) {
    return { tree: null, error: 'No valid lines found' };
  }

  // First line is root (depth 0)
  const rootName = parsed[0].name;
  const rootType = isFile(rootName) ? 'file' : 'directory';
  const root = createFileNode(rootName, rootType);

  if (parsed.length === 1) {
    return { tree: root };
  }

  // Build tree using stack
  const stack: { node: FileNode; depth: number }[] = [{ node: root, depth: 0 }];

  for (let i = 1; i < parsed.length; i++) {
    const { depth, name, lineNum } = parsed[i];
    const type = isFile(name) ? 'file' : 'directory';
    const newNode = createFileNode(name, type);

    // Find parent
    while (stack.length > 1 && stack[stack.length - 1].depth >= depth) {
      stack.pop();
    }

    const parent = stack[stack.length - 1].node;
    if (parent.type !== 'directory') {
      return { tree: null, error: `Cannot add child to file "${parent.name}"`, line: lineNum };
    }

    parent.children.push(newNode);
    stack.push({ node: newNode, depth });
  }

  return { tree: root };
}

export function detectIndentFormat(input: string): boolean {
  const lines = input.split('\n').filter(l => l.trim().length > 0);
  if (lines.length < 2) return false;

  // Check if lines use indentation (spaces or tabs) and no tree characters
  let indentedLines = 0;
  let treeCharLines = 0;
  let pathLines = 0;

  for (const line of lines) {
    if (/^[│├└─]/.test(line.trim())) {
      treeCharLines++;
    }
    if (/^\s+/.test(line)) {
      indentedLines++;
    }
    if (/\/$/.test(line.trim()) || line.trim().includes('/')) {
      pathLines++;
    }
  }

  // Indent format: has indented lines, no tree chars, not mostly paths
  return indentedLines > 0 && treeCharLines === 0 && pathLines < lines.length * 0.5;
}
