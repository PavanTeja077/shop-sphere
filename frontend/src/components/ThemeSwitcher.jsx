// frontend/src/components/ThemeSwitcher.jsx
import React from 'react';
import { Sun, Moon } from 'lucide-react';

export const THEMES = [
  {
    id: 'light',
    name: 'Luxe Light',
    category: 'Light Theme',
    badge: 'Light',
    icon: Sun,
    dotColor: '#0d9488',
    previewBg: '#ffffff',
    previewBorder: '#cbd5e1',
    description: 'Crisp, high-contrast modern luxury light palette with white cards & teal accents.'
  },
  {
    id: 'cyber',
    name: 'Cyber Dark',
    category: 'Dark Theme',
    badge: 'Dark',
    icon: Moon,
    dotColor: '#14b8a6',
    previewBg: '#04060b',
    previewBorder: '#1e293b',
    description: 'Deep spatial obsidian dark aesthetic with luminous cyan & teal neon accents.'
  }
];

export default function ThemeSwitcher({ currentTheme, onThemeChange }) {
  // Normalize any legacy theme names
  const isLight = currentTheme === 'light' || currentTheme === 'graphite' || currentTheme === 'vintage';

  return (
    <div 
      className="flex items-center p-1 rounded-full border transition-all shadow-sm backdrop-blur-md"
      style={{
        backgroundColor: 'var(--theme-surface, rgba(255, 255, 255, 0.08))',
        borderColor: 'var(--theme-border, rgba(255, 255, 255, 0.15))'
      }}
      role="group"
      aria-label="Theme mode switcher"
    >
      {/* Luxe Light Option */}
      <button
        type="button"
        onClick={() => onThemeChange('light')}
        className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all duration-200 ${
          isLight
            ? 'bg-white text-slate-900 shadow-md shadow-slate-900/10 scale-100 ring-1 ring-slate-200'
            : 'text-gray-400 hover:text-white opacity-70 hover:opacity-100'
        }`}
        title="Switch to Luxe Light Theme (Single Best Light Theme)"
      >
        <Sun className={`w-3.5 h-3.5 transition-transform ${isLight ? 'text-amber-500 rotate-12 scale-110' : 'text-gray-400'}`} />
        <span className="hidden sm:inline">Luxe Light</span>
      </button>

      {/* Cyber Dark Option */}
      <button
        type="button"
        onClick={() => onThemeChange('cyber')}
        className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all duration-200 ${
          !isLight
            ? 'bg-gradient-to-r from-teal-500 to-brand-500 text-white shadow-md shadow-brand-500/30 scale-100'
            : 'text-slate-600 hover:text-slate-900 opacity-70 hover:opacity-100'
        }`}
        title="Switch to Cyber Dark Theme (Obsidian Dark Theme)"
      >
        <Moon className={`w-3.5 h-3.5 transition-transform ${!isLight ? 'text-teal-200 -rotate-12 scale-110' : 'text-gray-400'}`} />
        <span className="hidden sm:inline">Cyber Dark</span>
      </button>
    </div>
  );
}
