/**
 * API client for Music AI backend communication.
 * 
 * Responsibilities:
 * - Configure axios instance with base URL.
 * - Provide typed methods for upload and session management.
 * - Handle errors and return typed responses.
 */
import axios, { AxiosError } from 'axios';
import type { AnalysisResponse, ErrorResponse } from '../types/api';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://abhinference-music-ai-analysis.hf.space';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 300000, // 5 min timeout for ML processing
});

/**
 * Upload an audio file and get complete analysis.
 * 
 * @param file - Audio file to upload (MP3/WAV/M4A)
 * @param device - Device for ML inference ('cpu' or 'cuda')
 * @param onProgress - Optional progress callback for upload
 * @returns Promise resolving to analysis response
 */
export async function uploadAndAnalyze(
  file: File,
  device: 'cpu' | 'cuda' = 'cpu',
  onProgress?: (percent: number) => void
): Promise<AnalysisResponse> {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await apiClient.post<AnalysisResponse>(
      `/v1/audio/upload?device=${device}`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            onProgress(percent);
          }
        },
      }
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<ErrorResponse>;
      throw new Error(axiosError.response?.data?.detail || axiosError.message);
    }
    throw error;
  }
}

/**
 * Clean up a session and its temporary files.
 * 
 * @param sessionId - Session identifier to clean up
 */
export async function cleanupSession(sessionId: string): Promise<void> {
  try {
    await apiClient.delete(`/v1/audio/session/${sessionId}`);
  } catch (error) {
    console.warn(`Session cleanup failed for ${sessionId}:`, error);
  }
}

/**
 * Health check endpoint.
 */
export async function checkHealth(): Promise<{ status: string }> {
  const response = await apiClient.get('/v1/health');
  return response.data;
}
