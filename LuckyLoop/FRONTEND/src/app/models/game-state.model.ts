import { Bet } from "./bet.model";
import { Chip } from "./chip.model";

export interface GameState {
    balance: number;
    selectedChip: Chip | null;
    bets: Bet[];
    lastWinningNumber: number | null;
    isSpinning: boolean;
  }