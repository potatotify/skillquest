import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useTabSwitchDetection } from '@/hooks/useTabSwitchDetection';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Car, Target, Sparkles, Zap, Star, Trophy, MousePointer, Keyboard, CheckCircle2 } from 'lucide-react';

interface UnblockMeProps {
  onComplete: (score: number, totalMoves: number, failed?: boolean, failureReason?: string) => void;
  timeRemaining: number;
  isTrialMode?: boolean;
}

type Block = {
  id: number;
  row: number;
  col: number;
  length: number;
  isHorizontal: boolean;
  isTarget: boolean;
};

type Level = {
  name: string;
  difficulty: 'Easy' | 'Hard';
  optimalMoves: number;
  blocks: Block[];
};

export const UnblockMe: React.FC<UnblockMeProps> = ({ onComplete, timeRemaining, isTrialMode = false }) => {
  const GRID_SIZE = 6;
  const CELL_SIZE = 80;
  const TOTAL_TIME = 300;
  const navigate = useNavigate();

  const [currentLevel, setCurrentLevel] = useState(0);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [moves, setMoves] = useState(0);
  const [totalMoves, setTotalMoves] = useState(0);
  const [levelMoves, setLevelMoves] = useState<number[]>(Array(6).fill(0));
  const [levelTimes, setLevelTimes] = useState<number[]>(Array(6).fill(0));
  const [score, setScore] = useState(0);
  const [puzzlesCompleted, setPuzzlesCompleted] = useState(0);
  const [levelComplete, setLevelComplete] = useState(false);
  const [allLevelsComplete, setAllLevelsComplete] = useState(false);
  const [draggedBlock, setDraggedBlock] = useState<number | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [tempPosition, setTempPosition] = useState<{ row: number; col: number } | null>(null);
  const [levelStartTime, setLevelStartTime] = useState<number>(TOTAL_TIME);

  const gridRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  const hasInitializedRef = useRef(false);
  const hasCompletedRef = useRef(false);

  // Tab switch detection - only enabled when not in trial mode
  useTabSwitchDetection({
    maxViolations: 3,
    enabled: !isTrialMode,
    onDisqualified: () => {
      onComplete(puzzlesCompleted, totalMoves, true, 'Disqualified due to tab switching violations');
      navigate('/applicant/assessment');
    },
  });

  // ✅ ALL 6 LEVELS - 3 Easy + 3 Hard
  const allLevels: Level[] = [
    // Easy Level 1
    {
      name: 'Level 1',
      difficulty: 'Easy',
      optimalMoves: 7,
      blocks: [
        { id: 1, row: 2, col: 0, length: 2, isHorizontal: true, isTarget: true },
        { id: 2, row: 1, col: 4, length: 3, isHorizontal: false, isTarget: false },
        { id: 3, row: 1, col: 5, length: 2, isHorizontal: false, isTarget: false },
        { id: 5, row: 3, col: 5, length: 2, isHorizontal: false, isTarget: false },
        { id: 7, row: 4, col: 1, length: 2, isHorizontal: false, isTarget: false },
        { id: 4, row: 0, col: 4, length: 2, isHorizontal: true, isTarget: false },
        { id: 6, row: 1, col: 0, length: 3, isHorizontal: true, isTarget: false },
        { id: 8, row: 3, col: 0, length: 2, isHorizontal: true, isTarget: false },
        { id: 9, row: 4, col: 3, length: 2, isHorizontal: true, isTarget: false },
        { id: 10, row: 5, col: 2, length: 3, isHorizontal: true, isTarget: false },
      ],
    },
    // Easy Level 2
    {
      name: 'Level 2',
      difficulty: 'Easy',
      optimalMoves: 9,
      blocks: [
        { id: 1, row: 2, col: 0, length: 2, isHorizontal: true, isTarget: true },
        { id: 2, row: 0, col: 0, length: 2, isHorizontal: false, isTarget: false },
        { id: 3, row: 3, col: 1, length: 3, isHorizontal: false, isTarget: false },
        { id: 5, row: 2, col: 2, length: 3, isHorizontal: false, isTarget: false },
        { id: 7, row: 2, col: 4, length: 2, isHorizontal: false, isTarget: false },
        { id: 4, row: 0, col: 2, length: 3, isHorizontal: true, isTarget: false },
        { id: 6, row: 1, col: 1, length: 2, isHorizontal: true, isTarget: false },
        { id: 8, row: 1, col: 3, length: 2, isHorizontal: true, isTarget: false },
        { id: 9, row: 4, col: 3, length: 2, isHorizontal: true, isTarget: false },
        { id: 10, row: 5, col: 2, length: 2, isHorizontal: true, isTarget: false },
      ],
    },
    // Easy Level 3
    {
      name: 'Level 3',
      difficulty: 'Easy',
      optimalMoves: 11,
      blocks: [
        { id: 1, row: 2, col: 2, length: 2, isHorizontal: true, isTarget: true },
        { id: 2, row: 1, col: 0, length: 2, isHorizontal: false, isTarget: false },
        { id: 3, row: 1, col: 1, length: 2, isHorizontal: false, isTarget: false },
        { id: 5, row: 0, col: 2, length: 2, isHorizontal: false, isTarget: false },
        { id: 7, row: 0, col: 3, length: 2, isHorizontal: false, isTarget: false },
        { id: 9, row: 1, col: 4, length: 2, isHorizontal: false, isTarget: false },
        { id: 10, row: 3, col: 0, length: 2, isHorizontal: false, isTarget: false },
        { id: 11, row: 4, col: 4, length: 2, isHorizontal: false, isTarget: false },
        { id: 4, row: 0, col: 4, length: 2, isHorizontal: true, isTarget: false },
        { id: 6, row: 3, col: 1, length: 2, isHorizontal: true, isTarget: false },
        { id: 8, row: 3, col: 3, length: 2, isHorizontal: true, isTarget: false },
      ],
    },
    // Hard Level 4
    {
      name: 'Level 4',
      difficulty: 'Hard',
      optimalMoves: 9,
      blocks: [
        { id: 1, row: 2, col: 2, length: 2, isHorizontal: true, isTarget: true },
        { id: 2, row: 2, col: 0, length: 2, isHorizontal: false, isTarget: false },
        { id: 3, row: 2, col: 1, length: 2, isHorizontal: false, isTarget: false },
        { id: 4, row: 0, col: 2, length: 2, isHorizontal: false, isTarget: false },
        { id: 11, row: 0, col: 5, length: 3, isHorizontal: false, isTarget: false },
        { id: 12, row: 4, col: 2, length: 2, isHorizontal: false, isTarget: false },
        { id: 5, row: 1, col: 3, length: 2, isHorizontal: true, isTarget: false },
        { id: 6, row: 3, col: 2, length: 2, isHorizontal: true, isTarget: false },
        { id: 7, row: 3, col: 4, length: 2, isHorizontal: true, isTarget: false },
        { id: 8, row: 4, col: 4, length: 2, isHorizontal: true, isTarget: false },
        { id: 9, row: 5, col: 0, length: 2, isHorizontal: true, isTarget: false },
        { id: 10, row: 5, col: 3, length: 3, isHorizontal: true, isTarget: false },
      ],
    },
    // Hard Level 5
    {
      name: 'Level 5',
      difficulty: 'Hard',
      optimalMoves: 14,
      blocks: [
        { id: 1, row: 2, col: 3, length: 2, isHorizontal: true, isTarget: true },
        { id: 2, row: 0, col: 5, length: 3, isHorizontal: false, isTarget: false },
        { id: 3, row: 2, col: 2, length: 2, isHorizontal: false, isTarget: false },
        { id: 4, row: 3, col: 3, length: 3, isHorizontal: false, isTarget: false },
        { id: 5, row: 1, col: 1, length: 3, isHorizontal: true, isTarget: false },
        { id: 6, row: 3, col: 4, length: 2, isHorizontal: true, isTarget: false },
        { id: 7, row: 4, col: 4, length: 2, isHorizontal: true, isTarget: false },
        { id: 8, row: 5, col: 0, length: 3, isHorizontal: true, isTarget: false },
      ],
    },
    // Hard Level 6
    {
      name: 'Level 6',
      difficulty: 'Hard',
      optimalMoves: 9,
      blocks: [
        { id: 1, row: 2, col: 0, length: 2, isHorizontal: true, isTarget: true },
        { id: 2, row: 0, col: 1, length: 2, isHorizontal: false, isTarget: false },
        { id: 3, row: 2, col: 4, length: 2, isHorizontal: false, isTarget: false },
        { id: 4, row: 2, col: 5, length: 2, isHorizontal: false, isTarget: false },
        { id: 7, row: 2, col: 3, length: 3, isHorizontal: false, isTarget: false },
        { id: 8, row: 3, col: 1, length: 2, isHorizontal: false, isTarget: false },
        { id: 9, row: 4, col: 5, length: 2, isHorizontal: false, isTarget: false },
        { id: 5, row: 1, col: 2, length: 2, isHorizontal: true, isTarget: false },
        { id: 6, row: 1, col: 4, length: 2, isHorizontal: true, isTarget: false },
      ],
    },
  ];

  // ✅ Select levels based on mode
  const selectedLevels = useMemo(() => {
    if (isTrialMode) {
      // Trial mode: Select 2-3 random levels
      const shuffled = [...allLevels].sort(() => Math.random() - 0.5);
      return shuffled.slice(0, 3);
    } else {
      // Actual game: Use all 6 levels in sequential order
      return allLevels;
    }
  }, [isTrialMode]);

  useEffect(() => {
    loadLevel(0);
    hasInitializedRef.current = true;
  }, []);

  // Handle time running out
  useEffect(() => {
    if (timeRemaining === 0 && !isTrialMode && !hasCompletedRef.current) {
      hasCompletedRef.current = true;
      onComplete(puzzlesCompleted, totalMoves);
    }
  }, [timeRemaining, isTrialMode, puzzlesCompleted, totalMoves, onComplete]);

  // Handle game completion
  useEffect(() => {
    if (allLevelsComplete && !hasCompletedRef.current) {
      hasCompletedRef.current = true;
      onComplete(puzzlesCompleted, totalMoves);
    }
  }, [allLevelsComplete, puzzlesCompleted, totalMoves, onComplete]);

  const loadLevel = (levelIndex: number) => {
    if (levelIndex >= selectedLevels.length) {
      setAllLevelsComplete(true);
      return;
    }

    const lvl = selectedLevels[levelIndex];
    if (!isLayoutValid(lvl.blocks)) {
      console.error(`Level ${levelIndex + 1} has an invalid layout (overlap or OOB).`);
    }

    setBlocks(lvl.blocks.map((b) => ({ ...b })));
    setMoves(0);
    setLevelComplete(false);
    setCurrentLevel(levelIndex);
    setLevelStartTime(timeRemaining);
  };

  const isLayoutValid = (bks: Block[]) => {
    const seen = new Set<string>();
    for (const b of bks) {
      for (let i = 0; i < b.length; i++) {
        const r = b.isHorizontal ? b.row : b.row + i;
        const c = b.isHorizontal ? b.col + i : b.col;
        if (r < 0 || r >= GRID_SIZE || c < 0 || c >= GRID_SIZE) return false;
        const key = `${r},${c}`;
        if (seen.has(key)) return false;
        seen.add(key);
      }
    }
    return true;
  };

  const calculateLevelScore = (levelIndex: number, movesUsed: number, timeSpent: number) => {
    const level = selectedLevels[levelIndex];
    const optimal = level.optimalMoves;
    const extraMoves = Math.max(0, movesUsed - optimal);

    let baseScore = level.difficulty === 'Easy' ? 40 : 60;
    const movePenalty = extraMoves * 3;
    const expectedTime = level.difficulty === 'Easy' ? 60 : 90;
    const timePenalty = Math.max(0, Math.floor((timeSpent - expectedTime) / 10));

    const minScore = level.difficulty === 'Easy' ? 10 : 20;
    return Math.max(baseScore - movePenalty - timePenalty, minScore);
  };

  const calculateTotalScore = () => {
    let total = 0;
    for (let i = 0; i <= currentLevel; i++) {
      if (levelMoves[i] > 0 || i === currentLevel) {
        const used = i === currentLevel ? moves : levelMoves[i];
        const timeSpent = i === currentLevel ? levelStartTime - timeRemaining : levelTimes[i];
        total += calculateLevelScore(i, used, timeSpent);
      }
    }
    return Math.min(Math.round(total), 100);
  };

  const checkWin = (currentBlocks: Block[]) => {
    const target = currentBlocks.find((b) => b.isTarget);
    if (target && target.col === GRID_SIZE - target.length) {
      setLevelComplete(true);

      const newLevelMoves = [...levelMoves];
      newLevelMoves[currentLevel] = moves;
      setLevelMoves(newLevelMoves);

      const timeSpent = levelStartTime - timeRemaining;
      const newLevelTimes = [...levelTimes];
      newLevelTimes[currentLevel] = timeSpent;
      setLevelTimes(newLevelTimes);

      const newScore = calculateTotalScore();
      setScore(newScore);

      setPuzzlesCompleted((prev) => prev + 1);
      setTotalMoves((prev) => prev + moves);

      // ✅ Automatically move to next level after completion
      if (currentLevel < selectedLevels.length - 1) {
        setTimeout(() => {
          loadLevel(currentLevel + 1);
        }, 2000);
      } else {
        setAllLevelsComplete(true);
      }
    }
  };

  const canMoveBlock = (block: Block, newRow: number, newCol: number): boolean => {
    if (block.isHorizontal) {
      if (newCol < 0 || newCol + block.length > GRID_SIZE) return false;
    } else {
      if (newRow < 0 || newRow + block.length > GRID_SIZE) return false;
    }

    for (let other of blocks) {
      if (other.id === block.id) continue;
      for (let i = 0; i < block.length; i++) {
        const checkRow = block.isHorizontal ? newRow : newRow + i;
        const checkCol = block.isHorizontal ? newCol + i : newCol;

        for (let j = 0; j < other.length; j++) {
          const otherRow = other.isHorizontal ? other.row : other.row + j;
          const otherCol = other.isHorizontal ? other.col + j : other.col;
          if (checkRow === otherRow && checkCol === otherCol) {
            return false;
          }
        }
      }
    }
    return true;
  };

  const handleMouseDown = (id: number, e: React.MouseEvent) => {
    if (levelComplete || allLevelsComplete) return;

    const block = blocks.find((b) => b.id === id);
    if (!block) return;

    const rect = e.currentTarget.getBoundingClientRect();
    setDraggedBlock(id);
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
    setTempPosition({ row: block.row, col: block.col });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (draggedBlock === null || !gridRef.current) return;

    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      const block = blocks.find((b) => b.id === draggedBlock);
      if (!block) return;

      const gridRect = gridRef.current!.getBoundingClientRect();
      const x = e.clientX - gridRect.left - dragOffset.x;
      const y = e.clientY - gridRect.top - dragOffset.y;

      let newRow = block.row;
      let newCol = block.col;

      if (block.isHorizontal) {
        newCol = Math.round(x / CELL_SIZE);
        newCol = Math.max(0, Math.min(GRID_SIZE - block.length, newCol));
      } else {
        newRow = Math.round(y / CELL_SIZE);
        newRow = Math.max(0, Math.min(GRID_SIZE - block.length, newRow));
      }

      if (canMoveBlock(block, newRow, newCol)) {
        setTempPosition({ row: newRow, col: newCol });
      }
    });
  };

  const handleMouseUp = () => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (draggedBlock === null || tempPosition === null) return;

    const block = blocks.find((b) => b.id === draggedBlock);
    if (!block) return;

    if (block.row !== tempPosition.row || block.col !== tempPosition.col) {
      const newBlocks = blocks.map((b) =>
        b.id === draggedBlock ? { ...b, row: tempPosition.row, col: tempPosition.col } : b
      );
      setBlocks(newBlocks);
      setMoves((m) => m + 1);
      checkWin(newBlocks);
    }

    setDraggedBlock(null);
    setTempPosition(null);
  };

  const getBlockPosition = (b: Block) => {
    if (draggedBlock === b.id && tempPosition) {
      return {
        top: tempPosition.row * CELL_SIZE,
        left: tempPosition.col * CELL_SIZE,
      };
    }
    return {
      top: b.row * CELL_SIZE,
      left: b.col * CELL_SIZE,
    };
  };

  const getBlockColor = (b: Block) => {
    if (b.isTarget) return 'bg-gradient-to-br from-red-500 to-red-600';
    const colors = [
      'bg-gradient-to-br from-blue-500 to-blue-600',
      'bg-gradient-to-br from-purple-500 to-purple-600',
      'bg-gradient-to-br from-green-500 to-green-600',
      'bg-gradient-to-br from-orange-500 to-orange-600',
      'bg-gradient-to-br from-pink-500 to-pink-600',
      'bg-gradient-to-br from-indigo-500 to-indigo-600',
      'bg-gradient-to-br from-cyan-500 to-cyan-600',
      'bg-gradient-to-br from-emerald-500 to-emerald-600',
    ];
    return colors[b.id % colors.length];
  };

  const getDifficultyColor = () => {
    switch (selectedLevels[currentLevel]?.difficulty) {
      case 'Easy':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'Hard':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-8">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between rounded-2xl bg-white p-6 shadow-lg">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Unblock Me Challenge</h1>
            <p className="mt-2 text-gray-600">
              Complete Level {currentLevel + 1} of {selectedLevels.length}
            </p>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-right">
              <p className="text-sm text-gray-500">Time Remaining</p>
              <p className="text-3xl font-bold text-indigo-600">
                {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Puzzles Solved</p>
              <p className="text-3xl font-bold text-green-600">{puzzlesCompleted}</p>
            </div>
          </div>
        </div>

        {/* Game Board */}
        <div className="rounded-2xl bg-white p-8 shadow-xl">
          {/* Level Info */}
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className={`rounded-lg border-2 px-4 py-2 text-sm font-bold ${getDifficultyColor()}`}>
                {selectedLevels[currentLevel]?.name} - {selectedLevels[currentLevel]?.difficulty}
              </span>
              <span className="text-lg font-medium text-gray-700">
                Moves: <span className="font-bold text-indigo-600">{moves}</span>
                {moves > selectedLevels[currentLevel]?.optimalMoves && (
                  <span className="ml-2 text-sm text-orange-500">
                    (+{moves - selectedLevels[currentLevel]?.optimalMoves} extra)
                  </span>
                )}
              </span>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Target</p>
              <p className="text-xl font-bold text-gray-700">≤ {selectedLevels[currentLevel]?.optimalMoves} moves</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-8 flex items-center gap-2">
            {selectedLevels.map((level, index) => (
              <div key={index} className="flex-1">
                <div
                  className={`h-3 rounded-full transition-all duration-500 ${
                    index < currentLevel
                      ? 'bg-gradient-to-r from-green-500 to-green-600 shadow-md'
                      : index === currentLevel
                      ? 'bg-gradient-to-r from-indigo-500 to-indigo-600 shadow-lg'
                      : 'bg-gray-200'
                  }`}
                />
                <p className="mt-1 text-center text-xs font-medium text-gray-500">{level.name}</p>
              </div>
            ))}
          </div>

          {/* Grid */}
          <div className="flex items-center justify-center">
            <div
              className="relative"
              style={{
                width: GRID_SIZE * CELL_SIZE + 48 + 40 + 8,
                height: GRID_SIZE * CELL_SIZE + 48,
              }}
            >
              <div
                ref={gridRef}
                className="absolute rounded-2xl bg-gradient-to-br from-amber-100 via-amber-50 to-yellow-100 p-6 shadow-inner overflow-hidden"
                style={{
                  width: GRID_SIZE * CELL_SIZE + 48,
                  height: GRID_SIZE * CELL_SIZE + 48,
                  left: 0,
                  top: 0,
                }}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              >
                {/* Grid lines */}
                <div
                  className="absolute inset-6 grid"
                  style={{
                    gridTemplateColumns: `repeat(${GRID_SIZE}, ${CELL_SIZE}px)`,
                    gridTemplateRows: `repeat(${GRID_SIZE}, ${CELL_SIZE}px)`,
                  }}
                >
                  {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, i) => (
                    <div key={i} className="border border-amber-300/40" />
                  ))}
                </div>

                {/* Blocks */}
                {blocks.map((block) => {
                  const position = getBlockPosition(block);
                  const isDragging = draggedBlock === block.id;
                  return (
                    <div
                      key={block.id}
                      onMouseDown={(e) => handleMouseDown(block.id, e)}
                      className={`absolute rounded-xl shadow-lg cursor-grab active:cursor-grabbing select-none ${getBlockColor(
                        block
                      )} ${isDragging ? 'shadow-2xl z-30 ring-4 ring-white/50' : 'hover:shadow-xl z-10'}`}
                      style={{
                        top: position.top + 24,
                        left: position.left + 24,
                        width: block.isHorizontal ? block.length * CELL_SIZE : CELL_SIZE,
                        height: block.isHorizontal ? CELL_SIZE : block.length * CELL_SIZE,
                        transition: isDragging ? 'none' : 'top 80ms ease-out, left 80ms ease-out',
                      }}
                    >
                      <div className="flex h-full w-full items-center justify-center">
                        {block.isTarget ? (
                          <Car className="h-12 w-12 text-white drop-shadow-2xl" />
                        ) : (
                          <div className="flex gap-1.5">
                            {block.isHorizontal ? (
                              <>
                                <div className="h-2.5 w-2.5 rounded-full bg-white/70 shadow-sm" />
                                <div className="h-2.5 w-2.5 rounded-full bg-white/70 shadow-sm" />
                              </>
                            ) : (
                              <div className="flex flex-col gap-1.5">
                                <div className="h-2.5 w-2.5 rounded-full bg-white/70 shadow-sm" />
                                <div className="h-2.5 w-2.5 rounded-full bg-white/70 shadow-sm" />
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Exit indicator */}
              <div
                className="absolute flex items-center justify-center bg-gradient-to-r from-green-500 to-emerald-500 rounded-r-xl shadow-xl z-50 animate-pulse"
                style={{
                  left: GRID_SIZE * CELL_SIZE + 48 + 8,
                  top: 24 + 2 * CELL_SIZE + (CELL_SIZE - 80) / 2,
                  width: 40,
                  height: 80,
                }}
                aria-label="Exit"
              >
                <Target className="h-8 w-8 text-white drop-shadow-lg" />
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="mt-8 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 p-6 border-2 border-blue-100">
            <h3 className="mb-4 text-lg font-bold text-gray-900 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-indigo-600" />
              How to Play
            </h3>
            <div className="space-y-3 text-sm text-gray-700">
              <div className="flex items-start gap-3 rounded-lg bg-red-50 p-3 border border-red-100">
                <Car className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-red-600">Goal:</strong> Move the red car to the exit on the right
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-lg bg-orange-50 p-3 border border-orange-100">
                <MousePointer className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-orange-600">Controls:</strong> Drag blocks horizontally or vertically to clear
                  the path
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-lg bg-green-50 p-3 border border-green-100">
                <Trophy className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <strong className="text-green-600">Scoring:</strong> Complete levels quickly with minimal moves for
                  better scores
                </div>
              </div>
            </div>
          </div>

          {/* Level Complete Message */}
          <AnimatePresence>
            {levelComplete && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
              >
                <div className="rounded-3xl bg-white p-12 shadow-2xl text-center max-w-md">
                  <CheckCircle2 className="h-20 w-20 text-green-500 mx-auto mb-6" />
                  <h2 className="text-4xl font-bold text-gray-900 mb-4">Level Complete! 🎉</h2>
                  <p className="text-xl text-gray-600 mb-6">
                    Completed in <span className="font-bold text-indigo-600">{moves}</span> moves
                  </p>
                  {currentLevel < selectedLevels.length - 1 ? (
                    <p className="text-gray-500">Loading next level...</p>
                  ) : (
                    <p className="text-green-600 font-bold">All levels completed!</p>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
