import type { ChordSegment, AudioMetadata } from '../types/api';
import { useI18n } from '../i18n';

interface ChordTimelineProps {
  chords: ChordSegment[];
  metadata: AudioMetadata;
}

export function ChordTimeline({ chords, metadata }: ChordTimelineProps) {
  const { lang } = useI18n();

  const noteMap: Record<string, string> = {
    C: 'Do', D: 'Ré', E: 'Mi', F: 'Fa', G: 'Sol', A: 'La', B: 'Si',
  };
  const accidental = (a?: string) => a === '#' ? '♯' : a === 'b' ? '♭' : '';
  const convertNote = (note: string) => {
    const m = note.match(/^([A-G])([#b]?)/);
    if (!m) return note;
    const root = noteMap[m[1]] ?? m[1];
    return root + accidental(m[2]) + note.slice(m[0].length);
  };
  const toSolfege = (label: string) => {
    // Handle chords like C#m7, Bbmaj7/C
    const parts = label.split('/');
    const head = convertNote(parts[0]);
    if (parts.length === 1) return head;
    return head + '/' + convertNote(parts[1]);
  };

  const duration = Math.max(0.001, metadata.duration_seconds);
  const segments = chords.map((seg, idx) => {
    const start = seg.time;
    const end = idx < chords.length - 1 ? chords[idx + 1].time : duration;
    const widthPct = Math.max(0.5, ((end - start) / duration) * 100);
    const label = lang === 'fr' ? toSolfege(seg.chord) : seg.chord;
    return {
      label,
      confidence: seg.confidence,
      start,
      end,
      widthPct,
    };
  });

  return (
    <div style={{ width: '100%', overflowX: 'auto', paddingBottom: 6 }}>
      <div style={{ display: 'flex', gap: 2, alignItems: 'stretch', flexWrap: 'nowrap' }}>
        {segments.map((s, i) => (
          <div
            key={i}
            title={`${s.label} • ${s.start.toFixed(1)}s → ${s.end.toFixed(1)}s`}
            style={{
              width: `${s.widthPct}%`,
              minWidth: 8,
              background: '#111827',
              border: '1px solid #1f2937',
              padding: '6px 8px',
              color: '#e5e7eb',
              fontSize: 12,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              flexShrink: 0,
            }}
          >
            {s.label}
            <span style={{ color: '#9ca3af', marginLeft: 6 }}>
              {(s.confidence * 100).toFixed(0)}%
            </span>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#6b7280', marginTop: 6 }}>
        <span>0s</span>
        <span>{duration.toFixed(1)}s</span>
      </div>
    </div>
  );
}
