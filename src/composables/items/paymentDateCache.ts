import type { RegNumber } from "@/types/external/attsrv/attendees/attendee";
import { computed, ref } from "vue";

type PackagePaidAtMap = Map<string, string | null>;

interface ExportedCache {
  createdAt: string | null;
  entries: Record<string, Record<string, string | null>>;
}

const cache = ref<Map<RegNumber, PackagePaidAtMap>>(new Map());
const createdAt = ref<Date | null>(null);

export function usePaymentDateCache() {
  function getPaymentDate(regNum: RegNumber, packageName: string): string | null | undefined {
    return cache.value.get(regNum)?.get(packageName);
  }

  function setPaymentDate(regNum: RegNumber, packageName: string, paidAt: string | null): void {
    const forReg = cache.value.get(regNum) ?? new Map<string, string | null>();
    forReg.set(packageName, paidAt);
    cache.value.set(regNum, forReg);
  }

  function markUpdated(at: Date): void {
    createdAt.value = at;
  }

  function clear(): void {
    cache.value = new Map();
    createdAt.value = null;
  }

  function exportData(): ExportedCache {
    const entries: Record<string, Record<string, string | null>> = {};
    for (const [regNum, forReg] of cache.value) {
      entries[String(regNum)] = Object.fromEntries(forReg);
    }
    return { createdAt: createdAt.value ? createdAt.value.toISOString() : null, entries };
  }

  function importData(raw: string): number {
    const parsed = JSON.parse(raw) as ExportedCache;
    const imported = new Map<RegNumber, PackagePaidAtMap>();
    for (const [regNumStr, packages] of Object.entries(parsed.entries)) {
      imported.set(Number(regNumStr) as RegNumber, new Map(Object.entries(packages)));
    }
    cache.value = imported;
    createdAt.value = parsed.createdAt ? new Date(parsed.createdAt) : null;
    return imported.size;
  }

  return {
    size: computed(() => cache.value.size),
    createdAt: computed(() => createdAt.value),
    getPaymentDate,
    setPaymentDate,
    markUpdated,
    clear,
    exportData,
    importData,
  };
}
