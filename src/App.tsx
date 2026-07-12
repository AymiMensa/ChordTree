import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { Play, Square, Settings2, Share2, Volume2, Waves, Repeat, RefreshCw, FolderTree, FileCode, CheckSquare, Settings, Compass, Activity, Layers, Sparkles, Search, Music } from "lucide-react";
import { AudioEngine } from "./utils/audioEngine";
import { ChordTreeNode, buildChordTree, buildChordTreeB, flattenTree, getChordSpelling, getChordMidiNotes, getChordDetails, getDominant } from "./chordsData";
import { PlaybackState, ProgressionStep } from "./types";
import { CustomChord } from "./components/FreeModeEditor";
import { ChordMindMap } from "./components/ChordMindMap";
import { CustomProgressionFlow } from "./components/CustomProgressionFlow";
import { FreeModeEditor } from "./components/FreeModeEditor";
import { InteractiveGuides } from "./components/InteractiveGuides";
import { MetronomeControls } from "./components/MetronomeControls";
import { PianoVisualizer } from "./components/PianoVisualizer";
import { PopQuiz } from "./components/PopQuiz";
import { ChordMindMapB } from "./components/ChordMindMapB";
import { Tooltip } from "./components/TooltipProvider";

// Generate a random path starting at a specified node
function generateRandomProgression(
  startNodeId: string,
  chordNodes: ChordTreeNode[],
  targetDepth: number,
  treeVariant: "A" | "B" | "CUSTOM"
): ProgressionStep[] {
  let currentNode = chordNodes.find(n => n.id === startNodeId) || chordNodes[0];
  const progression: ProgressionStep[] = [];

  progression.push({
    type: "node",
    id: currentNode.id,
    label: currentNode.name,
    notes: getChordSpelling(currentNode.name),
  });

  if (treeVariant === "B") {
    let currentDepth = 0;
    while (currentNode && currentDepth < targetDepth && currentNode.children.length > 0) {
      const children = currentNode.children;
      const randomChild = children[Math.floor(Math.random() * children.length)];

      progression.push({
        type: "node",
        id: randomChild.id,
        label: randomChild.name,
        notes: getChordSpelling(randomChild.name),
      });

      currentNode = randomChild;
      currentDepth++;
    }
  } else {
    let targetCount = 1;
    const desiredTargets = targetDepth + 1;

    while (currentNode && targetCount < desiredTargets && currentNode.children.length > 0) {
      const children = currentNode.children;
      const randomChild = children[Math.floor(Math.random() * children.length)];

      const domChord = getDominant(randomChild.name);
      progression.push({
        type: "node",
        id: `dom-${currentNode.id}-${randomChild.id}`,
        label: domChord,
        notes: getChordSpelling(domChord),
      });

      currentNode = randomChild;

      progression.push({
        type: "node",
        id: currentNode.id,
        label: currentNode.name,
        notes: getChordSpelling(currentNode.name),
      });
      targetCount++;
    }
  }

  return progression;
}

export default function App() {
  const [layers, setLayers] = useState<number>(() => {
    if (typeof window !== 'undefined' && window.innerWidth <= 640) return 5;
    return 5;
  });

  const [collapsedNodes, setCollapsedNodes] = useState<Set<string>>(new Set());
  const [interactionMode, setInteractionMode] = useState<"play" | "fold">("play");
  const [activeTab, setActiveTab] = useState<"controls" | "path" | "guide">("controls");
  const [isFreeModeEditing, setIsFreeModeEditing] = useState(false);
  const [customProgressionList, setCustomProgressionList] = useState<CustomChord[]>([]);
  const [isCustomPlayback, setIsCustomPlayback] = useState(false);
  const [isPopQuizActive, setIsPopQuizActive] = useState(false);
  const [treeVariant, setTreeVariant] = useState<"A" | "B" | "CUSTOM">("A");

  const maxDepth = useMemo(() => {
    if (treeVariant === "B") return layers - 1;
    return Math.floor((layers - 1) / 2);
  }, [layers, treeVariant]);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchFeedback, setSearchFeedback] = useState<string | null>(null);

  const rootTree = useMemo(() => {
    if (treeVariant === "B") return buildChordTreeB(maxDepth);
    return buildChordTree(maxDepth);
  }, [maxDepth, treeVariant]);

  const CHORD_NODES = useMemo(() => flattenTree(rootTree), [rootTree]);

  const ROOT_NODE_ID = "root-C";

  // 1. App state
  const [playbackState, setPlaybackState] = useState<PlaybackState>({
    isPlaying: false,
    isRepeat: false,
    bpm: 100,
    currentBeat: 1,
    activeNodeId: ROOT_NODE_ID,
    activePath: [ROOT_NODE_ID],
    activeStepIndex: 0,
    activeProgression: [
      {
        type: "node",
        id: ROOT_NODE_ID,
        label: "C",
        notes: getChordSpelling("C"),
      },
    ],
    beatsPerMeasure: 4,
    synthVolume: 0.5,
    metronomeVolume: 0.6,
    soundMode: "pad",
    synthStyle: "pad",
    activeGroove: "None",
  });

  // Mutable reference state for Audio Engine synchronous access
  const engineStateRef = useRef({
    stepIndex: playbackState.activeStepIndex,
    progression: playbackState.activeProgression,
    isPlaying: playbackState.isPlaying,
    isRepeat: playbackState.isRepeat,
    justStarted: false,
  });

  // Keep ref strictly synced when state changes (important for start/stop/reset interactions)
  useEffect(() => {
    engineStateRef.current.stepIndex = playbackState.activeStepIndex;
    engineStateRef.current.progression = playbackState.activeProgression;
    engineStateRef.current.isPlaying = playbackState.isPlaying;
    engineStateRef.current.isRepeat = playbackState.isRepeat;
  }, [
    playbackState.activeStepIndex,
    playbackState.activeProgression,
    playbackState.isPlaying,
    playbackState.isRepeat,
  ]);

  // Visual beat flashing indicator
  const [metronomeBeat, setMetronomeBeat] = useState(1);

  // Synchronize state when the chord tree structure is rebuilt (e.g., layers or fold state changed)
  useEffect(() => {
    if (isCustomPlayback) return;
    if (playbackState.activeNodeId.startsWith("dom-") || playbackState.activeNodeId.startsWith("search-")) return;

    // If the currently active node is no longer present in the newly generated node set, reset to ROOT
    const nodeExists = CHORD_NODES.some((n) => n.id === playbackState.activeNodeId);
    if (!nodeExists) {
      const defaultStep: ProgressionStep = {
        type: "node",
        id: ROOT_NODE_ID,
        label: "C",
        notes: getChordSpelling("C"),
      };
      setPlaybackState((prev) => ({
        ...prev,
        activeNodeId: ROOT_NODE_ID,
        activePath: [ROOT_NODE_ID],
        activeProgression: [defaultStep],
        activeStepIndex: 0,
        isPlaying: false, // Stop playback on structure rebuild if invalid
      }));
      audioEngineRef.current.stop();
    }
  }, [CHORD_NODES, playbackState.activeNodeId, isCustomPlayback]);

  // Derive active steps
  const currentStep =
    playbackState.activeProgression[playbackState.activeStepIndex] ||
    playbackState.activeProgression[0];

  // 2. Audio Engine Callbacks

  // A. onScheduleBeat: Invoked precisely before audio scheduling. Must return the notes to play.
  const handleScheduleBeat = useCallback((beatNum: number) => {
    const state = engineStateRef.current;

    // Advance step on Beat 1 if playing
    if (beatNum === 1 && state.isPlaying) {
      if (state.justStarted) {
        state.justStarted = false; // Do not advance on very first beat
      } else {
        state.stepIndex++;

        // End of progression?
        if (state.stepIndex >= state.progression.length) {
          if (state.isRepeat) {
            state.stepIndex = 0;
          } else {
            state.isPlaying = false;
            setTimeout(() => {
              setPlaybackState((prev) => ({ ...prev, isPlaying: false }));
              audioEngineRef.current.stop();
            }, 0);
            return null; // Signals AudioEngine to stop
          }
        }
      }
    }

    const upcomingStep = state.progression[state.stepIndex];
    return upcomingStep ? upcomingStep.notes : ["C", "E", "G"];
  }, []);

  // B. onPlayBeat: Invoked exactly when the scheduled audio hits the speaker. Updates the UI synchronously with the ear.
  const handlePlayBeat = useCallback((beatNum: number) => {
    setMetronomeBeat(beatNum);

    // Hydrate React UI state with the current engine position
    const state = engineStateRef.current;
    const currentActiveStep = state.progression[state.stepIndex];

    setPlaybackState((prev) => {
      const activeNodeId =
        currentActiveStep && currentActiveStep.type === "node"
          ? currentActiveStep.id
          : prev.activeNodeId;

      const activeNode = CHORD_NODES.find(n => n.id === activeNodeId);
      const activePath = activeNode ? activeNode.path : prev.activePath;

      return {
        ...prev,
        currentBeat: beatNum,
        activeStepIndex: state.stepIndex,
        activeProgression: state.progression,
        activeNodeId,
        activePath,
      };
    });
  }, [CHORD_NODES]);

  // 3. Stable Audio Engine Instance
  const audioEngineRef = useRef<AudioEngine>(null!);
  if (!audioEngineRef.current) {
    audioEngineRef.current = new AudioEngine(
      handleScheduleBeat,
      handlePlayBeat,
    );
  }

  // Sync parameters with AudioEngine when state changes
  useEffect(() => {
    audioEngineRef.current.setParams({
      bpm: playbackState.bpm,
      synthVolume: playbackState.synthVolume,
      metronomeVolume: playbackState.metronomeVolume,
      soundMode: playbackState.soundMode,
      synthStyle: playbackState.synthStyle,
      notes: currentStep?.notes || ["C", "E", "G"],
      activeGroove: playbackState.activeGroove,
    });
  }, [
    playbackState.bpm,
    playbackState.synthVolume,
    playbackState.metronomeVolume,
    playbackState.soundMode,
    playbackState.synthStyle,
    currentStep?.notes,
    playbackState.activeGroove,
  ]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      audioEngineRef.current.stop();
    };
  }, []);

  // 4. Controls Handlers
  const handleTogglePlay = () => {
    const nextPlaying = !playbackState.isPlaying;

    setPlaybackState((prev) => {
      let updatedProg = [...prev.activeProgression];
      let updatedIdx = prev.activeStepIndex;

      // When starting to play, if we are at step 0 of a single-chord list, start with a random walk from the current active node
      if (
        nextPlaying &&
        prev.activeProgression.length === 1
      ) {
        updatedProg = generateRandomProgression(prev.activeNodeId, CHORD_NODES, maxDepth, treeVariant);
        updatedIdx = 0;

        // Auto-expand nodes in the generated path so they become visible
        setCollapsedNodes(prevCollapsed => {
          const next = new Set(prevCollapsed);
          updatedProg.forEach(step => {
            const node = CHORD_NODES.find(n => n.id === step.id);
            if (node) {
              // Force expand all nodes in the active path
              next.delete(step.id);
            }
          });
          return next;
        });
      }

      return {
        ...prev,
        isPlaying: nextPlaying,
        activeProgression: updatedProg,
        activeStepIndex: updatedIdx,
      };
    });

    if (nextPlaying) {
      engineStateRef.current.justStarted = true;
      audioEngineRef.current.start();
    } else {
      audioEngineRef.current.stop();
    }
  };

  const handleToggleRepeat = () => {
    setPlaybackState((prev) => ({ ...prev, isRepeat: !prev.isRepeat }));
  };

  const handleGenerateNewPath = () => {
    const newProgression = generateRandomProgression(playbackState.activeNodeId, CHORD_NODES, maxDepth, treeVariant);
    // Auto-expand nodes in the new path
    setCollapsedNodes(prevCollapsed => {
      const next = new Set(prevCollapsed);
      newProgression.forEach(step => {
        const node = CHORD_NODES.find(n => n.id === step.id);
        if (node) {
          // Force expand all nodes in the new path
          next.delete(step.id);
        }
      });
      return next;
    });
    setPlaybackState((prev) => ({
      ...prev,
      activeProgression: newProgression,
      activeStepIndex: 0,
    }));
  };

  const handleBpmChange = (newBpm: number) => {
    const clampedBpm = Math.max(30, Math.min(300, newBpm));
    setPlaybackState((prev) => ({ ...prev, bpm: clampedBpm }));
  };

  const handleVolumeChange = (type: "synth" | "metronome", value: number) => {
    setPlaybackState((prev) => ({
      ...prev,
      [type === "synth" ? "synthVolume" : "metronomeVolume"]: value,
    }));
  };

  const handleSoundModeChange = (mode: "pad" | "arpeggio" | "silent") => {
    setPlaybackState((prev) => ({ ...prev, soundMode: mode }));
  };

  const handleSynthStyleChange = useCallback((style: any) => {
    setPlaybackState((prev) => ({ ...prev, synthStyle: style }));
  }, []);

  const handleGrooveChange = useCallback((groove: any) => {
    setPlaybackState((prev) => ({ ...prev, activeGroove: groove }));
  }, []);

  // Click handler for node interaction (direct trial listen / path focus)
  const handleNodeClick = (nodeId: string, chordName: string, path: string[]) => {
    const singleStep: ProgressionStep = {
      type: "node",
      id: nodeId,
      label: chordName,
      notes: getChordSpelling(chordName),
    };

    setPlaybackState((prev) => ({
      ...prev,
      activeNodeId: nodeId,
      activePath: path,
      activeProgression: [singleStep],
      activeStepIndex: 0, // Focus directly on the clicked node
    }));

    // Trigger instant synth chord play when clicked
    audioEngineRef.current.triggerChordDirectly(singleStep.notes);
  };

  const handleToggleFold = (nodeId: string) => {
    setCollapsedNodes(prev => {
      if (nodeId === "EXPAND_ALL") return new Set(); // Magic string to expand all
      const next = new Set(prev);
      if (next.has(nodeId)) {
        next.delete(nodeId);
      } else {
        next.add(nodeId);
      }
      return next;
    });
  };

  const handleReset = () => {
    setIsCustomPlayback(false);

    const defaultStep: ProgressionStep = {
      type: "node",
      id: ROOT_NODE_ID,
      label: "C",
      notes: getChordSpelling("C"),
    };
    setPlaybackState((prev) => ({
      ...prev,
      activeNodeId: ROOT_NODE_ID,
      activePath: [ROOT_NODE_ID],
      activeProgression: [defaultStep],
      activeStepIndex: 0,
      isPlaying: false,
    }));
    audioEngineRef.current.stop();
    audioEngineRef.current.triggerChordDirectly(defaultStep.notes);
  };

  const handleConfirmCustomProgression = (progression: ProgressionStep[], rawChords: CustomChord[]) => {
    setIsFreeModeEditing(false);
    if (progression.length > 0) {
      setIsCustomPlayback(true);
      setCustomProgressionList(rawChords);

      setPlaybackState((prev) => ({
        ...prev,
        activeNodeId: "",
        activePath: [],
        activeProgression: progression,
        activeStepIndex: 0,
        isPlaying: false,
      }));
      audioEngineRef.current.stop();
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    const query = searchQuery.trim();
    try {
      const details = getChordDetails(query);
      if (details) {
        // We only find the first occurrence in the tree
        const node = CHORD_NODES.find(n => n.name === query);
        if (node) {
          handleNodeClick(node.id, node.name, node.path);
          setSearchFeedback(`已定位和弦: ${query}`);
        } else {
          // It's a valid chord (e.g. dominant 7th like A7) but not a main node in the tree. Play it ad-hoc!
          const adhocStep: ProgressionStep = {
            type: "node",
            id: "search-" + query,
            label: query,
            notes: details.notes,
          };
          setPlaybackState((prev) => ({
            ...prev,
            activeNodeId: "search-" + query,
            activePath: ["search-" + query],
            activeProgression: [adhocStep],
            activeStepIndex: 0,
          }));
          audioEngineRef.current.triggerChordDirectly(adhocStep.notes);
          setSearchFeedback(`已播放和弦: ${query} (無節點對應)`);
        }
      }
    } catch (err) {
      setSearchFeedback(`找不到或不支援 "${query}" 格式。請輸入如 Dm, Eb, G7 等。`);
    }
  };

  return (
    <div className="h-[100dvh] w-screen bg-slate-950 text-slate-100 flex flex-col relative selection:bg-indigo-500/30 selection:text-white overflow-hidden">
      {/* Dynamic star grid background decoration */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(30,27,75,0.15)_1px,transparent_1px),linear-gradient(90deg,rgba(30,27,75,0.15)_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />
      <div className="absolute top-0 left-0 right-0 h-[450px] bg-[radial-gradient(circle_at_top_center,rgba(79,70,229,0.08)_0%,transparent_75%)] pointer-events-none" />

      {/* Main Container with desktop/mobile adaptive layouts */}
      <main className="flex-1 w-full max-w-[1500px] mx-auto px-1 sm:px-2 md:px-4 py-1 sm:py-2 flex flex-col gap-1 sm:gap-2 z-10 min-h-0 overflow-hidden">

        {/* NEW LAYOUT WRAPPER */}
        <div className="flex flex-col landscape:flex-row lg:flex-row gap-2 sm:gap-3 flex-1 items-stretch min-h-0">

          {/* LEFT COLUMN (Title + Graph) */}
          <div className="flex flex-col shrink-0 h-[45vh] landscape:h-auto landscape:flex-1 lg:h-auto lg:flex-1 min-w-0">

            {/* Title Header */}
            <header className="flex flex-col xl:flex-row xl:items-center justify-between gap-2 shrink-0 px-1 pb-1 sm:pb-2 mb-0.5 sm:mb-1 border-b border-indigo-900/30">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="p-1 sm:p-1.5 bg-gradient-to-br from-pink-500 to-indigo-600 rounded-lg sm:rounded-xl text-white shadow-lg shadow-pink-500/20 shrink-0">
                  <Music className="w-3.5 h-3.5 sm:w-5 sm:h-5" />
                </span>

                <div className="flex flex-col min-w-0">
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <h1 className="text-sm sm:text-lg md:text-xl font-extrabold font-display text-white tracking-wide truncate mobile-landscape-title">
                      互動式樂理和弦進行心智圖
                    </h1>
                    <div className="hidden sm:flex items-center px-1.5 py-0.5 rounded-full bg-indigo-900/60 border border-indigo-700/50 text-[9px] sm:text-[10px] text-indigo-200 shrink-0">
                      <span className="font-bold mr-1 text-indigo-300">D3.js</span>
                      樂理解析版
                    </div>
                  </div>
                  <div className="text-[9px] sm:text-[11px] md:text-xs text-slate-400 mt-0.5 font-medium tracking-wide truncate hidden landscape:block sm:block mobile-landscape-subtitle max-lg:landscape:text-[6px]">
                    基於屬七和弦 (Dominant 7th) 與主音 (Tonic) 解決關係的無限遞迴樂理視覺化演繹。
                  </div>
                </div>
              </div>

              {/* Variant Selector */}
              {!isFreeModeEditing && !isCustomPlayback && (
                <div className="flex items-center bg-[#03001e]/80 border border-indigo-950/50 rounded-lg p-0.5 shadow-lg shrink-0 max-w-full overflow-x-auto custom-scrollbar">
                  <Tooltip content="原始版本的和弦進行心智圖">
                    <button
                      onClick={() => {
                        setTreeVariant("A");
                        setLayers(5);
                        setCollapsedNodes(new Set());
                      }}
                      className={`px-2 py-1 text-[9px] sm:text-[10px] font-semibold rounded-md transition-all whitespace-nowrap shrink-0 ${treeVariant === "A"
                          ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/25"
                          : "text-slate-400 hover:text-slate-200 hover:bg-indigo-900/40"
                        }`}
                    >
                      原始心智圖
                    </button>
                  </Tooltip>
                  <Tooltip content="以五度圈結構為基礎的放射狀版本">
                    <button
                      onClick={() => {
                        setTreeVariant("B");
                        setLayers(11);
                        setCollapsedNodes(new Set());
                      }}
                      className={`px-2 py-1 text-[9px] sm:text-[10px] font-semibold rounded-md transition-all whitespace-nowrap shrink-0 ${treeVariant === "B"
                          ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/25"
                          : "text-slate-400 hover:text-slate-200 hover:bg-indigo-900/40"
                        }`}
                    >
                      對稱放射版
                    </button>
                  </Tooltip>
                  <Tooltip content="由您自己建立的和弦進行">
                    <button
                      onClick={() => setTreeVariant("CUSTOM")}
                      className={`px-2 py-1 text-[9px] sm:text-[10px] font-semibold rounded-md transition-all whitespace-nowrap shrink-0 ${treeVariant === "CUSTOM"
                          ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/25"
                          : "text-slate-400 hover:text-slate-200 hover:bg-indigo-900/40"
                        }`}
                    >
                      自訂和弦表
                    </button>
                  </Tooltip>
                </div>
              )}
            </header>

            {/* Graph Area */}
            <div className="relative flex-1 bg-slate-950/80 backdrop-blur-3xl border border-indigo-900/50 rounded-xl sm:rounded-2xl overflow-hidden shadow-2xl flex flex-col min-h-0">
              {isFreeModeEditing ? (
                <FreeModeEditor
                  initialChords={customProgressionList}
                  onConfirm={handleConfirmCustomProgression}
                  onCancel={() => setIsFreeModeEditing(false)}
                />
              ) : isCustomPlayback ? (
                <>
                  <div className="absolute top-2 left-2 sm:left-3 flex items-center gap-1 text-[8px] sm:text-[9px] font-mono text-slate-500 tracking-wider uppercase z-10 pointer-events-none">
                    <Layers className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-emerald-500" />
                    <span>自訂和弦進行</span>
                  </div>
                  <CustomProgressionFlow
                    progression={playbackState.activeProgression}
                    activeStepIndex={playbackState.activeStepIndex}
                  />
                </>
              ) : (
                <>
                  {/* Render the selected Variant */}
                  {treeVariant === "A" && (
                    <>
                      <div className="absolute top-2 left-2 sm:left-3 flex items-center gap-1 text-[8px] sm:text-[9px] font-mono text-slate-500 tracking-wider uppercase z-10 pointer-events-none">
                        <Layers className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-indigo-500" />
                        <span>和弦分支圖 (支援拖曳與縮放)</span>
                      </div>
                      <div className="absolute bottom-2 sm:bottom-3 right-2 sm:right-3 text-[7px] sm:text-[8px] font-mono text-slate-600 z-10 pointer-events-none text-right">
                        D3.js 遞迴圖 (層級 0 - {maxDepth})<br />(觸控 / 滑鼠拖曳移動視角)
                      </div>
                      <div className="absolute inset-0 p-1 flex items-center justify-center">
                        <ChordMindMap
                          rootTree={rootTree}
                          maxTreeDepth={maxDepth}
                          collapsedNodes={collapsedNodes}
                          activeNodeId={playbackState.activeNodeId}
                          activeStepIndex={playbackState.activeStepIndex}
                          activeProgression={playbackState.activeProgression}
                          onNodeClick={handleNodeClick}
                          onToggleFold={handleToggleFold}
                          metronomeBeat={metronomeBeat}
                          interactionMode={interactionMode}
                          isPlaying={playbackState.isPlaying}
                        />
                      </div>
                    </>
                  )}

                  {treeVariant === "B" && (
                    <div className="absolute inset-0 p-1 flex items-center justify-center">
                      <ChordMindMapB
                        rootTree={rootTree}
                        maxTreeDepth={maxDepth}
                        collapsedNodes={collapsedNodes}
                        activeNodeId={playbackState.activeNodeId}
                        activeStepIndex={playbackState.activeStepIndex}
                        activeProgression={playbackState.activeProgression}
                        onNodeClick={handleNodeClick}
                        onToggleFold={handleToggleFold}
                        metronomeBeat={metronomeBeat}
                        interactionMode={interactionMode}
                        isPlaying={playbackState.isPlaying}
                      />
                    </div>
                  )}

                  {treeVariant === "CUSTOM" && (
                    <>
                      <div className="absolute top-2 left-2 sm:left-3 flex items-center gap-1 text-[8px] sm:text-[9px] font-mono text-slate-500 tracking-wider uppercase z-10 pointer-events-none">
                        <Layers className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-indigo-500" />
                        <span>目前和弦進行軌跡 (橫向版)</span>
                      </div>
                      <CustomProgressionFlow
                        progression={playbackState.activeProgression}
                        activeStepIndex={playbackState.activeStepIndex}
                      />
                    </>
                  )}
                </>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN (Controls) */}
          <div className={`flex flex-col flex-1 landscape:flex-none landscape:w-[48%] lg:flex-none lg:w-[400px] xl:w-[450px] shrink-0 gap-1.5 sm:gap-2 min-h-0 overflow-y-auto custom-scrollbar pb-2 pr-1 ${isFreeModeEditing ? 'max-lg:landscape:hidden' : ''}`}>

            {/* Global Controls Card (Moved from header) */}
            <div className="flex flex-col gap-1.5 shrink-0 bg-[#03001e]/80 backdrop-blur-xl border border-indigo-950/50 rounded-xl p-1.5 sm:p-2 shadow-2xl">
              <div className="flex flex-wrap items-center justify-between gap-1 sm:gap-2">
                {/* Search Input */}
                <form onSubmit={handleSearch} className="relative flex-1 min-w-[90px]">
                  <Tooltip content="輸入和弦名稱進行搜尋 (如: Cmaj7, Dm, G7)" className="w-full flex">
                    <input
                      type="text"
                      placeholder="搜尋和弦..."
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setSearchFeedback(null);
                      }}
                      className="w-full bg-slate-900/80 border border-indigo-900/40 text-slate-200 placeholder-slate-500 text-[10px] sm:text-[11px] px-2 py-1 pl-5 sm:pl-6 rounded focus:outline-none focus:border-indigo-500 transition-all"
                    />
                  </Tooltip>
                  <Search className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-slate-500 absolute left-1.5 sm:left-2 top-[6px] sm:top-[6px]" />
                  {searchFeedback && (
                    <div className="absolute top-full left-0 mt-1 bg-indigo-950/90 text-[9px] sm:text-[10px] text-indigo-300 px-2 py-1 rounded shadow-lg border border-indigo-900 z-50 whitespace-nowrap">
                      {searchFeedback}
                    </div>
                  )}
                </form>

                <Tooltip content="建立自訂的和弦進行序列">
                  <button
                    onClick={() => setIsFreeModeEditing(true)}
                    className="flex items-center justify-center gap-1 px-1.5 sm:px-2 py-1 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 transition-colors text-[9px] sm:text-[11px] font-semibold whitespace-nowrap active:scale-95 shrink-0"
                    title="開啟自由編輯模式"
                  >
                    <FileCode className="w-2.5 h-2.5 sm:w-3 sm:h-3 hidden sm:block" />
                    自由編輯
                  </button>
                </Tooltip>

                <Tooltip content="隨機和弦測驗，訓練聽力與反應">
                  <button
                    onClick={() => {
                      audioEngineRef.current?.stop();
                      setPlaybackState(prev => ({ ...prev, isPlaying: false }));
                      setIsPopQuizActive(true);
                    }}
                    className="flex items-center justify-center gap-1 px-1.5 sm:px-2 py-1 rounded bg-pink-500/10 border border-pink-500/30 text-pink-400 hover:bg-pink-500/20 transition-colors text-[9px] sm:text-[11px] font-semibold whitespace-nowrap active:scale-95 shrink-0"
                    title="開啟隨堂考試"
                  >
                    <Music className="w-2.5 h-2.5 sm:w-3 sm:h-3 hidden sm:block" />
                    隨堂考試
                  </button>
                </Tooltip>

                <Tooltip content="回到預設的 C 和弦節點">
                  <button
                    onClick={handleReset}
                    className="flex items-center justify-center gap-1 px-1.5 sm:px-2 py-1 rounded bg-indigo-950/60 hover:bg-indigo-900/60 border border-indigo-900/50 text-[9px] sm:text-[11px] text-indigo-300 transition-all active:scale-95 cursor-pointer whitespace-nowrap shrink-0"
                    title="回到中心主音 C"
                  >
                    <RefreshCw className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                    <span className="hidden sm:inline">重置 C</span>
                  </button>
                </Tooltip>
              </div>

              <div className="flex items-center justify-between gap-1 overflow-x-auto custom-scrollbar pb-0.5">
                <div className="flex items-center gap-0.5 sm:gap-1 bg-black/20 border border-indigo-900/40 px-1 sm:px-1.5 py-0.5 sm:py-1 rounded text-[9px] sm:text-[11px] text-indigo-300 whitespace-nowrap shrink-0">
                  <span className="font-semibold text-slate-400">點擊模式:</span>
                  <Tooltip content="點擊節點進行試聽與播放路徑">
                    <button
                      onClick={() => setInteractionMode("play")}
                      className={`px-1 sm:px-1.5 py-0.5 rounded transition-all ${interactionMode === "play" ? "bg-indigo-500 text-white shadow-sm" : "hover:bg-indigo-900/60"}`}
                      title="點擊節點進行試聽與播放路徑"
                    >
                      🎵 試聽
                    </button>
                  </Tooltip>
                  <Tooltip content="點擊節點將其分支摺疊或展開">
                    <button
                      onClick={() => setInteractionMode("fold")}
                      className={`px-1 sm:px-1.5 py-0.5 rounded transition-all ${interactionMode === "fold" ? "bg-pink-600 text-white shadow-sm" : "hover:bg-indigo-900/60"}`}
                      title="點擊節點將其分支摺疊或展開"
                    >
                      📂 摺疊
                    </button>
                  </Tooltip>
                </div>

                <div className="flex items-center gap-0.5 sm:gap-1 bg-black/20 border border-indigo-900/40 px-1 sm:px-1.5 py-0.5 sm:py-1 rounded text-[9px] sm:text-[11px] text-indigo-300 whitespace-nowrap shrink-0">
                  <FolderTree className="w-2.5 h-2.5 sm:w-3 sm:h-3 hidden sm:block text-slate-400" />
                  <span className="font-semibold text-slate-400">層次:</span>
                  {[5, 7, 9, 11].map(d => (
                    <Tooltip content={`切換顯示層數至 ${d} 層`} key={d}>
                      <button
                        onClick={() => {
                          setLayers(d);
                          setCollapsedNodes(new Set());
                          handleReset();
                        }}
                        className={`px-1 sm:px-1.5 py-0.5 rounded transition-all ${layers === d ? "bg-indigo-500 text-white shadow-sm" : "hover:bg-indigo-900/60"}`}
                        title={`切換顯示層數至 ${d} 層`}
                      >
                        {d}
                      </button>
                    </Tooltip>
                  ))}
                </div>
              </div>
            </div>

            {/* Tabs Header */}
            <div className="flex bg-[#03001e]/80 backdrop-blur-xl border border-indigo-950/50 rounded-xl p-1 shadow-2xl shrink-0">
              <Tooltip content="調整節拍器與合成器設定" className="flex-1 flex">
                <button
                  onClick={() => setActiveTab("controls")}
                  className={`flex-1 py-1 sm:py-1.5 w-full text-[10px] sm:text-xs font-semibold rounded-lg transition-all ${activeTab === "controls"
                      ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/25"
                      : "text-slate-400 hover:text-slate-200"
                    }`}
                  title="切換至控制面板"
                >
                  控制面板
                </button>
              </Tooltip>
              <Tooltip content="檢視目前的和弦進行軌跡" className="flex-1 flex">
                <button
                  onClick={() => setActiveTab("path")}
                  className={`flex-1 py-1 sm:py-1.5 w-full text-[10px] sm:text-xs font-semibold rounded-lg transition-all ${activeTab === "path"
                      ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/25"
                      : "text-slate-400 hover:text-slate-200"
                    }`}
                  title="切換至進行軌跡"
                >
                  進行軌跡
                </button>
              </Tooltip>
              <Tooltip content="檢視心智圖的操作說明" className="flex-1 flex">
                <button
                  onClick={() => setActiveTab("guide")}
                  className={`flex-1 py-1 sm:py-1.5 w-full text-[10px] sm:text-xs font-semibold rounded-lg transition-all ${activeTab === "guide"
                      ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/25"
                      : "text-slate-400 hover:text-slate-200"
                    }`}
                  title="切換至互動指南"
                >
                  互動指南
                </button>
              </Tooltip>
            </div>

            {/* Tab Content Container */}
            <div className="flex-none relative flex flex-col gap-2">
              <div className="flex-none">
                {activeTab === "controls" && (
                  <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <MetronomeControls
                      playbackState={playbackState}
                      onTogglePlay={handleTogglePlay}
                      onToggleRepeat={handleToggleRepeat}
                      onGenerateNewPath={handleGenerateNewPath}
                      onBpmChange={handleBpmChange}
                      onVolumeChange={handleVolumeChange}
                      onSoundModeChange={handleSoundModeChange}
                      onSynthStyleChange={handleSynthStyleChange}
                      onGrooveChange={handleGrooveChange}
                      activeChordLabel={currentStep ? currentStep.label : "C"}
                      activeChordNotes={
                        currentStep ? currentStep.notes : ["C", "E", "G"]
                      }
                      activeChordFormula={
                        getChordDetails(currentStep ? currentStep.label : "C").formula
                      }
                      activeChordFullName={
                        getChordDetails(currentStep ? currentStep.label : "C").fullName
                      }
                      onPlayChordDirectly={() => {
                        if (currentStep) {
                          audioEngineRef.current.triggerChordDirectly(currentStep.notes);
                        } else {
                          audioEngineRef.current.triggerChordDirectly(getChordSpelling("C"));
                        }
                      }}
                      currentStep={currentStep}
                    />
                  </div>
                )}

                {activeTab === "path" && (
                  <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 bg-[#030018]/80 border border-indigo-950/40 rounded-xl p-3 flex flex-col gap-2">
                    <div className="flex items-center justify-between text-[9px] font-mono uppercase tracking-wider text-slate-400 shrink-0">
                      <span className="flex items-center gap-1 font-semibold text-pink-400">
                        <Sparkles className="w-2.5 h-2.5" />
                        進行軌跡
                      </span>
                      <span className="text-slate-500">
                        第 {playbackState.activeStepIndex + 1} 步 / 共{" "}
                        {playbackState.activeProgression.length} 步
                      </span>
                    </div>

                    <div className="flex flex-wrap items-start content-start gap-1.5 bg-black/30 p-3 rounded-lg border border-indigo-950/50 flex-1 overflow-y-auto custom-scrollbar">
                      {playbackState.activeProgression.map((step, idx) => {
                        const isActive = idx === playbackState.activeStepIndex;

                        return (
                          <div
                            key={`${step.id}-${idx}`}
                            className="flex items-center gap-1"
                          >
                            <span
                              onClick={() => {
                                if (step.type === "node") {
                                  const nodeObj = CHORD_NODES.find(
                                    (n) => n.id === step.id,
                                  );
                                  if (nodeObj) handleNodeClick(nodeObj.id, nodeObj.name, nodeObj.path);
                                }
                              }}
                              className={`text-xs font-bold font-mono px-2 py-1 rounded transition-all duration-200 select-none ${isActive
                                  ? "bg-pink-500/20 text-pink-400 border border-pink-500/45 shadow-md shadow-pink-500/10 scale-105 cursor-default"
                                  : step.type === "transition"
                                    ? "bg-amber-950/20 text-amber-500 border border-amber-950/40 cursor-default"
                                    : "bg-indigo-950/45 text-slate-400 hover:text-slate-200 border border-indigo-900/20 cursor-pointer"
                                }`}
                            >
                              {step.label}
                            </span>
                            {idx < playbackState.activeProgression.length - 1 && (
                              <span className="text-indigo-950 font-bold text-xs select-none">
                                →
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {activeTab === "guide" && (
                  <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <InteractiveGuides />
                  </div>
                )}
              </div>

              {/* Keyboard Visualizer firmly at bottom */}
              <div className="shrink-0">
                <PianoVisualizer
                  activeMidiNotes={getChordMidiNotes(currentStep?.label || "C")}
                  chordType={CHORD_NODES.find(n => n.id === currentStep?.id)?.type || 'major'}
                  activeChordLabel={currentStep ? currentStep.label : "C"}
                  activeChordNotes={currentStep ? currentStep.notes : ["C", "E", "G"]}
                  activeChordFormula={getChordDetails(currentStep ? currentStep.label : "C").formula}
                  activeChordFullName={getChordDetails(currentStep ? currentStep.label : "C").fullName}
                  onPlayChordDirectly={() => {
                    if (currentStep) {
                      audioEngineRef.current.triggerChordDirectly(currentStep.notes);
                    } else {
                      audioEngineRef.current.triggerChordDirectly(getChordSpelling("C"));
                    }
                  }}
                />
              </div>

            </div>
          </div>
        </div>
      </main>

      {/* Decorative clean footer */}
      <footer className="shrink-0 w-full text-center py-1 border-t border-indigo-950/30 text-[9px] font-mono text-slate-600 select-none bg-black/20">
        韶韻音樂學院 馬老師設計 專門給 秀玲姊練習用 App
      </footer>

      {isPopQuizActive && (
        <PopQuiz onClose={() => setIsPopQuizActive(false)} />
      )}
    </div>
  );
}
