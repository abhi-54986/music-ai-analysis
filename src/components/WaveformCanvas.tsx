import { useEffect, useRef } from 'react';
import type { WaveformData } from '../types/api';

interface WaveformCanvasProps {
  data: WaveformData;
  height?: number;
}

export function WaveformCanvas({ data, height = 160 }: WaveformCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    const width = canvas.clientWidth * dpr;
    const h = height * dpr;
    canvas.width = width;
    canvas.height = h;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, width, h);

    const channelColors = ['#4f46e5', '#22c55e', '#f59e0b'];
    const margin = 8 * dpr;
    const channelHeight = (h - margin * (data.channels + 1)) / data.channels;

    for (let ch = 0; ch < data.channels; ch++) {
      const yBase = margin + ch * (channelHeight + margin);
      const waveform = data.waveform[ch] || [];
      const len = waveform.length;
      if (len === 0) continue;

      // Draw baseline
      ctx.strokeStyle = '#e5e7eb';
      ctx.lineWidth = 1 * dpr;
      ctx.beginPath();
      ctx.moveTo(0, yBase + channelHeight / 2);
      ctx.lineTo(width, yBase + channelHeight / 2);
      ctx.stroke();

      // Draw waveform
      ctx.strokeStyle = channelColors[ch % channelColors.length];
      ctx.lineWidth = 1.5 * dpr;
      ctx.beginPath();

      for (let i = 0; i < len; i++) {
        const x = (i / (len - 1)) * width;
        const amp = waveform[i];
        const y = yBase + (1 - (amp + 1) / 2) * channelHeight; // map -1..1 to 0..channelHeight
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
  }, [data, height]);

  return (
    <div style={{ width: '100%' }}>
      <canvas ref={canvasRef} style={{ width: '100%', height }} />
      <div style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>
        {data.channels} ch • {data.sample_rate} Hz • {data.points} pts
      </div>
    </div>
  );
}
