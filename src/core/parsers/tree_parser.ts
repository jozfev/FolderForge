
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

function cleanTreeLine(line: string): { depth: number; name: string } | null {
  const trimmed = line.trim();
  if (!trimmed) return null;

  let depth = 0;
  let nameStart = 0;
  let i = 0;

  while (i < line.length) {
    const ch = line[i];

    if (ch === '│') {
      depth++;
      i++;
      while (i < line.length && line[i] === ' ') i++;
      continue;
    }

    if (ch === '├' || ch === '└') {
      depth++;
      i++;

      while (i < line.length && (line[i] === '─' || line[i] === ' ')) {
        i++;
      }

      nameStart = i;
      break;
    }

    if (ch === ' ' || ch === '\t') {
      i++;
      continue;
    }

    nameStart = i;
    break;
  }

  let name = line.substring(nameStart).trim();

  if (name.endsWith('/')) {
    name = name.slice(0, -1);
  }

  if (!name) return null;

  return { depth, name };
}

export function parseTreeFormat(input: string): {
  tree: FileNode | null;
  error?: string;
  line?: number;
} {
  const lines = input.split('\n');
  const parsedLines: { depth: number; name: string; lineNum: number }[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;

    const result = cleanTreeLine(line);

    if (result) {
      parsedLines.push({ ...result, lineNum: i + 1 });
    }
  }

  if (parsedLines.length === 0) {
    return { tree: null, error: 'No valid elements found' };
  }

  const rootName = parsedLines[0].name;
  const rootType = isFile(rootName) ? 'file' : 'directory';
  const root = createFileNode(rootName, rootType);

  if (parsedLines.length === 1) {
    return { tree: root };
  }

  const stack: { node: FileNode; depth: number }[] = [
    { node: root, depth: parsedLines[0].depth }
  ];

  for (let i = 1; i < parsedLines.length; i++) {
    const { depth, name, lineNum } = parsedLines[i];
    const type = isFile(name) ? 'file' : 'directory';
    const newNode = createFileNode(name, type);

    while (stack.length > 1 && stack[stack.length - 1].depth >= depth) {
      stack.pop();
    }

    const parent = stack[stack.length - 1].node;

    if (parent.type !== 'directory') {
      return {
        tree: null,
        error: `Cannot add "${name}" as child of file "${parent.name}"`,
        line: lineNum
      };
    }

    parent.children.push(newNode);
    stack.push({ node: newNode, depth });
  }

  return { tree: root };
}

export function detectTreeFormat(input: string): boolean {
  const lines = input.split('\n').filter(l => l.trim().length > 0);
  if (lines.length < 2) return false;

  let treeLineCount = 0;

  for (const line of lines) {
    if (/[├└│]/.test(line)) {
      treeLineCount++;
    }
  }

  return treeLineCount / (lines.length - 1) > 0.3;
}
