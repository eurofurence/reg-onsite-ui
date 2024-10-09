<template>
  <div v-if="(autoCompleteDataRef?.length || -1) > 0">
    <AutoComplete
      v-model="modelValueRef"
      @input="props.filterCallback()"
      @item-select="props.filterCallback()"
      class="search-column-filter"
      :placeholder="props.placeholder"
      :suggestions="suggestionsRef"
      @complete="doComplete"
    />
  </div>
  <div v-else>
    <InputText
      v-model="modelValueRef"
      @input="props.filterCallback()"
      class="search-column-filter"
      :placeholder="placeholder"
    />
  </div>
</template>

<script setup lang="ts">
import type { AutoCompleteCompleteEvent } from "primevue/autocomplete";
import type { ModelRef } from "vue";
import type { TransformedAttendeeInfo } from "@/types/internal/attendee";
import type { FilterElementProps } from "@/types/internal/component/table";

const suggestionsRef: Ref<string[]> = ref<string[]>([]);

const computedAutoCompleteDataRef: ComputedRef<[string, string][]> = computed<
  [string, string][]
>(() => {
  const autoCompleteField: keyof TransformedAttendeeInfo | null =
    props.autoCompleteField;
  if (autoCompleteField === null || !autoCompleteDataRef.value) {
    return [];
  }
  const autoCompleteData: string[] = <string[]>(
    autoCompleteDataRef.value
      .map((item: TransformedAttendeeInfo) => item[autoCompleteField])
      .filter((value: any) => value != null)
  );
  var uniqueAutoCompleteData: Map<string, string> = new Map<string, string>();
  autoCompleteData.forEach((entry: string) => {
    uniqueAutoCompleteData.set(entry, entry?.toLowerCase() || entry);
  });
  return Array.from(uniqueAutoCompleteData.entries());
});

async function doComplete(event: AutoCompleteCompleteEvent): Promise<void> {
  const query: string = event.query.toLowerCase();
  suggestionsRef.value = computedAutoCompleteDataRef.value
    .filter(([_showEntry, searchEntry]: [string, string]) =>
      searchEntry.startsWith(query)
    )
    .map(([showEntry, _searchEntry]: [string, string]) => showEntry);
}

interface Props extends FilterElementProps {
  placeholder: string;
  autoCompleteField: keyof TransformedAttendeeInfo | null;
}
const props: Props = defineProps<Props>();
const modelValueRef: ModelRef<string | null> = defineModel<string | null>({
  required: true,
});
const autoCompleteDataRef: ModelRef<TransformedAttendeeInfo[] | undefined> =
  defineModel<TransformedAttendeeInfo[]>("autoCompleteData", {
    required: true,
  });
</script>
