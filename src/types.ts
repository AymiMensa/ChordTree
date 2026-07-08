export interface ChordNode {
  id: string;
  label: string;
  level: number; // 0 is center, 1, 2, 3, 4, 5 are outer rings
  angle: number; // angle in degrees (0 to 360)
  radius: number; // radius fraction (0.0 to 1.0)
  notes: string[]; // spelling notes (e.g., ["C", "E", "G"])
  type: "major" | "minor" | "seventh" | "diminished" | "other";
  hasChildren?: boolean;
}

export interface ChordLink {
  id: string;
  from: string;
  to: string;
  label?: string;
}

export interface ProgressionStep {
  type: "node" | "transition";
  id: string; // node ID or link ID
  label: string;
  notes: string[];
}

export type GrooveType = 
  | "None"
  | "Samba" | "Rumba" | "Rock" | "Bossa Nova" | "Soul" | "Slow Soul" 
  | "Swing" | "Blues" | "Cha-Cha" | "Hip-Hop" | "Ballad" | "Folk" 
  | "Disco" | "EDM" | "Pop" | "R&B" | "Jazz" | "Shuffle Rock" 
  | "Funk" | "Neo-Soul" | "Salsa" | "Afrobeat";

export interface PlaybackState {
  isPlaying: boolean;
  isRepeat: boolean;
  bpm: number;
  currentBeat: number; // 1, 2, 3, 4
  activeNodeId: string;
  activePath: string[]; // History path of node IDs from center to current
  activeStepIndex: number;
  activeProgression: ProgressionStep[];
  beatsPerMeasure: number; // Default 4/4
  synthVolume: number; // 0 to 1
  metronomeVolume: number; // 0 to 1
  soundMode: "pad" | "arpeggio" | "silent";
  synthStyle: "epiano" | "pad" | "strings";
  activeGroove: GrooveType;
}
