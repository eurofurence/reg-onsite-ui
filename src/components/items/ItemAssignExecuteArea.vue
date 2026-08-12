<template>
  <div class="flex flex-col gap-4">
    <div class="flex justify-center gap-3">
      <Button
        @click="checkRegistrations"
        :loading="checkLoading"
        :disabled="!canAssign"
        icon="pi pi-search"
        label="Check"
        severity="secondary"
      />
      <Button
        @click="executeAssign"
        :loading="loading"
        :disabled="!canAssign || checkResults === null"
        icon="pi pi-check"
        :label="executeButtonLabel"
      />
    </div>

    <div v-if="checkProgress !== null" class="flex flex-col gap-1.5">
      <ProgressBar
        :value="checkProgress.total > 1 ? Math.round((checkProgress.current / checkProgress.total) * 100) : undefined"
        :mode="checkProgress.total > 1 ? 'determinate' : 'indeterminate'"
      />
      <div class="text-center text-xs text-surface-400">{{ checkProgress.label }}</div>
    </div>

    <div v-if="assignProgress !== null" class="flex flex-col gap-1.5">
      <ProgressBar :value="assignProgress.total > 0 ? Math.round((assignProgress.current / assignProgress.total) * 100) : 0" />
      <div class="text-center text-xs text-surface-400">{{ assignProgress.current }} / {{ assignProgress.total }}</div>
    </div>

    <ItemCheckResults :checkResults="checkResults" />
  </div>
</template>

<script setup lang="ts">
import ItemCheckResults, { type CheckItemGroup, type CheckRegRow, type CheckResults } from "@/components/items/ItemCheckResults.vue";
import type { InputConfig } from "@/components/items/ItemAssignInputArea.vue";
import { getErrorHandlerFunction } from "@/composables/api/base/getErrorHandlerFunction";
import { getGroupMembers } from "@/composables/api/backend/getGroupMembers";
import { getGoodieLevelPaymentDates } from "@/composables/api/backend/getGoodieLevelPaymentDates";
import { isFromSizeItem, resolveFromSizeItem } from "@/composables/items/fromSizeUtils";
import { getItemDisplayLabel } from "@/composables/items/getItemDisplayLabel";
import { getConventionSetup } from "@/composables/logic/getConventionSetup";
import { downloadJSON } from "@/composables/logic/downloadJSON";
import type { IdpGroupId } from "@/types/external/authsrv/frontenduserinfo";
import { getEmptySponsorDeskAddInfo } from "@/composables/services/attendee/getEmptySponsorDeskAddInfo";
import { attendeeService } from "@/composables/services/attendeeService";
import type { OnsiteToastService } from "@/composables/services/toastService";
import type { ConcreteGoodieValue } from "@/config/convention";
import type { ApiSponsorDeskAddInfo } from "@/types/external/attsrv/additional-info/sponsordesk";
import type { RegNumber } from "@/types/external/attsrv/attendees/attendee";
import type { TransformedAttendeeInfo } from "@/types/internal/attendee";
import { ToastSeverity } from "@/types/internal/primevue";
import Button from "@/volt/Button.vue";
import ProgressBar from "@/volt/ProgressBar.vue";
import { computed, ref, watch, type Ref } from "vue";

type AssignmentMode = "add" | "set" | "remove";

export interface OperationConfig {
  assignmentMode: AssignmentMode;
  itemCount: number;
  targetField: "reservedItems" | "pastItems" | "issuedItems";
}

interface Props {
  toastService: OnsiteToastService;
  inputConfig: InputConfig;
  operationConfig: OperationConfig;
}

const props = defineProps<Props>();
const errorHandler = getErrorHandlerFunction(props.toastService);

const loading: Ref<boolean> = ref(false);
const checkLoading: Ref<boolean> = ref(false);
const checkProgress = ref<{ label: string; current: number; total: number } | null>(null);
const checkedRegNumbers = ref<RegNumber[] | null>(null);
const rawCheckedPairs = ref<Array<{ regNum: RegNumber; item: ConcreteGoodieValue }> | null>(null);
const assignProgress = ref<{ current: number; total: number } | null>(null);
const checkResults: Ref<CheckResults | null> = ref(null);

const canAssign = computed(() => {
  const ic = props.inputConfig;
  const oc = props.operationConfig;
  if (ic.inputMode === "raw") {
    return ic.rawRows.some((r) => {
      const n = parseInt(r.regNum, 10);
      return !isNaN(n) && n > 0 && r.itemValue.trim().length > 0;
    });
  }
  if (ic.activeItems.length === 0) return false;
  if ((oc.itemCount ?? 0) < 1) return false;
  if (ic.targetType === "regNumbers") return ic.regNumbersInput.trim().length > 0;
  if (ic.targetType === "goodieLevel") {
    if (ic.selectedGoodieLevels.length === 0) return false;
    if (ic.goodieLevelFilter === "upToPaymentDate" && !ic.goodieLevelFilterDate) return false;
    return true;
  }
  if (ic.targetType === "idpGroup") return ic.idpGroupsInput.trim().length > 0 && ic.idpToken.trim().length > 0;
  return ic.selectedRoles.length > 0;
});

const executeButtonLabel = computed(() => {
  const oc = props.operationConfig;
  const ic = props.inputConfig;
  const modeStr = oc.assignmentMode === "add" ? "Add" : oc.assignmentMode === "set" ? "Set" : "Remove";
  if (ic.inputMode === "raw") return `${modeStr} Items from Raw Input`;
  const targetLabel = ic.targetType === "regNumbers" ? "Reg Numbers"
    : ic.targetType === "goodieLevel" ? "Goodie Level"
    : ic.targetType === "idpGroup" ? "IDP Group"
    : "Role";
  return `${modeStr} Items for ${targetLabel}`;
});

function parseRegNumbers(input: string): RegNumber[] {
  return input.split(/[\n,]+/).map((s) => s.trim()).filter(Boolean)
    .map((s) => parseInt(s, 10)).filter((n) => !isNaN(n) && n > 0) as RegNumber[];
}

function endOfDayHamburg(date: Date): Date {
  const parts = new Intl.DateTimeFormat('en', { timeZone: 'Europe/Berlin', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(date);
  const y = parts.find(p => p.type === 'year')!.value;
  const m = parts.find(p => p.type === 'month')!.value;
  const d = parts.find(p => p.type === 'day')!.value;
  const berlinDate = `${y}-${m}-${d}`;
  const noonUtc = new Date(`${berlinDate}T12:00:00Z`);
  const berlinHour = parseInt(new Intl.DateTimeFormat('en', { timeZone: 'Europe/Berlin', hour: '2-digit', hour12: false }).formatToParts(noonUtc).find(p => p.type === 'hour')!.value, 10);
  return new Date(`${berlinDate}T${String(23 - (berlinHour - 12)).padStart(2, '0')}:59:59.999Z`);
}

function computeItemDelta(list: ConcreteGoodieValue[], item: ConcreteGoodieValue, mode: AssignmentMode, count: number) {
  const currentCount = list.filter((i) => i === item).length;
  const newCount = mode === "add" ? currentCount + count : mode === "set" ? count : Math.max(0, currentCount - count);
  return { currentCount, newCount };
}

async function assignToRegNumber(regNum: RegNumber, items: ConcreteGoodieValue[], field: "reservedItems" | "pastItems" | "issuedItems", mode: AssignmentMode, count: number, tshirtSize?: string | null): Promise<boolean> {
  const existing = await attendeeService.addInfos.getSponsorDeskAddInfo(errorHandler, regNum);
  if (existing === undefined) return false;
  const addInfo: ApiSponsorDeskAddInfo = { ...getEmptySponsorDeskAddInfo(), ...existing };
  let changed = false;
  const resolvedItems = items.flatMap((item) => {
    if (isFromSizeItem(item)) { const r = resolveFromSizeItem(item, tshirtSize); return r ? [r as ConcreteGoodieValue] : []; }
    return [item];
  });
  for (const item of resolvedItems) {
    const list = addInfo[field];
    const currentCount = list.filter((i) => i === item).length;
    if (mode === "add") { for (let i = 0; i < count; i++) list.push(item); changed = true; }
    else if (mode === "set") {
      if (currentCount !== count) { addInfo[field] = list.filter((i) => i !== item); for (let i = 0; i < count; i++) addInfo[field].push(item); changed = true; }
    } else {
      const toRemove = Math.min(count, currentCount);
      if (toRemove > 0) { let rem = toRemove; addInfo[field] = list.filter((i) => { if (i === item && rem > 0) { rem--; return false; } return true; }); changed = true; }
    }
  }
  if (!changed) return true;
  return (await attendeeService.addInfos.putSponsorDeskAddInfo(errorHandler, regNum, addInfo)) !== undefined;
}

async function checkRegistrations(): Promise<void> {
  if (!canAssign.value) return;
  const ic = props.inputConfig;
  const oc = props.operationConfig;
  checkLoading.value = true;
  checkResults.value = null;
  checkedRegNumbers.value = null;
  rawCheckedPairs.value = null;

  if (ic.inputMode === "raw") {
    const pairs = ic.rawRows
      .map((r) => ({ regNum: parseInt(r.regNum, 10) as RegNumber, item: r.itemValue.trim() as ConcreteGoodieValue }))
      .filter((p) => !isNaN(p.regNum) && p.regNum > 0 && p.item.length > 0);

    if (pairs.length === 0) {
      props.toastService.add({ severity: ToastSeverity.warn, summary: "No valid rows", detail: "Please add rows with valid reg numbers and item values.", life: 5000 });
      checkLoading.value = false; return;
    }

    const regNumbers = [...new Set(pairs.map((p) => p.regNum))];
    checkedRegNumbers.value = regNumbers;
    checkProgress.value = { label: "Loading item data…", current: 0, total: 1 };

    const [attendeesForMap, allAddInfos] = await Promise.all([
      attendeeService.getAllAttendees(errorHandler),
      attendeeService.addInfos.getAllSponsorDeskAddInfos(errorHandler),
    ]);
    if (!allAddInfos) { checkLoading.value = false; checkProgress.value = null; return; }

    const attendeeMap = new Map<RegNumber, TransformedAttendeeInfo>(
      (attendeesForMap ?? []).filter((a) => a.id !== null).map((a) => [a.id as RegNumber, a])
    );
    const setup = getConventionSetup();
    const goodieLevelLabels = new Map(setup.metadata.forGoodiesLevels.list.map((e) => [e.value, e.label]));
    const roleLabels = new Map(setup.metadata.forConRole.list.map((e) => [e.value, e.label]));

    const itemToRegNums = new Map<ConcreteGoodieValue, RegNumber[]>();
    for (const pair of pairs) {
      const list = itemToRegNums.get(pair.item) ?? [];
      list.push(pair.regNum);
      itemToRegNums.set(pair.item, list);
    }

    const resolvedPairs: Array<{ regNum: RegNumber; item: ConcreteGoodieValue }> = [];
    const groups: CheckItemGroup[] = [];

    for (const [item, itemRegNums] of itemToRegNums) {
      const rows: CheckRegRow[] = [];
      for (const regNum of itemRegNums) {
        const addInfo = allAddInfos.infos.get(regNum) ?? getEmptySponsorDeskAddInfo();
        const attendee = attendeeMap.get(regNum);
        let effectiveItem = item;
        if (isFromSizeItem(item)) {
          const resolved = resolveFromSizeItem(item, attendee?.tshirt_size) as ConcreteGoodieValue | null;
          if (!resolved) continue;
          effectiveItem = resolved;
        }
        const { currentCount, newCount } = computeItemDelta(addInfo[oc.targetField], effectiveItem, oc.assignmentMode, oc.itemCount ?? 1);
        const delta = newCount - currentCount;
        if (delta !== 0) {
          rows.push({
            regNum,
            nickname: attendee?.nickname ?? String(regNum),
            goodieLevel: (attendee?.transGoodieChoice != null ? goodieLevelLabels.get(attendee.transGoodieChoice) : undefined) ?? attendee?.transGoodieChoice ?? "",
            role: (attendee?.transConRole != null ? roleLabels.get(attendee.transConRole) : undefined) ?? attendee?.transConRole ?? "",
            currentCount, newCount, delta,
            resolvedItem: effectiveItem !== item ? effectiveItem : undefined,
          });
        }
        resolvedPairs.push({ regNum, item });
      }
      if (rows.length > 0) groups.push({ item, label: getItemDisplayLabel(item), rows });
    }

    rawCheckedPairs.value = resolvedPairs;
    checkResults.value = { targetRegCount: regNumbers.length, groups };
    checkProgress.value = null;
    checkLoading.value = false;
    return;
  }

  // Standard mode
  let regNumbers: RegNumber[];
  let resolvedAttendees: TransformedAttendeeInfo[] | null = null;

  if (ic.targetType === "regNumbers") {
    const nums = parseRegNumbers(ic.regNumbersInput);
    if (nums.length === 0) {
      props.toastService.add({ severity: ToastSeverity.warn, summary: "No valid reg numbers", detail: "Please enter at least one valid reg number.", life: 5000 });
      checkLoading.value = false; checkProgress.value = null; return;
    }
    regNumbers = nums;
  } else if (ic.targetType === "idpGroup") {
    const groupIds = ic.idpGroupsInput.split(/\n/).map((s) => s.trim()).filter(Boolean) as IdpGroupId[];
    const memberMap = new Map<RegNumber, true>();
    checkProgress.value = { label: "Loading group members…", current: 0, total: groupIds.length };
    for (let i = 0; i < groupIds.length; i++) {
      const members = await getGroupMembers(errorHandler, groupIds[i]!, ic.idpToken);
      if (!members) { checkLoading.value = false; checkProgress.value = null; return; }
      for (const m of members) memberMap.set(m.id, true);
      checkProgress.value = { label: "Loading group members…", current: i + 1, total: groupIds.length };
    }
    if (memberMap.size === 0) {
      props.toastService.add({ severity: ToastSeverity.warn, summary: "No members found", detail: "The selected groups have no registered attendees.", life: 5000 });
      checkLoading.value = false; checkProgress.value = null; return;
    }
    regNumbers = [...memberMap.keys()];
  } else {
    checkProgress.value = { label: "Loading attendees…", current: 0, total: 1 };
    resolvedAttendees = await attendeeService.getAllAttendees(errorHandler) ?? null;
    if (!resolvedAttendees) { checkLoading.value = false; checkProgress.value = null; return; }
    if (ic.targetType === "goodieLevel") {
      const levels = ic.selectedGoodieLevels;
      const matching = resolvedAttendees.filter((a) => a.id !== null && a.transGoodieChoice !== null && levels.includes(a.transGoodieChoice as string));
      const filter = ic.goodieLevelFilter;
      if (filter === "all") {
        regNumbers = matching.map((a) => a.id as RegNumber);
      } else if (filter === "firstNByReg") {
        regNumbers = matching.sort((a, b) => (a.id as number) - (b.id as number)).slice(0, ic.goodieLevelFilterN ?? 10).map((a) => a.id as RegNumber);
      } else {
        const paymentDateMap = new Map<RegNumber, string | null>();
        for (let i = 0; i < levels.length; i++) {
          checkProgress.value = { label: `Loading payment dates… (${i + 1}/${levels.length})`, current: i, total: levels.length };
          const dates = await getGoodieLevelPaymentDates(errorHandler, levels[i]!);
          if (dates) for (const [reg, date] of dates) if (!paymentDateMap.has(reg)) paymentDateMap.set(reg, date);
          checkProgress.value = { label: `Loading payment dates… (${i + 1}/${levels.length})`, current: i + 1, total: levels.length };
        }
        if (filter === "upToPaymentDate") {
          const cutoff = ic.goodieLevelFilterDate ? endOfDayHamburg(new Date(ic.goodieLevelFilterDate)) : null;
          regNumbers = cutoff ? matching.filter((a) => { const d = paymentDateMap.get(a.id as RegNumber); return d != null && new Date(d) <= cutoff; }).map((a) => a.id as RegNumber) : matching.map((a) => a.id as RegNumber);
        } else {
          regNumbers = matching.filter((a) => paymentDateMap.get(a.id as RegNumber) != null).sort((a, b) => new Date(paymentDateMap.get(a.id as RegNumber)!).getTime() - new Date(paymentDateMap.get(b.id as RegNumber)!).getTime()).slice(0, ic.goodieLevelFilterN ?? 10).map((a) => a.id as RegNumber);
        }
      }
    } else {
      const roles = ic.selectedRoles;
      regNumbers = resolvedAttendees.filter((a) => a.id !== null && a.transConRole !== null && roles.includes(a.transConRole as string)).map((a) => a.id as RegNumber);
    }
  }

  checkedRegNumbers.value = regNumbers;
  checkProgress.value = { label: "Loading item data…", current: 0, total: 1 };

  const [attendeesForMap, allAddInfos] = await Promise.all([
    resolvedAttendees ? Promise.resolve(resolvedAttendees) : attendeeService.getAllAttendees(errorHandler),
    attendeeService.addInfos.getAllSponsorDeskAddInfos(errorHandler),
  ]);
  if (!allAddInfos) { checkLoading.value = false; checkProgress.value = null; return; }

  const attendeeMap = new Map<RegNumber, TransformedAttendeeInfo>((attendeesForMap ?? []).filter((a) => a.id !== null).map((a) => [a.id as RegNumber, a]));
  const setup = getConventionSetup();
  const goodieLevelLabels = new Map(setup.metadata.forGoodiesLevels.list.map((e) => [e.value, e.label]));
  const roleLabels = new Map(setup.metadata.forConRole.list.map((e) => [e.value, e.label]));

  const groups: CheckItemGroup[] = [];
  for (const item of ic.activeItems) {
    const rows: CheckRegRow[] = [];
    for (const regNum of regNumbers) {
      const addInfo = allAddInfos.infos.get(regNum) ?? getEmptySponsorDeskAddInfo();
      const attendee = attendeeMap.get(regNum);
      let effectiveItem = item;
      if (isFromSizeItem(item)) {
        const resolved = resolveFromSizeItem(item, attendee?.tshirt_size) as ConcreteGoodieValue | null;
        if (!resolved) continue;
        effectiveItem = resolved;
      }
      const { currentCount, newCount } = computeItemDelta(addInfo[oc.targetField], effectiveItem, oc.assignmentMode, oc.itemCount ?? 1);
      const delta = newCount - currentCount;
      if (delta !== 0) {
        rows.push({
          regNum,
          nickname: attendee?.nickname ?? String(regNum),
          goodieLevel: (attendee?.transGoodieChoice != null ? goodieLevelLabels.get(attendee.transGoodieChoice) : undefined) ?? attendee?.transGoodieChoice ?? "",
          role: (attendee?.transConRole != null ? roleLabels.get(attendee.transConRole) : undefined) ?? attendee?.transConRole ?? "",
          currentCount, newCount, delta,
          resolvedItem: effectiveItem !== item ? effectiveItem : undefined,
        });
      }
    }
    if (rows.length > 0) groups.push({ item, label: getItemDisplayLabel(item), rows });
  }

  checkResults.value = { targetRegCount: regNumbers.length, groups };
  checkProgress.value = null;
  checkLoading.value = false;
}

async function executeAssign(): Promise<void> {
  if (!canAssign.value || !checkResults.value) return;
  const ic = props.inputConfig;
  const oc = props.operationConfig;
  loading.value = true;

  const backupData = await attendeeService.addInfos.getAllSponsorDeskAddInfos(errorHandler);
  if (!backupData) { loading.value = false; return; }
  const backup: Record<string, ApiSponsorDeskAddInfo> = {};
  for (const [regNum, info] of backupData.infos) backup[String(regNum)] = info;
  downloadJSON(backup, `addinfos-backup-${new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)}.json`);

  if (ic.inputMode === "raw") {
    const pairs = rawCheckedPairs.value!;
    const regNumbers = [...new Set(pairs.map((p) => p.regNum))];

    const regToItems = new Map<RegNumber, ConcreteGoodieValue[]>();
    for (const pair of pairs) {
      const list = regToItems.get(pair.regNum) ?? [];
      list.push(pair.item);
      regToItems.set(pair.regNum, list);
    }

    const needsSizes = pairs.some((p) => isFromSizeItem(p.item));
    const attendeeSizeMap = new Map<RegNumber, string | null>();
    if (needsSizes) {
      const all = await attendeeService.getAllAttendees(errorHandler);
      for (const a of all ?? []) { if (a.id !== null) attendeeSizeMap.set(a.id, a.tshirt_size ?? null); }
    }

    let successCount = 0, failCount = 0;
    assignProgress.value = { current: 0, total: regNumbers.length };
    for (const regNum of regNumbers) {
      const items = regToItems.get(regNum) ?? [];
      const ok = await assignToRegNumber(regNum, items, oc.targetField, oc.assignmentMode, oc.itemCount ?? 1, needsSizes ? (attendeeSizeMap.get(regNum) ?? null) : null);
      if (ok) successCount++; else failCount++;
      assignProgress.value!.current++;
    }
    assignProgress.value = null;
    loading.value = false;

    props.toastService.add(failCount === 0
      ? { severity: ToastSeverity.success, summary: "Assignment complete", detail: `Items assigned to ${successCount} attendee(s).`, life: 6000 }
      : { severity: ToastSeverity.warn, summary: "Assignment partially complete", detail: `${successCount} succeeded, ${failCount} failed.`, life: 8000 });
    return;
  }

  // Standard mode
  const regNumbers = checkedRegNumbers.value!;
  const needsSizes = ic.activeItems.some(isFromSizeItem);
  const attendeeSizeMap = new Map<RegNumber, string | null>();
  if (needsSizes) {
    const all = await attendeeService.getAllAttendees(errorHandler);
    for (const a of all ?? []) { if (a.id !== null) attendeeSizeMap.set(a.id, a.tshirt_size ?? null); }
  }

  let successCount = 0, failCount = 0;
  assignProgress.value = { current: 0, total: regNumbers.length };
  for (const regNum of regNumbers) {
    const ok = await assignToRegNumber(regNum, ic.activeItems, oc.targetField, oc.assignmentMode, oc.itemCount ?? 1, needsSizes ? (attendeeSizeMap.get(regNum) ?? null) : null);
    if (ok) successCount++; else failCount++;
    assignProgress.value!.current++;
  }
  assignProgress.value = null;
  loading.value = false;

  props.toastService.add(failCount === 0
    ? { severity: ToastSeverity.success, summary: "Assignment complete", detail: `Items assigned to ${successCount} attendee(s).`, life: 6000 }
    : { severity: ToastSeverity.warn, summary: "Assignment partially complete", detail: `${successCount} succeeded, ${failCount} failed.`, life: 8000 });
}

watch(
  [() => props.inputConfig, () => props.operationConfig],
  () => { checkResults.value = null; checkedRegNumbers.value = null; rawCheckedPairs.value = null; },
  { deep: true },
);
</script>
