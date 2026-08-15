import type { PrintRow } from '@/types/printRow'

const STORAGE_KEY = 'badge.printRows'

export interface PrintRowStore {
  load(): PrintRow[]
  save(printRows: PrintRow[]): void
}

export const localPrintRowStore: PrintRowStore = {
  load() {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      return []
    }
    try {
      return JSON.parse(raw) as PrintRow[]
    } catch {
      return []
    }
  },
  save(printRows) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(printRows))
  },
}
