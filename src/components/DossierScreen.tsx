import React, { useState } from 'react';
import { Play, Pause, Plus, Check, Sliders, Lock } from 'lucide-react';
import { CrateRelease, TrackItem } from '../types/audio';

interface DossierScreenProps {
  releases: CrateRelease[];
  selectedRelease: CrateRelease;
  tracks: TrackItem[];
  activeTrackId: string;
  isPlaying: boolean;
  bagTrackIds: string[];
  onSelectRelease: (releaseId: string) => void;
  onPlayTrack: (trackId: string) => void;
  onAddToBag: (trackId: string) => void;
  onOpenConsoleForTrack: (trackId: string) => void;
}

export const DossierScreen: React.FC<DossierScreenProps> = ({
  releases,
  selectedRelease,
  tracks,
  activeTrackId,
  isPlaying,
  bagTrackIds,
  onSelectRelease,
  onPlayTrack,
  onAddToBag,
  onOpenConsoleForTrack,
}) => {
  const [exclusiveLockArmed, setExclusiveLockArmed] = useState(false);

  const releaseTracks = tracks.filter((t) => t.releaseId === selectedRelease.id);
  const leadTrack = releaseTracks[0] ?? tracks[0];

  return (
    <div className="space-y-8">
      {/* Release Switcher Strip */}
      <div className="flex flex-wrap items-center gap-2 border-b border-[#27272a] pb-4">
        {releases.map((rel) => {
          const active = rel.id === selectedRelease.id;
          return (
            <button
              key={rel.id}
              type="button"
              onClick={() => {
                setExclusiveLockArmed(false);
                onSelectRelease(rel.id);
              }}
              className={`h-10 px-4 text-xs font-bold uppercase tracking-[0.08em] border whitespace-nowrap shrink-0 transition-colors ${
                active
                  ? 'bg-[#dc2626] border-[#dc2626] text-[#f4f4f5]'
                  : 'bg-[#121316] border-[#27272a] text-[#a1a1aa] hover:border-[#dc2626] hover:text-[#f4f4f5]'
              }`}
            >
              {rel.code} · {rel.title}
            </button>
          );
        })}
      </div>

      {/* Main Dossier Split */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-5 border border-[#27272a] bg-[#050506]">
          <div className="aspect-square overflow-hidden">
            <img
              src={selectedRelease.coverUrl}
              alt={selectedRelease.title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        <div className="lg:col-span-7 bg-[#121316] border border-[#27272a] p-6 md:p-8 flex flex-col justify-between gap-6">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3 text-[11px] font-bold uppercase tracking-[0.08em]">
              <span className="text-[#f59e0b]">{selectedRelease.code}</span>
              <span className="text-[#71717a]">/</span>
              <span className="text-[#d4d4d8]">{selectedRelease.city}</span>
              <span className="text-[#71717a]">/</span>
              <span className="text-[#a1a1aa]">{selectedRelease.year}</span>
            </div>

            <h1 className="font-anton text-[36px] md:text-[48px] leading-none tracking-[0.02em] text-[#f4f4f5]">
              {selectedRelease.title}
            </h1>

            <p className="text-[13px] md:text-[15px] leading-relaxed text-[#d4d4d8]">
              {selectedRelease.description}
            </p>
          </div>

          <div className="space-y-5">
            <div className="grid grid-cols-2 sm:grid-cols-4 border border-[#27272a] bg-[#050506]">
              <div className="p-3 border-b sm:border-b-0 border-r border-[#27272a]">
                <div className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#71717a]">
                  PRODUCER
                </div>
                <div className="text-xs font-bold text-[#f4f4f5] mt-1 truncate">
                  {selectedRelease.producer}
                </div>
              </div>
              <div className="p-3 border-b sm:border-b-0 sm:border-r border-[#27272a]">
                <div className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#71717a]">
                  BPM RANGE
                </div>
                <div className="text-xs font-bold text-[#f59e0b] tabular-nums mt-1">
                  {selectedRelease.bpmRange}
                </div>
              </div>
              <div className="p-3 border-r border-[#27272a]">
                <div className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#71717a]">
                  SAMPLE RATE
                </div>
                <div className="text-xs font-bold text-[#f4f4f5] mt-1">
                  {selectedRelease.format}
                </div>
              </div>
              <div className="p-3">
                <div className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#71717a]">
                  LOUDNESS
                </div>
                <div className="text-xs font-bold text-[#f59e0b] tabular-nums mt-1">
                  {selectedRelease.lufsTarget}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => onPlayTrack(leadTrack.id)}
                className="tactical-chamfer h-12 px-6 bg-[#dc2626] hover:bg-[#ef4444] active:bg-[#ffffff] active:text-[#050506] text-[#f4f4f5] font-anton text-lg tracking-[0.05em] flex items-center gap-2 whitespace-nowrap shrink-0"
              >
                {isPlaying && activeTrackId === leadTrack.id ? (
                  <Pause className="w-4 h-4 fill-current" />
                ) : (
                  <Play className="w-4 h-4 fill-current" />
                )}
                AUDITION LEAD CUT
              </button>

              {/* Diagonal hazard striping destructive/live cue button */}
              <button
                type="button"
                onClick={() => {
                  setExclusiveLockArmed((prev) => !prev);
                  releaseTracks.forEach((t) => onAddToBag(t.id));
                }}
                className={`h-12 px-5 border border-[#ef4444] text-xs font-bold uppercase tracking-[0.08em] flex items-center gap-2 whitespace-nowrap shrink-0 transition-colors ${
                  exclusiveLockArmed
                    ? 'bg-[#ef4444] text-[#050506]'
                    : 'hazard-stripes text-[#f4f4f5] hover:bg-[#1a1212]'
                }`}
              >
                <Lock className="w-4 h-4" />
                {exclusiveLockArmed ? 'FULL RELEASE QUEUED IN BAG' : 'LOCK FULL RELEASE STEMS'}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Release Tracklist & Stem Architecture */}
      <section aria-label="Release tracklist" className="space-y-4">
        <div className="flex items-end justify-between border-b border-[#27272a] pb-2">
          <h2 className="font-anton text-2xl md:text-3xl tracking-[0.03em] text-[#f4f4f5]">
            MASTER TRACKLIST & STEM BREAKDOWN
          </h2>
          <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#a1a1aa]">
            {releaseTracks.length} CUTS
          </span>
        </div>

        <div className="space-y-4">
          {releaseTracks.map((track) => {
            const isCurrent = track.id === activeTrackId;
            const isTrackPlaying = isCurrent && isPlaying;
            const inBag = bagTrackIds.includes(track.id);

            return (
              <div
                key={track.id}
                className={`border p-4 md:p-5 space-y-4 transition-colors ${
                  isCurrent
                    ? 'border-[#dc2626] bg-[#18191e]'
                    : 'border-[#27272a] bg-[#121316]'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-sm font-bold tabular-nums text-[#71717a]">
                      {track.index}
                    </span>
                    <button
                      type="button"
                      onClick={() => onPlayTrack(track.id)}
                      aria-label={isTrackPlaying ? `Pause ${track.title}` : `Play ${track.title}`}
                      className={`w-10 h-10 border flex items-center justify-center shrink-0 ${
                        isTrackPlaying
                          ? 'bg-[#dc2626] border-[#dc2626] text-[#f4f4f5]'
                          : 'bg-[#050506] border-[#27272a] text-[#f4f4f5] hover:border-[#dc2626]'
                      }`}
                    >
                      {isTrackPlaying ? (
                        <Pause className="w-4 h-4 fill-current" />
                      ) : (
                        <Play className="w-4 h-4 fill-current" />
                      )}
                    </button>
                    <div className="min-w-0">
                      <h3 className="font-anton text-xl md:text-2xl leading-none tracking-[0.03em] text-[#f4f4f5]">
                        {track.title}
                      </h3>
                      <div className="text-[11px] text-[#a1a1aa] uppercase tracking-[0.06em] mt-1">
                        {track.genre} · KEY {track.musicalKey} ·{' '}
                        <span className="text-[#f59e0b] tabular-nums">{track.bpm} BPM</span> ·{' '}
                        <span className="tabular-nums">{track.durationLabel}</span> · {track.lufs}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => onOpenConsoleForTrack(track.id)}
                      className="h-9 px-3 border border-[#27272a] bg-[#050506] hover:border-[#dc2626] text-[11px] font-bold uppercase tracking-[0.08em] text-[#f4f4f5] flex items-center gap-1.5"
                    >
                      <Sliders className="w-3.5 h-3.5 text-[#f59e0b]" />
                      OPEN IN CONSOLE
                    </button>
                    <button
                      type="button"
                      onClick={() => onAddToBag(track.id)}
                      className={`h-9 px-3.5 text-[11px] font-bold uppercase tracking-[0.08em] flex items-center gap-1.5 ${
                        inBag
                          ? 'bg-[#27272a] border border-[#f59e0b] text-[#f59e0b]'
                          : 'bg-[#dc2626] hover:bg-[#ef4444] text-[#f4f4f5]'
                      }`}
                    >
                      {inBag ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                      {inBag ? 'IN CRATE BAG' : 'ADD TO CRATE'}
                    </button>
                  </div>
                </div>

                {/* 4 Stem Notes */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 pt-2 border-t border-[#27272a]">
                  {track.stemNotes.map((note, idx) => (
                    <div
                      key={idx}
                      className="px-3 py-2 bg-[#050506] border border-[#27272a] text-[11px] text-[#d4d4d8]"
                    >
                      <span className="text-[#71717a] font-bold mr-2">S0{idx + 1}</span>
                      <span>{note}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
