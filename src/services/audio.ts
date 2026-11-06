/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

class SoundManager {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private volume: number = 0.7; // 0.0 to 1.0 (default 70%)
  private masterGain: GainNode | null = null;
  private bgmGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private isBgmPlaying: boolean = false;
  private bgmInterval: number | null = null;
  private activeHissSource: AudioBufferSourceNode | null = null;

  constructor() {
    const savedMuted = localStorage.getItem('mc_runner_muted');
    if (savedMuted !== null) {
      this.isMuted = savedMuted === 'true';
    }
    const savedVol = localStorage.getItem('mc_runner_volume');
    if (savedVol !== null) {
      const parsed = parseFloat(savedVol);
      if (!isNaN(parsed) && parsed >= 0 && parsed <= 1) {
        this.volume = parsed;
      }
    }
  }

  private initCtx() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();

      this.masterGain = this.ctx.createGain();
      this.bgmGain = this.ctx.createGain();
      this.sfxGain = this.ctx.createGain();

      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.volume, this.ctx.currentTime);
      this.bgmGain.gain.setValueAtTime(0.22, this.ctx.currentTime);
      this.sfxGain.gain.setValueAtTime(0.55, this.ctx.currentTime);

      this.bgmGain.connect(this.masterGain);
      this.sfxGain.connect(this.masterGain);
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public getVolume(): number {
    return Math.round(this.volume * 100);
  }

  public setVolume(pct: number): number {
    const clamped = Math.max(0, Math.min(100, pct));
    this.volume = clamped / 100;
    localStorage.setItem('mc_runner_volume', String(this.volume));

    this.initCtx();
    if (this.ctx && this.masterGain) {
      const now = this.ctx.currentTime;
      // If user sets volume > 0 while muted, we unmute for intuitive UX
      if (this.isMuted && clamped > 0) {
        this.isMuted = false;
        localStorage.setItem('mc_runner_muted', 'false');
      }
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.volume, now);
    }
    return clamped;
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    localStorage.setItem('mc_runner_muted', String(this.isMuted));
    this.initCtx();
    if (this.ctx && this.masterGain) {
      const now = this.ctx.currentTime;
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.volume, now);
    }
    return this.isMuted;
  }

  public playCoin() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(987.77, now); // B5
    osc.frequency.exponentialRampToValueAtTime(1318.51, now + 0.08); // E6

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.18);
  }

  public playJump() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(160, now);
    osc.frequency.exponentialRampToValueAtTime(440, now + 0.15);

    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.18);
  }

  public playSlide() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;
    const bufferSize = this.ctx.sampleRate * 0.15;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(800, now);
    filter.frequency.exponentialRampToValueAtTime(300, now + 0.15);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    noise.start(now);
  }

  public playCrash() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;
    // Oof thud
    const osc = this.ctx.createOscillator();
    const oscGain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.exponentialRampToValueAtTime(45, now + 0.25);

    oscGain.gain.setValueAtTime(0.5, now);
    oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

    osc.connect(oscGain);
    oscGain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.28);

    // Crunch noise
    const bufferSize = this.ctx.sampleRate * 0.2;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(600, now);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.4, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(this.sfxGain);
    noise.start(now);
  }

  /**
   * Authentic Minecraft Creeper Warning Fuse Hiss ("tsss...")
   * Duration ~1.6s
   */
  public playCreeperHiss(): () => void {
    if (this.isMuted) return () => {};
    this.initCtx();
    if (!this.ctx || !this.sfxGain) return () => {};

    const duration = 1.7;
    const bufferSize = Math.floor(this.ctx.sampleRate * duration);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    this.activeHissSource = noise;

    // Highpass + bandpass to create characteristic sizzling fuse sound
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(2400, this.ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(3800, this.ctx.currentTime + duration);

    const gain = this.ctx.createGain();
    const now = this.ctx.currentTime;
    gain.gain.setValueAtTime(0.08, now);
    gain.gain.linearRampToValueAtTime(0.45, now + duration * 0.7);
    gain.gain.exponentialRampToValueAtTime(0.65, now + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    noise.start(now);

    return () => {
      try {
        noise.stop();
      } catch {
        // already stopped
      }
    };
  }

  /**
   * Authentic Minecraft Creeper Explosion ("BOOM!")
   */
  public playCreeperExplosion() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;

    // 1. Heavy low-frequency punch sub-bass (80Hz -> 25Hz)
    const subOsc = this.ctx.createOscillator();
    const subGain = this.ctx.createGain();
    subOsc.type = 'triangle';
    subOsc.frequency.setValueAtTime(90, now);
    subOsc.frequency.exponentialRampToValueAtTime(25, now + 0.45);

    subGain.gain.setValueAtTime(0.75, now);
    subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

    subOsc.connect(subGain);
    subGain.connect(this.sfxGain);
    subOsc.start(now);
    subOsc.stop(now + 0.5);

    // 2. High-energy explosion noise burst (duration ~0.65s)
    const bufferSize = Math.floor(this.ctx.sampleRate * 0.65);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (this.ctx.sampleRate * 0.15));
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1200, now);
    filter.frequency.exponentialRampToValueAtTime(200, now + 0.65);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.85, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.65);

    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(this.sfxGain);
    noise.start(now);
  }

  public playCorrect() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx || !this.sfxGain) return;

    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      const now = this.ctx!.currentTime + idx * 0.09;
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc.connect(gain);
      gain.connect(this.sfxGain!);

      osc.start(now);
      osc.stop(now + 0.35);
    });
  }

  public playWrong() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx || !this.sfxGain) return;

    const now = this.ctx.currentTime;
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.type = 'sawtooth';
    osc2.type = 'sawtooth';
    osc1.frequency.setValueAtTime(196, now); // G3
    osc2.frequency.setValueAtTime(207.65, now); // G#3 (dissonant)

    osc1.frequency.exponentialRampToValueAtTime(110, now + 0.35);
    osc2.frequency.exponentialRampToValueAtTime(116, now + 0.35);

    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.sfxGain);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 0.4);
    osc2.stop(now + 0.4);
  }

  public playPortal() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx || !this.sfxGain) return;

    const notes = [329.63, 440.0, 523.25, 659.25, 880.0];
    notes.forEach((freq, idx) => {
      const now = this.ctx!.currentTime + idx * 0.08;
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

      osc.connect(gain);
      gain.connect(this.sfxGain!);

      osc.start(now);
      osc.stop(now + 0.3);
    });
  }

  public playVictory() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx || !this.sfxGain) return;

    const chords = [
      [523.25, 659.25, 783.99], // C major
      [587.33, 739.99, 880.0],  // D major
      [659.25, 830.61, 987.77], // E major
      [783.99, 987.77, 1174.66, 1567.98] // G chord peak
    ];

    chords.forEach((chord, chordIdx) => {
      const startTime = this.ctx!.currentTime + chordIdx * 0.22;
      chord.forEach((freq) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, startTime);
        gain.gain.setValueAtTime(0.25, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.4);
        osc.connect(gain);
        gain.connect(this.sfxGain!);
        osc.start(startTime);
        osc.stop(startTime + 0.4);
      });
    });
  }

  public startBgm() {
    if (this.isBgmPlaying) return;
    this.initCtx();
    this.isBgmPlaying = true;

    const melody = [
      261.63, 329.63, 392.00, 440.00,
      392.00, 329.63, 261.63, 196.00,
      220.00, 261.63, 329.63, 392.00,
      329.63, 293.66, 261.63, 392.00
    ];
    const bass = [
      130.81, 130.81, 164.81, 164.81,
      174.61, 174.61, 196.00, 196.00,
      146.83, 146.83, 164.81, 164.81,
      174.61, 196.00, 130.81, 130.81
    ];

    let step = 0;
    const tempoMs = 185;

    const tickBgm = () => {
      if (!this.isBgmPlaying || !this.ctx || !this.bgmGain) return;
      if (this.isMuted) return;

      const now = this.ctx.currentTime;
      const mFreq = melody[step % melody.length];
      const bFreq = bass[step % bass.length];

      const mOsc = this.ctx.createOscillator();
      const mGain = this.ctx.createGain();
      mOsc.type = 'square';
      mOsc.frequency.setValueAtTime(mFreq, now);

      mGain.gain.setValueAtTime(0.08, now);
      mGain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);

      mOsc.connect(mGain);
      mGain.connect(this.bgmGain);
      mOsc.start(now);
      mOsc.stop(now + 0.16);

      if (step % 2 === 0) {
        const bOsc = this.ctx.createOscillator();
        const bGain = this.ctx.createGain();
        bOsc.type = 'triangle';
        bOsc.frequency.setValueAtTime(bFreq, now);

        bGain.gain.setValueAtTime(0.14, now);
        bGain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

        bOsc.connect(bGain);
        bGain.connect(this.bgmGain);
        bOsc.start(now);
        bOsc.stop(now + 0.28);
      }

      step++;
    };

    this.bgmInterval = window.setInterval(tickBgm, tempoMs);
  }

  public stopBgm() {
    this.isBgmPlaying = false;
    if (this.bgmInterval) {
      clearInterval(this.bgmInterval);
      this.bgmInterval = null;
    }
  }
}

export const soundManager = new SoundManager();
