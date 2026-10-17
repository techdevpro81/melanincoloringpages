// Web Audio API Synthesizer for sounds & soulful ambient music
class SoundManager {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private ambientGain: GainNode | null = null;
  private isAmbientPlaying: boolean = false;
  private storyGain: GainNode | null = null;
  private isStoryBackingPlaying: boolean = false;
  private storyTimeoutId: ReturnType<typeof setTimeout> | null = null;

  private initCtx() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.isMuted && this.ctx) {
      if (this.ambientGain) {
        this.ambientGain.gain.setValueAtTime(0, this.ctx.currentTime);
      }
      if (this.storyGain) {
        this.storyGain.gain.setValueAtTime(0, this.ctx.currentTime);
      }
    } else if (!this.isMuted && this.ctx) {
      if (this.isAmbientPlaying && this.ambientGain) {
        this.ambientGain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      }
      if (this.isStoryBackingPlaying && this.storyGain) {
        this.storyGain.gain.setValueAtTime(0.045, this.ctx.currentTime);
      }
    }
    return this.isMuted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  // Kalimba / Marimba chime for dot connect (pentatonic scale step based on dot number)
  public playDotConnect(dotNumber: number) {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    // African pentatonic scale frequencies (Eb, F, G, Bb, C)
    const baseFreqs = [311.13, 349.23, 392.00, 466.16, 523.25, 622.25, 698.46, 783.99, 932.33, 1046.50];
    const freq = baseFreqs[(dotNumber - 1) % baseFreqs.length] * (1 + Math.floor((dotNumber - 1) / 10) * 0.25);

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

    // Warm kalimba pluck envelope
    gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.35);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.36);
  }

  // Bucket fill chime (rich resonant chord)
  public playFillSound() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const freqs = [440, 554.37, 659.25]; // A Major triad
    freqs.forEach((f, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, this.ctx!.currentTime);

      gain.gain.setValueAtTime(0.08, this.ctx!.currentTime + idx * 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx!.currentTime + 0.4 + idx * 0.04);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);

      osc.start(this.ctx!.currentTime + idx * 0.04);
      osc.stop(this.ctx!.currentTime + 0.5 + idx * 0.04);
    });
  }

  // Brush stroke sound (soft gentle white noise swoosh)
  public playStrokeSound() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    try {
      const bufferSize = this.ctx.sampleRate * 0.08;
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.sin((i / bufferSize) * Math.PI);
      }

      const noise = this.ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(800, this.ctx.currentTime);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.03, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.08);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      noise.start();
    } catch {
      // Audio fallback
    }
  }

  // Paint-by-number error nudge
  public playErrorNudge() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(140, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, this.ctx.currentTime + 0.15);

    gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.15);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 0.16);
  }

  // Victory celebration fanfare
  public playVictoryFanfare() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    // Soulful triumphant brass-like chord progression
    const chordSeq = [
      [261.63, 329.63, 392.00], // C
      [293.66, 349.23, 440.00], // Dm
      [329.63, 415.30, 493.88], // E
      [392.00, 493.88, 587.33, 783.99] // G with octave
    ];

    chordSeq.forEach((chord, step) => {
      const startTime = this.ctx!.currentTime + step * 0.16;
      chord.forEach((freq) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0.09, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.45);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);

        osc.start(startTime);
        osc.stop(startTime + 0.46);
      });
    });
  }

  // Soulful Lofi Ambient track (Procedural Rhodes-style minor 9th chords)
  public toggleAmbientMusic(): boolean {
    this.initCtx();
    if (!this.ctx) return false;

    if (this.isAmbientPlaying) {
      this.stopAmbientMusic();
      return false;
    } else {
      this.startAmbientMusic();
      return true;
    }
  }

  public getIsAmbientPlaying(): boolean {
    return this.isAmbientPlaying;
  }

  private startAmbientMusic() {
    if (!this.ctx) return;
    this.stopAmbientMusic();
    this.isAmbientPlaying = true;

    // Master gain for ambient
    this.ambientGain = this.ctx.createGain();
    this.ambientGain.gain.setValueAtTime(this.isMuted ? 0 : 0.06, this.ctx.currentTime);
    this.ambientGain.connect(this.ctx.destination);

    // Warm Neo-Soul / Jazz chord cycle: Fmaj9 -> Em7 -> Dm9 -> Cmaj7
    const chords = [
      [174.61, 220.00, 261.63, 329.63, 392.00], // Fmaj9
      [164.81, 196.00, 246.94, 293.66],         // Em7
      [146.83, 174.61, 220.00, 261.63, 329.63], // Dm9
      [130.81, 164.81, 196.00, 246.94]          // Cmaj7
    ];

    let chordIdx = 0;
    const playChordLoop = () => {
      if (!this.isAmbientPlaying || !this.ctx || !this.ambientGain) return;

      const chord = chords[chordIdx % chords.length];
      chordIdx++;

      chord.forEach(freq => {
        const osc = this.ctx!.createOscillator();
        const noteGain = this.ctx!.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, this.ctx!.currentTime);

        // Soft slow attack and smooth release
        noteGain.gain.setValueAtTime(0.001, this.ctx!.currentTime);
        noteGain.gain.linearRampToValueAtTime(0.03, this.ctx!.currentTime + 0.8);
        noteGain.gain.linearRampToValueAtTime(0.015, this.ctx!.currentTime + 2.4);
        noteGain.gain.exponentialRampToValueAtTime(0.0001, this.ctx!.currentTime + 3.4);

        osc.connect(noteGain);
        noteGain.connect(this.ambientGain!);

        osc.start();
        osc.stop(this.ctx!.currentTime + 3.5);
      });

      // Schedule next chord
      if (this.isAmbientPlaying) {
        setTimeout(playChordLoop, 3200);
      }
    };

    playChordLoop();
  }

  private stopAmbientMusic() {
    this.isAmbientPlaying = false;
    if (this.ambientGain && this.ctx) {
      this.ambientGain.gain.linearRampToValueAtTime(0.0001, this.ctx.currentTime + 0.5);
    }
  }

  // Soulful Neo-Soul Backing Chords for Voice Storytelling
  public startStoryBacking(volume: number = 0.045) {
    this.initCtx();
    if (!this.ctx) return;
    this.stopStoryBacking();
    this.isStoryBackingPlaying = true;

    this.storyGain = this.ctx.createGain();
    this.storyGain.gain.setValueAtTime(this.isMuted ? 0 : volume, this.ctx.currentTime);
    this.storyGain.connect(this.ctx.destination);

    // Warm, Soulful Neo-Soul Rhodes progression:
    // Dbmaj9 -> Cm7 -> Bbm9 -> Abmaj7 -> Fmaj9 -> Dm9
    const neosoulChords = [
      [138.59, 174.61, 207.65, 261.63, 311.13], // Dbmaj9 (Warm deep soul root)
      [130.81, 155.56, 196.00, 233.08, 293.66], // Cm7
      [116.54, 138.59, 174.61, 207.65, 261.63], // Bbm9
      [103.83, 130.81, 155.56, 207.65, 261.63], // Abmaj7
      [174.61, 220.00, 261.63, 329.63, 392.00], // Fmaj9
      [146.83, 174.61, 220.00, 261.63, 329.63], // Dm9
    ];

    let chordIdx = 0;
    const playNeoSoulStep = () => {
      if (!this.isStoryBackingPlaying || !this.ctx || !this.storyGain) return;

      const chord = neosoulChords[chordIdx % neosoulChords.length];
      chordIdx++;

      chord.forEach((freq, noteIdx) => {
        const osc = this.ctx!.createOscillator();
        const noteGain = this.ctx!.createGain();
        const filter = this.ctx!.createBiquadFilter();

        // Warm electric Rhodes simulation: sine with gentle triangle overtone and lowpass filter
        osc.type = noteIdx === 0 ? 'sine' : 'triangle';
        osc.frequency.setValueAtTime(freq, this.ctx!.currentTime);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(920, this.ctx!.currentTime);

        // Gentle velvety envelope
        const now = this.ctx!.currentTime;
        noteGain.gain.setValueAtTime(0.0001, now);
        noteGain.gain.linearRampToValueAtTime(0.024, now + 0.7);
        noteGain.gain.linearRampToValueAtTime(0.012, now + 2.5);
        noteGain.gain.exponentialRampToValueAtTime(0.0001, now + 3.8);

        osc.connect(filter);
        filter.connect(noteGain);
        noteGain.connect(this.storyGain!);

        osc.start(now);
        osc.stop(now + 3.9);
      });

      if (this.isStoryBackingPlaying) {
        this.storyTimeoutId = setTimeout(playNeoSoulStep, 3400);
      }
    };

    playNeoSoulStep();
  }

  public setStoryBackingVolume(volume: number) {
    if (this.storyGain && this.ctx && !this.isMuted) {
      this.storyGain.gain.linearRampToValueAtTime(Math.max(0, Math.min(0.2, volume)), this.ctx.currentTime + 0.1);
    }
  }

  public stopStoryBacking() {
    this.isStoryBackingPlaying = false;
    if (this.storyTimeoutId) {
      clearTimeout(this.storyTimeoutId);
      this.storyTimeoutId = null;
    }
    if (this.storyGain && this.ctx) {
      try {
        this.storyGain.gain.linearRampToValueAtTime(0.0001, this.ctx.currentTime + 0.5);
      } catch {
        // Fallback
      }
    }
  }

  public isStoryBackingActive(): boolean {
    return this.isStoryBackingPlaying;
  }
}

export const soundManager = new SoundManager();
