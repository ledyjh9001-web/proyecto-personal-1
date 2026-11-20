export type ScreenId = 'crates' | 'console' | 'vault' | 'dossier';

export type GenreCategory =
  | 'ALL'
  | 'LATIN TRAP'
  | 'REGGAETON'
  | 'DEMBOW'
  | 'PERREO OSCURO'
  | 'STEMS READY';

export type StemChannelKey = 'sub808' | 'drums' | 'perc' | 'synth';

export interface StemChannelState {
  key: StemChannelKey;
  label: string;
  band: string;
  gain: number; // 0 to 1.2
  muted: boolean;
  solo: boolean;
}

export type LicenseTierId = 'mp3_dub' | 'wav_24' | 'full_stems' | 'exclusive';

export interface LicenseTier {
  id: LicenseTierId;
  label: string;
  format: string;
  price: number;
  rights: string;
}

export interface TrackPattern {
  sub808: number[]; // 16 steps: 0 = rest, >0 = MIDI note
  drums: number[];  // 16 steps: 0 = rest, 1 = kick, 2 = snare, 3 = kick+snare
  perc: number[];   // 16 steps: 0 = rest, 1 = closed hat, 2 = open hat / rim
  synth: number[];  // 16 steps: 0 = rest, >0 = MIDI note
}

export interface TrackItem {
  id: string;
  index: string;
  releaseId: string;
  title: string;
  artist: string;
  genre: Exclude<GenreCategory, 'ALL' | 'STEMS READY'>;
  bpm: number;
  musicalKey: string;
  sampleRate: string;
  lufs: string;
  durationSec: number;
  durationLabel: string;
  stemsReady: boolean;
  isExclusiveAvailable: boolean;
  coverUrl: string;
  waveform: number[];
  pattern: TrackPattern;
  stemNotes: string[];
}

export interface CrateRelease {
  id: string;
  code: string;
  title: string;
  producer: string;
  city: string;
  year: string;
  genreSummary: string;
  bpmRange: string;
  format: string;
  lufsTarget: string;
  coverUrl: string;
  description: string;
  trackIds: string[];
}

export interface CrateBagItem {
  trackId: string;
  tierId: LicenseTierId;
  addedAt: string;
}
