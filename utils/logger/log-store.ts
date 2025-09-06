import { create } from "zustand";

export interface LogEntry {
  id: string;
  timestamp: Date;
  level: string;
  message: string;
  data?: any;
  env?: any;
  error?: any;
}

interface LogStore {
  logs: LogEntry[];
  addLog: (log: Omit<LogEntry, "id">) => void;
  clearLogs: () => void;
  filterLogs: (filters: Record<string, any>) => LogEntry[];
}

export const useLogStore = create<LogStore>((set, get) => ({
  logs: [],

  addLog: (log) =>
    set((state) => ({
      logs: [
        {
          ...log,
          id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        },
        ...state.logs,
      ].slice(0, 1000),
    })),

  clearLogs: () => set({ logs: [] }),

  filterLogs: (filters) => {
    const { logs } = get();

    return logs.filter((log) => {
      if (filters.level && filters.level.length > 0) {
        if (!filters.level.includes(log.level)) return false;
      }

      if (filters.timeline === "custom" && filters.date) {
        const logDate = new Date(log.timestamp).toDateString();
        const filterDate = new Date(filters.date).toDateString();

        if (logDate !== filterDate) return false;
      }

      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        return (
          log.message.toLowerCase().includes(searchTerm) ||
          JSON.stringify(log.data || {})
            .toLowerCase()
            .includes(searchTerm)
        );
      }

      return true;
    });
  },
}));
