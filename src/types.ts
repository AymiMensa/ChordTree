// System Core Types

export interface ProgressionStep {
  type: "node" | "transition";
  id: string;
  label: string;
  notes: string[];
}

export type ChordTreeNodeType = "tonic" | "subdominant" | "dominant" | "predominant" | "special";

export interface ChordTreeNode {
  id: string;
  name: string;
  depth: number;
  type: ChordTreeNodeType;
  children: ChordTreeNode[];
  path: string[];
  isDominantPrecursor?: boolean;
}

export type ScaleDifficulty = "beginner" | "intermediate" | "advanced";

export type GrooveType = 
  | "None"
  // Four-on-the-floor (四拍直踏)
  | "Disco" | "EDM" | "Pop" | "Trance"
  | "House" | "Tech House" | "Future Bass" | "Dance Pop"
  // Backbeat Groove (後拍律動)
  | "Rock" | "Ballad" | "R&B" | "Folk" | "Soul" | "Slow Soul" 
  | "Heavy Metal" | "Country" | "Pop Ballad" | "Classic Rock"
  | "Rock & Roll" | "Alt Pop" | "Indie Pop" | "Pop Punk" | "Gospel Pop"
  // Shuffle / Swung (搖擺律動)
  | "Blues" | "Jazz" | "Shuffle Rock" | "Swing" | "Soft Swing" | "Jazz Ballad"
  | "Half-time Shuffle" | "Modern Swing"
  // Syncopated (切分音 / 放克律動)
  | "Funk" | "Hip-Hop" | "Neo-Soul" | "Drum & Bass" | "Rap"
  | "Trap" | "Drill" | "Boom Bap" | "Jersey Club" | "UK Garage" | "Breakbeat" | "Dancehall"
  // Polyrhythm (複節奏 / 拉丁律動)
  | "Salsa" | "Bossa Nova" | "Afrobeat" | "Samba" | "Rumba" | "Cha-Cha" | "Mambo"
  | "Reggaeton" | "Baile Funk" | "AmaPiano" | "Soca" | "Latin Pop" | "Afro Swing";

export type AmbientSoundType =
  | "None"
  // 自然生息 (8種)
  | "深夜森林" | "晨曦鳥鳴" | "竹林清風" | "松林松濤" 
  | "荒野朔風" | "春雨綿綿" | "夏夜蟲鳴" | "林雪暴風"
  // 水流江海 (8種)
  | "深海鯨語" | "浩瀚海浪" | "空靈溶洞" | "林澗溪流" 
  | "幽谷飛瀑" | "火山熔岩" | "雨打芭蕉" | "朝霧露滴"
  // 天地宇宙 (7種)
  | "星際共鳴" | "脈衝星芒" | "極光夜空" | "月光潮汐" 
  | "太陽風暴" | "黑洞引力" | "深空漫遊"
  // 人文禪意 (7種)
  | "古剎梵鐘" | "西藏頌歌" | "竹筒風鈴" | "黑膠溫暖" 
  | "深夜咖啡" | "遠方鐵道" | "古老壁爐";

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
  // Ambient Soundscape
  activeAmbient: AmbientSoundType;
  ambientVolume: number; // 0 to 1
}
