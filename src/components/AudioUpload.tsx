/**
 * AudioUpload component.
 * 
 * Responsibilities:
 * - File picker with drag-and-drop support
 * - Validate file format (MP3, WAV, M4A only)
 * - Display file metadata (name, size, duration)
 * - Trigger upload with progress feedback
 * - Emit analysis results to parent
 */
import { useState, useRef } from 'react';
import type { ChangeEvent } from 'react';
import { uploadAndAnalyze } from '../api/client';
import type { AnalysisResponse } from '../types/api';
import './AudioUpload.css';
import { useI18n } from '../i18n';

interface AudioUploadProps {
  onAnalysisComplete: (result: AnalysisResponse) => void;
  onError: (error: string) => void;
  onProcessingStart: () => void;
}

const ALLOWED_FORMATS = ['.mp3', '.wav', '.m4a'];
const MAX_FILE_SIZE_MB = 100;

export function AudioUpload({ onAnalysisComplete, onError, onProcessingStart }: AudioUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileMetadata, setFileMetadata] = useState<{ name: string; size: string; duration: string } | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { t } = useI18n();

  const validateFile = (file: File): string | null => {
    const ext = '.' + file.name.split('.').pop()?.toLowerCase();
    if (!ALLOWED_FORMATS.includes(ext)) {
      return `Invalid format. Allowed: ${ALLOWED_FORMATS.join(', ')}`;
    }
    const sizeMB = file.size / (1024 * 1024);
    if (sizeMB > MAX_FILE_SIZE_MB) {
      return `File too large. Max ${MAX_FILE_SIZE_MB}MB.`;
    }
    return null;
  };

  const loadFileMetadata = async (file: File) => {
    const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
    const audio = new Audio();
    const objectUrl = URL.createObjectURL(file);

    return new Promise<void>((resolve) => {
      audio.addEventListener('loadedmetadata', () => {
        const durationMin = Math.floor(audio.duration / 60);
        const durationSec = Math.floor(audio.duration % 60);
        setFileMetadata({
          name: file.name,
          size: `${sizeMB} MB`,
          duration: `${durationMin}:${durationSec.toString().padStart(2, '0')}`,
        });
        URL.revokeObjectURL(objectUrl);
        resolve();
      });
      audio.addEventListener('error', () => {
        setFileMetadata({
          name: file.name,
          size: `${sizeMB} MB`,
          duration: 'Unknown',
        });
        URL.revokeObjectURL(objectUrl);
        resolve();
      });
      audio.src = objectUrl;
    });
  };

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const error = validateFile(file);
    if (error) {
      onError(error);
      return;
    }

    setSelectedFile(file);
    await loadFileMetadata(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setUploadProgress(0);
    onProcessingStart();

    try {
   // const result = await uploadAndAnalyze(selectedFile, 'cuda', (percent) => {
      const result = await uploadAndAnalyze(selectedFile, 'cpu', (percent) => {
        setUploadProgress(percent);
      });
      onAnalysisComplete(result);
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setFileMetadata(null);
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="audio-upload">
      <div className="upload-card">
        {!selectedFile ? (
          <div className="file-picker">
            <input
              ref={fileInputRef}
              type="file"
              accept=".mp3,.wav,.m4a"
              onChange={handleFileChange}
              disabled={isUploading}
              style={{ display: 'none' }}
              id="audio-file-input"
            />
            <label htmlFor="audio-file-input" className="file-picker-label">
              <div className="file-picker-icon">🎵</div>
              <p className="file-picker-text">{t('upload.click')}</p>
              <p className="file-picker-hint">{t('upload.hint', { size: MAX_FILE_SIZE_MB })}</p>
            </label>
          </div>
        ) : (
          <div className="file-info">
            <h3>{t('upload.selected')}</h3>
            <div className="metadata-grid">
              <div className="metadata-item">
                <span className="label">{t('upload.name')}</span>
                <span className="value">{fileMetadata?.name}</span>
              </div>
              <div className="metadata-item">
                <span className="label">{t('upload.size')}</span>
                <span className="value">{fileMetadata?.size}</span>
              </div>
              <div className="metadata-item">
                <span className="label">{t('upload.duration')}</span>
                <span className="value">{fileMetadata?.duration}</span>
              </div>
            </div>

            {isUploading && (
              <div className="progress-section">
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${uploadProgress}%` }} />
                </div>
                <p className="progress-text">
                  {uploadProgress < 100 ? t('upload.uploading', { percent: uploadProgress }) : t('upload.processing')}
                </p>
              </div>
            )}

            <div className="action-buttons">
              <button
                onClick={handleUpload}
                disabled={isUploading}
                className="btn-primary"
              >
                {isUploading ? t('upload.processing') : t('upload.analyze')}
              </button>
              <button
                onClick={handleReset}
                disabled={isUploading}
                className="btn-secondary"
              >
                {t('upload.cancel')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
