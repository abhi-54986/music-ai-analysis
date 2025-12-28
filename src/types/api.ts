// TypeScript type definitions matching backend Pydantic schemas.

export interface ChordSegment {
  time: number;
  chord: string;
  confidence: number;
}

export interface WaveformData {
  sample_rate: number;
  channels: number;
  points: number;
  waveform: number[][];
}

export interface AudioMetadata {
  filename: string;
  duration_seconds: number;
  processing_time_seconds: number;
}

export interface StemReferences {
  vocals?: string;
  drums?: string;
  bass?: string;
  other?: string;
}

export interface AnalysisResponse {
  session_id: string;
  metadata: AudioMetadata;
  waveform: WaveformData;
  key: string;
  key_confidence: number;
  tempo_bpm: number;
  beat_times: number[];
  chords: ChordSegment[];
  stems: StemReferences;
}

export interface ErrorResponse {
  error: string;
  detail?: string;
}
