import React, { useMemo, useState } from 'react';
import { Play, Pause, Plus, Check, Sliders, Search, ArrowUpRight } from 'lucide-react';
import { CrateRelease, GenreCategory, TrackItem } from '../types/audio';
import { HERO_STUDIO_IMAGE } from '../data/catalog';

interface CratesScreenProps {
  releases: CrateRelease[];
  tracks: TrackItem[];
  activeTrackId: string;
  isPlaying: boolean;
  bagTrackIds: string[];
  onPlayTrack: (trackId: string) => void;
  onAddToBag: (trackId: string) => void;
  onOpenDossier: (releaseId: string) => void;
  onOpenConsoleForTrack: (trackId: string) => void;
}

const FILTER_TABS: GenreCategory[] = [
  'ALL',
  'LATIN TRAP',
  'REGGAETON',
  'DEMBOW',
  'PERREO OSCURO',
  'STEMS READY',
];

export const CratesScreen: React.FC<CratesScreenProps> = ({
  releases,
  tracks,
  activeTrackId,
  isPlaying,
  bagTrackIds,
  onPlayTrack,
  onAddToBag,
  onOpenDossier,
  onOpenConsoleForTrack,
}) => {
  const [selectedGenre, setSelectedGenre] = useState<GenreCategory>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const featuredRelease = releases[0];
  const featuredTrack = tracks[0];
  const isFeaturedPlaying = isPlaying && activeTrackId === featuredTrack.id;

  const filteredTracks = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return tracks.filter((t) => {
      const matchesGenre =
        selectedGenre === 'ALL'
          ? true
          : selectedGenre === 'STEMS READY'
          ? t.stemsReady
          : t.genre === selectedGenre;
      const matchesQuery =
        !q ||
        t.title.toLowerCase().includes(q) ||
        t.artist.toLowerCase().includes(q) ||
        t.musicalKey.toLowerCase().includes(q) ||
        String(t.bpm).includes(q);
      return matchesGenre && matchesQuery;
    });
  }, [tracks, selectedGenre, searchQuery]);

  return (
    <div className="space-y-10">
      {/* 1. HERO DROP SLAB — 12-col rigid split with items-stretch */}
      <section aria-label="Featured drop" className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
        <div className="lg:col-span-7 bg-[#121316] border border-[#27272a] p-6 md:p-8 flex flex-col justify-between gap-6">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3 text-[11px] font-bold uppercase tracking-[0.08em] text-[#a1a1aa]">
              <span className="text-[#f59e0b]">FEATURED MASTER DROP</span>
              <span aria-hidden="true">/</span>
              <span>{featuredRelease.code}</span>
              <span aria-hidden="true">/</span>
              <span>{featuredRelease.city}</span>
            </div>

            <h1 className="font-anton text-[40px] sm:text-[52px] md:text-[56px] leading-[1.0] tracking-[0.02em] text-[#f4f4f5] max-w-xl">
              RAW STREET CUTS. ZERO COMPROMISE.
            </h1>

            <p className="text-[13px] md:text-[15px] leading-[1.55] text-[#d4d4d8] max-w-xl">
              {featuredRelease.description}
            </p>
          </div>

          <div className="space-y-5">
            <div className="grid grid-cols-3 border border-[#27272a] bg-[#050506]">
              <div className="p-3 border-r border-[#27272a]">
                <div className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#71717a]">
                  MASTER FORMAT
                </div>
                <div className="text-xs md:text-sm font-bold text-[#f4f4f5] mt-1">
                  48KHZ / 24-BIT
                </div>
              </div>
              <div className="p-3 border-r border-[#27272a]">
                <div className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#71717a]">
                  TEMPO WINDOW
                </div>
                <div className="text-xs md:text-sm font-bold text-[#f59e0b] tabular-nums mt-1">
                  {featuredRelease.bpmRange}
                </div>
              </div>
              <div className="p-3">
                <div className="text-[10px] font-bold uppercase tracking-[0.08em] text-[#71717a]">
                  ISOLATED STEMS
                </div>
                <div className="text-xs md:text-sm font-bold text-[#f4f4f5] tabular-nums mt-1">
                  48 CHANNELS
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => onPlayTrack(featuredTrack.id)}
                className="tactical-chamfer h-12 px-6 bg-[#dc2626] hover:bg-[#ef4444] active:bg-[#ffffff] active:text-[#050506] text-[#f4f4f5] font-anton text-lg tracking-[0.05em] flex items-center gap-2.5 whitespace-nowrap shrink-0 transition-colors duration-100"
              >
                {isFeaturedPlaying ? (
                  <Pause className="w-4 h-4 fill-current" />
                ) : (
                  <Play className="w-4 h-4 fill-current" />
                )}
                {isFeaturedPlaying ? 'PAUSE FEATURED CUT' : 'PLAY FEATURED CUT'}
              </button>

              <button
                type="button"
                onClick={() => onOpenDossier(featuredRelease.id)}
                className="h-12 px-5 bg-transparent border border-[#27272a] hover:border-[#dc2626] hover:bg-[#1a1212] text-[#f4f4f5] text-xs font-bold uppercase tracking-[0.08em] flex items-center gap-2 whitespace-nowrap shrink-0 transition-colors duration-100"
              >
                OPEN RELEASE DOSSIER
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 border border-[#27272a] bg-[#0a0a0c] flex flex-col justify-between overflow-hidden">
          <div className="relative flex-1 min-h-[260px] lg:min-h-0 overflow-hidden bg-[#050506]">
            <img
              src={HERO_STUDIO_IMAGE}
              alt="Concrete Heat underground mastering studio in San Juan"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#050506]/85 via-transparent to-transparent pointer-events-none" />
            <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-[11px] font-bold uppercase tracking-[0.08em] text-[#f4f4f5]">
              <span>{featuredRelease.producer}</span>
              <span className="text-[#f59e0b] tabular-nums">{featuredRelease.lufsTarget}</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. ALBUM & CRATE TILE GRID */}
      <section aria-label="Crate releases" className="space-y-4">
        <div className="flex items-end justify-between border-b border-[#27272a] pb-3">
          <h2 className="font-anton text-[28px] md:text-[36px] leading-none tracking-[0.03em] text-[#f4f4f5]">
            CRATE RELEASES
          </h2>
          <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#a1a1aa] tabular-nums">
            04 VOLUMES · 24-BIT MASTERS
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {releases.map((rel) => {
            const leadTrack = tracks.find((t) => t.releaseId === rel.id) ?? tracks[0];
            const relPlaying = isPlaying && leadTrack.id === activeTrackId;
            return (
              <article
                key={rel.id}
                className="border border-[#27272a] bg-[#121316] hover:border-[#dc2626] transition-colors duration-100 flex flex-col"
              >
                <div className="relative aspect-square bg-[#050506] border-b border-[#27272a] overflow-hidden group">
                  <img
                    src={rel.coverUrl}
                    alt={rel.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-[1.03]"
                  />
                  <button
                    type="button"
                    onClick={() => onPlayTrack(leadTrack.id)}
                    aria-label={relPlaying ? `Pause ${rel.title}` : `Play ${rel.title}`}
                    className="absolute bottom-3 right-3 w-11 h-11 bg-[#dc2626] hover:bg-[#ef4444] active:bg-[#ffffff] active:text-[#050506] text-[#f4f4f5] flex items-center justify-center hard-drop transition-colors duration-100"
                  >
                    {relPlaying ? (
                      <Pause className="w-4 h-4 fill-current" />
                    ) : (
                      <Play className="w-4 h-4 fill-current" />
                    )}
                  </button>
                </div>

                <div className="p-4 flex-1 flex flex-col justify-between gap-3">
                  <div>
                    <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.08em] text-[#a1a1aa] mb-1">
                      <span>{rel.code}</span>
                      <span className="text-[#f59e0b] tabular-nums">{rel.bpmRange}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => onOpenDossier(rel.id)}
                      className="font-anton text-[20px] leading-tight tracking-[0.03em] text-[#f4f4f5] hover:text-[#dc2626] text-left transition-colors"
                    >
                      {rel.title}
                    </button>
                    <div className="text-[11px] text-[#a1a1aa] mt-1 truncate">
                      {rel.producer}
                    </div>
                  </div>

                  <div className="pt-2.5 border-t border-[#1a1b1f] flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.08em]">
                    <span className="text-[#71717a]">{rel.format}</span>
                    <button
                      type="button"
                      onClick={() => onOpenDossier(rel.id)}
                      className="text-[#f4f4f5] hover:text-[#dc2626] whitespace-nowrap shrink-0"
                    >
                      INSPECT CRATE →
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* 3. FILTER BAR + TERMINAL SEARCH + 56PX AUDIO TRACK ROWS */}
      <section aria-label="Track catalog" className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#27272a] pb-4">
          <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Filter tracks by genre">
            {FILTER_TABS.map((cat) => {
              const active = selectedGenre === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedGenre(cat)}
                  className={`h-9 px-3 text-[11px] font-bold uppercase tracking-[0.08em] whitespace-nowrap shrink-0 transition-colors duration-100 ${
                    active
                      ? 'bg-[#dc2626] text-[#f4f4f5]'
                      : 'bg-[#27272a] text-[#d4d4d8] hover:bg-[#353437]'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          <div className="relative w-full md:w-72 shrink-0">
            <Search
              aria-hidden="true"
              className="w-4 h-4 text-[#71717a] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="SEARCH TITLE, BPM, KEY..."
              aria-label="Search tracks by title, artist, BPM, or key"
              className="w-full h-11 pl-9 pr-3 bg-[#0a0a0c] border border-[#27272a] focus:border-[#dc2626] focus:outline-none text-xs text-[#f4f4f5] placeholder-[#71717a]"
            />
          </div>
        </div>

        {/* Column Header */}
        <div className="hidden md:grid grid-cols-12 gap-3 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.1em] text-[#71717a] border-b border-[#27272a]">
          <div className="col-span-1">#</div>
          <div className="col-span-4">CUT / PRODUCER</div>
          <div className="col-span-2">GENRE</div>
          <div className="col-span-1 text-right">KEY</div>
          <div className="col-span-1 text-right">BPM</div>
          <div className="col-span-1 text-right">TIME</div>
          <div className="col-span-2 text-right">ACTIONS</div>
        </div>

        {/* Audio Row Units (56px height) */}
        <div className="border-t border-[#1a1b1f]">
          {filteredTracks.length === 0 ? (
            <div className="p-8 bg-[#121316] border border-[#27272a] text-center space-y-2">
              <p className="font-anton text-xl text-[#f4f4f5]">NO MATCHING CUTS FOUND</p>
              <p className="text-xs text-[#a1a1aa]">
                Clear the search query or switch genre filters to inspect all 12 master tracks.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSelectedGenre('ALL');
                  setSearchQuery('');
                }}
                className="mt-2 h-9 px-4 bg-[#dc2626] text-[#f4f4f5] text-[11px] font-bold uppercase tracking-[0.08em]"
              >
                RESET FILTERS
              </button>
            </div>
          ) : (
            filteredTracks.map((track) => {
              const isCurrent = track.id === activeTrackId;
              const isTrackPlaying = isCurrent && isPlaying;
              const inBag = bagTrackIds.includes(track.id);

              return (
                <div
                  key={track.id}
                  className={`min-h-[56px] px-3 py-2 border-b border-[#1a1b1f] grid grid-cols-12 gap-2 md:gap-3 items-center transition-colors duration-100 ${
                    isCurrent
                      ? 'bg-[#18191e] border-b-[#dc2626]'
                      : 'bg-[#050506] hover:bg-[#18191e]'
                  }`}
                >
                  {/* Index + Play */}
                  <div className="col-span-2 md:col-span-1 flex items-center gap-2">
                    <span
                      className={`text-xs font-bold tabular-nums w-5 ${
                        isCurrent ? 'text-[#dc2626]' : 'text-[#71717a]'
                      }`}
                    >
                      {track.index}
                    </span>
                    <button
                      type="button"
                      onClick={() => onPlayTrack(track.id)}
                      aria-label={isTrackPlaying ? `Pause ${track.title}` : `Play ${track.title}`}
                      className={`w-8 h-8 flex items-center justify-center border transition-colors duration-100 ${
                        isTrackPlaying
                          ? 'bg-[#dc2626] border-[#dc2626] text-[#f4f4f5]'
                          : 'bg-[#121316] border-[#27272a] text-[#f4f4f5] hover:border-[#dc2626]'
                      }`}
                    >
                      {isTrackPlaying ? (
                        <Pause className="w-3.5 h-3.5 fill-current" />
                      ) : (
                        <Play className="w-3.5 h-3.5 fill-current" />
                      )}
                    </button>
                  </div>

                  {/* Title & Artist */}
                  <div className="col-span-7 md:col-span-4 min-w-0">
                    <div className="text-xs md:text-[13px] font-bold uppercase tracking-[0.03em] text-[#f4f4f5] truncate">
                      {track.title}
                    </div>
                    <div className="text-[11px] text-[#a1a1aa] truncate">
                      {track.artist} · {track.sampleRate}
                    </div>
                  </div>

                  {/* Genre */}
                  <div className="hidden md:block col-span-2 text-[11px] font-bold uppercase tracking-[0.06em] text-[#d4d4d8] truncate">
                    {track.genre}
                  </div>

                  {/* Key */}
                  <div className="hidden md:block col-span-1 text-right text-xs font-bold text-[#f4f4f5] tabular-nums">
                    {track.musicalKey}
                  </div>

                  {/* BPM */}
                  <div className="col-span-3 md:col-span-1 text-right">
                    <span className="inline-block px-2 py-0.5 bg-[#121316] border border-[#27272a] text-[11px] font-bold text-[#f59e0b] tabular-nums">
                      {track.bpm}
                    </span>
                  </div>

                  {/* Duration */}
                  <div className="hidden md:block col-span-1 text-right text-xs text-[#a1a1aa] tabular-nums">
                    {track.durationLabel}
                  </div>

                  {/* Actions */}
                  <div className="col-span-12 md:col-span-2 flex items-center justify-end gap-1.5 pt-1 md:pt-0">
                    <button
                      type="button"
                      onClick={() => onOpenConsoleForTrack(track.id)}
                      title="Open in Stems Console"
                      className="h-8 px-2.5 bg-[#121316] border border-[#27272a] hover:border-[#dc2626] text-[#f4f4f5] text-[10px] font-bold uppercase tracking-[0.06em] flex items-center gap-1 whitespace-nowrap shrink-0"
                    >
                      <Sliders className="w-3 h-3 text-[#f59e0b]" />
                      STEMS
                    </button>
                    <button
                      type="button"
                      onClick={() => onAddToBag(track.id)}
                      className={`h-8 px-2.5 text-[10px] font-bold uppercase tracking-[0.06em] flex items-center gap-1 whitespace-nowrap shrink-0 transition-colors ${
                        inBag
                          ? 'bg-[#27272a] text-[#f59e0b] border border-[#f59e0b]'
                          : 'bg-[#dc2626] hover:bg-[#ef4444] text-[#f4f4f5]'
                      }`}
                    >
                      {inBag ? <Check className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                      {inBag ? 'QUEUED' : 'CRATE'}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>
    </div>
  );
};
