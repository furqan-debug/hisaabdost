
import { create } from 'zustand';

interface ModalState {
  isModalOpen: boolean;
  setModalOpen: (open: boolean) => void;
}

export const useModalState = create<ModalState>((set) => ({
  isModalOpen: false,
  setModalOpen: (open: boolean) => set({ isModalOpen: open }),
}));
