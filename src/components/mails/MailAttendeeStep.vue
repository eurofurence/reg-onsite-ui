<template>
  <Fieldset>
    <template #legend>
      <span class="font-semibold">Step 1b - Attendees</span>
    </template>
    <div class="flex flex-row gap-5 justify-center mb-3">
      <div class="flex items-center">
        <RadioButton
          v-model="filterStatusRef"
          :inputId="filterStatusId + '_raw'"
          name="filterStatus"
          :value="FilterStatus.raw"
        />
        <label :for="filterStatusId + '_raw'" class="ml-2">
          Unfiltered
        </label>
      </div>
      <div class="flex items-center">
        <RadioButton
          v-model="filterStatusRef"
          :inputId="filterStatusId + '_filtered'"
          name="filterStatus"
          :value="FilterStatus.filtered"
        />
        <label :for="filterStatusId + '_filtered'" class="ml-2">
          Filtered data
        </label>
      </div>
    </div>
    <div
      v-if="filterStatusRef === FilterStatus.filtered"
      class="flex flex-row gap-5 justify-center flex-wrap mb-3"
    >
      <div v-for="columnDefinition of tagColumns" class="flex flex-col gap-1">
        <label>{{ columnDefinition.label }}</label>
        <SearchFieldTag
          v-model="filterOptionsRef[columnDefinition.value as FilterFieldValue].value"
          :columnDefinition="columnDefinition"
          :configItems="columnDefinition.configItems"
          placeholder="Search"
        />
      </div>
      <div v-if="attendanceColumn" class="flex flex-col gap-1">
        <label>{{ attendanceColumn.label }}</label>
        <SearchFieldAttendance
          v-model="filterOptionsRef[attendanceColumn.value as FilterFieldValue].value"
          :columnDefinition="attendanceColumn"
          :configItems="attendanceColumn.configItems"
        />
      </div>
      <div v-if="countryColumn" class="flex flex-col gap-1">
        <label>{{ countryColumn.label }}</label>
        <SearchFieldCountry
          v-model="filterOptionsRef.country.value"
          :columnDefinition="countryColumn"
          :autoCompleteData="props.attendees"
        />
      </div>
      <div class="flex flex-col gap-1">
        <label>Min badge</label>
        <InputNumber
          v-model="minBadgeFilter"
          :min="0"
          :useGrouping="false"
          class="w-28"
        />
      </div>
      <div class="flex flex-col gap-1">
        <label>Max badge</label>
        <InputNumber
          v-model="maxBadgeFilter"
          :min="0"
          :useGrouping="false"
          class="w-28"
        />
      </div>
      <div class="flex flex-col gap-1">
        <label>Search</label>
        <span class="p-input-icon-left">
          <i class="pi pi-search text-surface-400" />
          <InputText
            v-model="filterOptionsRef.global.value"
            placeholder="Name, badge, nickname..."
            class="w-56"
          />
        </span>
      </div>
      <div class="flex items-end">
        <Button
          class="h-12 aspect-square"
          v-tooltip.top="'Reset filters'"
          @click="onResetFilters()"
        >
          <i class="pi pi-filter-slash" />
        </Button>
      </div>
      <div class="flex items-end">
        <Button
          class="h-12"
          severity="secondary"
          :disabled="filteredListRef.length === 0"
          @click="selectAllFiltered()"
        >
          <i class="pi pi-check-square mr-2" />Select all filtered
        </Button>
        <Button
          class="h-12 ml-2"
          severity="secondary"
          text
          :disabled="selected.length === 0"
          @click="clearSelection()"
        >
          <i class="pi pi-times-circle mr-2" />Clear
        </Button>
      </div>
    </div>
    <DataTable
      v-model:selection="selected"
      :value="filteredListRef"
      dataKey="id"
      selectionMode="multiple"
      compareSelectionBy="equals"
      :scrollable="true"
      scrollHeight="20rem"
      :paginator="true"
      :rows="10"
      :rowsPerPageOptions="[10, 20, 50]"
      rowHover
      :loading="props.loading"
      @row-click="onRowClick"
    >
      <template #loading>Loading attendee data. Please wait.</template>
      <template #empty>No attendees match the current filters.</template>
      <Column selectionMode="multiple" headerStyle="width: 3rem" :exportable="false" />
      <Column field="badge_id" header="Badge" sortable />
      <Column field="nickname" header="Nickname" sortable />
      <Column field="first_name" header="First Name" sortable />
      <Column field="last_name" header="Last Name" sortable />
      <Column header="Email">
        <template #body="{ data }">
          <span>{{ data.email }}</span>
          <i
            v-if="!data.email"
            class="pi pi-exclamation-triangle text-amber-500 ml-1"
            v-tooltip="'No email address'"
          />
          <i
            v-if="hasNoBulkMailFlag(data)"
            class="pi pi-ban text-red-500 ml-1"
            v-tooltip="'Opted out of bulk mail'"
          />
        </template>
      </Column>
      <Column header="Status">
        <template #body="{ data }">
          <TagControl
            :modelValue="data.status"
            :configItems="statusColumn?.configItems ?? []"
          />
        </template>
      </Column>
    </DataTable>
    <div class="flex flex-row justify-end gap-3 mt-3 flex-wrap items-center">
      <Tag
        value=""
        v-if="selectedWithoutEmailCount > 0"
        severity="warn"
      >
        {{ selectedWithoutEmailCount }} selected without email (will be skipped)
      </Tag>
      <Tag
        value=""
        v-if="selectedNoBulkMailCount > 0"
        severity="danger"
      >
        {{ selectedNoBulkMailCount }} selected opted out of bulk mail (will be skipped)
      </Tag>
      <span
        v-if="filteredNoBulkMailCount > 0"
        class="text-surface-500"
      >
        {{ filteredNoBulkMailCount }} attendee(s) in current filter opted out of
        bulk mail and would be skipped.
      </span>
      <span class="text-surface-500">
        {{ selectedWithEmailCount }} attendee(s) selected
      </span>
      <Button
        :disabled="
          selectedWithEmailCount === 0 ||
          !props.templateSelected ||
          props.sending
        "
        @click="emit('continue')"
      >
        <i class="pi pi-arrow-right mr-2" />Continue to Sending
      </Button>
    </div>
  </Fieldset>
</template>

<script setup lang="ts">
import TagControl from "@/components/common/TagControl.vue";
import SearchFieldAttendance from "@/components/common/attendee_table/SearchFieldAttendance.vue";
import SearchFieldCountry from "@/components/common/attendee_table/SearchFieldCountry.vue";
import SearchFieldTag from "@/components/common/attendee_table/SearchFieldTag.vue";
import { deepCopy } from "@/composables/deepCopy";
import { generateId } from "@/composables/generateId";
import { hasNoBulkMailFlag } from "@/composables/services/mails/hasNoBulkMailFlag";
import { getFilteredAttendees } from "@/composables/sort_and_filter/getFilteredAttendees";
import { AttendeeApiStatus } from "@/config/metadata/metadataForStatus";
import {
  getDefaultAttendeeFilterValues,
  setupColumnDefinitionList,
} from "@/config/system/regdesk";
import type { TransformedAttendeeInfo } from "@/types/internal/attendee";
import {
  ColumnType,
  type AttendanceColumn,
  type ColumnDefinition,
  type CountryColumn,
  type TagColumn,
} from "@/types/internal/component/table";
import type {
  FilterFieldValue,
  RawAttendeeFilter,
} from "@/types/internal/filter";
import Button from "@/volt/Button.vue";
import DataTable from "@/volt/DataTable.vue";
import Fieldset from "@/volt/Fieldset.vue";
import InputNumber from "@/volt/InputNumber.vue";
import InputText from "@/volt/InputText.vue";
import RadioButton from "@/volt/RadioButton.vue";
import Tag from "@/volt/Tag.vue";
import Column from "primevue/column";
import { FilterMatchMode } from "@primevue/core/api";
import { computed, ref, useId, type ComputedRef, type ModelRef, type Ref } from "vue";

const enum FilterStatus {
  raw = "raw",
  filtered = "filtered",
}
type FilterStatusValue = `${FilterStatus}`;

interface Props {
  attendees: TransformedAttendeeInfo[];
  loading: boolean;
  templateSelected: boolean;
  sending: boolean;
}
const props: Props = defineProps<Props>();

const selected: ModelRef<TransformedAttendeeInfo[]> = defineModel<
  TransformedAttendeeInfo[]
>("selected", { required: true });

const emit = defineEmits<{
  clickAttendee: [attendee: TransformedAttendeeInfo];
  continue: [void];
}>();

const componentId: string = generateId(useId());
const filterStatusId: string = `mailFilterStatus${componentId}`;

const filterStatusRef: Ref<FilterStatusValue> = ref(FilterStatus.filtered);
const initialFilterValues: RawAttendeeFilter = {
  ...getDefaultAttendeeFilterValues(),
  ...{
    status: {
      value: [
        AttendeeApiStatus.new,
        AttendeeApiStatus.approved,
        AttendeeApiStatus.partially_paid,
        AttendeeApiStatus.paid,
        AttendeeApiStatus.checked_in,
        AttendeeApiStatus.cancelled,
        AttendeeApiStatus.deleted,
      ],
      matchMode: FilterMatchMode.IN,
    },
  },
};
const filterOptionsRef: Ref<RawAttendeeFilter> = ref(
  deepCopy(initialFilterValues)
);
const minBadgeFilter: Ref<number | null> = ref(null);
const maxBadgeFilter: Ref<number | null> = ref(null);

function onResetFilters(): void {
  filterOptionsRef.value = deepCopy(initialFilterValues);
  minBadgeFilter.value = null;
  maxBadgeFilter.value = null;
}

function onRowClick(event: { data: TransformedAttendeeInfo }): void {
  emit("clickAttendee", event.data);
}

function selectAllFiltered(): void {
  const existingIds: Set<string> = new Set(
    selected.value.map((attendee) => String(attendee.id))
  );
  selected.value = [
    ...selected.value,
    ...filteredListRef.value.filter(
      (attendee: TransformedAttendeeInfo) =>
        !existingIds.has(String(attendee.id))
    ),
  ];
}

function clearSelection(): void {
  selected.value = [];
}

const globalFilterColumns: FilterFieldValue[] = [
  "badge_id",
  "nickname",
  "first_name",
  "last_name",
];

const tagFields: FilterFieldValue[] = [
  "status",
  "transSponsorChoice",
  "transConbookChoice",
  "transConRole",
];

const tagColumns: TagColumn[] = tagFields
  .map((field: FilterFieldValue) =>
    setupColumnDefinitionList.find(
      (columnDefinition: ColumnDefinition) => columnDefinition.value === field
    )
  )
  .filter(
    (columnDefinition): columnDefinition is TagColumn =>
      columnDefinition !== undefined &&
      columnDefinition.columnType === ColumnType.tag
  );

const attendanceColumnDefinition: ColumnDefinition | undefined =
  setupColumnDefinitionList.find(
    (columnDefinition: ColumnDefinition) =>
      columnDefinition.value === "transDayAttendance"
  );
const attendanceColumn: AttendanceColumn | undefined =
  attendanceColumnDefinition?.columnType === ColumnType.attendance
    ? attendanceColumnDefinition
    : undefined;

const countryColumnDefinition: ColumnDefinition | undefined =
  setupColumnDefinitionList.find(
    (columnDefinition: ColumnDefinition) => columnDefinition.value === "country"
  );
const countryColumn: CountryColumn | undefined =
  countryColumnDefinition?.columnType === ColumnType.country
    ? countryColumnDefinition
    : undefined;

const statusColumn: TagColumn | undefined =
  setupColumnDefinitionList.find(
    (columnDefinition: ColumnDefinition) =>
      columnDefinition.value === "status" &&
      columnDefinition.columnType === ColumnType.tag
  ) as TagColumn | undefined;

const filteredListRef: ComputedRef<TransformedAttendeeInfo[]> = computed(() => {
  let result: TransformedAttendeeInfo[];
  if (filterStatusRef.value === FilterStatus.raw) {
    result = props.attendees;
  } else {
    result = getFilteredAttendees(
      props.attendees,
      filterOptionsRef.value,
      globalFilterColumns
    );
    const minBadge: number | null = minBadgeFilter.value;
    const maxBadge: number | null = maxBadgeFilter.value;
    if (minBadge !== null || maxBadge !== null) {
      result = result.filter((attendee: TransformedAttendeeInfo): boolean => {
        const badgeNumber: number = Number(attendee.transId);
        if (!Number.isInteger(badgeNumber)) {
          return false;
        }
        if (minBadge !== null && badgeNumber < minBadge) {
          return false;
        }
        if (maxBadge !== null && badgeNumber > maxBadge) {
          return false;
        }
        return true;
      });
    }
  }
  return result;
});

const selectedWithEmailCount: ComputedRef<number> = computed(
  () =>
    selected.value.filter(
      (attendee: TransformedAttendeeInfo) =>
        attendee.email && !hasNoBulkMailFlag(attendee)
    ).length
);
const selectedWithoutEmailCount: ComputedRef<number> = computed(
  () =>
    selected.value.filter(
      (attendee: TransformedAttendeeInfo) => !attendee.email
    ).length
);
const selectedNoBulkMailCount: ComputedRef<number> = computed(
  () =>
    selected.value.filter((attendee: TransformedAttendeeInfo) =>
      hasNoBulkMailFlag(attendee)
    ).length
);
const filteredNoBulkMailCount: ComputedRef<number> = computed(
  () =>
    filteredListRef.value.filter((attendee: TransformedAttendeeInfo) =>
      hasNoBulkMailFlag(attendee)
    ).length
);
</script>
