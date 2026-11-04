import { FileNode, ValidationError } from './models';

// Windows reserved names
const WINDOWS_RESERVED = new Set([
  'CON', 'PRN', 'AUX', 'NUL',
  'COM1', 'COM2', 'COM3', 'COM4', 'COM5', 'COM6', 'COM7', 'COM8', 'COM9',
  'LPT1', 'LPT2', 'LPT3', 'LPT4', 'LPT5', 'LPT6', 'LPT7', 'LPT8', 'LPT9'
]);

// Invalid characters for Windows file names
const INVALID_CHARS = /[<>:"|?*\x00-\x1f]/;

// Path traversal patterns
const TRAVERSAL_PATTERNS = ['..', '../', '..\\'];

export function validate(tree: FileNode): ValidationError[] {
  const errors: ValidationError[] = [];
  const seenPaths = new Set<string>();

  function validateNode(node: FileNode, path: string, depth: number) {
    const fullPath = path ? `${path}/${node.name}` : node.name;

    // Check for empty names
    if (!node.name || node.name.trim() === '') {
      errors.push({ message: 'Empty name found', type: 'error' });
      return;
    }

    // Check for path traversal
    for (const pattern of TRAVERSAL_PATTERNS) {
      if (node.name.includes(pattern)) {
        errors.push({ 
          message: `Path traversal detected in "${node.name}"`, 
          type: 'error' 
        });
        return;
      }
    }

    // Check for invalid characters
    if (INVALID_CHARS.test(node.name)) {
      errors.push({ 
        message: `Invalid characters in name "${node.name}"`, 
        type: 'error' 
      });
    }

    // Check for Windows reserved names
    const nameWithoutExt = node.name.split('.')[0].toUpperCase();
    if (WINDOWS_RESERVED.has(nameWithoutExt)) {
      errors.push({ 
        message: `Windows reserved name "${node.name}"`, 
        type: 'error' 
      });
    }

    // Check for names starting or ending with space/dot
    if (node.name.startsWith(' ') || node.name.endsWith(' ') || node.name.endsWith('.')) {
      errors.push({ 
        message: `Name "${node.name}" starts/ends with space or dot`, 
        type: 'warning' 
      });
    }

    // Check for duplicates
    if (seenPaths.has(fullPath.toLowerCase())) {
      errors.push({ 
        message: `Duplicate path: "${fullPath}"`, 
        type: 'error' 
      });
    }
    seenPaths.add(fullPath.toLowerCase());

    // Check depth limit
    if (depth > 50) {
      errors.push({ 
        message: `Maximum nesting depth exceeded at "${fullPath}"`, 
        type: 'error' 
      });
      return;
    }

    // Check name length
    if (node.name.length > 255) {
      errors.push({ 
        message: `Name too long: "${node.name.substring(0, 50)}..."`, 
        type: 'error' 
      });
    }

    // Recurse into children
    if (node.type === 'directory') {
      for (const child of node.children) {
        validateNode(child, fullPath, depth + 1);
      }
    } else if (node.children.length > 0) {
      errors.push({ 
        message: `File "${node.name}" has children (should be directory)`, 
        type: 'error' 
      });
    }
  }

  validateNode(tree, '', 0);
  return errors;
}

export function checkConflicts(tree: FileNode, existingPaths: Set<string>): { 
  conflicts: string[]; 
  newItems: string[] 
} {
  const conflicts: string[] = [];
  const newItems: string[] = [];

  function traverse(node: FileNode, path: string) {
    const fullPath = path ? `${path}/${node.name}` : node.name;
    
    if (existingPaths.has(fullPath.toLowerCase())) {
      conflicts.push(fullPath);
    } else {
      newItems.push(fullPath);
    }

    if (node.type === 'directory') {
      node.children.forEach(child => traverse(child, fullPath));
    }
  }

  traverse(tree, '');
  return { conflicts, newItems };
}
