import React, { useMemo, useState } from 'react';
import { Play, Pause, Download, Trash2 } from 'lucide-react';
import { LicenseTierId, TrackItem } from '../types/audio';
import { LICENSE_TIERS } from '../data/catalog';

interface VaultScreenProps {
  tracks: TrackItem[];
  savedTrackIds: string[];
  activeTrackId: string;
  isPlaying: boolean;
  onPlayTrack: (trackId: string) => void;
  onToggleSaved: (trackId: string) => void;
  onQueueSelectedToBag: (trackIds: string[], tierId: LicenseTierId) => void;
}

export const VaultScreen: React.FC<VaultScreenProps> = ({
  tracks,
  savedTrackIds,
  activeTrackId,
  isPlaying,
  onPlayTrack,
  onToggleSaved,
  onQueueSelectedToBag,
}) => {
  const [selectedIds, setSelectedIds] = useState<string[]>(() => savedTrackIds.slice(0, 3));
  const [selectedTier, setSelectedTier] = useState<LicenseTierId>('full_stems');
  const [vaultFilter, setVaultFilter] = useState('');
  const [projectName, setProjectName] = useState('');
  const [manifestNotice, setManifestNotice] = useState<string | null>(null);

  const vaultTracks = useMemo(() => {
    const q = vaultFilter.trim().toLowerCase();
    return tracks.filter((t) => {
      if (!savedTrackIds.includes(t.id)) return false;
      if (!q) return true;
      return (
        t.title.toLowerCase().includes(q) ||
        t.artist.toLowerCase().includes(q) ||
        t.genre.toLowerCase().includes(q) ||
        t.musicalKey.toLowerCase().includes(q)
      );
    });
  }, [tracks, savedTrackIds, vaultFilter]);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const allVisibleSelected =
    vaultTracks.length > 0 && vaultTracks.every((t) => selectedIds.includes(t.id));

  const toggleSelectAll = () => {
    if (allVisibleSelected) {
      setSelectedIds((prev) => prev.filter((id) => !vaultTracks.some((t) => t.id === id)));
    } else {
      const merged = new Set([...selectedIds, ...vaultTracks.map((t) => t.id)]);
      setSelectedIds(Array.from(merged));
    }
  };

  const activeTierObj = LICENSE_TIERS.find((l) => l.id === selectedTier) ?? LICENSE_TIERS[2];
  const activeSelectedCount = selectedIds.filter((id) => savedTrackIds.includes(id)).length;
  const totalEstimate = activeSelectedCount * activeTierObj.price;

  const handleBatchQueue = () => {
    const validIds = selectedIds.filter((id) => savedTrackIds.includes(id));
    if (validIds.length === 0) return;
    onQueueSelectedToBag(validIds, selectedTier);
    setManifestNotice(
      `QUEUED ${validIds.length} CUT(S) UNDER ${activeTierObj.label} (${projectName.trim() || 'UNNAMED SESSION'})`
    );
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-[#121316] border border-[#27272a] p-5 md:p-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1.5">
          <div className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#f59e0b]">
            PRODUCER ARCHIVE & BATCH LICENSING
          </div>
          <h1 className="font-anton text-[32px] md:text-[42px] leading-none tracking-[0.03em] text-[#f4f4f5]">
            CRATE VAULT
          </h1>
          <p className="text-xs text-[#a1a1aa] max-w-xl">
            Manage saved cuts, batch-select tracks for stem extraction, and configure licensing rights.
          </p>
        </div>

        <div className="w-full md:w-80">
          <label
            htmlFor="vault-filter-input"
            className="block text-[10px] font-bold uppercase tracking-[0.08em] text-[#71717a] mb-1.5"
          >
            FILTER SAVED VAULT
          </label>
          <input
            id="vault-filter-input"
            type="text"
            value={vaultFilter}
            onChange={(e) => setVaultFilter(e.target.value)}
            placeholder="TYPE TITLE, GENRE, KEY..."
            className="w-full h-11 px-3 bg-[#0a0a0c] border border-[#27272a] focus:border-[#dc2626] focus:outline-none text-xs text-[#f4f4f5] placeholder-[#71717a]"
          />
        </div>
      </div>

      {manifestNotice && (
        <div className="p-4 border border-[#dc2626] bg-[#1a1212] flex flex-wrap items-center justify-between gap-3 hard-drop">
          <span className="text-xs font-bold uppercase tracking-[0.06em] text-[#f4f4f5]">
            {manifestNotice}
          </span>
          <button
            type="button"
            onClick={() => setManifestNotice(null)}
            className="px-3 py-1 bg-[#27272a] text-[10px] font-bold uppercase tracking-[0.08em] text-[#f4f4f5]"
          >
            DISMISS
          </button>
        </div>
      )}

      {/* 12-Col Layout: Left 8 Cols Vault Table, Right 4 Cols License Radio Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Saved Tracks with Brutalist 16x16 Checkboxes */}
        <section aria-label="Saved vault tracks" className="lg:col-span-8 border border-[#27272a] bg-[#050506]">
          <div className="px-4 py-3 bg-[#121316] border-b border-[#27272a] flex items-center justify-between">
            <button
              type="button"
              onClick={toggleSelectAll}
              className="flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.08em] text-[#f4f4f5]"
            >
              {/* 16x16px pure square checkbox */}
              <span
                aria-hidden="true"
                className={`w-4 h-4 border flex items-center justify-center shrink-0 ${
                  allVisibleSelected
                    ? 'bg-[#dc2626] border-[#dc2626]'
                    : 'bg-[#050506] border-[#27272a]'
                }`}
              >
                {allVisibleSelected && <span className="w-2 h-2 bg-[#f4f4f5] block" />}
              </span>
              <span>SELECT ALL ({vaultTracks.length})</span>
            </button>

            <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#f59e0b] tabular-nums">
              {activeSelectedCount} SELECTED
            </span>
          </div>

          {vaultTracks.length === 0 ? (
            <div className="p-10 text-center space-y-2 bg-[#121316]">
              <p className="font-anton text-xl text-[#f4f4f5]">NO SAVED CUTS IN VAULT</p>
              <p className="text-xs text-[#a1a1aa]">
                Bookmark tracks from the Crate Feed or clear your filter query.
              </p>
            </div>
          ) : (
            <div>
              {vaultTracks.map((track) => {
                const checked = selectedIds.includes(track.id);
                const isTrackPlaying = isPlaying && activeTrackId === track.id;

                return (
                  <div
                    key={track.id}
                    className={`min-h-[56px] px-4 py-2.5 border-b border-[#1a1b1f] flex items-center justify-between gap-3 transition-colors ${
                      checked ? 'bg-[#18191e]' : 'bg-[#050506] hover:bg-[#121316]'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {/* 16x16px Square Checkbox */}
                      <button
                        type="button"
                        role="checkbox"
                        aria-checked={checked}
                        aria-label={`Select ${track.title}`}
                        onClick={() => toggleSelect(track.id)}
                        className={`w-4 h-4 border flex items-center justify-center shrink-0 transition-colors ${
                          checked
                            ? 'bg-[#dc2626] border-[#dc2626]'
                            : 'bg-[#050506] border-[#27272a] hover:border-[#dc2626]'
                        }`}
                      >
                        {checked && <span className="w-2 h-2 bg-[#f4f4f5] block" />}
                      </button>

                      <button
                        type="button"
                        onClick={() => onPlayTrack(track.id)}
                        aria-label={isTrackPlaying ? `Pause ${track.title}` : `Play ${track.title}`}
                        className={`w-8 h-8 border flex items-center justify-center shrink-0 ${
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

                      <div className="min-w-0">
                        <div className="text-xs md:text-[13px] font-bold uppercase tracking-[0.03em] text-[#f4f4f5] truncate">
                          {track.title}
                        </div>
                        <div className="text-[11px] text-[#a1a1aa] truncate">
                          {track.artist} · {track.genre} · {track.musicalKey}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className="hidden sm:inline-block px-2 py-0.5 bg-[#121316] border border-[#27272a] text-[11px] font-bold text-[#f59e0b] tabular-nums">
                        {track.bpm} BPM
                      </span>
                      <button
                        type="button"
                        onClick={() => onToggleSaved(track.id)}
                        aria-label={`Remove ${track.title} from vault`}
                        className="w-8 h-8 flex items-center justify-center border border-[#27272a] bg-[#050506] text-[#71717a] hover:text-[#ef4444] hover:border-[#ef4444]"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Right: License Tier Radio Matrix & Batch Export */}
        <aside aria-label="License tier configurator" className="lg:col-span-4 bg-[#121316] border border-[#27272a] p-5 space-y-5">
          <div className="border-b border-[#27272a] pb-3">
            <h2 className="font-anton text-2xl tracking-[0.03em] text-[#f4f4f5]">
              LICENSE TIER MATRIX
            </h2>
            <p className="text-[11px] text-[#a1a1aa] uppercase tracking-[0.05em]">
              APPLY TO {activeSelectedCount} SELECTED CUT(S)
            </p>
          </div>

          <div className="space-y-2.5" role="radiogroup" aria-label="Select license tier">
            {LICENSE_TIERS.map((tier) => {
              const active = selectedTier === tier.id;
              const isExclusive = tier.id === 'exclusive';
              return (
                <button
                  key={tier.id}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => setSelectedTier(tier.id)}
                  className={`w-full p-3.5 border text-left flex items-start gap-3 transition-colors ${
                    active
                      ? 'border-[#dc2626] bg-[#1a1212]'
                      : isExclusive
                      ? 'border-[#ef4444]/60 hazard-stripes hover:border-[#ef4444]'
                      : 'border-[#27272a] bg-[#050506] hover:border-[#52525b]'
                  }`}
                >
                  {/* 16x16px outer square enclosing inner 8x8px solid crimson block */}
                  <span
                    aria-hidden="true"
                    className={`w-4 h-4 mt-0.5 border flex items-center justify-center shrink-0 ${
                      active ? 'border-[#dc2626] bg-[#050506]' : 'border-[#27272a] bg-[#050506]'
                    }`}
                  >
                    {active && <span className="w-2 h-2 bg-[#dc2626] block" />}
                  </span>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold uppercase tracking-[0.06em] text-[#f4f4f5]">
                        {tier.label}
                      </span>
                      <span className="text-xs font-bold text-[#f59e0b] tabular-nums">
                        ${tier.price}
                      </span>
                    </div>
                    <div className="text-[10px] text-[#a1a1aa] uppercase tracking-[0.05em] mt-1">
                      {tier.format}
                    </div>
                    <div className="text-[10px] text-[#71717a] mt-0.5">
                      {tier.rights}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          <div>
            <label
              htmlFor="vault-session-name"
              className="block text-[10px] font-bold uppercase tracking-[0.08em] text-[#a1a1aa] mb-1.5"
            >
              SESSION / RELEASE IDENTIFIER
            </label>
            <input
              id="vault-session-name"
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="E.G. SAN JUAN EP MASTER"
              className="w-full h-11 px-3 bg-[#0a0a0c] border border-[#27272a] focus:border-[#dc2626] focus:outline-none text-xs text-[#f4f4f5] placeholder-[#71717a]"
            />
          </div>

          <div className="pt-2 border-t border-[#27272a] flex items-center justify-between">
            <span className="text-xs uppercase tracking-[0.08em] text-[#a1a1aa]">
              BATCH ESTIMATE
            </span>
            <span className="font-anton text-2xl text-[#f4f4f5] tabular-nums">
              ${totalEstimate} USD
            </span>
          </div>

          <button
            type="button"
            disabled={activeSelectedCount === 0}
            onClick={handleBatchQueue}
            className="tactical-chamfer w-full h-12 bg-[#dc2626] hover:bg-[#ef4444] disabled:bg-[#27272a] disabled:text-[#71717a] active:bg-[#ffffff] active:text-[#050506] text-[#f4f4f5] font-anton text-lg tracking-[0.06em] flex items-center justify-center gap-2 transition-colors"
          >
            <Download className="w-4 h-4" />
            QUEUE SELECTED TO CRATE BAG
          </button>
        </aside>
      </div>
    </div>
  );
};
