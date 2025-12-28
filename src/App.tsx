/**
 * Main App component for Music AI Web Application.
 * 
 * Responsibilities:
 * - Manage upload state and analysis results.
 * - Coordinate between upload, visualization, and playback components.
 * - Handle session lifecycle and cleanup.
 */
import { useState, useEffect } from 'react';
import './App.css';
import type { AnalysisResponse } from './types/api';
import { AudioUpload } from './components/AudioUpload';
import { cleanupSession } from './api/client';
import { WaveformCanvas } from './components/WaveformCanvas';
import { ChordTimeline } from './components/ChordTimeline';
import { StemPlayer } from './components/StemPlayer';
import { LanguageSwitcher, useI18n } from './i18n';

function App() {
  const [analysisResult, setAnalysisResult] = useState<AnalysisResponse | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Cleanup session on unmount or when result changes
  useEffect(() => {
    return () => {
      if (analysisResult?.session_id) {
        cleanupSession(analysisResult.session_id);
      }
    };
  }, [analysisResult]);

  const handleAnalysisComplete = (result: AnalysisResponse) => {
    setAnalysisResult(result);
    setIsProcessing(false);
    setError(null);
  };

  const handleError = (errorMsg: string) => {
    setError(errorMsg);
    setIsProcessing(false);
  };

  const handleProcessingStart = () => {
    setIsProcessing(true);
    setError(null);
    setAnalysisResult(null);
  };

  const handleReset = () => {
    if (analysisResult?.session_id) {
      cleanupSession(analysisResult.session_id);
    }
    setAnalysisResult(null);
    setIsProcessing(false);
    setError(null);
  };

  const { t } = useI18n();

  return (
    <div className="app">
      <header className="app-header">
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', gap:12}}>
          <div>
            <h1>{t('app.title')}</h1>
            <p>{t('app.subtitle')}</p>
          </div>
          <LanguageSwitcher />
        </div>
      </header>

      <main className="app-main">
        {error && (
          <div className="error-section">
            <p><strong>{t('error.title')}:</strong> {error}</p>
            <button onClick={() => setError(null)} className="btn-dismiss">
              {t('error.dismiss')}
            </button>
          </div>
        )}

        {!analysisResult && !isProcessing && (
          <div className="upload-section">
            <AudioUpload
              onAnalysisComplete={handleAnalysisComplete}
              onError={handleError}
              onProcessingStart={handleProcessingStart}
            />
          </div>
        )}

        {isProcessing && (
          <div className="processing-section">
            <div className="spinner"></div>
            <p>{t('processing.title')}</p>
            <p className="processing-hint">{t('processing.hint')}</p>
          </div>
        )}

        {analysisResult && (
          <div className="results-section">
            <div className="results-header">
              <h2>{t('results.title')}</h2>
              <button onClick={handleReset} className="btn-new-analysis">
                {t('results.new')}
              </button>
            </div>
            <div className="results-summary">
              <div className="summary-item">
                <span className="summary-label">{t('summary.file')}</span>
                <span className="summary-value">{analysisResult.metadata.filename}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">{t('summary.duration')}</span>
                <span className="summary-value">{analysisResult.metadata.duration_seconds.toFixed(1)}s</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">{t('summary.key')}</span>
                <span className="summary-value">{analysisResult.key}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">{t('summary.tempo')}</span>
                <span className="summary-value">{analysisResult.tempo_bpm.toFixed(1)} BPM</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">{t('summary.processing')}</span>
                <span className="summary-value">{analysisResult.metadata.processing_time_seconds.toFixed(1)}s</span>
              </div>
            </div>
            <section style={{ marginTop: 20 }}>
              <h3>{t('section.waveform')}</h3>
              <WaveformCanvas data={analysisResult.waveform} />
            </section>
            <section style={{ marginTop: 24 }}>
              <h3>{t('section.chords')}</h3>
              <ChordTimeline chords={analysisResult.chords} metadata={analysisResult.metadata} />
            </section>
            <section style={{ marginTop: 24 }}>
              <h3>{t('section.stems')}</h3>
              <StemPlayer stems={analysisResult.stems} />
            </section>
            <details className="raw-data">
              <summary>{t('json.viewRaw')}</summary>
              <pre>{JSON.stringify(analysisResult, null, 2)}</pre>
            </details>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
