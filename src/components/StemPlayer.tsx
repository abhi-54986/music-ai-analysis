import type { StemReferences } from '../types/api';
import { useI18n } from '../i18n';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

interface StemPlayerProps {
  stems: StemReferences;
}

function resolveSrc(value?: string): string | undefined {
  if (!value) return undefined;
  // If the value is already absolute, return as-is.
  if (value.startsWith('http://') || value.startsWith('https://')) return value;
  // If it's an API path like /v1/..., prefix with backend base URL.
  if (value.startsWith('/')) return `${API_BASE_URL}${value}`;
  // Otherwise, attempt to resolve relative to origin.
  try {
    const u = new URL(value, window.location.origin);
    return u.toString();
  } catch {
    return value;
  }
}

export function StemPlayer({ stems }: StemPlayerProps) {
  const { t } = useI18n();
  const entries = [
    { key: 'vocals', label: t('stems.vocals'), src: resolveSrc(stems.vocals) },
    { key: 'drums', label: t('stems.drums'), src: resolveSrc(stems.drums) },
    { key: 'bass', label: t('stems.bass'), src: resolveSrc(stems.bass) },
    { key: 'other', label: t('stems.other'), src: resolveSrc(stems.other) },
  ];

  return (
    <div style={{ display: 'grid', gap: 12 }}>
      {entries.map((e) => (
        <div key={e.key} style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <strong>{e.label}</strong>
            {e.src ? (
              <audio controls preload="metadata" src={e.src} style={{ width: '60%' }} />
            ) : (
              <span style={{ color: '#9ca3af', fontSize: 12 }}>Not available</span>
            )}
          </div>
          {!e.src && (
            <div style={{ marginTop: 8, fontSize: 12, color: '#6b7280' }}>
              Stem URL unavailable
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
