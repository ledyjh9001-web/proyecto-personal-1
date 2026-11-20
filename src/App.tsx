import { useEffect, useMemo, useState } from 'react';
import {
  CRATE_RELEASES,
  DEFAULT_STEM_CHANNELS,
  TRACK_CATALOG,
} from './data/catalog';
import {
  CrateBagItem,
  LicenseTierId,
  ScreenId,
  StemChannelKey,
  StemChannelState,
  TrackPattern,
} from './types/audio';
import { audioEngine } from './audio/synthEngine';
import { TopBar } from './components/TopBar';
import { CratesScreen } from './components/CratesScreen';
import { ConsoleScreen } from './components/ConsoleScreen';
import { VaultScreen } from './components/VaultScreen';
import { DossierScreen } from './components/DossierScreen';
import { TransportDeck } from './components/TransportDeck';
import { CrateBagDrawer } from './components/CrateBagDrawer';

export default function App() {
  const [activeScreen, setActiveScreen] = useState<ScreenId>('crates');
  const [selectedReleaseId, setSelectedReleaseId] = useState<string>(CRATE_RELEASES[0].id);
  const [activeTrackId, setActiveTrackId] = useState<string>(TRACK_CATALOG[0].id);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTimeSec, setCurrentTimeSec] = useState<number>(0);
  const [currentStep, setCurrentStep] = useState<number>(0);

  const [stemChannels, setStemChannels] = useState<StemChannelState[]>(DEFAULT_STEM_CHANNELS);
  const [tempoMultiplier, setTempoMultiplier] = useState<number>(1);
  const [limiterActive, setLimiterActive] = useState<boolean>(true);
  const [volume, setVolume] = useState<number>(0.85);
  const [muted, setMuted] = useState<boolean>(false);

  const [customPatterns, setCustomPatterns] = useState<Record<string, TrackPattern>>({});
  const [savedTrackIds, setSavedTrackIds] = useState<string[]>([
    'trk-01',
    'trk-02',
    'trk-04',
    'trk-07',
    'trk-10',
  ]);
  const [bagItems, setBagItems] = useState<CrateBagItem[]>([
    { trackId: 'trk-01', tierId: 'full_stems', addedAt: '2026-11-20' },
  ]);
  const [isBagOpen, setIsBagOpen] = useState<boolean>(false);

  const activeTrack = useMemo(
    () => TRACK_CATALOG.find((t) => t.id === activeTrackId) ?? TRACK_CATALOG[0],
    [activeTrackId]
  );

  const activePattern = customPatterns[activeTrack.id] ?? activeTrack.pattern;

  const selectedRelease = useMemo(
    () => CRATE_RELEASES.find((r) => r.id === selectedReleaseId) ?? CRATE_RELEASES[0],
    [selectedReleaseId]
  );

  // Sync engine step indicator
  useEffect(() => {
    return audioEngine.subscribeStep((step) => {
      setCurrentStep(step);
    });
  }, []);

  // Sync audio engine parameters whenever track/pattern/stems/tempo change
  useEffect(() => {
    audioEngine.setBpm(activeTrack.bpm);
    audioEngine.setPattern(activePattern);
  }, [activeTrack, activePattern]);

  useEffect(() => {
    audioEngine.updateStems(stemChannels);
  }, [stemChannels]);

  useEffect(() => {
    audioEngine.setTempoMultiplier(tempoMultiplier);
  }, [tempoMultiplier]);

  useEffect(() => {
    audioEngine.setLimiterActive(limiterActive);
  }, [limiterActive]);

  useEffect(() => {
    audioEngine.setMasterVolume(volume, muted);
  }, [volume, muted]);

  // Playback progress timer
  useEffect(() => {
    if (!isPlaying) return;
    const id = window.setInterval(() => {
      setCurrentTimeSec((prev) => {
        if (prev + 1 >= activeTrack.durationSec) {
          return 0;
        }
        return prev + 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [isPlaying, activeTrack.durationSec]);

  const handlePlayTrack = (trackId: string) => {
    if (trackId === activeTrackId) {
      if (isPlaying) {
        audioEngine.stop();
        setIsPlaying(false);
      } else {
        audioEngine.setBpm(activeTrack.bpm);
        audioEngine.setPattern(activePattern);
        audioEngine.start(stemChannels);
        setIsPlaying(true);
      }
      return;
    }

    const nextTrack = TRACK_CATALOG.find((t) => t.id === trackId) ?? TRACK_CATALOG[0];
    const nextPattern = customPatterns[nextTrack.id] ?? nextTrack.pattern;
    setActiveTrackId(nextTrack.id);
    setCurrentTimeSec(0);
    audioEngine.setBpm(nextTrack.bpm);
    audioEngine.setPattern(nextPattern);
    audioEngine.start(stemChannels);
    setIsPlaying(true);
  };

  const handleTogglePlay = () => {
    handlePlayTrack(activeTrackId);
  };

  const handlePrevTrack = () => {
    const idx = TRACK_CATALOG.findIndex((t) => t.id === activeTrackId);
    const prevIdx = (idx - 1 + TRACK_CATALOG.length) % TRACK_CATALOG.length;
    handlePlayTrack(TRACK_CATALOG[prevIdx].id);
  };

  const handleNextTrack = () => {
    const idx = TRACK_CATALOG.findIndex((t) => t.id === activeTrackId);
    const nextIdx = (idx + 1) % TRACK_CATALOG.length;
    handlePlayTrack(TRACK_CATALOG[nextIdx].id);
  };

  const handleAddToBag = (trackId: string, tierId: LicenseTierId = 'full_stems') => {
    setBagItems((prev) => {
      if (prev.some((i) => i.trackId === trackId)) return prev;
      return [...prev, { trackId, tierId, addedAt: new Date().toISOString() }];
    });
    setSavedTrackIds((prev) => (prev.includes(trackId) ? prev : [...prev, trackId]));
  };

  const handleQueueBatchToBag = (trackIds: string[], tierId: LicenseTierId) => {
    setBagItems((prev) => {
      const next = [...prev];
      for (const trackId of trackIds) {
        const existingIdx = next.findIndex((i) => i.trackId === trackId);
        if (existingIdx >= 0) {
          next[existingIdx] = { ...next[existingIdx], tierId };
        } else {
          next.push({ trackId, tierId, addedAt: new Date().toISOString() });
        }
      }
      return next;
    });
  };

  const handleUpdateStem = (key: StemChannelKey, patch: Partial<StemChannelState>) => {
    setStemChannels((prev) =>
      prev.map((ch) => (ch.key === key ? { ...ch, ...patch } : ch))
    );
  };

  const handleTogglePatternStep = (channel: StemChannelKey, stepIdx: number) => {
    setCustomPatterns((prev) => {
      const base = prev[activeTrack.id] ?? {
        sub808: [...activeTrack.pattern.sub808],
        drums: [...activeTrack.pattern.drums],
        perc: [...activeTrack.pattern.perc],
        synth: [...activeTrack.pattern.synth],
      };

      const nextArr = [...base[channel]];
      if (channel === 'sub808') {
        const defaultNote = activeTrack.pattern.sub808.find((n) => n > 0) ?? 33;
        nextArr[stepIdx] = nextArr[stepIdx] > 0 ? 0 : defaultNote;
      } else if (channel === 'synth') {
        const defaultNote = activeTrack.pattern.synth.find((n) => n > 0) ?? 57;
        nextArr[stepIdx] = nextArr[stepIdx] > 0 ? 0 : defaultNote;
      } else if (channel === 'drums') {
        nextArr[stepIdx] = nextArr[stepIdx] === 0 ? 1 : nextArr[stepIdx] === 1 ? 2 : 0;
      } else {
        nextArr[stepIdx] = nextArr[stepIdx] === 0 ? 1 : 0;
      }

      return {
        ...prev,
        [activeTrack.id]: {
          ...base,
          [channel]: nextArr,
        },
      };
    });
  };

  const handleResetPattern = () => {
    setCustomPatterns((prev) => {
      const next = { ...prev };
      delete next[activeTrack.id];
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-[#050506] text-[#f4f4f5] flex flex-col">
      <TopBar
        activeScreen={activeScreen}
        onNavigate={setActiveScreen}
        bagCount={bagItems.length}
        onOpenBag={() => setIsBagOpen(true)}
      />

      <main className="flex-1 w-full max-w-[1440px] mx-auto px-4 md:px-6 pt-6 md:pt-8 pb-28">
        {activeScreen === 'crates' && (
          <CratesScreen
            releases={CRATE_RELEASES}
            tracks={TRACK_CATALOG}
            activeTrackId={activeTrackId}
            isPlaying={isPlaying}
            bagTrackIds={bagItems.map((i) => i.trackId)}
            onPlayTrack={handlePlayTrack}
            onAddToBag={(id) => handleAddToBag(id)}
            onOpenDossier={(releaseId) => {
              setSelectedReleaseId(releaseId);
              setActiveScreen('dossier');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onOpenConsoleForTrack={(trackId) => {
              setActiveTrackId(trackId);
              setActiveScreen('console');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {activeScreen === 'console' && (
          <ConsoleScreen
            tracks={TRACK_CATALOG}
            activeTrack={activeTrack}
            isPlaying={isPlaying}
            currentStep={currentStep}
            stemChannels={stemChannels}
            tempoMultiplier={tempoMultiplier}
            limiterActive={limiterActive}
            customPattern={activePattern}
            onSelectTrack={(trackId) => {
              setActiveTrackId(trackId);
              setCurrentTimeSec(0);
            }}
            onTogglePlay={handleTogglePlay}
            onUpdateStem={handleUpdateStem}
            onResetStems={() => setStemChannels(DEFAULT_STEM_CHANNELS)}
            onTempoChange={setTempoMultiplier}
            onToggleLimiter={() => setLimiterActive((prev) => !prev)}
            onTogglePatternStep={handleTogglePatternStep}
            onResetPattern={handleResetPattern}
          />
        )}

        {activeScreen === 'vault' && (
          <VaultScreen
            tracks={TRACK_CATALOG}
            savedTrackIds={savedTrackIds}
            activeTrackId={activeTrackId}
            isPlaying={isPlaying}
            onPlayTrack={handlePlayTrack}
            onToggleSaved={(id) =>
              setSavedTrackIds((prev) =>
                prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
              )
            }
            onQueueSelectedToBag={handleQueueBatchToBag}
          />
        )}

        {activeScreen === 'dossier' && (
          <DossierScreen
            releases={CRATE_RELEASES}
            selectedRelease={selectedRelease}
            tracks={TRACK_CATALOG}
            activeTrackId={activeTrackId}
            isPlaying={isPlaying}
            bagTrackIds={bagItems.map((i) => i.trackId)}
            onSelectRelease={setSelectedReleaseId}
            onPlayTrack={handlePlayTrack}
            onAddToBag={(id) => handleAddToBag(id)}
            onOpenConsoleForTrack={(trackId) => {
              setActiveTrackId(trackId);
              setActiveScreen('console');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}
      </main>

      <TransportDeck
        track={activeTrack}
        isPlaying={isPlaying}
        currentTimeSec={currentTimeSec}
        tempoMultiplier={tempoMultiplier}
        volume={volume}
        muted={muted}
        onTogglePlay={handleTogglePlay}
        onPrev={handlePrevTrack}
        onNext={handleNextTrack}
        onSeek={setCurrentTimeSec}
        onVolumeChange={(val) => {
          setVolume(val);
          if (val > 0 && muted) setMuted(false);
        }}
        onToggleMute={() => setMuted((prev) => !prev)}
        onOpenConsole={() => {
          setActiveScreen('console');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />

      <CrateBagDrawer
        isOpen={isBagOpen}
        onClose={() => setIsBagOpen(false)}
        items={bagItems}
        tracks={TRACK_CATALOG}
        onRemoveItem={(trackId) =>
          setBagItems((prev) => prev.filter((item) => item.trackId !== trackId))
        }
        onChangeTier={(trackId, tierId) =>
          setBagItems((prev) =>
            prev.map((item) => (item.trackId === trackId ? { ...item, tierId } : item))
          )
        }
        onClearBag={() => setBagItems([])}
      />
    </div>
  );
}
