import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { FileNode } from './models';

export interface BuildProgress {
  current: number;
  total: number;
  currentItem: string;
}

export interface BuildResult {
  success: boolean;
  filesCreated: number;
  dirsCreated: number;
  skipped: number;
  error?: string;
}

function countAllNodes(node: FileNode): number {
  let count = 1;
  for (const child of node.children) {
    count += countAllNodes(child);
  }
  return count;
}

export async function buildZip(
  tree: FileNode,
  onProgress?: (progress: BuildProgress) => void,
  signal?: { cancelled: boolean }
): Promise<BuildResult> {
  const zip = new JSZip();
  const total = countAllNodes(tree);
  let current = 0;
  let filesCreated = 0;
  let dirsCreated = 0;

  function addNode(node: FileNode, path: string) {
    if (signal?.cancelled) return;

    const fullPath = path ? `${path}/${node.name}` : node.name;
    current++;

    if (onProgress) {
      onProgress({ current, total, currentItem: fullPath });
    }

    if (node.type === 'directory') {
      zip.folder(fullPath);
      dirsCreated++;
      for (const child of node.children) {
        addNode(child, fullPath);
      }
    } else {
      zip.file(fullPath, '');
      filesCreated++;
    }
  }

  try {
    addNode(tree, '');

    if (signal?.cancelled) {
      return { success: false, filesCreated: 0, dirsCreated: 0, skipped: 0, error: 'Cancelled' };
    }

    // Generate ZIP
    const blob = await zip.generateAsync({ 
      type: 'blob',
      compression: 'DEFLATE',
      compressionOptions: { level: 6 }
    }, (metadata) => {
      if (onProgress) {
        onProgress({ 
          current: Math.round(metadata.percent), 
          total: 100, 
          currentItem: 'Generating ZIP...' 
        });
      }
    });

    // Download
    const zipName = `${tree.name || 'structure'}.zip`;
    saveAs(blob, zipName);

    return { success: true, filesCreated, dirsCreated, skipped: 0 };
  } catch (e) {
    return { 
      success: false, 
      filesCreated, 
      dirsCreated, 
      skipped: 0, 
      error: e instanceof Error ? e.message : 'Unknown error' 
    };
  }
}
