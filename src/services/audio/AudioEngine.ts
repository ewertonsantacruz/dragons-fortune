let ctx: AudioContext | null = null;
let sfxGainNode: GainNode | null = null;
let musicGainNode: GainNode | null = null;

function getCtx(): AudioContext {
  if (!ctx) {
    const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    ctx = new Ctor();
    sfxGainNode = ctx.createGain();
    musicGainNode = ctx.createGain();
    sfxGainNode.connect(ctx.destination);
    musicGainNode.connect(ctx.destination);
  }
  if (ctx.state === 'suspended') void ctx.resume();
  return ctx;
}

function getSfxGain(): GainNode { getCtx(); return sfxGainNode!; }
function getMusicGain(): GainNode { getCtx(); return musicGainNode!; }

function makeNoiseBuffer(audioCtx: AudioContext, duration: number): AudioBuffer {
  const sampleRate = audioCtx.sampleRate;
  const length = Math.floor(sampleRate * duration);
  const buffer = audioCtx.createBuffer(1, length, sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i++) data[i] = Math.random() * 2 - 1;
  return buffer;
}

interface ToneOptions {
  freq: number; duration: number; type?: OscillatorType; volume?: number;
  attack?: number; release?: number; detune?: number; glideTo?: number; bus?: 'sfx' | 'music';
}

function playTone({ freq, duration, type = 'sine', volume = 0.3, attack = 0.005, release = 0.05, detune = 0, glideTo, bus = 'sfx' }: ToneOptions) {
  const audioCtx = getCtx();
  const now = audioCtx.currentTime;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, now);
  if (detune) osc.detune.setValueAtTime(detune, now);
  if (glideTo) osc.frequency.exponentialRampToValueAtTime(glideTo, now + duration);
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(volume, now + attack);
  gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
  const dest = bus === 'music' ? getMusicGain() : getSfxGain();
  osc.connect(gain); gain.connect(dest);
  osc.start(now); osc.stop(now + duration + release);
}

function playNoise(duration: number, volume = 0.2, filterFreq = 1000, filterType: BiquadFilterType = 'lowpass') {
  const audioCtx = getCtx();
  const now = audioCtx.currentTime;
  const source = audioCtx.createBufferSource();
  source.buffer = makeNoiseBuffer(audioCtx, duration);
  const filter = audioCtx.createBiquadFilter();
  filter.type = filterType;
  filter.frequency.setValueAtTime(filterFreq, now);
  const gain = audioCtx.createGain();
  gain.gain.setValueAtTime(volume, now);
  gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
  const dest = getSfxGain();
  source.connect(filter); filter.connect(gain); gain.connect(dest);
  source.start(now); source.stop(now + duration);
}

function playSequence(notes: { freq: number; time: number; duration: number; type?: OscillatorType; volume?: number }[]) {
  notes.forEach((note) => { setTimeout(() => playTone(note), note.time); });
}

class AudioEngine {
  private muted = false;
  private sfxVolume = 0.7;
  private musicVolume = 0.4;
  private musicNodes: { osc: OscillatorNode; gain: GainNode }[] = [];
  private musicPlaying = false;
  private musicBellInterval: number | null = null;

  setMuted(muted: boolean) {
    this.muted = muted;
    if (muted) { this.stopMusic(); } else { getCtx(); if (!this.musicPlaying) this.startMusic(); }
  }
  isMuted() { return this.muted; }
  setSfxVolume(volume: number) {
    this.sfxVolume = Math.max(0, Math.min(1, volume));
    const gain = getSfxGain();
    gain.gain.cancelScheduledValues(getCtx().currentTime);
    gain.gain.setTargetAtTime(this.sfxVolume, getCtx().currentTime, 0.05);
  }
  setMusicVolume(volume: number) {
    this.musicVolume = Math.max(0, Math.min(1, volume));
    const gain = getMusicGain();
    gain.gain.cancelScheduledValues(getCtx().currentTime);
    gain.gain.setTargetAtTime(this.musicVolume, getCtx().currentTime, 0.05);
  }
  getSfxVolume() { return this.sfxVolume; }
  getMusicVolume() { return this.musicVolume; }
  private guard() { if (this.muted) return false; getCtx(); return true; }

  spinStart() {
    if (!this.guard()) return;
    const audioCtx = getCtx(); const now = audioCtx.currentTime;
    const source = audioCtx.createBufferSource();
    source.buffer = makeNoiseBuffer(audioCtx, 0.6);
    const filter = audioCtx.createBiquadFilter();
    filter.type = 'bandpass'; filter.frequency.setValueAtTime(200, now);
    filter.frequency.exponentialRampToValueAtTime(2000, now + 0.5); filter.Q.value = 2;
    const gain = audioCtx.createGain();
    gain.gain.setValueAtTime(0, now); gain.gain.linearRampToValueAtTime(0.15, now + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
    source.connect(filter); filter.connect(gain); gain.connect(getSfxGain());
    source.start(now); source.stop(now + 0.6);
  }
  reelStop() { if (!this.guard()) return; playTone({ freq: 180, duration: 0.08, type: 'square', volume: 0.12, release: 0.03 }); playNoise(0.05, 0.08, 3000, 'highpass'); }
  bigWin() { if (!this.guard()) return; playSequence([{ freq: 523, time: 0, duration: 0.15, type: 'triangle', volume: 0.2 }, { freq: 659, time: 80, duration: 0.15, type: 'triangle', volume: 0.2 }, { freq: 784, time: 160, duration: 0.2, type: 'triangle', volume: 0.25 }, { freq: 1047, time: 240, duration: 0.3, type: 'triangle', volume: 0.3 }]); }
  megaWin() { if (!this.guard()) return; playSequence([{ freq: 523, time: 0, duration: 0.12, type: 'sawtooth', volume: 0.15 }, { freq: 659, time: 60, duration: 0.12, type: 'sawtooth', volume: 0.15 }, { freq: 784, time: 120, duration: 0.12, type: 'sawtooth', volume: 0.18 }, { freq: 1047, time: 180, duration: 0.15, type: 'sawtooth', volume: 0.2 }, { freq: 1319, time: 240, duration: 0.2, type: 'triangle', volume: 0.25 }, { freq: 1568, time: 320, duration: 0.4, type: 'triangle', volume: 0.3 }]); playNoise(0.5, 0.06, 5000, 'highpass'); }
  coinWin() { if (!this.guard()) return; playSequence([{ freq: 1318, time: 0, duration: 0.1, type: 'triangle', volume: 0.15 }, { freq: 1568, time: 50, duration: 0.1, type: 'triangle', volume: 0.12 }, { freq: 2093, time: 100, duration: 0.15, type: 'triangle', volume: 0.1 }]); }
  buttonClick() { if (!this.guard()) return; playTone({ freq: 800, duration: 0.04, type: 'square', volume: 0.08, release: 0.02 }); }
  betChange() { if (!this.guard()) return; playTone({ freq: 600, duration: 0.05, type: 'square', volume: 0.06, glideTo: 900, release: 0.02 }); }
  bonusTrigger() {
    if (!this.guard()) return;
    const audioCtx = getCtx(); const now = audioCtx.currentTime;
    const osc1 = audioCtx.createOscillator(); osc1.type = 'sawtooth'; osc1.frequency.setValueAtTime(80, now); osc1.frequency.exponentialRampToValueAtTime(40, now + 1.2);
    const g1 = audioCtx.createGain(); g1.gain.setValueAtTime(0, now); g1.gain.linearRampToValueAtTime(0.2, now + 0.1); g1.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
    osc1.connect(g1); g1.connect(getSfxGain()); osc1.start(now); osc1.stop(now + 1.3);
    playSequence([{ freq: 880, time: 200, duration: 0.3, type: 'triangle', volume: 0.15 }, { freq: 1108, time: 300, duration: 0.3, type: 'triangle', volume: 0.15 }, { freq: 1318, time: 400, duration: 0.4, type: 'triangle', volume: 0.2 }, { freq: 1760, time: 500, duration: 0.5, type: 'triangle', volume: 0.2 }]);
  }
  eggCrack() { if (!this.guard()) return; playNoise(0.15, 0.2, 4000, 'highpass'); playTone({ freq: 300, duration: 0.1, type: 'square', volume: 0.1, glideTo: 150, release: 0.05 }); }
  eggReveal() { if (!this.guard()) return; playSequence([{ freq: 784, time: 0, duration: 0.15, type: 'triangle', volume: 0.18 }, { freq: 1047, time: 60, duration: 0.15, type: 'triangle', volume: 0.18 }, { freq: 1319, time: 120, duration: 0.25, type: 'triangle', volume: 0.22 }]); }
  freeSpinStart() { if (!this.guard()) return; playTone({ freq: 440, duration: 0.3, type: 'triangle', volume: 0.15, glideTo: 880 }); }
  bonusComplete() { if (!this.guard()) return; playSequence([{ freq: 523, time: 0, duration: 0.15, type: 'triangle', volume: 0.2 }, { freq: 659, time: 80, duration: 0.15, type: 'triangle', volume: 0.2 }, { freq: 784, time: 160, duration: 0.15, type: 'triangle', volume: 0.22 }, { freq: 1047, time: 240, duration: 0.2, type: 'triangle', volume: 0.25 }, { freq: 1319, time: 320, duration: 0.2, type: 'triangle', volume: 0.25 }, { freq: 1568, time: 400, duration: 0.3, type: 'triangle', volume: 0.3 }, { freq: 2093, time: 500, duration: 0.6, type: 'triangle', volume: 0.3 }]); playNoise(0.8, 0.05, 6000, 'highpass'); }
  jackpotTrigger() { if (!this.guard()) return; playSequence([{ freq: 392, time: 0, duration: 0.2, type: 'sawtooth', volume: 0.15 }, { freq: 523, time: 100, duration: 0.2, type: 'sawtooth', volume: 0.15 }, { freq: 659, time: 200, duration: 0.2, type: 'sawtooth', volume: 0.18 }, { freq: 784, time: 300, duration: 0.2, type: 'sawtooth', volume: 0.2 }, { freq: 1047, time: 400, duration: 0.3, type: 'triangle', volume: 0.25 }, { freq: 1319, time: 520, duration: 0.3, type: 'triangle', volume: 0.25 }, { freq: 1568, time: 640, duration: 0.4, type: 'triangle', volume: 0.3 }, { freq: 2093, time: 780, duration: 0.8, type: 'triangle', volume: 0.35 }]); playNoise(1.0, 0.08, 7000, 'highpass'); }
  wheelTick() { if (!this.guard()) return; playTone({ freq: 1200, duration: 0.03, type: 'square', volume: 0.06, release: 0.01 }); }
  wheelStop(prize: number) { if (!this.guard()) return; if (prize >= 10000) this.megaWin(); else if (prize >= 1000) this.bigWin(); else this.coinWin(); }

  startMusic() {
    if (this.muted || this.musicPlaying) return; if (!this.guard()) return;
    const audioCtx = getCtx(); const now = audioCtx.currentTime; this.musicPlaying = true;
    const dest = getMusicGain();
    const bassOsc = audioCtx.createOscillator(); bassOsc.type = 'sine'; bassOsc.frequency.setValueAtTime(55, now);
    const bassGain = audioCtx.createGain(); bassGain.gain.setValueAtTime(0, now); bassGain.gain.linearRampToValueAtTime(0.04, now + 2);
    bassOsc.connect(bassGain); bassGain.connect(dest); bassOsc.start(now); this.musicNodes.push({ osc: bassOsc, gain: bassGain });
    const fifthOsc = audioCtx.createOscillator(); fifthOsc.type = 'sine'; fifthOsc.frequency.setValueAtTime(82.4, now);
    const fifthGain = audioCtx.createGain(); fifthGain.gain.setValueAtTime(0, now); fifthGain.gain.linearRampToValueAtTime(0.025, now + 3);
    fifthOsc.connect(fifthGain); fifthGain.connect(dest); fifthOsc.start(now); this.musicNodes.push({ osc: fifthOsc, gain: fifthGain });
    const shimmerOsc = audioCtx.createOscillator(); shimmerOsc.type = 'triangle'; shimmerOsc.frequency.setValueAtTime(440, now);
    const shimmerGain = audioCtx.createGain(); shimmerGain.gain.setValueAtTime(0, now);
    const lfo = audioCtx.createOscillator(); lfo.type = 'sine'; lfo.frequency.setValueAtTime(0.15, now);
    const lfoGain = audioCtx.createGain(); lfoGain.gain.setValueAtTime(0.015, now);
    lfo.connect(lfoGain); lfoGain.connect(shimmerGain.gain);
    shimmerOsc.connect(shimmerGain); shimmerGain.connect(dest); shimmerOsc.start(now); lfo.start(now);
    this.musicNodes.push({ osc: shimmerOsc, gain: shimmerGain }); this.musicNodes.push({ osc: lfo, gain: lfoGain });
    this.musicBellInterval = window.setInterval(() => { if (this.muted || !this.musicPlaying) return; playTone({ freq: 660, duration: 1.5, type: 'sine', volume: 0.04, attack: 0.01, release: 1.2, bus: 'music' }); }, 8000);
  }

  stopMusic() {
    if (!this.musicPlaying) return; this.musicPlaying = false;
    if (this.musicBellInterval !== null) { clearInterval(this.musicBellInterval); this.musicBellInterval = null; }
    const audioCtx = ctx; if (!audioCtx) return; const now = audioCtx.currentTime;
    this.musicNodes.forEach(({ osc, gain }) => { try { gain.gain.cancelScheduledValues(now); gain.gain.setValueAtTime(gain.gain.value, now); gain.gain.exponentialRampToValueAtTime(0.001, now + 1.5); osc.stop(now + 1.6); } catch { /* already stopped */ } });
    this.musicNodes = [];
  }

  unlock() {
    getCtx();
    getSfxGain().gain.setValueAtTime(this.sfxVolume, getCtx().currentTime);
    getMusicGain().gain.setValueAtTime(this.musicVolume, getCtx().currentTime);
    if (!this.muted && !this.musicPlaying) this.startMusic();
  }
}

export const audioEngine = new AudioEngine();
