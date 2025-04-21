import { Chip } from "./chip.model";

export interface Bet {
    id: number;
    type: 'straight' | 'split' | 'street' | 'corner' | 'line' | 'dozen' | 'column' | 'red' | 'black' | 'even' | 'odd' | 'low' | 'high';
    numbers: number[];
    chips: Chip[];
    totalAmount: number;
  }