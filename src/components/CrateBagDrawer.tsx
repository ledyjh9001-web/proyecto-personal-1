import React, { useState } from 'react';
import { X, Trash2, CheckSquare } from 'lucide-react';
import { CrateBagItem, LicenseTierId, TrackItem } from '../types/audio';
import { LICENSE_TIERS } from '../data/catalog';

interface CrateBagDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CrateBagItem[];
  tracks: TrackItem[];
  onRemoveItem: (trackId: string) => void;
  onChangeTier: (trackId: string, tierId: LicenseTierId) => void;
  onClearBag: () => void;
}

export const CrateBagDrawer: React.FC<CrateBagDrawerProps> = ({
  isOpen,
  onClose,
  items,
  tracks,
  onRemoveItem,
  onChangeTier,
  onClearBag,
}) => {
  const [artistHandle, setArtistHandle] = useState('');
  const [confirmedReceipt, setConfirmedReceipt] = useState<string | null>(null);

  if (!isOpen) return null;

  const resolvedItems = items
    .map((bagItem) => {
      const track = tracks.find((t) => t.id === bagItem.trackId);
      const tier = LICENSE_TIERS.find((l) => l.id === bagItem.tierId) ?? LICENSE_TIERS[2];
      return track ? { bagItem, track, tier } : null;
    })
    .filter((x): x is NonNullable<typeof x> => x !== null);

  const subtotal = resolvedItems.reduce((sum, entry) => sum + entry.tier.price, 0);

  const handleConfirmManifest = (e: React.FormEvent) => {
    e.preventDefault();
    if (resolvedItems.length === 0) return;
    const orderCode = `CH-${Math.floor(100000 + Math.random() * 899999)}`;
    setConfirmedReceipt(
      `MANIFEST ${orderCode} LOCKED FOR ${artistHandle.trim() || 'STUDIO SESSION'} · ${resolvedItems.length} CUT(S) · $${subtotal} USD`
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/75"
      role="dialog"
      aria-modal="true"
      aria-label="Crate bag and stem export"
    >
      <div className="w-full max-w-md bg-[#0a0a0c] border-l border-[#dc2626] h-full flex flex-col hard-drop">
        {/* Header */}
        <div className="px-5 py-4 bg-[#121316] border-b border-[#27272a] flex items-center justify-between">
          <div>
            <h2 className="font-anton text-2xl tracking-[0.03em] text-[#f4f4f5]">
              CRATE BAG
            </h2>
            <p className="text-[11px] text-[#a1a1aa] uppercase tracking-[0.06em]">
              {resolvedItems.length} CUTS QUEUED · ZERO-LOSS STEMS
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close crate bag"
            className="w-10 h-10 flex items-center justify-center border border-[#27272a] bg-[#050506] text-[#f4f4f5] hover:border-[#dc2626] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {confirmedReceipt && (
            <div className="p-4 border border-[#f59e0b] bg-[#121316] space-y-2">
              <div className="flex items-center gap-2 text-[#f59e0b] text-xs font-bold tracking-[0.08em]">
                <CheckSquare className="w-4 h-4" />
                <span>LICENSE & STEM MANIFEST GENERATED</span>
              </div>
              <p className="text-xs text-[#f4f4f5] leading-relaxed">{confirmedReceipt}</p>
              <button
                type="button"
                onClick={() => {
                  setConfirmedReceipt(null);
                  onClearBag();
                }}
                className="px-3 py-1.5 bg-[#27272a] hover:bg-[#dc2626] text-[#f4f4f5] text-[11px] font-bold uppercase tracking-[0.08em]"
              >
                RESET QUEUE
              </button>
            </div>
          )}

          {resolvedItems.length === 0 ? (
            <div className="p-8 border border-[#27272a] bg-[#121316] text-center space-y-3">
              <p className="font-anton text-xl tracking-[0.03em] text-[#f4f4f5]">
                CRATE BAG EMPTY
              </p>
              <p className="text-xs text-[#a1a1aa] leading-relaxed">
                Select tracks from the Crate Feed or Vault to queue 24-bit WAV masters and isolated stems.
              </p>
            </div>
          ) : (
            resolvedItems.map(({ bagItem, track, tier }) => (
              <div
                key={track.id}
                className="p-3.5 border border-[#27272a] bg-[#121316] space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={track.coverUrl}
                      alt={track.title}
                      referrerPolicy="no-referrer"
                      className="w-12 h-12 object-cover border border-[#27272a] shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="font-anton text-lg leading-tight text-[#f4f4f5] truncate">
                        {track.title}
                      </div>
                      <div className="text-[11px] text-[#a1a1aa] uppercase tracking-[0.05em]">
                        {track.artist} · <span className="text-[#f59e0b]">{track.bpm} BPM</span> · {track.musicalKey}
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => onRemoveItem(track.id)}
                    aria-label={`Remove ${track.title} from crate bag`}
                    className="w-8 h-8 flex items-center justify-center border border-[#27272a] bg-[#050506] text-[#a1a1aa] hover:text-[#ef4444] hover:border-[#ef4444] shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Tier Selector */}
                <div className="grid grid-cols-2 gap-1.5">
                  {LICENSE_TIERS.map((option) => {
                    const selected = option.id === tier.id;
                    return (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => onChangeTier(track.id, option.id)}
                        className={`px-2.5 py-2 text-left border transition-colors duration-100 ${
                          selected
                            ? 'border-[#dc2626] bg-[#1a1212] text-[#f4f4f5]'
                            : 'border-[#27272a] bg-[#050506] text-[#a1a1aa] hover:border-[#52525b]'
                        }`}
                      >
                        <div className="text-[10px] font-bold tracking-[0.06em] truncate">
                          {option.label}
                        </div>
                        <div className="text-[11px] font-bold text-[#f59e0b] tabular-nums">
                          ${option.price}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Checkout */}
        <form onSubmit={handleConfirmManifest} className="p-5 bg-[#121316] border-t border-[#27272a] space-y-3">
          <div>
            <label
              htmlFor="crate-artist-input"
              className="block text-[10px] font-bold uppercase tracking-[0.08em] text-[#a1a1aa] mb-1.5"
            >
              LICENSEE / ARTIST CREDIT
            </label>
            <input
              id="crate-artist-input"
              type="text"
              value={artistHandle}
              onChange={(e) => setArtistHandle(e.target.value)}
              placeholder="ENTER STUDIO OR ARTIST NAME"
              className="w-full h-11 px-3 bg-[#0a0a0c] border border-[#27272a] focus:border-[#dc2626] focus:outline-none text-xs text-[#f4f4f5] placeholder-[#71717a]"
            />
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-xs uppercase tracking-[0.08em] text-[#a1a1aa]">
              TOTAL LICENSING
            </span>
            <span className="font-anton text-2xl tracking-[0.03em] text-[#f4f4f5] tabular-nums">
              ${subtotal} USD
            </span>
          </div>

          <button
            type="submit"
            disabled={resolvedItems.length === 0}
            className="tactical-chamfer w-full h-12 bg-[#dc2626] hover:bg-[#ef4444] disabled:bg-[#27272a] disabled:text-[#71717a] active:bg-[#ffffff] active:text-[#050506] text-[#f4f4f5] font-anton text-lg tracking-[0.06em] transition-colors duration-100"
          >
            LOCK LICENSE & EXPORT STEMS
          </button>
        </form>
      </div>
    </div>
  );
};
