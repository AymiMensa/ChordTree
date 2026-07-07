import { NOTE_BASE_FREQS } from "./audioNotes";

export class AudioEngine {
  private ctx: AudioContext | null = null;
  private schedulerTimerId: number | null = null;
  private nextNoteTime = 0.0; // absolute time when next beat is due
  private currentBeatInMeasure = 1; // 1, 2, 3, 4
  private bpm = 120;
  private beatsPerMeasure = 4;
  private lookahead = 25.0; // ms between schedule intervals
  private scheduleAheadTime = 0.1; // sec to schedule ahead

  private metronomeVolume = 0.6;
  private synthVolume = 0.5;
  private soundMode: "pad" | "arpeggio" | "silent" = "pad";
  private synthStyle: "epiano" | "pad" | "strings" = "pad";
  private currentNotes: string[] = ["C", "E", "G"];

  // Callback to synchronize visual state with exact AudioContext trigger time
  private onScheduleBeat?: (beat: number) => string[] | null;
  private onPlayBeat?: (beat: number) => void;

  constructor(
    onScheduleBeat?: (beat: number) => string[] | null,
    onPlayBeat?: (beat: number) => void,
  ) {
    this.onScheduleBeat = onScheduleBeat;
    this.onPlayBeat = onPlayBeat;
  }

  // Ensure AudioContext is initialized (must be triggered by user gesture)
  private initContext() {
    if (!this.ctx) {
      this.ctx = new (
        window.AudioContext || (window as any).webkitAudioContext
      )();
    }
    if (this.ctx.state === "suspended") {
      this.ctx.resume();
    }
    return this.ctx;
  }

  public setParams(params: {
    bpm?: number;
    metronomeVolume?: number;
    synthVolume?: number;
    soundMode?: "pad" | "arpeggio" | "silent";
    synthStyle?: "epiano" | "pad" | "strings";
    notes?: string[];
  }) {
    if (params.bpm !== undefined) this.bpm = params.bpm;
    if (params.metronomeVolume !== undefined)
      this.metronomeVolume = params.metronomeVolume;
    if (params.synthVolume !== undefined) this.synthVolume = params.synthVolume;
    if (params.soundMode !== undefined) this.soundMode = params.soundMode;
    if (params.synthStyle !== undefined) this.synthStyle = params.synthStyle;
    if (params.notes !== undefined) this.currentNotes = params.notes;
  }

  public start() {
    const context = this.initContext();
    this.currentBeatInMeasure = 1;
    this.nextNoteTime = context.currentTime + 0.05;

    // Start lookahead scheduler loop
    if (this.schedulerTimerId === null) {
      this.schedulerTimerId = window.setInterval(
        () => this.schedulerLoop(),
        this.lookahead,
      );
    }
  }

  public stop() {
    if (this.schedulerTimerId !== null) {
      window.clearInterval(this.schedulerTimerId);
      this.schedulerTimerId = null;
    }
  }

  private schedulerLoop() {
    if (!this.ctx) return;

    // While there are notes to play before the next interval, schedule them
    while (this.nextNoteTime < this.ctx.currentTime + this.scheduleAheadTime) {
      this.scheduleNote(this.currentBeatInMeasure, this.nextNoteTime);
      this.advanceNote();
    }
  }

  private advanceNote() {
    const secondsPerBeat = 60.0 / this.bpm;
    this.nextNoteTime += secondsPerBeat;

    this.currentBeatInMeasure++;
    if (this.currentBeatInMeasure > this.beatsPerMeasure) {
      this.currentBeatInMeasure = 1;
    }
  }

  private scheduleNote(beatNumber: number, time: number) {
    if (!this.ctx) return;

    // 1. Fetch exact notes for this upcoming beat
    let notesToPlay = this.currentNotes;
    if (this.onScheduleBeat) {
      const upcomingNotes = this.onScheduleBeat(beatNumber);
      if (upcomingNotes === null) {
        return; // Abort scheduling this beat entirely
      }
      if (upcomingNotes && upcomingNotes.length > 0) {
        notesToPlay = upcomingNotes;
        this.currentNotes = upcomingNotes; // Sync internal state
      }
    }

    // 2. Trigger visual callback via setTimeout or requestAnimationFrame timed to audio clock
    const delayMs = Math.max(0, (time - this.ctx.currentTime) * 1000);
    setTimeout(() => {
      if (this.onPlayBeat) {
        this.onPlayBeat(beatNumber);
      }
    }, delayMs);

    // 3. Play Metronome sound
    if (this.metronomeVolume > 0) {
      this.playMetronomeTick(beatNumber, time);
    }

    // 4. Play Synthesizer based on sound mode
    if (
      this.synthVolume > 0 &&
      this.soundMode !== "silent" &&
      notesToPlay.length > 0
    ) {
      if (this.soundMode === "pad" && beatNumber === 1) {
        // Play the full lush chord pad on beat 1 of each measure
        this.playChordPad(notesToPlay, time, (60.0 / this.bpm) * 3.8);
      } else if (this.soundMode === "arpeggio") {
        // Calculate strictly ascending frequencies for the chord notes to prevent octave dropping
        const ascendingFreqs: number[] = [];
        let currentFreq = 0;
        for (const note of notesToPlay) {
          let f = NOTE_BASE_FREQS[note] || 261.63;
          while (f < currentFreq) {
            f *= 2.0;
          }
          ascendingFreqs.push(f);
          currentFreq = f;
        }

        // Play arpeggiated note on each beat
        let noteIndex = 0;
        let freqMultiplier = 1.0;
        
        if (notesToPlay.length === 3) {
          // Triad: 1-3-5-OctaveRoot
          if (beatNumber === 4) {
            noteIndex = 0;
            freqMultiplier = 2.0; // Octave higher
          } else {
            noteIndex = beatNumber - 1;
          }
        } else if (notesToPlay.length >= 4) {
          // 7th Chord: 1-3-5-7
          if (beatNumber === 4) {
            noteIndex = 3;
          } else {
            noteIndex = beatNumber - 1;
          }
        } else {
          // Fallback
          noteIndex = (beatNumber - 1) % notesToPlay.length;
        }
        
        const finalFreq = ascendingFreqs[noteIndex] * freqMultiplier;
        this.playSingleSynthNote(finalFreq, time, 0.25);
      }
    }
  }

  // Create a beautiful, woody metronome "tick/tock" click sound
  private playMetronomeTick(beatNumber: number, time: number) {
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gainNode = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(this.ctx.destination);

    // Settings for Beat 1 vs others
    const isFirstBeat = beatNumber === 1;
    const pitch = isFirstBeat ? 1000 : 700; // woody high click vs low click

    osc.type = "triangle";
    osc.frequency.setValueAtTime(pitch, time);

    // Filter to sweeten the metronome click (bandpass centered at pitch)
    filter.type = "bandpass";
    filter.frequency.setValueAtTime(pitch, time);
    filter.Q.setValueAtTime(3, time);

    // Dynamic gain envelope
    gainNode.gain.setValueAtTime(0, time);
    gainNode.gain.linearRampToValueAtTime(
      this.metronomeVolume * 0.9,
      time + 0.002,
    );
    gainNode.gain.exponentialRampToValueAtTime(0.001, time + 0.08); // snappy release

    osc.start(time);
    osc.stop(time + 0.1);
  }

  // Lush polyphonic synthesizer pad for chord accompaniment
  private playChordPad(notes: string[], time: number, duration: number) {
    if (!this.ctx) return;

    const mainGain = this.ctx.createGain();
    mainGain.connect(this.ctx.destination);

    // Master volume envelope for the chord based on style
    mainGain.gain.setValueAtTime(0, time);
    if (this.synthStyle === "epiano") {
      mainGain.gain.linearRampToValueAtTime(this.synthVolume * 0.5, time + 0.02); // sharp attack
      mainGain.gain.exponentialRampToValueAtTime(this.synthVolume * 0.1, time + duration - 0.1); // decay
      mainGain.gain.linearRampToValueAtTime(0, time + duration); // smooth release
    } else if (this.synthStyle === "strings") {
      mainGain.gain.linearRampToValueAtTime(this.synthVolume * 0.3, time + 0.5); // very slow attack
      mainGain.gain.setValueAtTime(this.synthVolume * 0.3, time + duration - 0.5); // sustain
      mainGain.gain.linearRampToValueAtTime(0, time + duration + 0.5); // slow release
    } else {
      mainGain.gain.linearRampToValueAtTime(this.synthVolume * 0.35, time + 0.15); // gentle attack
      mainGain.gain.setValueAtTime(
        this.synthVolume * 0.35,
        time + duration - 0.2,
      );
      mainGain.gain.linearRampToValueAtTime(0, time + duration); // smooth decay
    }

    notes.forEach((note, idx) => {
      if (!this.ctx) return;
      const baseFreq = NOTE_BASE_FREQS[note] || 261.63;

      // Let's build a nice fat dual-oscillator voice for each note
      // Bass note in octave 3 for root note
      const isRoot = idx === 0;
      const frequency = isRoot ? baseFreq * 0.5 : baseFreq;

      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const voiceGain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(voiceGain);
      voiceGain.connect(mainGain);

      osc1.frequency.setValueAtTime(frequency, time);
      
      if (this.synthStyle === "epiano") {
        osc1.type = "sine";
        osc2.type = "triangle";
        osc2.frequency.setValueAtTime(frequency * 1.002, time); // slight chorus for e-piano
        filter.type = "lowpass";
        filter.frequency.setValueAtTime(2500, time);
        filter.frequency.exponentialRampToValueAtTime(400, time + duration);
        filter.Q.setValueAtTime(1, time);
      } else if (this.synthStyle === "strings") {
        osc1.type = "sawtooth";
        osc2.type = "sawtooth"; 
        osc2.frequency.setValueAtTime(frequency * 1.005, time); // detuned saw for lush strings
        filter.type = "lowpass";
        filter.frequency.setValueAtTime(800, time); // muted, softer
        filter.frequency.linearRampToValueAtTime(1200, time + duration / 2); // slight swell
        filter.frequency.linearRampToValueAtTime(800, time + duration); // and back
        filter.Q.setValueAtTime(0.5, time);
      } else {
        // Pad
        osc1.type = isRoot ? "sine" : "triangle";
        osc2.type = "triangle";
        osc2.frequency.setValueAtTime(frequency * 1.006, time); // chorus detune
        filter.type = "lowpass";
        filter.frequency.setValueAtTime(1200, time);
        filter.frequency.exponentialRampToValueAtTime(600, time + 1.0);
        filter.Q.setValueAtTime(1.5, time);
      }

      voiceGain.gain.setValueAtTime(0.7, time);

      osc1.start(time);
      osc2.start(time);
      osc1.stop(time + duration);
      osc2.stop(time + duration);
    });
  }

  // A clear, sparkling synth note for arpeggiated mode
  private playSingleSynthNote(freq: number, time: number, duration: number) {
    if (!this.ctx) return;

    const baseFreq = freq;
    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gainNode = this.ctx.createGain();

    osc.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(this.ctx.destination);

    if (this.synthStyle === "epiano") {
      osc.type = "sine";
      osc.frequency.setValueAtTime(baseFreq * 2.0, time);
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(2500, time);
      filter.frequency.exponentialRampToValueAtTime(400, time + duration);
      filter.Q.setValueAtTime(1.0, time);
      gainNode.gain.setValueAtTime(0, time);
      gainNode.gain.linearRampToValueAtTime(this.synthVolume * 0.5, time + 0.02);
      gainNode.gain.exponentialRampToValueAtTime(0.001, time + duration);
    } else if (this.synthStyle === "strings") {
      osc.type = "sine"; // Use sine for a softer bowed/plucked arpeggio
      osc.frequency.setValueAtTime(baseFreq * 2.0, time);
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(1500, time);
      filter.Q.setValueAtTime(0.5, time);
      gainNode.gain.setValueAtTime(0, time);
      gainNode.gain.linearRampToValueAtTime(this.synthVolume * 0.3, time + 0.1); // softer attack
      gainNode.gain.setValueAtTime(this.synthVolume * 0.3, time + duration - 0.1);
      gainNode.gain.linearRampToValueAtTime(0, time + duration + 0.2); // smooth release
    } else {
      // Play in a slightly higher octave for sparkling arpeggio
      osc.type = "triangle";
      osc.frequency.setValueAtTime(baseFreq * 2.0, time);

      // Lowpass filter envelope
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(2000, time);
      filter.frequency.exponentialRampToValueAtTime(500, time + duration);
      filter.Q.setValueAtTime(2.0, time);

      // Volume envelope
      gainNode.gain.setValueAtTime(0, time);
      gainNode.gain.linearRampToValueAtTime(this.synthVolume * 0.4, time + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.001, time + duration);
    }

    osc.start(time);
    osc.stop(time + duration + 0.05);
  }

  // Play an interactive direct trigger chord (when the user clicks a chord node)
  public triggerChordDirectly(notes: string[]) {
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    this.playChordPad(notes, now, 1.8);
  }
}
