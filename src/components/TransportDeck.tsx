import React from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Sliders } from 'lucide-react';
import { TrackItem } from '../types/audio';

interface TransportDeckProps {
  track: TrackItem;
  isPlaying: boolean;
  currentTimeSec: number;
  tempoMultiplier: number;
  volume: number;
  muted: boolean;
  onTogglePlay: () => void;
  onPrev: () => void;
  onNext: () => void;
  onSeek: (sec: number) => void;
  onVolumeChange: (val: number) => void;
  onToggleMute: () => void;
  onOpenConsole: () => void;
}

function formatTime(sec: number): string {
  const safe = Math.max(0, Math.floor(sec));
  const mins = Math.floor(safe / 60);
  const rem = safe % 60;
  return `${String(mins).padStart(2, '0')}:${String(rem).padStart(2, '0')}`;
}

export const TransportDeck: React.FC<TransportDeckProps> = ({
  track,
  isPlaying,
  currentTimeSec,
  tempoMultiplier,
  volume,
  muted,
  onTogglePlay,
  onPrev,
  onNext,
  onSeek,
  onVolumeChange,
  onToggleMute,
  onOpenConsole,
}) => {
  const progressRatio = track.durationSec > 0 ? Math.min(1, currentTimeSec / track.durationSec) : 0;
  const effectiveBpm = Math.round(track.bpm * tempoMultiplier);

  const handleWaveformClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    onSeek(Math.floor(ratio * track.durationSec));
  };

  return (
    <footer
      aria-label="Hardware transport deck"
      className="fixed bottom-0 left-0 right-0 z-50 bg-[#0c0d10] border-t border-[#dc2626] hard-drop"
    >
      <div className="max-w-[1440px] mx-auto px-3 md:px-6 h-16 md:h-[72px] flex items-center justify-between gap-3 md:gap-6">
        {/* Track Identity */}
        <div className="flex items-center gap-3 min-w-0 w-[180px] sm:w-[240px] md:w-[280px] shrink-0">
          <div className="w-10 h-10 md:w-12 md:h-12 border border-[#27272a] bg-[#121316] shrink-0 overflow-hidden">
            <img
              src={track.coverUrl}
              alt={track.title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-anton text-[15px] md:text-[18px] leading-tight tracking-[0.03em] text-[#f4f4f5] truncate">
              {track.title}
            </div>
            <div className="flex items-center gap-2 text-[10px] md:text-[11px] font-bold tracking-[0.06em] text-[#a1a1aa] truncate">
              <span className="truncate">{track.artist}</span>
              <span aria-hidden="true">/</span>
              <span className="text-[#f59e0b] tabular-nums shrink-0">{effectiveBpm} BPM</span>
            </div>
          </div>
        </div>

        {/* Transport Controls + Linear Waveform Scrub */}
        <div className="flex items-center gap-2 md:gap-4 flex-1 min-w-0">
          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={onPrev}
              aria-label="Previous track"
              className="w-9 h-9 md:w-10 md:h-10 flex items-center justify-center border border-[#27272a] bg-[#121316] text-[#f4f4f5] hover:border-[#dc2626] hover:bg-[#1a1212] active:bg-[#ffffff] active:text-[#050506] transition-colors duration-100"
            >
              <SkipBack className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onTogglePlay}
              aria-label={isPlaying ? 'Pause playback' : 'Start playback'}
              className="w-10 h-9 md:w-12 md:h-10 flex items-center justify-center bg-[#dc2626] hover:bg-[#ef4444] active:bg-[#ffffff] active:text-[#050506] text-[#f4f4f5] transition-colors duration-100"
            >
              {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
            </button>
            <button
              type="button"
              onClick={onNext}
              aria-label="Next track"
              className="w-9 h-9 md:w-10 md:h-10 flex items-center justify-center border border-[#27272a] bg-[#121316] text-[#f4f4f5] hover:border-[#dc2626] hover:bg-[#1a1212] active:bg-[#ffffff] active:text-[#050506] transition-colors duration-100"
            >
              <SkipForward className="w-4 h-4" />
            </button>
          </div>

          {/* Time Elapsed */}
          <span className="hidden sm:inline-block text-[11px] font-bold tabular-nums text-[#f4f4f5] w-11 text-right shrink-0">
            {formatTime(currentTimeSec)}
          </span>

          {/* Linear Waveform Scrub Meter (No curved caps) */}
          <div
            role="slider"
            tabIndex={0}
            aria-label="Track playback position"
            aria-valuemin={0}
            aria-valuemax={track.durationSec}
            aria-valuenow={currentTimeSec}
            onClick={handleWaveformClick}
            onKeyDown={(e) => {
              if (e.key === 'ArrowRight') onSeek(Math.min(track.durationSec, currentTimeSec + 5));
              if (e.key === 'ArrowLeft') onSeek(Math.max(0, currentTimeSec - 5));
            }}
            className="hidden sm:flex items-end gap-[2px] md:gap-[3px] flex-1 h-9 px-2 py-1.5 bg-[#050506] border border-[#27272a] hover:border-[#dc2626] cursor-pointer transition-colors duration-100"
          >
            {track.waveform.map((peak, idx) => {
              const barRatio = (idx + 1) / track.waveform.length;
              const isPast = barRatio <= progressRatio;
              return (
                <div
                  key={idx}
                  className={`flex-1 transition-colors duration-75 ${
                    isPast ? 'bg-[#dc2626]' : 'bg-[#27272a]'
                  }`}
                  style={{ height: `${Math.max(16, peak)}%` }}
                />
              );
            })}
          </div>

          {/* Total Duration */}
          <span className="hidden sm:inline-block text-[11px] tabular-nums text-[#71717a] w-11 shrink-0">
            {track.durationLabel}
          </span>
        </div>

        {/* Right Controls: Volume + Console Jump */}
        <div className="hidden lg:flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={onToggleMute}
            aria-label={muted ? 'Unmute master output' : 'Mute master output'}
            className="w-9 h-9 flex items-center justify-center border border-[#27272a] bg-[#121316] text-[#f4f4f5] hover:border-[#dc2626] transition-colors duration-100"
          >
            {muted || volume === 0 ? <VolumeX className="w-4 h-4 text-[#ef4444]" /> : <Volume2 className="w-4 h-4" />}
          </button>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={muted ? 0 : volume}
            aria-label="Master output volume"
            onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
            className="concrete-fader w-24"
          />
          <button
            type="button"
            onClick={onOpenConsole}
            className="h-9 px-3 border border-[#27272a] bg-[#121316] hover:border-[#dc2626] hover:bg-[#1a1212] text-[#f4f4f5] text-[11px] font-bold uppercase tracking-[0.08em] flex items-center gap-2 whitespace-nowrap shrink-0 transition-colors duration-100"
          >
            <Sliders className="w-3.5 h-3.5 text-[#f59e0b]" />
            STEMS
          </button>
        </div>
      </div>
    </footer>
  );
};
