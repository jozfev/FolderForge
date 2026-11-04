import { X } from 'lucide-react';

interface FormatGuideProps {
  isOpen: boolean;
  onClose: () => void;
}

export function FormatGuide({ isOpen, onClose }: FormatGuideProps) {
  if (!isOpen) return null;

  return (
    <div className="absolute right-0 top-full mt-2 z-40 w-[420px] animate-fade-in">
      <div className="bg-[#1B1F23] border border-[#2B3235] rounded-xl p-5 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-[#F1F5F3]">Supported Formats</h3>
          <button
            onClick={onClose}
            className="text-[#929B9D] hover:text-[#F1F5F3] transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <div className="space-y-4">
          {/* Tree Format */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#35D39A]" />
              <span className="text-xs font-medium text-[#F1F5F3]">Tree format</span>
            </div>
            <pre className="text-xs text-[#929B9D] bg-[#101214] rounded-lg p-3 font-mono overflow-x-auto">
{`Project/
├── src/
│   └── main.py
└── README.md`}
            </pre>
            <p className="text-xs text-[#929B9D]">Tree structure with branch characters.</p>
          </div>

          {/* Indent Format */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#48E0AA]" />
              <span className="text-xs font-medium text-[#F1F5F3]">Indentation format</span>
            </div>
            <pre className="text-xs text-[#929B9D] bg-[#101214] rounded-lg p-3 font-mono overflow-x-auto">
{`Project
    src
        main.py
    README.md`}
            </pre>
            <p className="text-xs text-[#929B9D]">Nesting determined by indentation.</p>
          </div>

          {/* Path Format */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#E7B65C]" />
              <span className="text-xs font-medium text-[#F1F5F3]">Path format</span>
            </div>
            <pre className="text-xs text-[#929B9D] bg-[#101214] rounded-lg p-3 font-mono overflow-x-auto">
{`Project/
Project/src/
Project/src/main.py
Project/README.md`}
            </pre>
            <p className="text-xs text-[#929B9D]">Each element as a separate relative path.</p>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-[#2B3235]">
          <p className="text-xs text-[#929B9D]">
            JSON format is also supported but not shown here.
          </p>
        </div>
      </div>
    </div>
  );
}
