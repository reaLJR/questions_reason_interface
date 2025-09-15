import { create } from 'zustand';
import { ReasoningResult } from '../types';

interface AppState {
  // 状态
  currentQuestion: string;
  isLoading: boolean;
  historyRecords: ReasoningResult[];
  searchKeyword: string;
  
  // 动作
  setCurrentQuestion: (question: string) => void;
  setLoading: (loading: boolean) => void;
  addHistoryRecord: (record: ReasoningResult) => void;
  setSearchKeyword: (keyword: string) => void;
  clearHistory: () => void;
  deleteHistoryRecord: (id: string) => void;
  
  // 本地存储相关
  loadHistoryFromStorage: () => void;
  saveHistoryToStorage: () => void;
}

const STORAGE_KEY = 'reasoning_history';

export const useAppStore = create<AppState>((set, get) => ({
  // 初始状态
  currentQuestion: '',
  isLoading: false,
  historyRecords: [],
  searchKeyword: '',
  
  // 设置当前问题
  setCurrentQuestion: (question: string) => set({ currentQuestion: question }),
  
  // 设置加载状态
  setLoading: (loading: boolean) => set({ isLoading: loading }),
  
  // 添加历史记录
  addHistoryRecord: (record: ReasoningResult) => {
    set((state) => ({
      historyRecords: [record, ...state.historyRecords]
    }));
    get().saveHistoryToStorage();
  },
  
  // 设置搜索关键词
  setSearchKeyword: (keyword: string) => set({ searchKeyword: keyword }),
  
  // 清空历史记录
  clearHistory: () => {
    set({ historyRecords: [] });
    localStorage.removeItem(STORAGE_KEY);
  },
  
  // 删除单条历史记录
  deleteHistoryRecord: (id: string) => {
    set((state) => ({
      historyRecords: state.historyRecords.filter(record => record.id !== id)
    }));
    get().saveHistoryToStorage();
  },
  
  // 从本地存储加载历史记录
  loadHistoryFromStorage: () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        set({ historyRecords: data.records || [] });
      }
    } catch (error) {
      console.error('Failed to load history from storage:', error);
    }
  },
  
  // 保存历史记录到本地存储
  saveHistoryToStorage: () => {
    try {
      const { historyRecords } = get();
      const data = {
        records: historyRecords,
        lastUpdated: Date.now()
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save history to storage:', error);
    }
  }
}));



