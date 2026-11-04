import { ParseResult, FormatType, FileNode, countNodes } from './models';
import { parseTreeFormat, detectTreeFormat } from './parsers/tree_parser';
import { parseIndentFormat, detectIndentFormat } from './parsers/indent_parser';
import { parsePathFormat, detectPathFormat } from './parsers/path_parser';
import { parseJsonFormat, detectJsonFormat } from './parsers/json_parser';

function detectFormat(input: string): FormatType {
  const trimmed = input.trim();
  
  if (!trimmed) return 'unknown';

  // Check JSON first (most distinctive - starts with { or [)
  if (detectJsonFormat(trimmed)) {
    return 'json';
  }

  const lines = trimmed.split('\n').filter(l => l.trim().length > 0);
  if (lines.length === 0) return 'unknown';

  // Check tree format (has tree drawing characters: ├──, └──, │)
  if (detectTreeFormat(trimmed)) {
    return 'tree';
  }

  // Check path format (lines contain / as path separators, no leading whitespace)
  if (detectPathFormat(trimmed)) {
    return 'path';
  }

  // Check indent format (has indentation with spaces/tabs, no tree chars)
  if (detectIndentFormat(trimmed)) {
    return 'indent';
  }

  // Fallback heuristics
  const slashLines = lines.filter(l => l.includes('/') && !/^\s/.test(l)).length;
  const indentedLines = lines.filter(l => /^\s+/.test(l)).length;
  
  if (slashLines > lines.length * 0.5) {
    return 'path';
  }
  
  if (indentedLines > 0) {
    return 'indent';
  }

  // Single line with no special chars - treat as indent (single root)
  if (lines.length === 1) {
    return 'indent';
  }

  return 'unknown';
}

export function parse(input: string): ParseResult {
  const trimmed = input.trim();
  
  if (!trimmed) {
    return { success: false, error: 'Input is empty' };
  }

  const format = detectFormat(trimmed);

  if (format === 'unknown') {
    return { 
      success: false, 
      error: 'Cannot determine format. Please use one of the supported formats: Tree, Indentation, Path, or JSON.' 
    };
  }

  let result: { tree: FileNode | null; error?: string; line?: number };

  switch (format) {
    case 'tree':
      result = parseTreeFormat(trimmed);
      break;
    case 'indent':
      result = parseIndentFormat(trimmed);
      break;
    case 'path':
      result = parsePathFormat(trimmed);
      break;
    case 'json':
      result = parseJsonFormat(trimmed);
      break;
    default:
      return { success: false, error: 'Unsupported format' };
  }

  if (!result.tree) {
    return { 
      success: false, 
      format, 
      error: result.error || 'Failed to parse structure',
      line: result.line
    };
  }

  const stats = countNodes(result.tree);

  return {
    success: true,
    format,
    tree: result.tree,
    stats
  };
}

export function getFormatName(format: FormatType | undefined): string {
  switch (format) {
    case 'tree': return 'Tree format';
    case 'indent': return 'Indentation format';
    case 'path': return 'Path format';
    case 'json': return 'JSON format';
    default: return 'Unknown';
  }
}
