import { StemChannelKey, StemChannelState, TrackPattern } from '../types/audio';

function midiToFreq(midi: number): number {
  return 440 * Math.pow(2, (midi - 69) / 12);
}

function makeDistortionCurve(amount: number): Float32Array<ArrayBuffer> {
  const k = amount;
  const nSamples = 1024;
  const buffer = new ArrayBuffer(nSamples * 4);
  const curve = new Float32Array(buffer);
  const deg = Math.PI / 180;
  for (let i = 0; i < nSamples; i++) {
    const x = (i * 2) / nSamples - 1;
    curve[i] = ((3 + k) * x * 20 * deg) / (Math.PI + k * Math.abs(x));
  }
  return curve;
}

class ConcreteAudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private limiterNode: DynamicsCompressorNode | null = null;
  private driveNode: WaveShaperNode | null = null;
  private analyser: AnalyserNode | null = null;
  private stemGains: Record<StemChannelKey, GainNode> | null = null;
  private noiseBuffer: AudioBuffer | null = null;

  private isPlaying = false;
  private bpm = 96;
  private tempoMultiplier = 1;
  private masterVolume = 0.85;
  private masterMuted = false;
  private limiterActive = true;
  private currentStep = 0;
  private nextNoteTime = 0;
  private timerId: number | null = null;

  private pattern: TrackPattern = {
    sub808: new Array(16).fill(0),
    drums: new Array(16).fill(0),
    perc: new Array(16).fill(0),
    synth: new Array(16).fill(0),
  };

  private onStepListeners = new Set<(step: number) => void>();

  private ensureContext(): AudioContext {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = this.masterMuted ? 0 : this.masterVolume;

      this.driveNode = this.ctx.createWaveShaper();
      this.driveNode.curve = makeDistortionCurve(this.limiterActive ? 14 : 0);
      this.driveNode.oversample = '2x';

      this.limiterNode = this.ctx.createDynamicsCompressor();
      this.limiterNode.threshold.value = -8;
      this.limiterNode.knee.value = 4;
      this.limiterNode.ratio.value = 12;
      this.limiterNode.attack.value = 0.002;
      this.limiterNode.release.value = 0.12;

      this.analyser = this.ctx.createAnalyser();
      this.analyser.fftSize = 128;
      this.analyser.smoothingTimeConstant = 0.72;

      this.stemGains = {
        sub808: this.ctx.createGain(),
        drums: this.ctx.createGain(),
        perc: this.ctx.createGain(),
        synth: this.ctx.createGain(),
      };

      Object.values(this.stemGains).forEach((g) => {
        g.connect(this.driveNode!);
      });

      this.driveNode.connect(this.limiterNode);
      this.limiterNode.connect(this.masterGain);
      this.masterGain.connect(this.analyser);
      this.analyser.connect(this.ctx.destination);

      // Pre-compute white noise buffer for snares/hi-hats
      const bufSize = this.ctx.sampleRate * 0.5;
      this.noiseBuffer = this.ctx.createBuffer(1, bufSize, this.ctx.sampleRate);
      const data = this.noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
    }

    if (this.ctx.state === 'suspended') {
      void this.ctx.resume();
    }
    return this.ctx;
  }

  public subscribeStep(cb: (step: number) => void): () => void {
    this.onStepListeners.add(cb);
    return () => {
      this.onStepListeners.delete(cb);
    };
  }

  public setPattern(pattern: TrackPattern): void {
    this.pattern = {
      sub808: [...pattern.sub808],
      drums: [...pattern.drums],
      perc: [...pattern.perc],
      synth: [...pattern.synth],
    };
  }

  public setBpm(bpm: number): void {
    this.bpm = Math.max(60, Math.min(180, bpm));
  }

  public setTempoMultiplier(mult: number): void {
    this.tempoMultiplier = Math.max(0.75, Math.min(1.25, mult));
  }

  public setLimiterActive(active: boolean): void {
    this.limiterActive = active;
    if (this.driveNode) {
      this.driveNode.curve = makeDistortionCurve(active ? 16 : 0);
    }
  }

  public setMasterVolume(vol: number, muted: boolean): void {
    this.masterVolume = vol;
    this.masterMuted = muted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(muted ? 0 : vol, this.ctx.currentTime, 0.015);
    }
  }

  public updateStems(channels: StemChannelState[]): void {
    if (!this.stemGains || !this.ctx) return;
    const anySolo = channels.some((c) => c.solo);
    for (const ch of channels) {
      const node = this.stemGains[ch.key];
      const audible = anySolo ? ch.solo && !ch.muted : !ch.muted;
      const target = audible ? ch.gain : 0;
      node.gain.setTargetAtTime(target, this.ctx.currentTime, 0.015);
    }
  }

  public start(channels?: StemChannelState[]): void {
    const ctx = this.ensureContext();
    if (channels) {
      this.updateStems(channels);
    }
    if (this.isPlaying) return;
    this.isPlaying = true;
    this.currentStep = 0;
    this.nextNoteTime = ctx.currentTime + 0.04;
    this.timerId = window.setInterval(() => this.scheduler(), 25);
  }

  public stop(): void {
    this.isPlaying = false;
    if (this.timerId !== null) {
      window.clearInterval(this.timerId);
      this.timerId = null;
    }
  }

  public getFrequencyData(target: Uint8Array<ArrayBuffer>): boolean {
    if (!this.analyser || !this.isPlaying) return false;
    this.analyser.getByteFrequencyData(target);
    return true;
  }

  private scheduler(): void {
    if (!this.ctx || !this.isPlaying) return;
    const lookahead = 0.1;
    while (this.nextNoteTime < this.ctx.currentTime + lookahead) {
      this.scheduleStep(this.currentStep, this.nextNoteTime);
      const effectiveBpm = this.bpm * this.tempoMultiplier;
      const secondsPerSixteenth = 60.0 / effectiveBpm / 4.0;
      this.nextNoteTime += secondsPerSixteenth;
      this.currentStep = (this.currentStep + 1) % 16;
    }
  }

  private scheduleStep(step: number, time: number): void {
    const stepSnapshot = step;
    const delayMs = Math.max(0, (time - (this.ctx?.currentTime ?? time)) * 1000);
    window.setTimeout(() => {
      if (this.isPlaying) {
        this.onStepListeners.forEach((cb) => cb(stepSnapshot));
      }
    }, delayMs);

    const subNote = this.pattern.sub808[step];
    if (subNote > 0) this.trigger808(midiToFreq(subNote), time);

    const drumHit = this.pattern.drums[step];
    if (drumHit === 1 || drumHit === 3) this.triggerKick(time);
    if (drumHit === 2 || drumHit === 3) this.triggerSnare(time);

    const percHit = this.pattern.perc[step];
    if (percHit === 1) this.triggerHiHat(time, false);
    if (percHit === 2) this.triggerHiHat(time, true);

    const synthNote = this.pattern.synth[step];
    if (synthNote > 0) this.triggerSynth(midiToFreq(synthNote), time);
  }

  private trigger808(freq: number, time: number): void {
    if (!this.ctx || !this.stemGains) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq * 1.45, time);
    osc.frequency.exponentialRampToValueAtTime(freq, time + 0.045);

    gain.gain.setValueAtTime(0.001, time);
    gain.gain.linearRampToValueAtTime(0.75, time + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.42);

    osc.connect(gain);
    gain.connect(this.stemGains.sub808);
    osc.start(time);
    osc.stop(time + 0.44);
  }

  private triggerKick(time: number): void {
    if (!this.ctx || !this.stemGains) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(145, time);
    osc.frequency.exponentialRampToValueAtTime(44, time + 0.09);

    gain.gain.setValueAtTime(0.9, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.16);

    osc.connect(gain);
    gain.connect(this.stemGains.drums);
    osc.start(time);
    osc.stop(time + 0.17);
  }

  private triggerSnare(time: number): void {
    if (!this.ctx || !this.stemGains || !this.noiseBuffer) return;

    const noise = this.ctx.createBufferSource();
    noise.buffer = this.noiseBuffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1850, time);
    filter.Q.value = 1.2;

    const nGain = this.ctx.createGain();
    nGain.gain.setValueAtTime(0.55, time);
    nGain.gain.exponentialRampToValueAtTime(0.001, time + 0.13);

    noise.connect(filter);
    filter.connect(nGain);
    nGain.connect(this.stemGains.drums);
    noise.start(time);
    noise.stop(time + 0.14);

    // Snare punch body
    const osc = this.ctx.createOscillator();
    const oGain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(210, time);
    osc.frequency.exponentialRampToValueAtTime(110, time + 0.06);
    oGain.gain.setValueAtTime(0.45, time);
    oGain.gain.exponentialRampToValueAtTime(0.001, time + 0.08);
    osc.connect(oGain);
    oGain.connect(this.stemGains.drums);
    osc.start(time);
    osc.stop(time + 0.09);
  }

  private triggerHiHat(time: number, open: boolean): void {
    if (!this.ctx || !this.stemGains || !this.noiseBuffer) return;
    const noise = this.ctx.createBufferSource();
    noise.buffer = this.noiseBuffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(open ? 5600 : 7400, time);

    const gain = this.ctx.createGain();
    const dur = open ? 0.14 : 0.045;
    gain.gain.setValueAtTime(open ? 0.24 : 0.16, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + dur);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.stemGains.perc);
    noise.start(time);
    noise.stop(time + dur + 0.01);
  }

  private triggerSynth(freq: number, time: number): void {
    if (!this.ctx || !this.stemGains) return;
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc1.type = 'sawtooth';
    osc2.type = 'square';
    osc1.frequency.setValueAtTime(freq, time);
    osc2.frequency.setValueAtTime(freq * 1.006, time);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1900, time);
    filter.frequency.exponentialRampToValueAtTime(420, time + 0.24);

    gain.gain.setValueAtTime(0.001, time);
    gain.gain.linearRampToValueAtTime(0.22, time + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.26);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gain);
    gain.connect(this.stemGains.synth);

    osc1.start(time);
    osc2.start(time);
    osc1.stop(time + 0.28);
    osc2.stop(time + 0.28);
  }
}

export const audioEngine = new ConcreteAudioEngine();
