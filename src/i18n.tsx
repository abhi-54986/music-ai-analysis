import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from 'react';

export type Lang = 'en' | 'fr';

type Dict = Record<string, string>;

const dicts: Record<Lang, Dict> = {
  en: {
    'app.title': 'Music AI Analysis',
    'app.subtitle': 'Upload audio to extract stems, chords, key, and tempo',
    'error.title': 'Error',
    'error.dismiss': 'Dismiss',
    'processing.title': 'Processing audio with ML models...',
    'processing.hint': 'This may take a minute depending on hardware',
    'results.title': 'Analysis Complete',
    'results.new': 'New Analysis',
    'summary.file': 'File:',
    'summary.duration': 'Duration:',
    'summary.key': 'Key:',
    'summary.tempo': 'Tempo:',
    'summary.processing': 'Processing Time:',
    'section.waveform': 'Waveform',
    'section.chords': 'Chords',
    'section.stems': 'Stems',
    'stems.vocals': 'Vocals',
    'stems.drums': 'Drums',
    'stems.bass': 'Bass',
    'stems.other': 'Other',
    'json.viewRaw': 'View Raw JSON',
    'upload.click': 'Click to select audio file',
    'upload.hint': 'Supported: MP3, WAV, M4A (max {size}MB)',
    'upload.selected': 'Selected File',
    'upload.name': 'Name:',
    'upload.size': 'Size:',
    'upload.duration': 'Duration:',
    'upload.analyze': 'Analyze Audio',
    'upload.cancel': 'Cancel',
    'upload.uploading': 'Uploading... {percent}%',
    'upload.processing': 'Processing audio...'
  },
  fr: {
    'app.title': "Analyse IA de Musique",
    'app.subtitle': "Téléversez un audio pour extraire les stems, accords, tonalité et tempo",
    'error.title': 'Erreur',
    'error.dismiss': 'Fermer',
    'processing.title': "Traitement de l'audio avec des modèles ML...",
    'processing.hint': "Cela peut prendre une minute selon le matériel",
    'results.title': 'Analyse terminée',
    'results.new': 'Nouvelle analyse',
    'summary.file': 'Fichier :',
    'summary.duration': 'Durée :',
    'summary.key': 'Tonalité :',
    'summary.tempo': 'Tempo :',
    'summary.processing': 'Temps de traitement :',
    'section.waveform': 'Forme d’onde',
    'section.chords': 'Accords',
    'section.stems': 'Stems',
    'stems.vocals': 'Voix',
    'stems.drums': 'Batterie',
    'stems.bass': 'Basse',
    'stems.other': 'Autres',
    'json.viewRaw': 'Voir JSON brut',
    'upload.click': "Cliquez pour sélectionner un fichier audio",
    'upload.hint': 'Pris en charge : MP3, WAV, M4A (max {size}Mo)',
    'upload.selected': 'Fichier sélectionné',
    'upload.name': 'Nom :',
    'upload.size': 'Taille :',
    'upload.duration': 'Durée :',
    'upload.analyze': 'Analyser',
    'upload.cancel': 'Annuler',
    'upload.uploading': 'Téléversement... {percent}%',
    'upload.processing': 'Traitement de l’audio...'
  }
};

type I18nContextValue = {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
};

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>(() => (localStorage.getItem('lang') as Lang) || 'en');

  useEffect(() => {
    localStorage.setItem('lang', lang);
  }, [lang]);

  const t = useMemo(() => {
    return (key: string, vars?: Record<string, string | number>) => {
      const base = dicts[lang][key] ?? key;
      if (!vars) return base;
      return Object.keys(vars).reduce((acc, k) => acc.replace(`{${k}}`, String(vars[k])), base);
    };
  }, [lang]);

  const value = useMemo(() => ({ lang, setLang, t }), [lang, t]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used within I18nProvider');
  return ctx;
}

export function LanguageSwitcher() {
  const { lang, setLang } = useI18n();
  return (
    <select
      aria-label="Language"
      value={lang}
      onChange={(e) => setLang(e.target.value as Lang)}
      style={{
        padding: '6px 8px',
        borderRadius: 6,
        border: '1px solid #374151',
        background: '#111827',
        color: '#e5e7eb'
      }}
    >
      <option value="en">English</option>
      <option value="fr">Français</option>
    </select>
  );
}
