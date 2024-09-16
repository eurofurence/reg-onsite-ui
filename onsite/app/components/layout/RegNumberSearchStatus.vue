<template>
  <div class="flex flex-col">
    <div class="pt-3" v-if="props.status.mode == SearchStatusMode.searching">
      <Message :closable="false" :severity="Severity.info">
        Searching for registration number "{{ props.status.regNumber }}"
      </Message>
      <ProgressBar mode="indeterminate" />
    </div>
    <div class="pt-3" v-if="props.status.mode == SearchStatusMode.error">
      <Message :closable="false" severity="error">
        Encountered error while searching for registration number "{{
          props.status.regNumber
        }}":
        <br />
        {{ props.status.message }}
      </Message>
    </div>
    <div class="pt-3" v-if="props.status.mode == SearchStatusMode.idle_no_data">
      <Message :closable="false" :severity="Severity.info">
        No pending operations ...
      </Message>
    </div>
  </div>
</template>

<script setup lang="ts">
import { SearchStatusMode, Severity } from "@/types/internal";
import type { SearchStatus } from "@/types/internal";
interface Props {
  status: SearchStatus;
}
const props: Props = defineProps<Props>();
</script>
