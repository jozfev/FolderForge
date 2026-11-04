import { AppSettings } from '../core/models';

const STORAGE_KEY = 'folderforge_settings';

const DEFAULT_SETTINGS: AppSettings = {
  theme: 'dark',
  animations: true,
  existingFiles: 'skip',
  language: 'en'
};

export function getSettings(): AppSettings {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
    }
  } catch (e) {
    console.error('Failed to load settings:', e);
  }
  return { ...DEFAULT_SETTINGS };
}

export function saveSettings(settings: AppSettings): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}

export function resetSettings(): AppSettings {
  localStorage.removeItem(STORAGE_KEY);
  return { ...DEFAULT_SETTINGS };
}
