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
      <Button
        @click="copyRegIds"
        :disabled="checkResults === null || affectedRegNumbers.length === 0"
        icon="pi pi-copy"
        label="Copy Reg IDs"
        severity="secondary"
        outlined
      />
      <Button
        @click="copyRegIdsWithItems"
        :disabled="checkResults === null || affectedRegNumbers.length === 0"
        icon="pi pi-copy"
        label="Copy Reg IDs + Items"
        severity="secondary"
        outlined
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

    <RetryFailedDialog
      ref="retryFailedDialog"
      message="Items could not be assigned for the following reg number(s) — likely due to a persistent error or ongoing throttling:"
      itemLabelSingular="reg number"
      itemLabelPlural="reg numbers"
      :itemKey="(regNum: RegNumber) => regNum"
    />
  </div>
</template>

<script setup lang="ts">
import RetryFailedDialog from "@/components/common/RetryFailedDialog.vue";
import ItemCheckResults, { type CheckItemGroup, type CheckRegRow, type CheckResults } from "@/components/items/ItemCheckResults.vue";
import type { InputConfig } from "@/components/items/ItemAssignInputArea.vue";
import { getErrorHandlerFunction } from "@/composables/api/base/getErrorHandlerFunction";
import { getGroupMembers } from "@/composables/api/backend/getGroupMembers";
import { getPackagePayments } from "@/composables/api/backend/getPackagePayments";
import { isFromSizeItem, resolveFromSizeItem } from "@/composables/items/fromSizeUtils";
import { getItemDisplayLabel } from "@/composables/items/getItemDisplayLabel";
import { usePaymentDateCache } from "@/composables/items/paymentDateCache";
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
import { computed, ref, useTemplateRef, watch, type Ref } from "vue";

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
const paymentDateCache = usePaymentDateCache();

const loading: Ref<boolean> = ref(false);
const checkLoading: Ref<boolean> = ref(false);
const checkProgress = ref<{ label: string; current: number; total: number } | null>(null);
const checkedRegNumbers = ref<RegNumber[] | null>(null);
const rawCheckedPairs = ref<Array<{ regNum: RegNumber; item: ConcreteGoodieValue }> | null>(null);
const assignProgress = ref<{ current: number; total: number } | null>(null);
const checkResults: Ref<CheckResults | null> = ref(null);
const retryFailedDialog = useTemplateRef("retryFailedDialog");

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

type AssignOutcome = "assigned" | "failed";

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function assignToRegNumber(regNum: RegNumber, targetCounts: Map<ConcreteGoodieValue, number>, field: "reservedItems" | "pastItems" | "issuedItems"): Promise<AssignOutcome> {
  const existing = await attendeeService.addInfos.getSponsorDeskAddInfo(errorHandler, regNum);
  if (existing === undefined) return "failed";
  const addInfo: ApiSponsorDeskAddInfo = { ...getEmptySponsorDeskAddInfo(), ...existing };
  let changed = false;
  for (const [item, targetCount] of targetCounts) {
    const list = addInfo[field];
    const currentCount = list.filter((i) => i === item).length;
    if (currentCount !== targetCount) {
      addInfo[field] = list.filter((i) => i !== item);
      for (let i = 0; i < targetCount; i++) addInfo[field].push(item);
      changed = true;
    }
  }
  if (!changed) return "assigned";
  return (await attendeeService.addInfos.putSponsorDeskAddInfo(errorHandler, regNum, addInfo)) !== undefined ? "assigned" : "failed";
}

const ASSIGN_RETRY_ATTEMPTS = 3;
const ASSIGN_RETRY_DELAY_MS = 300;

async function assignToRegNumberWithRetry(regNum: RegNumber, targetCounts: Map<ConcreteGoodieValue, number>, field: "reservedItems" | "pastItems" | "issuedItems"): Promise<AssignOutcome> {
  for (let attempt = 1; ; attempt++) {
    const outcome = await assignToRegNumber(regNum, targetCounts, field);
    if (outcome === "assigned" || attempt >= ASSIGN_RETRY_ATTEMPTS) return outcome;
    await sleep(ASSIGN_RETRY_DELAY_MS);
  }
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
        const packageNameByLevel = new Map<string, string>(
          getConventionSetup().metadata.forGoodiesLevels.list
            .filter((level) => levels.includes(level.value))
            .map((level) => [level.value, Object.keys(level.search.packages ?? {})[0]!])
        );
        const paymentDateMap = new Map<RegNumber, string | null>();
        for (let i = 0; i < matching.length; i++) {
          const attendee = matching[i]!;
          checkProgress.value = { label: `Loading payment dates… (${i + 1}/${matching.length})`, current: i, total: matching.length };
          const packageName = packageNameByLevel.get(attendee.transGoodieChoice as string);
          const regNum = attendee.id as RegNumber;
          const cached = packageName ? paymentDateCache.getPaymentDate(regNum, packageName) : undefined;
          let paidAt: string | null;
          if (cached !== undefined) {
            paidAt = cached;
          } else {
            const packages = packageName ? await getPackagePayments(errorHandler, regNum) : undefined;
            paidAt = packages?.find((pkg) => pkg.name === packageName)?.fully_paid_at ?? null;
            if (packageName) paymentDateCache.setPaymentDate(regNum, packageName, paidAt);
          }
          paymentDateMap.set(regNum, paidAt);
          checkProgress.value = { label: `Loading payment dates… (${i + 1}/${matching.length})`, current: i + 1, total: matching.length };
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

function reportAssignmentResult(successCount: number, failCount: number) {
  if (failCount === 0) {
    return { severity: ToastSeverity.success, summary: "Assignment complete", detail: `Items assigned to ${successCount} attendee(s).`, life: 6000 };
  }
  const parts = [`${successCount} succeeded`, `${failCount} failed`];
  return { severity: ToastSeverity.warn, summary: "Assignment partially complete", detail: parts.join(", ") + ".", life: 8000 };
}

function buildTargetCountsByRegNumber(results: CheckResults): Map<RegNumber, Map<ConcreteGoodieValue, number>> {
  const targets = new Map<RegNumber, Map<ConcreteGoodieValue, number>>();
  for (const group of results.groups) {
    for (const row of group.rows) {
      const item = row.resolvedItem ?? group.item;
      const forReg = targets.get(row.regNum) ?? new Map<ConcreteGoodieValue, number>();
      forReg.set(item, row.newCount);
      targets.set(row.regNum, forReg);
    }
  }
  return targets;
}

async function executeAssign(): Promise<void> {
  if (!canAssign.value || !checkResults.value) return;
  const oc = props.operationConfig;
  loading.value = true;

  const backupData = await attendeeService.addInfos.getAllSponsorDeskAddInfos(errorHandler);
  if (!backupData) { loading.value = false; return; }
  const backup: Record<string, ApiSponsorDeskAddInfo> = {};
  for (const [regNum, info] of backupData.infos) backup[String(regNum)] = info;
  const backupFilename = `addinfos-backup-${new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19)}.json`;
  downloadJSON(backup, backupFilename);
  props.toastService.add({
    severity: ToastSeverity.warn,
    summary: "Backup downloaded",
    detail: `A pre-assignment backup (${backupFilename}) was saved to your downloads. Confirm the download succeeded before proceeding — it can be restored later from the History tab's "Restore from Backup File" option.`,
    life: 10000,
  });

  const targetCountsByRegNumber = buildTargetCountsByRegNumber(checkResults.value);
  let attemptRegNumbers = [...targetCountsByRegNumber.keys()];
  const totalCount = attemptRegNumbers.length;

  let successCount = 0, cancelled = false;
  assignProgress.value = { current: 0, total: totalCount };
  for (;;) {
    const stillFailing: RegNumber[] = [];
    for (const regNum of attemptRegNumbers) {
      const targetCounts = targetCountsByRegNumber.get(regNum)!;
      const outcome = await assignToRegNumberWithRetry(regNum, targetCounts, oc.targetField);
      if (outcome === "assigned") successCount++;
      else stillFailing.push(regNum);
      assignProgress.value!.current++;
    }
    if (stillFailing.length === 0) break;
    const decision = await retryFailedDialog.value!.confirmRetry(stillFailing);
    if (decision === "cancel") { cancelled = true; break; }
    if (decision === "skip") break;
    attemptRegNumbers = stillFailing;
    assignProgress.value = { current: totalCount - stillFailing.length, total: totalCount };
  }
  const failCount = cancelled ? 0 : totalCount - successCount;
  assignProgress.value = null;
  loading.value = false;

  if (cancelled) {
    props.toastService.add({ severity: ToastSeverity.warn, summary: "Assignment cancelled", detail: `${successCount} attendee(s) were already updated before cancelling.`, life: 8000 });
    return;
  }

  props.toastService.add(reportAssignmentResult(successCount, failCount));
}

watch(
  [() => props.inputConfig, () => props.operationConfig],
  () => { checkResults.value = null; checkedRegNumbers.value = null; rawCheckedPairs.value = null; },
  { deep: true },
);

const affectedRegNumbers = computed<RegNumber[]>(() => {
  if (!checkResults.value) return [];
  return [...new Set(checkResults.value.groups.flatMap((g) => g.rows.map((r) => r.regNum)))];
});

const affectedNicknames = computed<Map<RegNumber, string>>(() => {
  const map = new Map<RegNumber, string>();
  if (!checkResults.value) return map;
  for (const group of checkResults.value.groups) {
    for (const row of group.rows) map.set(row.regNum, row.nickname);
  }
  return map;
});

async function copyRegIds(): Promise<void> {
  const nicknames = affectedNicknames.value;
  const csv = affectedRegNumbers.value.map((regNum) => `${regNum};${nicknames.get(regNum) ?? ""}`).join("\n");
  await navigator.clipboard.writeText(csv);
  props.toastService.add({ severity: ToastSeverity.info, summary: "Copied to clipboard", life: 2000 });
}

async function copyRegIdsWithItems(): Promise<void> {
  if (!checkResults.value) return;
  const lines: string[] = [];
  for (const group of checkResults.value.groups) {
    for (const row of group.rows) {
      lines.push(`${row.regNum}\t${row.resolvedItem ?? group.item}`);
    }
  }
  await navigator.clipboard.writeText(lines.join("\n"));
  props.toastService.add({ severity: ToastSeverity.info, summary: "Copied to clipboard", life: 2000 });
}
</script>
