import { useState, useEffect, useCallback, useRef } from 'react';
import {
  FolderPlus, Settings as SettingsIcon, HelpCircle, Download,
  Layout, Clock, Trash2, Sparkles
} from 'lucide-react';
import { parse, getFormatName } from './core/parser';
import { validate } from './core/validator';
import { buildZip, BuildProgress } from './core/builder';
import { FileNode, FormatType, AppSettings, HistoryEntry } from './core/models';
import { getTemplates, saveCustomTemplate, deleteCustomTemplate } from './services/templates';
import { getHistory, addHistoryEntry, clearHistory, deleteHistoryEntry } from './services/history';
import { getSettings, saveSettings } from './services/settings';
import { FormatGuide } from './components/FormatGuide';
import { Preview } from './components/Preview';
import { Settings } from './components/Settings';
import { History } from './components/History';
import { Templates } from './components/Templates';
import { ToastContainer, showToast } from './components/Toast';

function App() {
  const [input, setInput] = useState('');
  const [parsedTree, setParsedTree] = useState<FileNode | null>(null);
  const [format, setFormat] = useState<FormatType | undefined>();
  const [stats, setStats] = useState<{ directories: number; files: number } | undefined>();
  const [errors, setErrors] = useState<{ message: string; type: string }[]>([]);
  const [showGuide, setShowGuide] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [settings, setSettings] = useState<AppSettings>(getSettings());
  const [history, setHistory] = useState<HistoryEntry[]>(getHistory());
  const [templates, setTemplates] = useState(getTemplates());
  const [isBuilding, setIsBuilding] = useState(false);
  const [buildProgress, setBuildProgress] = useState<BuildProgress | null>(null);
  const cancelRef = useRef<{ cancelled: boolean }>({ cancelled: false });
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lineNumbersRef = useRef<HTMLDivElement>(null);

  // Parse input on change with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!input.trim()) {
        setParsedTree(null);
        setFormat(undefined);
        setStats(undefined);
        setErrors([]);
        return;
      }

      const result = parse(input);
      if (result.success && result.tree) {
        setParsedTree(result.tree);
        setFormat(result.format);
        setStats(result.stats);

        // Validate
        const validationErrors = validate(result.tree);
        setErrors(validationErrors.map(e => ({ message: e.message, type: e.type })));
      } else {
        setParsedTree(null);
        setFormat(result.format);
        setStats(undefined);
        setErrors(result.error ? [{ message: result.error, type: 'error' }] : []);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [input]);

  // Sync line numbers
  const handleScroll = useCallback(() => {
    if (textareaRef.current && lineNumbersRef.current) {
      lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  }, []);

  const lineCount = input ? input.split('\n').length : 1;

  // Handle settings change
  const handleSettingsChange = (newSettings: AppSettings) => {
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  // Handle template selection
  const handleTemplateSelect = (template: { content: string }) => {
    setInput(template.content);
    showToast('Template loaded', 'info');
  };

  // Handle custom template save
  const handleSaveCustomTemplate = (name: string, content: string) => {
    saveCustomTemplate({ name, description: 'Custom template', content, format: 'tree' as FormatType });
    setTemplates(getTemplates());
    showToast('Template saved', 'success');
  };

  // Handle custom template delete
  const handleDeleteCustomTemplate = (id: string) => {
    deleteCustomTemplate(id);
    setTemplates(getTemplates());
    showToast('Template deleted', 'info');
  };

  // Handle build
  const handleBuild = async () => {
    if (!parsedTree) {
      showToast('No valid structure to create', 'error');
      return;
    }

    if (errors.some(e => e.type === 'error')) {
      showToast('Fix errors before creating structure', 'error');
      return;
    }

    setIsBuilding(true);
    cancelRef.current = { cancelled: false };

    try {
      const result = await buildZip(
        parsedTree,
        (progress) => setBuildProgress(progress),
        cancelRef.current
      );

      if (result.success) {
        // Add to history
        addHistoryEntry({
          projectName: parsedTree.name,
          destination: 'Downloaded as ZIP',
          filesCount: result.filesCreated,
          dirsCount: result.dirsCreated,
          status: 'success'
        });
        setHistory(getHistory());
        showToast('Structure created and downloaded!', 'success');
      } else if (result.error === 'Cancelled') {
        showToast('Creation cancelled', 'warning');
      } else {
        showToast(`Error: ${result.error}`, 'error');
      }
    } catch (e) {
      showToast('Unexpected error occurred', 'error');
    } finally {
      setIsBuilding(false);
      setBuildProgress(null);
    }
  };

  const handleCancel = () => {
    cancelRef.current.cancelled = true;
  };

  // Handle clear
  const handleClear = () => {
    setInput('');
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  return (
    <div className="min-h-screen bg-[#101214] text-[#F1F5F3] flex flex-col">
      {/* Header */}
      <header className="h-[55px] flex items-center justify-between px-5 border-b border-[#2B3235] bg-[#15181B]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#35D39A]/10 flex items-center justify-center">
            <FolderPlus size={18} className="text-[#35D39A]" />
          </div>
          <div>
            <h1 className="text-sm font-semibold text-[#F1F5F3] leading-none">FolderForge</h1>
            <span className="text-[10px] text-[#929B9D]">v1.0</span>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowHistory(true)}
            className="p-2 text-[#929B9D] hover:text-[#F1F5F3] hover:bg-[#22282D] rounded-lg transition-all"
            title="History"
          >
            <Clock size={16} />
          </button>
          <button
            onClick={() => setShowTemplates(true)}
            className="p-2 text-[#929B9D] hover:text-[#F1F5F3] hover:bg-[#22282D] rounded-lg transition-all"
            title="Templates"
          >
            <Layout size={16} />
          </button>
          <button
            onClick={() => setShowSettings(true)}
            className="p-2 text-[#929B9D] hover:text-[#F1F5F3] hover:bg-[#22282D] rounded-lg transition-all"
            title="Settings"
          >
            <SettingsIcon size={16} />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center px-6 py-8 max-w-4xl mx-auto w-full">
        {/* Title */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-[#F1F5F3] mb-2">Create your structure</h2>
          <p className="text-sm text-[#929B9D]">
            Paste a folder tree or import your structure.
          </p>
        </div>

        {/* Editor Area */}
        <div className="w-full relative mb-6">
          <div className="bg-[#1B1F23] border border-[#2B3235] rounded-xl overflow-hidden focus-within:border-[#35D39A]/40 transition-colors">
            {/* Editor toolbar */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-[#2B3235] bg-[#15181B]">
              <div className="flex items-center gap-2">
                {format && (
                  <span className="text-[10px] px-2 py-0.5 bg-[#35D39A]/10 text-[#35D39A] rounded-full font-medium">
                    {getFormatName(format)}
                  </span>
                )}
                {stats && (
                  <span className="text-[10px] text-[#929B9D]">
                    {stats.directories} folders · {stats.files} files
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1">
                <div className="relative">
                  <button
                    onClick={() => setShowGuide(!showGuide)}
                    className={`p-1.5 rounded-md transition-all ${
                      showGuide ? 'text-[#35D39A] bg-[#35D39A]/10' : 'text-[#929B9D] hover:text-[#F1F5F3] hover:bg-[#22282D]'
                    }`}
                    title="Format guide"
                  >
                    <HelpCircle size={14} />
                  </button>
                  <FormatGuide isOpen={showGuide} onClose={() => setShowGuide(false)} />
                </div>
                {input && (
                  <button
                    onClick={handleClear}
                    className="p-1.5 text-[#929B9D] hover:text-[#F1F5F3] hover:bg-[#22282D] rounded-md transition-all"
                    title="Clear"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </div>

            {/* Editor with line numbers */}
            <div className="flex min-h-[320px] max-h-[400px]">
              {/* Line numbers */}
              <div
                ref={lineNumbersRef}
                className="w-12 bg-[#15181B] border-r border-[#2B3235] overflow-hidden select-none py-3"
              >
                {Array.from({ length: Math.max(lineCount, 15) }, (_, i) => (
                  <div
                    key={i}
                    className="text-right pr-3 text-[11px] leading-[1.65] text-[#929B9D]/40 font-mono"
                  >
                    {i + 1}
                  </div>
                ))}
              </div>

              {/* Textarea */}
              <textarea
                ref={textareaRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onScroll={handleScroll}
                placeholder={`Paste your structure here...\n\nExample (tree format):\nMyProject/\n├── src/\n│   ├── main.py\n│   └── utils.py\n├── tests/\n│   └── test_main.py\n└── README.md`}
                className="flex-1 bg-transparent text-[#F1F5F3] font-mono text-[13px] leading-[1.65] p-3 resize-none focus:outline-none placeholder:text-[#929B9D]/30 custom-scrollbar"
                spellCheck={false}
              />
            </div>
          </div>
        </div>

        {/* Preview */}
        <div className="w-full mb-6">
          <Preview
            tree={parsedTree}
            format={format ? getFormatName(format) : undefined}
            stats={stats}
            errors={errors}
          />
        </div>

        {/* Action Bar */}
        <div className="w-full flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowTemplates(true)}
              className="flex items-center gap-2 px-3 py-2 bg-[#1B1F23] border border-[#2B3235] rounded-lg text-xs text-[#929B9D] hover:text-[#F1F5F3] hover:border-[#35D39A]/30 transition-all"
            >
              <Sparkles size={13} />
              Templates
            </button>
          </div>

          <div className="flex items-center gap-3">
            {isBuilding && buildProgress && (
              <div className="flex items-center gap-2">
                <div className="w-32 h-1.5 bg-[#2B3235] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#35D39A] rounded-full transition-all duration-300"
                    style={{ width: `${(buildProgress.current / buildProgress.total) * 100}%` }}
                  />
                </div>
                <button
                  onClick={handleCancel}
                  className="text-[10px] text-[#F16C6C] hover:text-[#F16C6C]/80"
                >
                  Cancel
                </button>
              </div>
            )}

            <button
              onClick={handleBuild}
              disabled={!parsedTree || isBuilding || errors.some(e => e.type === 'error')}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#35D39A] text-[#101214] text-sm font-semibold rounded-lg hover:bg-[#48E0AA] transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-[#35D39A] shadow-lg shadow-[#35D39A]/10"
            >
              {isBuilding ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-[#101214]/30 border-t-[#101214] rounded-full animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Download size={15} />
                  Create structure
                </>
              )}
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="h-10 flex items-center justify-center border-t border-[#2B3235] bg-[#15181B]">
        <p className="text-[10px] text-[#929B9D]">
          FolderForge — Generate project structures instantly
        </p>
      </footer>

      {/* Modals */}
      <Settings
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        settings={settings}
        onSettingsChange={handleSettingsChange}
      />
      <History
        isOpen={showHistory}
        onClose={() => setShowHistory(false)}
        history={history}
        onClear={() => { clearHistory(); setHistory([]); showToast('History cleared', 'info'); }}
        onDelete={(id) => { deleteHistoryEntry(id); setHistory(getHistory()); }}
      />
      <Templates
        isOpen={showTemplates}
        onClose={() => setShowTemplates(false)}
        templates={templates}
        onSelect={handleTemplateSelect}
        onSaveCustom={handleSaveCustomTemplate}
        onDeleteCustom={handleDeleteCustomTemplate}
      />

      {/* Toast notifications */}
      <ToastContainer />
    </div>
  );
}

export default App;
