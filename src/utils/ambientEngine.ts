// Procedural Ambient Soundscape Engine (Web Audio API)
import { AmbientSoundType } from "../types";

export interface AmbientCategoryInfo {
  category: string;
  items: AmbientSoundType[];
}

export const AMBIENT_CATEGORIES: AmbientCategoryInfo[] = [
  {
    category: "自然生息",
    items: [
      "深夜森林", "晨曦鳥鳴", "竹林清風", "松林松濤",
      "荒野朔風", "春雨綿綿", "夏夜蟲鳴", "林雪暴風"
    ]
  },
  {
    category: "水流江海",
    items: [
      "深海鯨語", "浩瀚海浪", "空靈溶洞", "林澗溪流",
      "幽谷飛瀑", "火山熔岩", "雨打芭蕉", "朝霧露滴"
    ]
  },
  {
    category: "天地宇宙",
    items: [
      "星際共鳴", "脈衝星芒", "極光夜空", "月光潮汐",
      "太陽風暴", "黑洞引力", "深空漫遊"
    ]
  },
  {
    category: "人文禪意",
    items: [
      "古剎梵鐘", "西藏頌歌", "竹筒風鈴", "黑膠溫暖",
      "深夜咖啡", "遠方鐵道", "古老壁爐"
    ]
  }
];

export class AmbientEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private currentSound: AmbientSoundType = "None";
  private isRunning = false;
  private volume = 0.5;

  // Active audio nodes for cancellation
  private activeNodes: (AudioNode | number)[] = [];
  private scheduledIntervals: number[] = [];

  constructor(ctx?: AudioContext) {
    if (ctx) this.ctx = ctx;
  }

  public setContext(ctx: AudioContext) {
    this.ctx = ctx;
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(this.volume, this.ctx.currentTime, 0.05);
    }
  }

  public getCurrentSound(): AmbientSoundType {
    return this.currentSound;
  }

  public isPlaying(): boolean {
    return this.isRunning && this.currentSound !== "None";
  }

  private initMaster() {
    if (!this.ctx) return;
    if (!this.masterGain) {
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = this.volume;
      this.masterGain.connect(this.ctx.destination);
    }
  }

  public play(sound: AmbientSoundType) {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === "suspended") {
      this.ctx.resume();
    }

    this.stop();

    if (sound === "None") {
      this.currentSound = "None";
      this.isRunning = false;
      return;
    }

    this.initMaster();
    this.currentSound = sound;
    this.isRunning = true;

    try {
      this.createSoundscape(sound);
    } catch (e) {
      console.error("Failed to start soundscape:", sound, e);
    }
  }

  public stop() {
    this.scheduledIntervals.forEach(id => window.clearInterval(id));
    this.scheduledIntervals = [];

    this.activeNodes.forEach(item => {
      try {
        if (typeof item === "number") {
          window.clearTimeout(item);
        } else if ("stop" in item && typeof (item as any).stop === "function") {
          (item as any).stop();
          (item as any).disconnect();
        } else if ("disconnect" in item && typeof item.disconnect === "function") {
          item.disconnect();
        }
      } catch (e) {
        // ignore already stopped nodes
      }
    });

    this.activeNodes = [];
    this.currentSound = "None";
    this.isRunning = false;
  }

  // Generate pink/white noise buffer
  private createNoiseBuffer(seconds = 4, isPink = false): AudioBuffer {
    if (!this.ctx) throw new Error("No AudioContext");
    const bufferSize = this.ctx.sampleRate * seconds;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);

    if (isPink) {
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
        b6 = white * 0.115926;
      }
    } else {
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
    }
    return buffer;
  }

  // Create loop noise source
  private createLoopNoise(isPink = false, seconds = 4): AudioBufferSourceNode {
    if (!this.ctx) throw new Error("No AudioContext");
    const noise = this.ctx.createBufferSource();
    noise.buffer = this.createNoiseBuffer(seconds, isPink);
    noise.loop = true;
    this.activeNodes.push(noise);
    return noise;
  }

  private createSoundscape(type: AmbientSoundType) {
    if (!this.ctx || !this.masterGain) return;
    const ctx = this.ctx;
    const out = this.masterGain;

    switch (type) {
      // ==========================================
      // 自然生息 (8種)
      // ==========================================
      case "深夜森林": {
        // Deep nocturnal wind + gentle rustle
        const noise = this.createLoopNoise(true);
        const filter = ctx.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.value = 450;
        const gain = ctx.createGain();
        gain.gain.value = 0.35;

        // Slow LFO for nocturnal breeze
        const lfo = ctx.createOscillator();
        lfo.frequency.value = 0.15;
        const lfoGain = ctx.createGain();
        lfoGain.gain.value = 180;
        lfo.connect(lfoGain);
        lfoGain.connect(filter.frequency);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(out);
        noise.start();
        lfo.start();
        this.activeNodes.push(lfo, filter, gain);
        break;
      }

      case "晨曦鳥鳴": {
        // Ambient soft breeze + procedural bird chirps
        const breeze = this.createLoopNoise(true);
        const breezeFilter = ctx.createBiquadFilter();
        breezeFilter.type = "bandpass";
        breezeFilter.frequency.value = 800;
        breezeFilter.Q.value = 1.0;
        const breezeGain = ctx.createGain();
        breezeGain.gain.value = 0.15;
        breeze.connect(breezeFilter);
        breezeFilter.connect(breezeGain);
        breezeGain.connect(out);
        breeze.start();
        this.activeNodes.push(breeze, breezeFilter, breezeGain);

        // Bird chirping scheduler
        const birdTimer = window.setInterval(() => {
          if (!this.isRunning || !this.ctx) return;
          const now = this.ctx.currentTime;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          const startFreq = 2200 + Math.random() * 1400;
          osc.type = "sine";
          osc.frequency.setValueAtTime(startFreq, now);
          osc.frequency.exponentialRampToValueAtTime(startFreq * (Math.random() > 0.5 ? 1.4 : 0.7), now + 0.12);
          osc.frequency.exponentialRampToValueAtTime(startFreq, now + 0.24);

          gain.gain.setValueAtTime(0, now);
          gain.gain.linearRampToValueAtTime(0.18, now + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

          osc.connect(gain);
          gain.connect(out);
          osc.start(now);
          osc.stop(now + 0.26);
        }, 1200 + Math.random() * 1800);
        this.scheduledIntervals.push(birdTimer);
        break;
      }

      case "竹林清風": {
        // Resonant breeze whistling through bamboo hollows
        const noise = this.createLoopNoise(false);
        const band1 = ctx.createBiquadFilter();
        band1.type = "bandpass";
        band1.frequency.value = 950;
        band1.Q.value = 6;
        const band2 = ctx.createBiquadFilter();
        band2.type = "bandpass";
        band2.frequency.value = 1600;
        band2.Q.value = 8;
        const gain = ctx.createGain();
        gain.gain.value = 0.28;

        const lfo = ctx.createOscillator();
        lfo.frequency.value = 0.2;
        const lfoGain = ctx.createGain();
        lfoGain.gain.value = 250;
        lfo.connect(lfoGain);
        lfoGain.connect(band1.frequency);

        noise.connect(band1);
        noise.connect(band2);
        band1.connect(gain);
        band2.connect(gain);
        gain.connect(out);
        noise.start();
        lfo.start();
        this.activeNodes.push(lfo, band1, band2, gain);
        break;
      }

      case "松林松濤": {
        // Low oceanic waves of wind through pine canopies
        const noise = this.createLoopNoise(true);
        const filter = ctx.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.value = 320;
        const gain = ctx.createGain();
        gain.gain.value = 0.45;

        const lfo = ctx.createOscillator();
        lfo.frequency.value = 0.08;
        const lfoGain = ctx.createGain();
        lfoGain.gain.value = 160;
        lfo.connect(lfoGain);
        lfoGain.connect(filter.frequency);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(out);
        noise.start();
        lfo.start();
        this.activeNodes.push(lfo, filter, gain);
        break;
      }

      case "荒野朔風": {
        // Desolate howling northern gale
        const noise = this.createLoopNoise(false);
        const filter = ctx.createBiquadFilter();
        filter.type = "bandpass";
        filter.frequency.value = 620;
        filter.Q.value = 5.0;
        const gain = ctx.createGain();
        gain.gain.value = 0.4;

        const lfo = ctx.createOscillator();
        lfo.frequency.value = 0.35;
        const lfoGain = ctx.createGain();
        lfoGain.gain.value = 400;
        lfo.connect(lfoGain);
        lfoGain.connect(filter.frequency);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(out);
        noise.start();
        lfo.start();
        this.activeNodes.push(lfo, filter, gain);
        break;
      }

      case "春雨綿綿": {
        // Gentle spring drizzle
        const noise = this.createLoopNoise(false);
        const filter = ctx.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.value = 1200;
        const highpass = ctx.createBiquadFilter();
        highpass.type = "highpass";
        highpass.frequency.value = 400;
        const gain = ctx.createGain();
        gain.gain.value = 0.35;

        noise.connect(highpass);
        highpass.connect(filter);
        filter.connect(gain);
        gain.connect(out);
        noise.start();
        this.activeNodes.push(filter, highpass, gain);
        break;
      }

      case "夏夜蟲鳴": {
        // High frequency crickets pulsating in summer grass
        const cricketTimer = window.setInterval(() => {
          if (!this.isRunning || !this.ctx) return;
          const now = this.ctx.currentTime;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = "sine";
          osc.frequency.setValueAtTime(4600 + Math.random() * 200, now);

          // Fast chirp tremolo
          const pulses = 3;
          for (let p = 0; p < pulses; p++) {
            const t = now + p * 0.06;
            gain.gain.setValueAtTime(0, t);
            gain.gain.linearRampToValueAtTime(0.08, t + 0.02);
            gain.gain.linearRampToValueAtTime(0, t + 0.05);
          }

          osc.connect(gain);
          gain.connect(out);
          osc.start(now);
          osc.stop(now + pulses * 0.06 + 0.02);
        }, 350);
        this.scheduledIntervals.push(cricketTimer);
        break;
      }

      case "林雪暴風": {
        // Howling snow blizzard with heavy sub-wind
        const noise = this.createLoopNoise(true);
        const band = ctx.createBiquadFilter();
        band.type = "bandpass";
        band.frequency.value = 500;
        band.Q.value = 4.0;
        const low = ctx.createBiquadFilter();
        low.type = "lowpass";
        low.frequency.value = 220;
        const gain = ctx.createGain();
        gain.gain.value = 0.5;

        const lfo = ctx.createOscillator();
        lfo.frequency.value = 0.28;
        const lfoGain = ctx.createGain();
        lfoGain.gain.value = 350;
        lfo.connect(lfoGain);
        lfoGain.connect(band.frequency);

        noise.connect(band);
        noise.connect(low);
        band.connect(gain);
        low.connect(gain);
        gain.connect(out);
        noise.start();
        lfo.start();
        this.activeNodes.push(lfo, band, low, gain);
        break;
      }

      // ==========================================
      // 水流江海 (8種)
      // ==========================================
      case "深海鯨語": {
        // Deep sub-aquatic pressure + occasional majestic whale song
        const sub = ctx.createOscillator();
        sub.type = "sine";
        sub.frequency.value = 48;
        const subGain = ctx.createGain();
        subGain.gain.value = 0.25;
        sub.connect(subGain);
        subGain.connect(out);
        sub.start();
        this.activeNodes.push(sub, subGain);

        const whaleTimer = window.setInterval(() => {
          if (!this.isRunning || !this.ctx) return;
          const now = this.ctx.currentTime;
          const whale = this.ctx.createOscillator();
          const wGain = this.ctx.createGain();
          const filter = this.ctx.createBiquadFilter();
          filter.type = "lowpass";
          filter.frequency.value = 600;

          whale.type = "triangle";
          const base = 120 + Math.random() * 80;
          whale.frequency.setValueAtTime(base, now);
          whale.frequency.exponentialRampToValueAtTime(base * 1.8, now + 1.2);
          whale.frequency.exponentialRampToValueAtTime(base * 0.9, now + 2.5);

          wGain.gain.setValueAtTime(0, now);
          wGain.gain.linearRampToValueAtTime(0.25, now + 0.8);
          wGain.gain.exponentialRampToValueAtTime(0.001, now + 2.8);

          whale.connect(filter);
          filter.connect(wGain);
          wGain.connect(out);
          whale.start(now);
          whale.stop(now + 2.9);
        }, 4000);
        this.scheduledIntervals.push(whaleTimer);
        break;
      }

      case "浩瀚海浪": {
        // Tidal surge in rhythmic cycles
        const noise = this.createLoopNoise(true);
        const filter = ctx.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.value = 350;
        const gain = ctx.createGain();
        gain.gain.value = 0.45;

        // Slow ocean swell LFO
        const lfo = ctx.createOscillator();
        lfo.frequency.value = 0.09; // ~11 sec wave cycle
        const lfoGain = ctx.createGain();
        lfoGain.gain.value = 500;
        lfo.connect(lfoGain);
        lfoGain.connect(filter.frequency);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(out);
        noise.start();
        lfo.start();
        this.activeNodes.push(lfo, filter, gain);
        break;
      }

      case "空靈溶洞": {
        // Deep limestone cavern resonance + crystal water drops
        const drone = ctx.createOscillator();
        drone.type = "sine";
        drone.frequency.value = 75;
        const dGain = ctx.createGain();
        dGain.gain.value = 0.18;
        drone.connect(dGain);
        dGain.connect(out);
        drone.start();
        this.activeNodes.push(drone, dGain);

        const dropTimer = window.setInterval(() => {
          if (!this.isRunning || !this.ctx) return;
          const now = this.ctx.currentTime;
          const drop = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          const f = 1400 + Math.random() * 800;
          drop.type = "sine";
          drop.frequency.setValueAtTime(f, now);
          drop.frequency.exponentialRampToValueAtTime(f * 0.4, now + 0.15);

          gain.gain.setValueAtTime(0.2, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

          drop.connect(gain);
          gain.connect(out);
          drop.start(now);
          drop.stop(now + 0.42);
        }, 1600 + Math.random() * 2000);
        this.scheduledIntervals.push(dropTimer);
        break;
      }

      case "林澗溪流": {
        // Bubbling lively brook
        const noise = this.createLoopNoise(false);
        const band1 = ctx.createBiquadFilter();
        band1.type = "bandpass";
        band1.frequency.value = 700;
        band1.Q.value = 4.0;
        const band2 = ctx.createBiquadFilter();
        band2.type = "bandpass";
        band2.frequency.value = 1300;
        band2.Q.value = 6.0;
        const gain = ctx.createGain();
        gain.gain.value = 0.38;

        const lfo = ctx.createOscillator();
        lfo.frequency.value = 3.5;
        const lfoGain = ctx.createGain();
        lfoGain.gain.value = 250;
        lfo.connect(lfoGain);
        lfoGain.connect(band2.frequency);

        noise.connect(band1);
        noise.connect(band2);
        band1.connect(gain);
        band2.connect(gain);
        gain.connect(out);
        noise.start();
        lfo.start();
        this.activeNodes.push(lfo, band1, band2, gain);
        break;
      }

      case "幽谷飛瀑": {
        // Thundering valley waterfall with white noise roar
        const noise = this.createLoopNoise(true);
        const low = ctx.createBiquadFilter();
        low.type = "lowpass";
        low.frequency.value = 850;
        const sub = ctx.createOscillator();
        sub.type = "sine";
        sub.frequency.value = 55;
        const sGain = ctx.createGain();
        sGain.gain.value = 0.25;

        const gain = ctx.createGain();
        gain.gain.value = 0.55;

        noise.connect(low);
        low.connect(gain);
        sub.connect(sGain);
        sGain.connect(gain);
        gain.connect(out);
        noise.start();
        sub.start();
        this.activeNodes.push(low, sub, sGain, gain);
        break;
      }

      case "火山熔岩": {
        // Sub-rumble with bubbling geothermal lava
        const sub = ctx.createOscillator();
        sub.type = "triangle";
        sub.frequency.value = 38;
        const sGain = ctx.createGain();
        sGain.gain.value = 0.35;
        sub.connect(sGain);
        sGain.connect(out);
        sub.start();
        this.activeNodes.push(sub, sGain);

        const lavaTimer = window.setInterval(() => {
          if (!this.isRunning || !this.ctx) return;
          const now = this.ctx.currentTime;
          const bubble = this.ctx.createOscillator();
          const bGain = this.ctx.createGain();
          bubble.type = "sine";
          const f = 90 + Math.random() * 60;
          bubble.frequency.setValueAtTime(f, now);
          bubble.frequency.exponentialRampToValueAtTime(f * 2.5, now + 0.25);

          bGain.gain.setValueAtTime(0.2, now);
          bGain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

          bubble.connect(bGain);
          bGain.connect(out);
          bubble.start(now);
          bubble.stop(now + 0.36);
        }, 700 + Math.random() * 800);
        this.scheduledIntervals.push(lavaTimer);
        break;
      }

      case "雨打芭蕉": {
        // Rain droplets hitting broad banana leaves
        const rain = this.createLoopNoise(false);
        const rFilter = ctx.createBiquadFilter();
        rFilter.type = "lowpass";
        rFilter.frequency.value = 800;
        const rGain = ctx.createGain();
        rGain.gain.value = 0.18;
        rain.connect(rFilter);
        rFilter.connect(rGain);
        rGain.connect(out);
        rain.start();
        this.activeNodes.push(rain, rFilter, rGain);

        const leafTimer = window.setInterval(() => {
          if (!this.isRunning || !this.ctx) return;
          const now = this.ctx.currentTime;
          const drop = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          const f = 320 + Math.random() * 220; // Woody dull drop
          drop.type = "triangle";
          drop.frequency.setValueAtTime(f, now);
          drop.frequency.exponentialRampToValueAtTime(f * 0.6, now + 0.08);

          gain.gain.setValueAtTime(0.28, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

          drop.connect(gain);
          gain.connect(out);
          drop.start(now);
          drop.stop(now + 0.11);
        }, 220 + Math.random() * 300);
        this.scheduledIntervals.push(leafTimer);
        break;
      }

      case "朝霧露滴": {
        // Crystalline morning dew drops dripping from leaves
        const pad = ctx.createOscillator();
        pad.type = "sine";
        pad.frequency.value = 216; // 432 / 2
        const pGain = ctx.createGain();
        pGain.gain.value = 0.12;
        pad.connect(pGain);
        pGain.connect(out);
        pad.start();
        this.activeNodes.push(pad, pGain);

        const dewTimer = window.setInterval(() => {
          if (!this.isRunning || !this.ctx) return;
          const now = this.ctx.currentTime;
          const dew = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          const f = 1800 + Math.random() * 600;
          dew.type = "sine";
          dew.frequency.setValueAtTime(f, now);
          dew.frequency.exponentialRampToValueAtTime(f * 0.7, now + 0.12);

          gain.gain.setValueAtTime(0.18, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

          dew.connect(gain);
          gain.connect(out);
          dew.start(now);
          dew.stop(now + 0.26);
        }, 1100 + Math.random() * 1400);
        this.scheduledIntervals.push(dewTimer);
        break;
      }

      // ==========================================
      // 天地宇宙 (7種)
      // ==========================================
      case "星際共鳴": {
        // Binaural cosmic resonance (432Hz & 528Hz healing tones)
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        osc1.type = "sine";
        osc2.type = "sine";
        osc1.frequency.value = 432;
        osc2.frequency.value = 436; // 4Hz binaural theta beat
        const gain = ctx.createGain();
        gain.gain.value = 0.22;

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(out);
        osc1.start();
        osc2.start();
        this.activeNodes.push(osc1, osc2, gain);
        break;
      }

      case "脈衝星芒": {
        // Rotating pulsar beacon pulses + ethereal star sparkle
        const pulsarTimer = window.setInterval(() => {
          if (!this.isRunning || !this.ctx) return;
          const now = this.ctx.currentTime;
          const osc = this.ctx.createOscillator();
          const filter = this.ctx.createBiquadFilter();
          filter.type = "bandpass";
          filter.frequency.value = 880;
          filter.Q.value = 8;
          const gain = this.ctx.createGain();

          osc.type = "sawtooth";
          osc.frequency.setValueAtTime(220, now);
          osc.frequency.exponentialRampToValueAtTime(55, now + 0.18);

          gain.gain.setValueAtTime(0.3, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

          osc.connect(filter);
          filter.connect(gain);
          gain.connect(out);
          osc.start(now);
          osc.stop(now + 0.26);
        }, 1250); // Steady pulsar rotation
        this.scheduledIntervals.push(pulsarTimer);
        break;
      }

      case "極光夜空": {
        // Shimmering northern lights aurora curtains
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const osc3 = ctx.createOscillator();
        osc1.type = "triangle";
        osc2.type = "sine";
        osc3.type = "sine";
        osc1.frequency.value = 164.81; // E3
        osc2.frequency.value = 246.94; // B3
        osc3.frequency.value = 329.63; // E4
        const gain = ctx.createGain();
        gain.gain.value = 0.18;

        const lfo = ctx.createOscillator();
        lfo.frequency.value = 0.12;
        const lfoGain = ctx.createGain();
        lfoGain.gain.value = 0.08;
        lfo.connect(lfoGain);
        lfoGain.connect(gain.gain);

        osc1.connect(gain);
        osc2.connect(gain);
        osc3.connect(gain);
        gain.connect(out);
        osc1.start();
        osc2.start();
        osc3.start();
        lfo.start();
        this.activeNodes.push(osc1, osc2, osc3, lfo, gain);
        break;
      }

      case "月光潮汐": {
        // Deep lunar gravitation ocean swells
        const osc = ctx.createOscillator();
        osc.type = "sine";
        osc.frequency.value = 55;
        const noise = this.createLoopNoise(true);
        const nFilter = ctx.createBiquadFilter();
        nFilter.type = "lowpass";
        nFilter.frequency.value = 280;
        const gain = ctx.createGain();
        gain.gain.value = 0.38;

        const lfo = ctx.createOscillator();
        lfo.frequency.value = 0.06;
        const lfoGain = ctx.createGain();
        lfoGain.gain.value = 180;
        lfo.connect(lfoGain);
        lfoGain.connect(nFilter.frequency);

        osc.connect(gain);
        noise.connect(nFilter);
        nFilter.connect(gain);
        gain.connect(out);
        osc.start();
        noise.start();
        lfo.start();
        this.activeNodes.push(osc, lfo, nFilter, gain);
        break;
      }

      case "太陽風暴": {
        // Solar coronal flare plasma waves
        const noise = this.createLoopNoise(false);
        const filter = ctx.createBiquadFilter();
        filter.type = "bandpass";
        filter.frequency.value = 750;
        filter.Q.value = 3.5;
        const gain = ctx.createGain();
        gain.gain.value = 0.35;

        const lfo = ctx.createOscillator();
        lfo.frequency.value = 0.4;
        const lfoGain = ctx.createGain();
        lfoGain.gain.value = 450;
        lfo.connect(lfoGain);
        lfoGain.connect(filter.frequency);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(out);
        noise.start();
        lfo.start();
        this.activeNodes.push(lfo, filter, gain);
        break;
      }

      case "黑洞引力": {
        // Infrasonic singularity gravity pull (32Hz rumbling sub-bass)
        const sub1 = ctx.createOscillator();
        const sub2 = ctx.createOscillator();
        sub1.type = "sine";
        sub2.type = "sawtooth";
        sub1.frequency.value = 34;
        sub2.frequency.value = 34.5;
        const filter = ctx.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.value = 110;
        const gain = ctx.createGain();
        gain.gain.value = 0.5;

        sub1.connect(gain);
        sub2.connect(filter);
        filter.connect(gain);
        gain.connect(out);
        sub1.start();
        sub2.start();
        this.activeNodes.push(sub1, sub2, filter, gain);
        break;
      }

      case "深空漫遊": {
        // Solitary starship drifting through silence of the void
        const hum = ctx.createOscillator();
        hum.type = "triangle";
        hum.frequency.value = 60; // 60Hz warp core hum
        const air = this.createLoopNoise(true);
        const aFilter = ctx.createBiquadFilter();
        aFilter.type = "lowpass";
        aFilter.frequency.value = 240;
        const gain = ctx.createGain();
        gain.gain.value = 0.28;

        hum.connect(gain);
        air.connect(aFilter);
        aFilter.connect(gain);
        gain.connect(out);
        hum.start();
        air.start();
        this.activeNodes.push(hum, aFilter, gain);
        break;
      }

      // ==========================================
      // 人文禪意 (7種)
      // ==========================================
      case "古剎梵鐘": {
        // Deep ancient bronze temple bell resonating in mountains
        const bellTimer = window.setInterval(() => {
          if (!this.isRunning || !this.ctx) return;
          const now = this.ctx.currentTime;
          // Harmonics of bronze temple bell
          const partials = [110, 220, 314, 442, 590];
          partials.forEach((f, idx) => {
            if (!this.ctx) return;
            const osc = this.ctx.createOscillator();
            const g = this.ctx.createGain();
            osc.type = idx === 0 ? "sine" : "triangle";
            osc.frequency.setValueAtTime(f, now);

            const duration = 4.5 - idx * 0.6;
            g.gain.setValueAtTime(0.2 / (idx + 1), now);
            g.gain.exponentialRampToValueAtTime(0.0001, now + duration);

            osc.connect(g);
            g.connect(out);
            osc.start(now);
            osc.stop(now + duration + 0.1);
          });
        }, 5500);
        this.scheduledIntervals.push(bellTimer);
        break;
      }

      case "西藏頌歌": {
        // Tibetan singing bowl sustained meditative drone
        const bowl1 = ctx.createOscillator();
        const bowl2 = ctx.createOscillator();
        bowl1.type = "sine";
        bowl2.type = "sine";
        bowl1.frequency.value = 264; // C4
        bowl2.frequency.value = 265.5; // Gentle 1.5Hz acoustic friction beat
        const gain = ctx.createGain();
        gain.gain.value = 0.28;

        bowl1.connect(gain);
        bowl2.connect(gain);
        gain.connect(out);
        bowl1.start();
        bowl2.start();
        this.activeNodes.push(bowl1, bowl2, gain);
        break;
      }

      case "竹筒風鈴": {
        // Wind chimes made of natural hollow bamboo clinking in breeze
        const chimeTimer = window.setInterval(() => {
          if (!this.isRunning || !this.ctx) return;
          const now = this.ctx.currentTime;
          const notes = [523.25, 587.33, 659.25, 783.99, 880]; // Pentatonic bamboo tubes
          const freq = notes[Math.floor(Math.random() * notes.length)];
          const osc = this.ctx.createOscillator();
          const g = this.ctx.createGain();
          osc.type = "sine";
          osc.frequency.setValueAtTime(freq, now);

          g.gain.setValueAtTime(0.22, now);
          g.gain.exponentialRampToValueAtTime(0.001, now + 0.8);

          osc.connect(g);
          g.connect(out);
          osc.start(now);
          osc.stop(now + 0.85);
        }, 900 + Math.random() * 800);
        this.scheduledIntervals.push(chimeTimer);
        break;
      }

      case "黑膠溫暖": {
        // Vintage warm analog vinyl record turntable crackles
        const crackle = this.createLoopNoise(false);
        const filter = ctx.createBiquadFilter();
        filter.type = "bandpass";
        filter.frequency.value = 3500;
        filter.Q.value = 4.0;
        const gain = ctx.createGain();
        gain.gain.value = 0.15;

        // Occasional clicks
        const clickTimer = window.setInterval(() => {
          if (!this.isRunning || !this.ctx) return;
          const now = this.ctx.currentTime;
          const osc = this.ctx.createOscillator();
          const cGain = this.ctx.createGain();
          osc.type = "square";
          osc.frequency.setValueAtTime(100 + Math.random() * 800, now);
          cGain.gain.setValueAtTime(0.25, now);
          cGain.gain.exponentialRampToValueAtTime(0.001, now + 0.02);

          osc.connect(cGain);
          cGain.connect(out);
          osc.start(now);
          osc.stop(now + 0.025);
        }, 400 + Math.random() * 600);
        this.scheduledIntervals.push(clickTimer);

        crackle.connect(filter);
        filter.connect(gain);
        gain.connect(out);
        crackle.start();
        this.activeNodes.push(crackle, filter, gain);
        break;
      }

      case "深夜咖啡": {
        // Late night cafe murmur + warm street air
        const noise = this.createLoopNoise(true);
        const filter = ctx.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.value = 550;
        const gain = ctx.createGain();
        gain.gain.value = 0.28;

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(out);
        noise.start();
        this.activeNodes.push(filter, gain);
        break;
      }

      case "遠方鐵道": {
        // Distant nighttime train rolling rhythmically over tracks
        const trainTimer = window.setInterval(() => {
          if (!this.isRunning || !this.ctx) return;
          const now = this.ctx.currentTime;
          // Click-clack: 2 quick hits
          for (let i = 0; i < 2; i++) {
            const t = now + i * 0.12;
            const osc = this.ctx.createOscillator();
            const g = this.ctx.createGain();
            osc.type = "triangle";
            osc.frequency.setValueAtTime(75, t);
            osc.frequency.exponentialRampToValueAtTime(45, t + 0.08);

            g.gain.setValueAtTime(0.3, t);
            g.gain.exponentialRampToValueAtTime(0.001, t + 0.09);

            osc.connect(g);
            g.connect(out);
            osc.start(t);
            osc.stop(t + 0.1);
          }
        }, 1400); // Train wheel cadence
        this.scheduledIntervals.push(trainTimer);
        break;
      }

      case "古老壁爐": {
        // Crackling fireplace timber embers on a winter night
        const hiss = this.createLoopNoise(true);
        const hFilter = ctx.createBiquadFilter();
        hFilter.type = "lowpass";
        hFilter.frequency.value = 350;
        const hGain = ctx.createGain();
        hGain.gain.value = 0.22;
        hiss.connect(hFilter);
        hFilter.connect(hGain);
        hGain.connect(out);
        hiss.start();
        this.activeNodes.push(hiss, hFilter, hGain);

        const woodPopTimer = window.setInterval(() => {
          if (!this.isRunning || !this.ctx) return;
          const now = this.ctx.currentTime;
          const pop = this.ctx.createOscillator();
          const pGain = this.ctx.createGain();
          pop.type = "triangle";
          const f = 200 + Math.random() * 500;
          pop.frequency.setValueAtTime(f, now);
          pop.frequency.exponentialRampToValueAtTime(f * 0.3, now + 0.04);

          pGain.gain.setValueAtTime(0.35, now);
          pGain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

          pop.connect(pGain);
          pGain.connect(out);
          pop.start(now);
          pop.stop(now + 0.06);
        }, 300 + Math.random() * 500);
        this.scheduledIntervals.push(woodPopTimer);
        break;
      }

      default:
        break;
    }
  }
}
