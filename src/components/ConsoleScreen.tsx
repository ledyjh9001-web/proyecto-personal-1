import React, { useEffect, useRef, useState } from 'react';
import { Play, Pause, RotateCcw, Zap } from 'lucide-react';
import { StemChannelKey, StemChannelState, TrackItem, TrackPattern } from '../types/audio';
import { audioEngine } from '../audio/synthEngine';

interface ConsoleScreenProps {
  tracks: TrackItem[];
  activeTrack: TrackItem;
  isPlaying: boolean;
  currentStep: number;
  stemChannels: StemChannelState[];
  tempoMultiplier: number;
  limiterActive: boolean;
  customPattern: TrackPattern;
  onSelectTrack: (trackId: string) => void;
  onTogglePlay: () => void;
  onUpdateStem: (key: StemChannelKey, patch: Partial<StemChannelState>) => void;
  onResetStems: () => void;
  onTempoChange: (mult: number) => void;
  onToggleLimiter: () => void;
  onTogglePatternStep: (channel: StemChannelKey, stepIdx: number) => void;
  onResetPattern: () => void;
}

export const ConsoleScreen: React.FC<ConsoleScreenProps> = ({
  tracks,
  activeTrack,
  isPlaying,
  currentStep,
  stemChannels,
  tempoMultiplier,
  limiterActive,
  customPattern,
  onSelectTrack,
  onTogglePlay,
  onUpdateStem,
  onResetStems,
  onTempoChange,
  onToggleLimiter,
  onTogglePatternStep,
  onResetPattern,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [peakDb, setPeakDb] = useState<string>('-INF');
  const peakHoldRef = useRef<number[]>(new Array(32).fill(0));

  useEffect(() => {
    let rafId = 0;
    const freqData = new Uint8Array(new ArrayBuffer(64));

    const draw = () => {
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const w = canvas.width;
          const h = canvas.height;
          ctx.fillStyle = '#050506';
          ctx.fillRect(0, 0, w, h);

          // Grid lines
          ctx.strokeStyle = '#18191e';
          ctx.lineWidth = 1;
          for (let y = 1; y < 4; y++) {
            const gy = Math.floor((h / 4) * y) + 0.5;
            ctx.beginPath();
            ctx.moveTo(0, gy);
            ctx.lineTo(w, gy);
            ctx.stroke();
          }

          const hasLive = audioEngine.getFrequencyData(freqData);
          const barCount = 32;
          const gap = 3;
          const barW = Math.floor((w - gap * (barCount - 1)) / barCount);

          let maxVal = 0;
          for (let i = 0; i < barCount; i++) {
            const raw = hasLive ? freqData[i] : 0;
            if (raw > maxVal) maxVal = raw;

            const norm = raw / 255;
            const barH = Math.max(2, Math.floor(norm * (h - 14)));
            const x = i * (barW + gap);
            const y = h - barH;

            if (barH > peakHoldRef.current[i]) {
              peakHoldRef.current[i] = barH;
            } else {
              peakHoldRef.current[i] = Math.max(2, peakHoldRef.current[i] - 1.4);
            }

            // Main linear crimson bar (zero curved caps)
            ctx.fillStyle = norm > 0.78 ? '#ef4444' : '#dc2626';
            ctx.fillRect(x, y, barW, barH);

            // Amber peak cap
            const capY = Math.max(2, h - peakHoldRef.current[i] - 3);
            ctx.fillStyle = '#f59e0b';
            ctx.fillRect(x, capY, barW, 2);
          }

          if (hasLive && maxVal > 0) {
            const db = (20 * Math.log10(maxVal / 255)).toFixed(1);
            setPeakDb(`${db} DBFS`);
          } else {
            setPeakDb(isPlaying ? '-12.4 DBFS' : '-INF DBFS');
          }
        }
      }
      rafId = window.requestAnimationFrame(draw);
    };

    rafId = window.requestAnimationFrame(draw);
    return () => window.cancelAnimationFrame(rafId);
  }, [isPlaying]);

  const effectiveBpm = Math.round(activeTrack.bpm * tempoMultiplier);

  return (
    <div className="space-y-8">
      {/* Console Header & Track Loader */}
      <div className="bg-[#121316] border border-[#27272a] p-5 md:p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div className="space-y-1.5">
          <div className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#f59e0b]">
            4-CHANNEL HARDWARE STEM CONSOLE
          </div>
          <h1 className="font-anton text-[32px] md:text-[40px] leading-none tracking-[0.03em] text-[#f4f4f5]">
            {activeTrack.title} — {activeTrack.artist}
          </h1>
          <div className="text-xs text-[#a1a1aa] uppercase tracking-[0.05em]">
            {activeTrack.genre} · KEY {activeTrack.musicalKey} · {activeTrack.sampleRate} ·{' '}
            <span className="text-[#f59e0b] tabular-nums">{effectiveBpm} BPM</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            aria-label="Load track into mastering console"
            value={activeTrack.id}
            onChange={(e) => onSelectTrack(e.target.value)}
            className="h-11 px-3 bg-[#0a0a0c] border border-[#27272a] focus:border-[#dc2626] focus:outline-none text-xs font-bold uppercase tracking-[0.06em] text-[#f4f4f5]"
          >
            {tracks.map((t) => (
              <option key={t.id} value={t.id}>
                {t.index} · {t.title} ({t.bpm} BPM)
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={onTogglePlay}
            className="tactical-chamfer-sm h-11 px-5 bg-[#dc2626] hover:bg-[#ef4444] active:bg-[#ffffff] active:text-[#050506] text-[#f4f4f5] font-anton text-base tracking-[0.06em] flex items-center gap-2 whitespace-nowrap shrink-0"
          >
            {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
            {isPlaying ? 'STOP ENGINE' : 'IGNITE DECK'}
          </button>
        </div>
      </div>

      {/* Spectrum Analyzer + Master Bus Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
        <div className="lg:col-span-8 bg-[#121316] border border-[#27272a] p-4 flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-[0.08em]">
            <span className="text-[#a1a1aa]">32-BAND LINEAR SPECTRUM ANALYZER</span>
            <span className="text-[#f59e0b] tabular-nums">PEAK: {peakDb}</span>
          </div>
          <canvas
            ref={canvasRef}
            width={760}
            height={160}
            className="w-full h-40 bg-[#050506] border border-[#27272a] block"
          />
        </div>

        <div className="lg:col-span-4 bg-[#121316] border border-[#27272a] p-4 flex flex-col justify-between gap-4">
          <div className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#a1a1aa]">
            MASTER BUS & TEMPO PITCH
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-[#d4d4d8]">TEMPO SCALE</span>
              <span className="text-[#f59e0b] tabular-nums">
                {Math.round(tempoMultiplier * 100)}% ({effectiveBpm} BPM)
              </span>
            </div>
            <input
              type="range"
              min={0.75}
              max={1.25}
              step={0.01}
              value={tempoMultiplier}
              aria-label="Tempo multiplier"
              onChange={(e) => onTempoChange(parseFloat(e.target.value))}
              className="concrete-fader w-full"
            />
            <div className="flex justify-between text-[10px] text-[#71717a] tabular-nums">
              <span>-25%</span>
              <button
                type="button"
                onClick={() => onTempoChange(1)}
                className="text-[#a1a1aa] hover:text-[#f4f4f5]"
              >
                RESET 100%
              </button>
              <span>+25%</span>
            </div>
          </div>

          <button
            type="button"
            onClick={onToggleLimiter}
            className={`h-11 px-4 border font-bold text-xs uppercase tracking-[0.08em] flex items-center justify-between transition-colors ${
              limiterActive
                ? 'border-[#ef4444] bg-[#dc2626] text-[#f4f4f5]'
                : 'border-[#ef4444] hazard-stripes text-[#f4f4f5]'
            }`}
          >
            <span className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              SUB-BASS TAPE LIMITER
            </span>
            <span>{limiterActive ? 'ENGAGED' : 'BYPASS'}</span>
          </button>
        </div>
      </div>

      {/* 4-Channel Stem Mixer Matrix */}
      <section aria-label="4-channel stem mixer" className="space-y-3">
        <div className="flex items-center justify-between border-b border-[#27272a] pb-2">
          <h2 className="font-anton text-2xl tracking-[0.03em] text-[#f4f4f5]">
            STEM CHANNEL STRIPS
          </h2>
          <button
            type="button"
            onClick={onResetStems}
            className="h-8 px-3 border border-[#27272a] bg-[#121316] hover:border-[#dc2626] text-[10px] font-bold uppercase tracking-[0.08em] text-[#f4f4f5] flex items-center gap-1.5"
          >
            <RotateCcw className="w-3 h-3" />
            RESET FADERS
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stemChannels.map((ch, idx) => {
            const pct = Math.round(ch.gain * 100);
            const activeNotes = activeTrack.stemNotes[idx] ?? 'ISOLATED BUS';
            return (
              <div
                key={ch.key}
                className={`p-4 border bg-[#121316] space-y-4 transition-colors ${
                  ch.solo
                    ? 'border-[#f59e0b]'
                    : ch.muted
                    ? 'border-[#27272a] opacity-70'
                    : 'border-[#27272a]'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#71717a]">
                      CH 0{idx + 1} · {ch.band}
                    </div>
                    <div className="font-anton text-xl tracking-[0.03em] text-[#f4f4f5]">
                      {ch.label}
                    </div>
                  </div>
                  <span className="px-2 py-0.5 bg-[#050506] border border-[#27272a] text-[11px] font-bold text-[#f59e0b] tabular-nums">
                    {pct}%
                  </span>
                </div>

                <div className="text-[11px] text-[#a1a1aa] truncate border-t border-[#1a1b1f] pt-2">
                  {activeNotes}
                </div>

                {/* Gain Slider */}
                <div className="space-y-1.5">
                  <input
                    type="range"
                    min={0}
                    max={1.2}
                    step={0.02}
                    value={ch.gain}
                    aria-label={`${ch.label} gain`}
                    onChange={(e) => onUpdateStem(ch.key, { gain: parseFloat(e.target.value) })}
                    className="concrete-fader w-full"
                  />
                </div>

                {/* Mute & Solo */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => onUpdateStem(ch.key, { muted: !ch.muted })}
                    className={`h-9 text-[11px] font-bold uppercase tracking-[0.08em] border transition-colors ${
                      ch.muted
                        ? 'bg-[#dc2626] border-[#dc2626] text-[#f4f4f5]'
                        : 'bg-[#050506] border-[#27272a] text-[#a1a1aa] hover:border-[#dc2626] hover:text-[#f4f4f5]'
                    }`}
                  >
                    {ch.muted ? 'MUTED' : 'MUTE'}
                  </button>
                  <button
                    type="button"
                    onClick={() => onUpdateStem(ch.key, { solo: !ch.solo })}
                    className={`h-9 text-[11px] font-bold uppercase tracking-[0.08em] border transition-colors ${
                      ch.solo
                        ? 'bg-[#f59e0b] border-[#f59e0b] text-[#050506]'
                        : 'bg-[#050506] border-[#27272a] text-[#a1a1aa] hover:border-[#f59e0b] hover:text-[#f4f4f5]'
                    }`}
                  >
                    {ch.solo ? 'SOLO ON' : 'SOLO'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Interactive 16-Step Pattern Sequencer */}
      <section aria-label="16-step stem sequencer" className="bg-[#121316] border border-[#27272a] p-4 md:p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#27272a] pb-3">
          <div>
            <h2 className="font-anton text-2xl tracking-[0.03em] text-[#f4f4f5]">
              16-STEP PATTERN MATRIX
            </h2>
            <p className="text-[11px] text-[#a1a1aa] uppercase tracking-[0.05em]">
              CLICK ANY CELL TO REPROGRAM THE LIVE AUDIO ENGINE IN REAL TIME
            </p>
          </div>
          <button
            type="button"
            onClick={onResetPattern}
            className="h-9 px-3 border border-[#27272a] bg-[#050506] hover:border-[#dc2626] text-[10px] font-bold uppercase tracking-[0.08em] text-[#f4f4f5]"
          >
            RESTORE ORIGINAL PATTERN
          </button>
        </div>

        <div className="overflow-x-auto">
          <div className="min-w-[680px] space-y-2">
            {/* Step Index Numbers */}
            <div className="grid grid-cols-[130px_repeat(16,minmax(0,1fr))] gap-1.5 items-center">
              <div className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#71717a]">
                STEP
              </div>
              {Array.from({ length: 16 }).map((_, stepIdx) => (
                <div
                  key={stepIdx}
                  className={`text-center text-[10px] font-bold tabular-nums py-1 ${
                    isPlaying && currentStep === stepIdx
                      ? 'bg-[#dc2626] text-[#f4f4f5]'
                      : stepIdx % 4 === 0
                      ? 'text-[#f59e0b]'
                      : 'text-[#71717a]'
                  }`}
                >
                  {String(stepIdx + 1).padStart(2, '0')}
                </div>
              ))}
            </div>

            {(['sub808', 'drums', 'perc', 'synth'] as StemChannelKey[]).map((chKey) => {
              const labelMap: Record<StemChannelKey, string> = {
                sub808: '808 SUB',
                drums: 'KICK / SNARE',
                perc: 'PERC / HAT',
                synth: 'DARK SYNTH',
              };
              const steps = customPattern[chKey];

              return (
                <div
                  key={chKey}
                  className="grid grid-cols-[130px_repeat(16,minmax(0,1fr))] gap-1.5 items-center"
                >
                  <div className="text-[11px] font-bold uppercase tracking-[0.06em] text-[#f4f4f5] truncate">
                    {labelMap[chKey]}
                  </div>
                  {steps.map((val, stepIdx) => {
                    const active = val > 0;
                    const playhead = isPlaying && currentStep === stepIdx;
                    return (
                      <button
                        key={stepIdx}
                        type="button"
                        onClick={() => onTogglePatternStep(chKey, stepIdx)}
                        aria-label={`Toggle ${labelMap[chKey]} step ${stepIdx + 1}`}
                        className={`h-9 border transition-colors duration-75 ${
                          active
                            ? chKey === 'drums' && val === 2
                              ? 'bg-[#f59e0b] border-[#f59e0b]'
                              : 'bg-[#dc2626] border-[#dc2626]'
                            : stepIdx % 4 === 0
                            ? 'bg-[#1a1b1f] border-[#27272a] hover:border-[#dc2626]'
                            : 'bg-[#050506] border-[#27272a] hover:border-[#dc2626]'
                        } ${playhead ? 'ring-1 ring-[#f4f4f5]' : ''}`}
                      />
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
};
