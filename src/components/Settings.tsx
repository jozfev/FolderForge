import { X } from 'lucide-react';
import { AppSettings } from '../core/models';

interface SettingsProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onSettingsChange: (settings: AppSettings) => void;
}

export function Settings({ isOpen, onClose, settings, onSettingsChange }: SettingsProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#1B1F23] border border-[#2B3235] rounded-xl w-[440px] max-h-[80vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#2B3235]">
          <h2 className="text-sm font-semibold text-[#F1F5F3]">Settings</h2>
          <button
            onClick={onClose}
            className="text-[#929B9D] hover:text-[#F1F5F3] transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-5 overflow-y-auto max-h-[60vh]">
          {/* Theme */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-[#F1F5F3]">Theme</label>
            <div className="flex gap-2">
              {(['dark', 'light'] as const).map(theme => (
                <button
                  key={theme}
                  onClick={() => onSettingsChange({ ...settings, theme })}
                  className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    settings.theme === theme
                      ? 'bg-[#35D39A]/10 text-[#35D39A] border border-[#35D39A]/30'
                      : 'bg-[#22282D] text-[#929B9D] border border-[#2B3235] hover:border-[#35D39A]/20'
                  }`}
                >
                  {theme === 'dark' ? '🌙 Dark' : '☀️ Light'}
                </button>
              ))}
            </div>
          </div>

          {/* Animations */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-[#F1F5F3]">Animations</p>
              <p className="text-[10px] text-[#929B9D]">Enable interface animations</p>
            </div>
            <button
              onClick={() => onSettingsChange({ ...settings, animations: !settings.animations })}
              className={`w-10 h-5 rounded-full transition-colors ${
                settings.animations ? 'bg-[#35D39A]' : 'bg-[#2B3235]'
              }`}
            >
              <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
                settings.animations ? 'translate-x-5' : 'translate-x-0.5'
              }`} />
            </button>
          </div>

          {/* Existing files behavior */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-[#F1F5F3]">Existing files</label>
            <div className="space-y-1">
              {([
                { value: 'skip' as const, label: 'Skip', desc: 'Don\'t overwrite existing files' },
                { value: 'overwrite' as const, label: 'Overwrite', desc: 'Replace existing files' },
                { value: 'ask' as const, label: 'Ask', desc: 'Ask before each conflict' },
              ]).map(option => (
                <button
                  key={option.value}
                  onClick={() => onSettingsChange({ ...settings, existingFiles: option.value })}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-all ${
                    settings.existingFiles === option.value
                      ? 'bg-[#35D39A]/10 border border-[#35D39A]/30'
                      : 'bg-[#22282D] border border-transparent hover:border-[#2B3235]'
                  }`}
                >
                  <div className={`w-3 h-3 rounded-full border-2 ${
                    settings.existingFiles === option.value
                      ? 'border-[#35D39A] bg-[#35D39A]'
                      : 'border-[#929B9D]'
                  }`} />
                  <div>
                    <p className="text-xs text-[#F1F5F3]">{option.label}</p>
                    <p className="text-[10px] text-[#929B9D]">{option.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Language */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-[#F1F5F3]">Language</label>
            <div className="flex gap-2">
              {([
                { value: 'en' as const, label: 'English' },
                { value: 'ru' as const, label: 'Русский' },
              ]).map(lang => (
                <button
                  key={lang.value}
                  onClick={() => onSettingsChange({ ...settings, language: lang.value })}
                  className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    settings.language === lang.value
                      ? 'bg-[#35D39A]/10 text-[#35D39A] border border-[#35D39A]/30'
                      : 'bg-[#22282D] text-[#929B9D] border border-[#2B3235] hover:border-[#35D39A]/20'
                  }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-[#2B3235] flex items-center justify-between">
          <span className="text-[10px] text-[#929B9D]">FolderForge v1.0</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-[#35D39A] text-[#101214] text-xs font-medium rounded-lg hover:bg-[#48E0AA] transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
