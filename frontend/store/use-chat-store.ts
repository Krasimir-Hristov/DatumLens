import { create } from 'zustand';

// Дефинираме как изглежда едно съобщение
export interface Message {
  role: 'user' | 'assistant';
  content: string;
  sources?: number;
}

// Дефинираме какво има на "черната дъска" (State)
interface ChatState {
  messages: Message[]; // Списък със съобщения
  isLoading: boolean; // Дали в момента чакаме отговор

  // Действия (Actions) - какво можем да правим с дъската
  addMessage: (message: Message) => void;
  setLoading: (loading: boolean) => void;
  clearMessages: () => void;
}

// Създаваме самия store
export const useChatStore = create<ChatState>((set) => ({
  // Начално състояние
  messages: [],
  isLoading: false,

  // Функция за добавяне на съобщение
  // Взима текущото състояние (state) и добавя новото съобщение към списъка
  addMessage: (message) =>
    set((state) => ({ messages: [...state.messages, message] })),

  // Функция за промяна на loading статуса
  setLoading: (loading) => set({ isLoading: loading }),

  // Функция за изчистване на всичко
  clearMessages: () => set({ messages: [] }),
}));
