import React from 'react';
import { ScreenId } from '../types/audio';

interface TopBarProps {
  activeScreen: ScreenId;
  onNavigate: (screen: ScreenId) => void;
  bagCount: number;
  onOpenBag: () => void;
}

const NAV_ITEMS: { id: ScreenId; label: string }[] = [
  { id: 'crates', label: 'Crates' },
  { id: 'console', label: 'Console' },
  { id: 'vault', label: 'Vault' },
  { id: 'dossier', label: 'Dossier' },
];

export const TopBar: React.FC<TopBarProps> = ({
  activeScreen,
  onNavigate,
  bagCount,
  onOpenBag,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full bg-[#050506] border-b border-[#27272a]">
      <div className="max-w-[1440px] mx-auto px-4 md:px-6 h-14 md:h-16 flex items-center justify-between gap-4 md:gap-8">
        {/* Zone 1: Brand Title (Single text element, one line) */}
        <button
          type="button"
          onClick={() => onNavigate('crates')}
          className="font-anton text-2xl md:text-[28px] leading-none tracking-[0.04em] text-[#f4f4f5] hover:text-[#dc2626] transition-colors duration-150 whitespace-nowrap shrink-0 text-left"
        >
          CONCRETE HEAT
        </button>

        {/* Zone 2: 4 concise single-line nav links */}
        <nav
          aria-label="Primary navigation"
          className="flex items-center gap-4 md:gap-8 overflow-x-auto no-scrollbar"
        >
          {NAV_ITEMS.map((item) => {
            const isActive = activeScreen === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onNavigate(item.id)}
                className={`relative py-2 text-[11px] md:text-[13px] font-bold uppercase tracking-[0.08em] whitespace-nowrap shrink-0 transition-colors duration-150 ${
                  isActive
                    ? 'text-[#f4f4f5]'
                    : 'text-[#a1a1aa] hover:text-[#f4f4f5]'
                }`}
              >
                {item.label}
                {isActive && (
                  <span
                    aria-hidden="true"
                    className="absolute left-0 right-0 bottom-0 h-[2px] bg-[#dc2626]"
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="shrink-0">
          <button
            type="button"
            onClick={onOpenBag}
            className="tactical-chamfer-sm px-3.5 md:px-5 h-9 md:h-10 bg-[#dc2626] hover:bg-[#ef4444] active:bg-[#ffffff] active:text-[#050506] text-[#f4f4f5] text-[11px] md:text-[12px] font-bold uppercase tracking-[0.08em] whitespace-nowrap shrink-0 transition-colors duration-100"
          >
            CRATE BAG ({bagCount})
          </button>
        </div>
      </div>
    </header>
  );
};
