import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Participant {
  id: string;
  name: string;
  weight: number; // For probability boosts
}

export interface Winner {
  id: string;
  name: string;
  round: number;
  timestamp: number;
}

interface LotteryConfig {
  winnerCount: number;
  allowRepeat: boolean;
  speed: number; // 1-10
}

interface LotteryState {
  participants: Participant[];
  winners: Winner[];
  config: LotteryConfig;
  status: 'idle' | 'running' | 'stopping' | 'show-winner';
  currentWinners: Winner[]; // Winners of the current round
  
  // Actions
  setParticipants: (participants: Participant[]) => void;
  addParticipants: (names: string[]) => void;
  updateParticipant: (id: string, updates: Partial<Participant>) => void;
  removeParticipant: (id: string) => void;
  setConfig: (config: Partial<LotteryConfig>) => void;
  startLottery: () => void;
  stopLottery: () => void;
  resetWinners: () => void;
  setStatus: (status: LotteryState['status']) => void;
}

export const useLotteryStore = create<LotteryState>()(
  persist(
    (set, get) => ({
      participants: [],
      winners: [],
      config: {
        winnerCount: 1,
        allowRepeat: false,
        speed: 5,
      },
      status: 'idle',
      currentWinners: [],

      setParticipants: (participants) => set({ participants }),
      
      addParticipants: (names) => set((state) => {
        const newParticipants = names.map(name => ({
          id: Math.random().toString(36).substring(7),
          name: name.trim(),
          weight: 1,
        })).filter(p => p.name.length > 0);
        return { participants: [...state.participants, ...newParticipants] };
      }),

      updateParticipant: (id, updates) => set((state) => ({
        participants: state.participants.map(p => 
          p.id === id ? { ...p, ...updates } : p
        )
      })),

      removeParticipant: (id) => set((state) => ({
        participants: state.participants.filter(p => p.id !== id)
      })),

      setConfig: (config) => set((state) => ({
        config: { ...state.config, ...config }
      })),

      startLottery: () => set({ status: 'running', currentWinners: [] }),

      stopLottery: () => {
        const { participants, winners, config } = get();
        const availableParticipants = config.allowRepeat 
          ? participants 
          : participants.filter(p => !winners.some(w => w.id === p.id));
        
        if (availableParticipants.length === 0) {
          // No one left to win
          set({ status: 'idle' });
          return;
        }

        const roundWinners: Winner[] = [];
        const count = Math.min(config.winnerCount, availableParticipants.length);
        const tempAvailable = [...availableParticipants];

        for (let i = 0; i < count; i++) {
          // Weighted random selection
          const totalWeight = tempAvailable.reduce((sum, p) => sum + p.weight, 0);
          let random = Math.random() * totalWeight;
          
          let selectedIndex = -1;
          for (let j = 0; j < tempAvailable.length; j++) {
            random -= tempAvailable[j].weight;
            if (random <= 0) {
              selectedIndex = j;
              break;
            }
          }
          
          // Fallback if float precision issues
          if (selectedIndex === -1) selectedIndex = tempAvailable.length - 1;

          const winner = tempAvailable[selectedIndex];
          roundWinners.push({
            id: winner.id,
            name: winner.name,
            round: winners.length + 1,
            timestamp: Date.now(),
          });

          // Remove selected from temp pool for this round
          tempAvailable.splice(selectedIndex, 1);
        }

        set((state) => ({
          status: 'show-winner',
          winners: [...state.winners, ...roundWinners],
          currentWinners: roundWinners,
        }));
      },

      resetWinners: () => set({ winners: [], currentWinners: [] }),
      setStatus: (status) => set({ status }),
    }),
    {
      name: 'lottery-storage',
    }
  )
);
