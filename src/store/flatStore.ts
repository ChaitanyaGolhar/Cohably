import { create } from 'zustand';
import type { Flat, Member } from '../types/api';

interface FlatState {
  currentFlat: Flat | null;
  members: Member[];
  setFlat: (flat: Flat, members?: Member[]) => void;
  clearFlat: () => void;
}

export const useFlatStore = create<FlatState>((set) => ({
  currentFlat: null,
  members: [],
  setFlat: (flat, members = []) => set({ currentFlat: flat, members }),
  clearFlat: () => set({ currentFlat: null, members: [] }),
}));
