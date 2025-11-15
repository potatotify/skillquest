import {type ClassValue, clsx} from "clsx";
import {twMerge} from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function generateCandidateId(): string {
  const prefix = "IFA";
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.random().toString(36).substr(2, 4).toUpperCase();
  return `${prefix}${timestamp}${random}`;
}

export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs
    .toString()
    .padStart(2, "0")}`;
}

export function calculateTotalScore(
  minesweeperScore: number,
  unblockMeScore: number,
  waterCapacityScore: number
): number {
  // Define maximum expected performance for each game
  const MAX_MINESWEEPER_PUZZLES = 20;    // Top performers complete ~20 puzzles
  const MAX_UNBLOCK_ME_PUZZLES = 17;     // 17 levels in actual game
  const MAX_WATER_CAPACITY_PUZZLES = 30; // Top performers complete ~30 puzzles

  // Normalize each game score to 0-100 scale
  const normalizedMinesweeper = Math.min((minesweeperScore / MAX_MINESWEEPER_PUZZLES) * 100, 100);
  const normalizedUnblockMe = Math.min((unblockMeScore / MAX_UNBLOCK_ME_PUZZLES) * 100, 100);
  const normalizedWaterCapacity = Math.min((waterCapacityScore / MAX_WATER_CAPACITY_PUZZLES) * 100, 100);

  // Calculate weighted average: Minesweeper (30%), Unblock Me (35%), Water Capacity (35%)
  return Math.round(
    normalizedMinesweeper * 0.3 + normalizedUnblockMe * 0.35 + normalizedWaterCapacity * 0.35
  );
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}
