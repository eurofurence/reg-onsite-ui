import { putAddInfo } from "@/composables/api/attsrv/additional-info/putGenericAddInfo";
import type { RestErrorHandler } from "@/composables/api/base/restErrorWrapper";
import { getEmptySponsorDeskAddInfo } from "@/composables/services/attendee/getEmptySponsorDeskAddInfo";
import type { ApiSponsorDeskAddInfo } from "@/types/external/attsrv/additional-info/sponsordesk";
import type { RegNumber } from "@/types/external/attsrv/attendees/attendee";
import type { Ref } from "vue";

export interface RawHistoryEntry {
  state: string;
  by: string;
  when: string;
}

export interface Operation {
  id: string;
  by: string;
  whenStart: Date;
  affectedRegs: Set<RegNumber>;
}

export function parseHistoryEntry(raw: string): RawHistoryEntry | null {
  try { return JSON.parse(raw) as RawHistoryEntry; } catch { return null; }
}

export function buildOperations(infos: Map<RegNumber, ApiSponsorDeskAddInfo>): Operation[] {
  const flat: Array<{ regNum: RegNumber; by: string; when: Date }> = [];
  for (const [regNum, addInfo] of infos) {
    for (const raw of addInfo.history) {
      const parsed = parseHistoryEntry(raw);
      if (!parsed) continue;
      flat.push({ regNum, by: parsed.by ?? "", when: new Date(parsed.when) });
    }
  }
  flat.sort((a, b) => a.when.getTime() - b.when.getTime());
  const ops: Operation[] = [];
  for (const entry of flat) {
    const last = ops[ops.length - 1];
    const gapSec = last ? (entry.when.getTime() - last.whenStart.getTime()) / 1000 : Infinity;
    if (!last || last.by !== entry.by || gapSec > 300) {
      ops.push({ id: `${entry.by}-${entry.when.getTime()}`, by: entry.by, whenStart: entry.when, affectedRegs: new Set([entry.regNum]) });
    } else {
      last.affectedRegs.add(entry.regNum);
    }
  }
  return ops.reverse();
}

export function buildRestoreTargets(
  addInfosMap: Map<RegNumber, ApiSponsorDeskAddInfo>,
  cutoffMs: number,
): Map<RegNumber, ApiSponsorDeskAddInfo> {
  const targets = new Map<RegNumber, ApiSponsorDeskAddInfo>();
  for (const [regNum, addInfo] of addInfosMap) {
    if (addInfo.history.length === 0) continue;
    const parsedEntries = addInfo.history.map(parseHistoryEntry);
    if (!parsedEntries.some((e) => e && new Date(e.when).getTime() >= cutoffMs)) continue;
    let beforeIdx = -1;
    for (let i = 0; i < parsedEntries.length; i++) {
      const e = parsedEntries[i];
      if (e && new Date(e.when).getTime() < cutoffMs) beforeIdx = i;
    }
    if (beforeIdx < 0) { targets.set(regNum, getEmptySponsorDeskAddInfo()); continue; }
    try {
      targets.set(regNum, {
        ...(JSON.parse(parsedEntries[beforeIdx]!.state) as ApiSponsorDeskAddInfo),
        history: addInfo.history.slice(0, beforeIdx + 1),
      });
    } catch { /* skip malformed */ }
  }
  return targets;
}

export async function applyRestoreTargets(
  errorHandler: RestErrorHandler,
  targets: Map<RegNumber, ApiSponsorDeskAddInfo>,
  progress: Ref<{ current: number; total: number } | null>,
): Promise<{ success: number; fail: number }> {
  progress.value = { current: 0, total: targets.size };
  let success = 0, fail = 0;
  for (const [regNum, state] of targets) {
    const result = await putAddInfo<ApiSponsorDeskAddInfo>("Attendee Items Service", "sponsordesk", errorHandler, regNum, state);
    if (result !== undefined) success++; else fail++;
    progress.value!.current++;
  }
  progress.value = null;
  return { success, fail };
}

export function formatTimestamp(d: Date): string {
  return d.toLocaleString("de-DE", { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit" });
}
