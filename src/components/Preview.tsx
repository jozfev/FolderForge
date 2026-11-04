import { FileNode } from '../core/models';
import { Folder, File, ChevronRight, ChevronDown } from 'lucide-react';
import { useState } from 'react';

interface PreviewProps {
  tree: FileNode | null;
  format?: string;
  stats?: { directories: number; files: number };
  errors?: { message: string; type: string }[];
}

function TreeNode({ node, depth = 0 }: { node: FileNode; depth?: number }) {
  const [expanded, setExpanded] = useState(depth < 2);
  const isDir = node.type === 'directory';
  const hasChildren = node.children.length > 0;

  return (
    <div>
      <div
        className={`flex items-center gap-1.5 py-0.5 px-2 rounded hover:bg-[#22282D] cursor-pointer transition-colors group`}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
        onClick={() => isDir && setExpanded(!expanded)}
      >
        {isDir && hasChildren ? (
          expanded ? (
            <ChevronDown size={12} className="text-[#929B9D] flex-shrink-0" />
          ) : (
            <ChevronRight size={12} className="text-[#929B9D] flex-shrink-0" />
          )
        ) : (
          <span className="w-3 flex-shrink-0" />
        )}
        {isDir ? (
          <Folder size={14} className="text-[#35D39A] flex-shrink-0" />
        ) : (
          <File size={14} className="text-[#929B9D] flex-shrink-0" />
        )}
        <span className={`text-xs ${isDir ? 'text-[#F1F5F3]' : 'text-[#929B9D]'}`}>
          {node.name}
        </span>
      </div>
      {isDir && expanded && hasChildren && (
        <div>
          {node.children.map((child, i) => (
            <TreeNode key={`${child.name}-${i}`} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export function Preview({ tree, format, stats, errors }: PreviewProps) {
  if (!tree) {
    return (
      <div className="bg-[#1B1F23] border border-[#2B3235] rounded-xl p-6">
        <div className="text-center text-[#929B9D]">
          <p className="text-sm">Enter a structure to see the preview</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#1B1F23] border border-[#2B3235] rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#2B3235]">
        <div className="flex items-center gap-3">
          <h3 className="text-xs font-medium text-[#F1F5F3]">Preview</h3>
          {format && (
            <span className="text-[10px] px-2 py-0.5 bg-[#35D39A]/10 text-[#35D39A] rounded-full font-medium">
              {format}
            </span>
          )}
        </div>
        {stats && (
          <div className="flex items-center gap-3">
            <span className="text-[10px] text-[#929B9D]">
              <span className="text-[#35D39A]">{stats.directories}</span> folders
            </span>
            <span className="text-[10px] text-[#929B9D]">
              <span className="text-[#48E0AA]">{stats.files}</span> files
            </span>
          </div>
        )}
      </div>

      {/* Errors */}
      {errors && errors.length > 0 && (
        <div className="px-4 py-2 border-b border-[#2B3235] bg-[#F16C6C]/5">
          {errors.map((err, i) => (
            <p key={i} className={`text-xs ${err.type === 'error' ? 'text-[#F16C6C]' : 'text-[#E7B65C]'}`}>
              {err.message}
            </p>
          ))}
        </div>
      )}

      {/* Tree */}
      <div className="max-h-[300px] overflow-y-auto p-2 custom-scrollbar">
        <TreeNode node={tree} />
      </div>
    </div>
  );
}
