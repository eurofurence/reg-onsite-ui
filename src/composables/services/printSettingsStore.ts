import { createDefaultPrintSettings } from '@/types/printSettings'
import type { PrintSettings } from '@/types/printSettings'

const STORAGE_KEY = 'xpage.printSettings'

export interface PrintSettingsStore {
  load(): PrintSettings
  save(printSettings: PrintSettings): void
}

export const localPrintSettingsStore: PrintSettingsStore = {
  load() {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      return createDefaultPrintSettings()
    }
    try {
      return { ...createDefaultPrintSettings(), ...JSON.parse(raw) } as PrintSettings
    } catch {
      return createDefaultPrintSettings()
    }
  },
  save(printSettings) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(printSettings))
  },
}
