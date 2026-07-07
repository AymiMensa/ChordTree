import React, { useState } from "react";
import {
  Info,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Music,
  Compass,
  Star,
} from "lucide-react";

export const InteractiveGuides: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="w-full bg-[#040117]/60 border border-indigo-950/30 rounded-2xl p-4 sm:p-5 flex flex-col gap-4 text-xs text-slate-300 leading-relaxed shadow-xl">
      {/* Quick Intro */}
      <div className="flex items-center gap-2 mb-1">
        <HelpCircle className="w-5 h-5 text-indigo-400 shrink-0" />
        <span className="text-sm font-semibold tracking-wide text-indigo-200">
          和弦樹狀進行 · 樂理導覽與說明
        </span>
      </div>

      <p className="text-slate-400">
        本系統重現了您上傳的經典「圓形樹狀和弦進行圖」（Modal Interchange /
        屬七關係分支圖）。它以中央的主音
        <strong className="text-pink-400"> C </strong>
        為起點，每次和弦轉換都會隨機往外層（層級 1 至 層級
        5）探索不同的調性或平行大小調關係，並透過連接線上的屬七和弦（7th
        Chord）完美進行過渡。
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-1">
        {/* Chord Tree Rules */}
        <div className="bg-black/30 p-3 rounded-xl border border-indigo-950/50 flex flex-col gap-1.5">
          <span className="font-semibold text-indigo-300 flex items-center gap-1.5">
            <Compass className="w-4 h-4 text-pink-400" />
            分支移動規則
          </span>
          <ul className="list-disc pl-4 space-y-1 text-slate-400">
            <li>
              <strong className="text-slate-200">隨機分支探索：</strong>
              當啟動進行時，系統會從中心主和弦開始，隨機探索出一條完整的和弦進行路徑。
            </li>
            <li>
              <strong className="text-slate-200">終點停止與重複：</strong>
              當走到路徑終點時，節拍與播放會自動停止；若您開啟了「重複」功能，則會在此路徑上不斷迴圈。
            </li>
            <li>
              <strong className="text-slate-200">手動點擊試聽：</strong>
              即使在播放狀態中，您依然可以隨時點擊地圖上的任何一個和弦，直接激發它的合成器聲音與和弦組成音顯示。
            </li>
          </ul>
        </div>

        {/* Music Theory Rules */}
        <div className="bg-black/30 p-3 rounded-xl border border-indigo-950/50 flex flex-col gap-1.5 md:col-span-2">
          <span className="font-semibold text-indigo-300 flex items-center gap-1.5">
            <Music className="w-4 h-4 text-emerald-400" />
            遞迴演繹規則與亮燈特效
          </span>
          <ul className="list-disc pl-4 space-y-1 text-slate-400">
            <li>
              <strong className="text-pink-400">
                粉紅/深紅燈（大三和弦 Major）：
              </strong>
              展現明亮、正向、開闊的色彩偏向。
            </li>
            <li>
              <strong className="text-cyan-400">
                天藍/深藍燈（小三和弦 Minor）：
              </strong>
              展現深邃、憂鬱、略帶神秘感的色彩偏向。
            </li>
            <li>
              <strong className="text-amber-400">
                金黃色環線（過渡七和弦 Connector）：
              </strong>
              樹狀連結線上的小圓點代表關鍵的導音過渡。
            </li>
            <li className="pt-2 mt-2 border-t border-indigo-900/40">
              <strong className="text-indigo-300">遞迴演繹關係：</strong>
              每一層的<span className="text-sky-400">小和弦</span>會延伸出 3 個<span className="text-pink-400">大和弦</span> (同名大和弦、關係大和弦、以及 VI 級大和弦)；而每個<span className="text-pink-400">大和弦</span>又會延伸出 2 個<span className="text-sky-400">小和弦</span> (同名小和弦、以及關係小和弦)。所有過渡連線皆由其<span className="text-amber-500 font-medium">屬七和弦</span>作為橋樑進行強烈解決。
            </li>
          </ul>
        </div>
      </div>

      {/* Tips for users */}
      <div className="flex gap-2.5 bg-indigo-950/20 border border-indigo-900/30 p-3 rounded-xl mt-auto">
        <Star className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <p className="font-medium text-slate-200 mb-0.5">
            專業混音技巧 (Mix Tips)
          </p>
          <p className="text-slate-400 leading-normal">
            切換至{" "}
            <span className="text-indigo-300 font-semibold">
              Arpeggio (琶音)
            </span>{" "}
            模式能幫助您清晰聆聽每個和弦分解音；而在
            <span className="text-indigo-300 font-semibold">
              {" "}
              Lush Pad
            </span>{" "}
            模式下，鋼琴大三度與小三度的渾厚泛音能提供絕佳的背景即興伴奏。
          </p>
        </div>
      </div>
    </div>
  );
};
