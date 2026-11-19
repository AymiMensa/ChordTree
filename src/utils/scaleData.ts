// Scale System Data Definitions

export type ScaleDifficulty = "beginner" | "intermediate" | "advanced";

export type ScaleCategory = 
  | "chinese"      // 中國傳統五聲與七聲音階
  | "western"      // 西方自然與大小調
  | "modes"        // 七大教會調式
  | "jazz_blues"   // 藍調與爵士即興
  | "world";       // 世界民族與異國調式

export interface ScaleDefinition {
  id: string;
  name: string;              // 主名稱
  englishName: string;       // 英文名稱
  alias?: string;            // 別名
  category: ScaleCategory;   // 分類
  difficulty: ScaleDifficulty;// 難度
  semitones: number[];       // 相對於根音的半音數 (例如 [0, 2, 4, 7, 9])
  solfege: string[];         // 簡譜 (例如 ["1", "2", "3", "5", "6"])
  chineseNames?: string[];   // 五音階位 (例如 ["宮", "商", "角", "徵", "羽"])
  characteristicBias?: string;// 加入的偏音 (針對七聲音階，例如 "變徵（#4）、變宮（7）")
  description: string;       // 特點與應用說明
  isTraditionalChinese7?: boolean; // 是否為三大傳統七聲音階
}

// 傳統三大七聲音階對照表資料結構
export interface TraditionalChinese7Info {
  name: string;
  alias: string;
  biasNotes: string;         // 加入的兩個偏音
  solfegeC: string;          // 現代簡譜對應 (以 C 為宮)
  features: string;          // 特點與應用
}

export const TRADITIONAL_CHINESE_7_TABLE: TraditionalChinese7Info[] = [
  {
    name: "雅樂音階",
    alias: "古音階、正聲音階",
    biasNotes: "變徵（#4）、變宮（7）",
    solfegeC: "1, 2, 3, #4, 5, 6, 7",
    features: "歷史最悠久，常見於古代宮廷雅樂、部分北方民歌。結構對應西方 Lydian 調式，具有明亮、空靈與高雅的殿堂氣質。"
  },
  {
    name: "清樂音階",
    alias: "新音階、下徵音階",
    biasNotes: "清角（4）、變宮（7）",
    solfegeC: "1, 2, 3, 4, 5, 6, 7",
    features: "結構與西方自然大調音階（Ionian）完全相同，廣泛應用於中國民間戲曲、南管、北管音樂及現代江南絲竹。"
  },
  {
    name: "燕樂音階",
    alias: "俗樂音階、清商音階",
    biasNotes: "清角（4）、閏（♭7）",
    solfegeC: "1, 2, 3, 4, 5, 6, ♭7",
    features: "偏音帶有降 7 的色彩，盛行於隋唐時期的俗樂與西域傳入的音樂中。對應西方 Mixolydian 調式，兼具悠揚熱情與異域風韻。"
  }
];

export const ALL_SCALES: ScaleDefinition[] = [
  // --- 中國傳統五聲與七聲音階 ---
  {
    id: "gong-pentatonic",
    name: "宮調五聲音階",
    englishName: "Gong / Major Pentatonic",
    alias: "大調五聲音階、正宮調",
    category: "chinese",
    difficulty: "beginner",
    semitones: [0, 2, 4, 7, 9],
    solfege: ["1", "2", "3", "5", "6"],
    chineseNames: ["宮", "商", "角", "徵", "羽"],
    description: "以宮音（1）為主音的五聲音階。純淨端莊、和諧圓滿，是東方傳統音樂的基石，西方亦稱大調五聲音階。"
  },
  {
    id: "shang-pentatonic",
    name: "商調五聲音階",
    englishName: "Shang Pentatonic",
    alias: "商調式、白石商調",
    category: "chinese",
    difficulty: "intermediate",
    semitones: [0, 2, 5, 7, 10],
    solfege: ["1", "2", "4", "5", "♭7"],
    chineseNames: ["商", "角", "徵", "羽", "宮"],
    description: "以商音為主音的五聲音階。調性剛健明朗中帶有一絲剛毅與凝練，色彩類似多利亞（Dorian）五聲形態。"
  },
  {
    id: "jue-pentatonic",
    name: "角調五聲音階",
    englishName: "Jue Pentatonic",
    alias: "角調式",
    category: "chinese",
    difficulty: "intermediate",
    semitones: [0, 3, 5, 8, 10],
    solfege: ["1", "♭3", "4", "♭6", "♭7"],
    chineseNames: ["角", "徵", "羽", "宮", "商"],
    description: "以角音為主音的五聲音階。色彩深沉婉約、幽遠柔和，類似弗里吉亞（Phrygian）的東方詩意意象。"
  },
  {
    id: "zhi-pentatonic",
    name: "徵調五聲音階",
    englishName: "Zhi Pentatonic",
    alias: "徵調式、南呂徵調",
    category: "chinese",
    difficulty: "beginner",
    semitones: [0, 2, 5, 7, 9],
    solfege: ["1", "2", "4", "5", "6"],
    chineseNames: ["徵", "羽", "宮", "商", "角"],
    description: "以徵音為主音的五聲音階。明亮活潑、豪邁流暢，民間山歌、歡慶秧歌與戲曲中最常見的調式。"
  },
  {
    id: "yu-pentatonic",
    name: "羽調五聲音階",
    englishName: "Yu / Minor Pentatonic",
    alias: "小調五聲音階、越調",
    category: "chinese",
    difficulty: "beginner",
    semitones: [0, 3, 5, 7, 10],
    solfege: ["1", "♭3", "4", "5", "♭7"],
    chineseNames: ["羽", "宮", "商", "角", "徵"],
    description: "以羽音為主音的五聲音階。抒情細膩、清麗淒美，廣泛應用於抒情民歌，現代流行樂中對應小調五聲音階。"
  },
  {
    id: "yanyue-chinese7",
    name: "燕樂音階",
    englishName: "Yanyue Scale / Qing-Shang",
    alias: "俗樂音階、清商音階",
    category: "chinese",
    difficulty: "intermediate",
    semitones: [0, 2, 4, 5, 7, 9, 10],
    solfege: ["1", "2", "3", "4", "5", "6", "♭7"],
    characteristicBias: "清角（4）、閏（♭7）",
    description: "三大傳統七聲音階之一。加入清角與閏音，偏音帶有降 7 的色彩，盛行於隋唐宮廷俗樂與西域傳入音樂，熱情華美。",
    isTraditionalChinese7: true
  },
  {
    id: "yayue-chinese7",
    name: "雅樂音階",
    englishName: "Yayue Scale / Ancient Scale",
    alias: "古音階、正聲音階",
    category: "chinese",
    difficulty: "intermediate",
    semitones: [0, 2, 4, 6, 7, 9, 11],
    solfege: ["1", "2", "3", "#4", "5", "6", "7"],
    characteristicBias: "變徵（#4）、變宮（7）",
    description: "三大傳統七聲音階之一。歷史最悠久，常見於古代宮廷雅樂與部分北方民歌。升 4 音賦予其出世超然的靈動之氣。",
    isTraditionalChinese7: true
  },
  {
    id: "qingyue-chinese7",
    name: "清樂音階",
    englishName: "Qingyue Scale / New Scale",
    alias: "新音階、下徵音階",
    category: "chinese",
    difficulty: "beginner",
    semitones: [0, 2, 4, 5, 7, 9, 11],
    solfege: ["1", "2", "3", "4", "5", "6", "7"],
    characteristicBias: "清角（4）、變宮（7）",
    description: "三大傳統七聲音階之一。結構與西方自然大調完全相同，廣泛應用於中國民間戲曲、南管、北管音樂及現代江南絲竹。",
    isTraditionalChinese7: true
  },

  // --- 西方自然調式與大小調 ---
  {
    id: "natural-major",
    name: "自然大調",
    englishName: "Natural Major / Ionian",
    alias: "大音階、伊奧尼亞調式",
    category: "western",
    difficulty: "beginner",
    semitones: [0, 2, 4, 5, 7, 9, 11],
    solfege: ["1", "2", "3", "4", "5", "6", "7"],
    description: "西方古典與現代音樂之母，明亮、純粹、正向，全音半音規律為「全全半全全全半」。"
  },
  {
    id: "natural-minor",
    name: "自然小調",
    englishName: "Natural Minor / Aeolian",
    alias: "純小音階、愛奧利亞調式",
    category: "western",
    difficulty: "beginner",
    semitones: [0, 2, 3, 5, 7, 8, 10],
    solfege: ["1", "2", "♭3", "4", "5", "♭6", "♭7"],
    description: "西方小調基準，富含幽怨、哀思與沉靜感，與關係大調共享相同調號。"
  },
  {
    id: "harmonic-minor",
    name: "和聲小調",
    englishName: "Harmonic Minor",
    alias: "和聲小音階",
    category: "western",
    difficulty: "intermediate",
    semitones: [0, 2, 3, 5, 7, 8, 11],
    solfege: ["1", "2", "♭3", "4", "5", "♭6", "7"],
    description: "將自然小調的第 7 音升高半音形成導音，第 6 與第 7 音之間形成增二度音程，兼具古典嚴謹與東歐異域色彩。"
  },
  {
    id: "melodic-minor",
    name: "旋律小調",
    englishName: "Melodic Minor / Jazz Minor",
    alias: "爵士小調音階",
    category: "western",
    difficulty: "intermediate",
    semitones: [0, 2, 3, 5, 7, 9, 11],
    solfege: ["1", "2", "♭3", "4", "5", "6", "7"],
    description: "同時升高第 6、第 7 音消除增二度。現代爵士樂中上下行皆採用此結構，是爵士和聲體系的重要母音階。"
  },
  {
    id: "modern-minor",
    name: "現代小調",
    englishName: "Modern Minor / Minor Bebop",
    alias: "現代融合小調",
    category: "western",
    difficulty: "advanced",
    semitones: [0, 2, 3, 5, 7, 8, 10, 11],
    solfege: ["1", "2", "♭3", "4", "5", "♭6", "♭7", "7"],
    description: "在小調中同時融入降 7 級與還原 7 級導音的八音體系，極受現代影視配樂與現代融合爵士即興青睞。"
  },
  {
    id: "neapolitan-minor",
    name: "拿坡里小調",
    englishName: "Neapolitan Minor",
    alias: "那不勒斯小調",
    category: "western",
    difficulty: "advanced",
    semitones: [0, 1, 3, 5, 7, 8, 11],
    solfege: ["1", "♭2", "♭3", "4", "5", "♭6", "7"],
    description: "具有降二級（♭2）與大七級（7）的獨特小調，戲劇張力極強，常現於巴洛克歌劇與浪漫派戲劇高潮。"
  },

  // --- 七大教會調式 (Church Modes) ---
  {
    id: "mode-dorian",
    name: "Dorian 多利亞調式",
    englishName: "Dorian Mode",
    alias: "大六度小調",
    category: "modes",
    difficulty: "intermediate",
    semitones: [0, 2, 3, 5, 7, 9, 10],
    solfege: ["1", "2", "♭3", "4", "5", "6", "♭7"],
    description: "大調第二級調式。小調色彩中帶有明亮的大六度（6 音），中世紀民謠、放克、現代爵士樂最愛調式之一。"
  },
  {
    id: "mode-phrygian",
    name: "Phrygian 弗里吉亞調式",
    englishName: "Phrygian Mode",
    alias: "小二度小調",
    category: "modes",
    difficulty: "intermediate",
    semitones: [0, 1, 3, 5, 7, 8, 10],
    solfege: ["1", "♭2", "♭3", "4", "5", "♭6", "♭7"],
    description: "大調第三級調式。標誌性的小二度（♭2）帶來西班牙佛朗明哥與濃烈的中東神秘感。"
  },
  {
    id: "mode-lydian",
    name: "Lydian 利第安調式",
    englishName: "Lydian Mode",
    alias: "增四度大調",
    category: "modes",
    difficulty: "intermediate",
    semitones: [0, 2, 4, 6, 7, 9, 11],
    solfege: ["1", "2", "3", "#4", "5", "6", "7"],
    description: "大調第四級調式。增四度（#4）消除了傳統三全音緊張感，產生漂浮、夢幻與科幻太空感。"
  },
  {
    id: "mode-mixolydian",
    name: "Mixolydian 混合利第安調式",
    englishName: "Mixolydian Mode",
    alias: "屬音階、降七度大調",
    category: "modes",
    difficulty: "intermediate",
    semitones: [0, 2, 4, 5, 7, 9, 10],
    solfege: ["1", "2", "3", "4", "5", "6", "♭7"],
    description: "大調第五級調式。大調基礎上帶有降七度（♭7），經典搖滾、藍調、放克的主力調式。"
  },
  {
    id: "mode-locrian",
    name: "Locrian 洛克里亞調式",
    englishName: "Locrian Mode",
    alias: "減五度小調",
    category: "modes",
    difficulty: "advanced",
    semitones: [0, 1, 3, 5, 6, 8, 10],
    solfege: ["1", "♭2", "♭3", "4", "♭5", "♭6", "♭7"],
    description: "大調第七級調式。主三和弦為減三和弦（含有 ♭5），極度不穩定，常代表恐懼、懸疑與深淵感。"
  },

  // --- 藍調與爵士即興 ---
  {
    id: "blues-scale",
    name: "經典六音藍調",
    englishName: "Blues Scale",
    alias: "小調藍調音階",
    category: "jazz_blues",
    difficulty: "beginner",
    semitones: [0, 3, 5, 6, 7, 10],
    solfege: ["1", "♭3", "4", "♭5", "5", "♭7"],
    description: "藍調靈魂所在，在小調五聲音階中加入了藍調特色降五度（♭5 Blue Note），散發深邃苦澀又熱烈的韻律。"
  },
  {
    id: "major-blues",
    name: "大調藍調音階",
    englishName: "Major Blues Scale",
    alias: "六音大調藍調",
    category: "jazz_blues",
    difficulty: "intermediate",
    semitones: [0, 2, 3, 4, 7, 9],
    solfege: ["1", "2", "♭3", "3", "5", "6"],
    description: "在大調五聲音階中加入了小三度（♭3）藍調滑音音符，明朗歡快中帶有瀟灑的布魯斯滑音趣味。"
  },
  {
    id: "bebop-dominant",
    name: "咆嘯屬音階",
    englishName: "Bebop Dominant Scale",
    alias: "比博普屬音階",
    category: "jazz_blues",
    difficulty: "advanced",
    semitones: [0, 2, 4, 5, 7, 9, 10, 11],
    solfege: ["1", "2", "3", "4", "5", "6", "♭7", "7"],
    description: "咆嘯爵士大師專用，在屬七音階中加入大七度過渡音，使八分音符下行跑動時和弦音永遠落在強拍上。"
  },
  {
    id: "altered-scale",
    name: "變化音階",
    englishName: "Altered Scale / Super Locrian",
    alias: "超洛克里亞音階",
    category: "jazz_blues",
    difficulty: "advanced",
    semitones: [0, 1, 3, 4, 6, 8, 10],
    solfege: ["1", "♭2", "♭3", "♭4", "♭5", "♭6", "♭7"],
    description: "爵士樂屬和弦最極致的張力音階，囊括 ♭9, #9, ♭5(#11), #5(♭13) 等所有變化張力音，解決回主和弦時滿足感極高。"
  },
  {
    id: "lydian-dominant",
    name: "利第安屬音階",
    englishName: "Lydian Dominant",
    alias: "Mixolydian #4、升四度屬音階",
    category: "jazz_blues",
    difficulty: "advanced",
    semitones: [0, 2, 4, 6, 7, 9, 10],
    solfege: ["1", "2", "3", "#4", "5", "6", "♭7"],
    description: "旋律小調第四級衍生音階，兼具利第安的飄逸增四度（#4）與屬七和弦的降七度（♭7），經典三全音替代必備。"
  },

  // --- 世界民族與異國調式 ---
  {
    id: "hirajoshi",
    name: "日本平調子",
    englishName: "Hirajoshi Scale",
    alias: "日本箏調式、平調子",
    category: "world",
    difficulty: "intermediate",
    semitones: [0, 2, 3, 7, 8],
    solfege: ["1", "2", "♭3", "5", "♭6"],
    description: "源自日本傳統箏曲的五聲音階。音程結構精妙（2-1-4-1-4 半音），營造出典型日本禪意、和風古雅與櫻落之寂。"
  },
  {
    id: "insen-kumoi",
    name: "日本陰旋律",
    englishName: "Insen & Kumoi Scale",
    alias: "都節音階、雲井音階",
    category: "world",
    difficulty: "intermediate",
    semitones: [0, 1, 5, 7, 10],
    solfege: ["1", "♭2", "4", "5", "♭7"],
    description: "江戶時代三味線與尺八經典音階。小二度強烈對比，洋溢東洋夜行、刀劍與幽玄侘寂之美。"
  },
  {
    id: "iwato",
    name: "日本岩戶音階",
    englishName: "Iwato Scale",
    alias: "岩戶調式",
    category: "world",
    difficulty: "advanced",
    semitones: [0, 1, 5, 6, 10],
    solfege: ["1", "♭2", "4", "♭5", "♭7"],
    description: "源自天岩戶神話古調，包含減五度與小二度，張力極度緊縮，呈現冷冽、深谷與太古神祭氛圍。"
  },
  {
    id: "raga-bhairav",
    name: "印度拜拉夫拉格",
    englishName: "Raga Bhairav",
    alias: "雙和聲大調、黎明拉格",
    category: "world",
    difficulty: "advanced",
    semitones: [0, 1, 4, 5, 7, 8, 11],
    solfege: ["1", "♭2", "3", "4", "5", "♭6", "7"],
    description: "北印度古典音樂聖境拉格，傳統用於拂曉黎明冥想。擁有兩個增二度音程，莊嚴肅穆、敬畏神聖。"
  },
  {
    id: "raga-kafi",
    name: "印度卡菲拉格",
    englishName: "Raga Kafi",
    alias: "春季夜間拉格",
    category: "world",
    difficulty: "intermediate",
    semitones: [0, 2, 3, 5, 7, 9, 10],
    solfege: ["1", "2", "♭3", "4", "5", "6", "♭7"],
    description: "印度古典三大基本體系之一，常用於排燈節與春夜慶典，旋律宛轉浪漫、抒情動人。"
  },
  {
    id: "gypsy-minor",
    name: "吉普賽小調",
    englishName: "Hungarian / Gypsy Minor",
    alias: "匈牙利小調音階",
    category: "world",
    difficulty: "advanced",
    semitones: [0, 2, 3, 6, 7, 8, 11],
    solfege: ["1", "2", "♭3", "#4", "5", "♭6", "7"],
    description: "具有兩個增二度（#4 與 7），濃烈吉普賽流浪風格，既有如泣如訴的悲切，又有如疾風驟雨般的狂熱舞蹈節奏。"
  },
  {
    id: "byzantine",
    name: "拜占庭雙和聲",
    englishName: "Byzantine / Arabic Hijaz",
    alias: "阿拉伯席賈茲調式",
    category: "world",
    difficulty: "advanced",
    semitones: [0, 1, 4, 5, 7, 8, 11],
    solfege: ["1", "♭2", "3", "4", "5", "♭6", "7"],
    description: "拜占庭教會與阿拉伯傳統音樂的核心，音調充滿沙漠商隊、金色宮殿與古老綠洲的神奇異域色彩。"
  }
];

export const ROOT_NOTES = [
  "C", "C#", "D", "Eb", "E", "F", "F#", "G", "Ab", "A", "Bb", "B"
];

const NOTE_TO_SEMITONE: Record<string, number> = {
  "C": 0, "C#": 1, "Db": 1,
  "D": 2, "D#": 3, "Eb": 3,
  "E": 4,
  "F": 5, "F#": 6, "Gb": 6,
  "G": 7, "G#": 8, "Ab": 8,
  "A": 9, "A#": 10, "Bb": 10,
  "B": 11
};

const SEMITONE_TO_NOTE_SHARP = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const SEMITONE_TO_NOTE_FLAT  = ["C", "Db", "D", "Eb", "E", "F", "Gb", "G", "Ab", "A", "Bb", "B"];

export function getScaleNotes(rootNote: string, semitones: number[]): string[] {
  const rootSemi = NOTE_TO_SEMITONE[rootNote] ?? 0;
  const useFlat = ["F", "Bb", "Eb", "Ab", "Db"].includes(rootNote);
  const table = useFlat ? SEMITONE_TO_NOTE_FLAT : SEMITONE_TO_NOTE_SHARP;

  return semitones.map((semi) => {
    const total = (rootSemi + semi) % 12;
    return table[total];
  });
}
