<template>
  <div class="flex flex-col gap-4 pt-4">
    <div class="grid grid-cols-2 gap-4">
      <ItemAttendeeSearchPanel
        legend="Source"
        v-model:regNum="sourceRegNum"
        :loading="sourceLoading"
        :attendee="sourceAttendee"
        :searchDone="sourceSearchDone"
        @search="searchSource"
      />
      <ItemAttendeeSearchPanel
        legend="Target"
        v-model:regNum="targetRegNum"
        :loading="targetLoading"
        :attendee="targetAttendee"
        :searchDone="targetSearchDone"
        @search="searchTarget"
      />
    </div>

    <div v-if="sourceSearchDone || targetSearchDone" class="flex flex-col gap-2">
      <div class="grid grid-cols-6 gap-4 text-xs font-semibold text-surface-400 uppercase tracking-wide px-1">
        <span class="col-span-3 text-center">Source</span>
        <span class="col-span-3 text-center">Target</span>
      </div>
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">

        <Fieldset legend="Reserved" class="p-2">
          <SourceItemList :addInfo="sourceAddInfo" field="reservedItems" v-model="selectedFromReserved" />
        </Fieldset>

        <Fieldset legend="Past" class="p-2">
          <SourceItemList :addInfo="sourceAddInfo" field="pastItems" v-model="selectedFromPast" />
        </Fieldset>

        <Fieldset legend="Issued" class="p-2">
          <SourceItemList :addInfo="sourceAddInfo" field="issuedItems" v-model="selectedFromIssued" />
        </Fieldset>

        <Fieldset legend="Reserved" class="p-2">
          <ItemList :addInfo="targetAddInfo" field="reservedItems" />
        </Fieldset>

        <Fieldset legend="Past" class="p-2">
          <ItemList :addInfo="targetAddInfo" field="pastItems" />
        </Fieldset>

        <Fieldset legend="Issued" class="p-2">
          <ItemList :addInfo="targetAddInfo" field="issuedItems" />
        </Fieldset>

      </div>
    </div>

    <div class="flex flex-col items-center gap-3">
      <div class="flex items-center gap-3 text-sm">
        <span class="text-surface-500">Transfer selected to:</span>
        <ItemTargetFieldSelect v-model="targetTransferField" />
      </div>
      <span v-tooltip.top="transferBlockReason">
        <Button
          @click="executeTransfer"
          :loading="transferLoading"
          :disabled="!canTransfer"
          icon="pi pi-arrow-right"
          label="Transfer Selected Items to Target"
          severity="warn"
        />
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import ItemAttendeeSearchPanel from "@/components/items/ItemAttendeeSearchPanel.vue";
import { getErrorHandlerFunction } from "@/composables/api/base/getErrorHandlerFunction";
import { deepCopy } from "@/composables/deepCopy";
import { getGoodieLabel } from "@/composables/items/getGoodieLabel";
import { getEmptySponsorDeskAddInfo } from "@/composables/services/attendee/getEmptySponsorDeskAddInfo";
import { attendeeService } from "@/composables/services/attendeeService";
import type { OnsiteToastService } from "@/composables/services/toastService";
import type { ConcreteGoodieValue } from "@/config/convention";
import type { ApiSponsorDeskAddInfo } from "@/types/external/attsrv/additional-info/sponsordesk";
import type { RegNumber } from "@/types/external/attsrv/attendees/attendee";
import type { TransformedAttendeeInfo } from "@/types/internal/attendee";
import { ToastSeverity } from "@/types/internal/primevue";
import ItemTargetFieldSelect from "@/components/items/ItemTargetFieldSelect.vue";
import Button from "@/volt/Button.vue";
import Fieldset from "@/volt/Fieldset.vue";
import { computed, defineComponent, h, ref, type Ref } from "vue";

type AddInfoField = "reservedItems" | "pastItems" | "issuedItems";

const ItemList = defineComponent({
  props: {
    addInfo: { type: Object as () => ApiSponsorDeskAddInfo | null, default: null },
    field: { type: String as () => AddInfoField, required: true },
  },
  setup(props) {
    return () => {
      if (!props.addInfo) return h("div", { class: "text-surface-400 text-sm" }, "-");
      const items: ConcreteGoodieValue[] = props.addInfo[props.field] ?? [];
      if (items.length === 0) return h("div", { class: "text-surface-400 text-sm" }, "None");
      return h("div", { class: "flex flex-col gap-1.5" },
        items.map((item) =>
          h("div", { class: "text-sm leading-tight" }, [
            getGoodieLabel(item),
            h("span", { class: "text-muted-color text-xs block" }, `(${item})`),
          ])
        )
      );
    };
  },
});

// modelValue holds one entry per SELECTED source array index (indices into
// props.addInfo[props.field]), not the selected item values - this is what
// lets two rows for the same duplicated item be checked independently.
const SourceItemList = defineComponent({
  props: {
    addInfo: { type: Object as () => ApiSponsorDeskAddInfo | null, default: null },
    field: { type: String as () => AddInfoField, required: true },
    modelValue: { type: Array as () => number[], required: true },
  },
  emits: ["update:modelValue"],
  setup(props, { emit }) {
    return () => {
      if (!props.addInfo) return h("div", { class: "text-surface-400 text-sm" }, "-");
      const items: ConcreteGoodieValue[] = props.addInfo[props.field] ?? [];
      if (items.length === 0) return h("div", { class: "text-surface-400 text-sm" }, "None");
      return h("div", { class: "flex flex-col gap-1.5" },
        items.map((item, index) => {
          const checked = props.modelValue.includes(index);
          const id = `src-${props.field}-${index}`;
          return h("div", { class: "flex items-start gap-2" }, [
            h("input", {
              type: "checkbox",
              id,
              checked,
              class: "mt-0.5 cursor-pointer",
              onChange: () => {
                const next = checked
                  ? props.modelValue.filter((v) => v !== index)
                  : [...props.modelValue, index];
                emit("update:modelValue", next);
              },
            }),
            h("label", { for: id, class: "text-sm cursor-pointer leading-tight" }, [
              getGoodieLabel(item),
              h("span", { class: "text-muted-color text-xs block" }, `(${item})`),
            ]),
          ]);
        })
      );
    };
  },
});

interface Props {
  toastService: OnsiteToastService;
}
const props = defineProps<Props>();
const errorHandler = getErrorHandlerFunction(props.toastService);

const sourceRegNum: Ref<number | null> = ref(null);
const targetRegNum: Ref<number | null> = ref(null);

const sourceAttendee: Ref<TransformedAttendeeInfo | null> = ref(null);
const targetAttendee: Ref<TransformedAttendeeInfo | null> = ref(null);
const sourceAddInfo: Ref<ApiSponsorDeskAddInfo | null> = ref(null);
const targetAddInfo: Ref<ApiSponsorDeskAddInfo | null> = ref(null);

const sourceSearchDone: Ref<boolean> = ref(false);
const targetSearchDone: Ref<boolean> = ref(false);
const sourceLoading: Ref<boolean> = ref(false);
const targetLoading: Ref<boolean> = ref(false);
const transferLoading: Ref<boolean> = ref(false);

const selectedFromReserved: Ref<number[]> = ref([]);
const selectedFromPast: Ref<number[]> = ref([]);
const selectedFromIssued: Ref<number[]> = ref([]);
const targetTransferField: Ref<"reservedItems" | "pastItems" | "issuedItems"> = ref("reservedItems");

const anySelected = computed(() =>
  selectedFromReserved.value.length > 0 ||
  selectedFromPast.value.length > 0 ||
  selectedFromIssued.value.length > 0
);

const canTransfer = computed(() =>
  sourceAttendee.value !== null &&
  targetAttendee.value !== null &&
  anySelected.value &&
  sourceRegNum.value !== targetRegNum.value
);

const transferBlockReason = computed<string | null>(() => {
  if (sourceAttendee.value === null) return "Search for a source attendee first.";
  if (targetAttendee.value === null) return "Search for a target attendee first.";
  if (sourceRegNum.value === targetRegNum.value) return "Source and target must be different attendees.";
  if (!anySelected.value) return "Select at least one item to transfer.";
  return null;
});

async function searchSource(): Promise<void> {
  if (sourceRegNum.value === null) return;
  sourceLoading.value = true;
  sourceSearchDone.value = false;
  sourceAttendee.value = null;
  sourceAddInfo.value = null;
  selectedFromReserved.value = [];
  selectedFromPast.value = [];
  selectedFromIssued.value = [];
  const regNum = sourceRegNum.value as RegNumber;
  const [attendee, addInfo] = await Promise.all([
    attendeeService.getAttendeeByRegNumber(errorHandler, regNum),
    attendeeService.addInfos.getSponsorDeskAddInfo(errorHandler, regNum),
  ]);
  sourceAttendee.value = attendee || null;
  sourceAddInfo.value = addInfo ? { ...getEmptySponsorDeskAddInfo(), ...addInfo } : null;
  sourceSearchDone.value = true;
  sourceLoading.value = false;
}

async function searchTarget(): Promise<void> {
  if (targetRegNum.value === null) return;
  targetLoading.value = true;
  targetSearchDone.value = false;
  targetAttendee.value = null;
  targetAddInfo.value = null;
  const regNum = targetRegNum.value as RegNumber;
  const [attendee, addInfo] = await Promise.all([
    attendeeService.getAttendeeByRegNumber(errorHandler, regNum),
    attendeeService.addInfos.getSponsorDeskAddInfo(errorHandler, regNum),
  ]);
  targetAttendee.value = attendee || null;
  targetAddInfo.value = attendee ? { ...getEmptySponsorDeskAddInfo(), ...(addInfo ?? {}) } : null;
  targetSearchDone.value = true;
  targetLoading.value = false;
}

function sameItems(a: ConcreteGoodieValue[], b: ConcreteGoodieValue[]): boolean {
  if (a.length !== b.length) return false;
  const bCounts = new Map<ConcreteGoodieValue, number>();
  for (const item of b) bCounts.set(item, (bCounts.get(item) ?? 0) + 1);
  for (const item of a) {
    const remaining = bCounts.get(item) ?? 0;
    if (remaining <= 0) return false;
    bCounts.set(item, remaining - 1);
  }
  return true;
}

function addInfoUnchangedSince(
  current: ApiSponsorDeskAddInfo,
  snapshot: ApiSponsorDeskAddInfo
): boolean {
  return (
    sameItems(current.reservedItems, snapshot.reservedItems) &&
    sameItems(current.pastItems, snapshot.pastItems) &&
    sameItems(current.issuedItems, snapshot.issuedItems)
  );
}

async function executeTransfer(): Promise<void> {
  if (!canTransfer.value) return;
  const srcInfo = sourceAddInfo.value!;
  const tgtInfo = targetAddInfo.value!;

  const srcRegNum = sourceRegNum.value as RegNumber;
  const tgtRegNum = targetRegNum.value as RegNumber;

  transferLoading.value = true;
  const [freshSrcInfo, freshTgtInfo] = await Promise.all([
    attendeeService.addInfos.getSponsorDeskAddInfo(errorHandler, srcRegNum),
    attendeeService.addInfos.getSponsorDeskAddInfo(errorHandler, tgtRegNum),
  ]);
  const currentSrcInfo = freshSrcInfo ? { ...getEmptySponsorDeskAddInfo(), ...freshSrcInfo } : getEmptySponsorDeskAddInfo();
  const currentTgtInfo = freshTgtInfo ? { ...getEmptySponsorDeskAddInfo(), ...freshTgtInfo } : getEmptySponsorDeskAddInfo();

  if (!addInfoUnchangedSince(currentSrcInfo, srcInfo) || !addInfoUnchangedSince(currentTgtInfo, tgtInfo)) {
    transferLoading.value = false;
    props.toastService.add({
      severity: ToastSeverity.warn,
      summary: "Transfer aborted",
      detail: "Source or target items changed since you selected them. Please search again and retry.",
      life: 8000,
    });
    return;
  }

  const updatedSource: ApiSponsorDeskAddInfo = deepCopy(currentSrcInfo);
  const updatedTarget: ApiSponsorDeskAddInfo = deepCopy(currentTgtInfo);

  // Pull the selected items out by index (highest first, so removing one
  // selected index doesn't shift the position of another) so duplicated
  // items can be transferred individually without disturbing unselected
  // copies of the same item.
  function takeSelected(field: AddInfoField, selectedIndices: number[]): ConcreteGoodieValue[] {
    const source = updatedSource[field];
    const taken: ConcreteGoodieValue[] = [];
    for (const index of [...selectedIndices].sort((a, b) => b - a)) {
      const item = source[index];
      if (item === undefined) continue;
      taken.push(item);
      source.splice(index, 1);
    }
    return taken;
  }

  const takenFromReserved = takeSelected("reservedItems", selectedFromReserved.value);
  const takenFromPast = takeSelected("pastItems", selectedFromPast.value);
  const takenFromIssued = takeSelected("issuedItems", selectedFromIssued.value);
  const allSelected = [...takenFromReserved, ...takenFromPast, ...takenFromIssued];

  const destField = targetTransferField.value;
  updatedTarget[destField].push(...allSelected);

  const [srcResult, tgtResult] = await Promise.all([
    attendeeService.addInfos.putSponsorDeskAddInfo(errorHandler, srcRegNum, updatedSource),
    attendeeService.addInfos.putSponsorDeskAddInfo(errorHandler, tgtRegNum, updatedTarget),
  ]);
  transferLoading.value = false;

  if (srcResult !== undefined && tgtResult !== undefined) {
    props.toastService.add({
      severity: ToastSeverity.success,
      summary: "Transfer complete",
      detail: `${allSelected.length} item(s) moved from #${srcRegNum} to #${tgtRegNum}.`,
      life: 5000,
    });
    sourceAddInfo.value = updatedSource;
    targetAddInfo.value = updatedTarget;
    selectedFromReserved.value = [];
    selectedFromPast.value = [];
    selectedFromIssued.value = [];
  }
}
</script>
