<template>
  <div class="flex flex-col">
    <div v-if="props.status.mode == SearchStatusMode.searching">
      <Message :closable="false" :severity="MessageSeverity.info">
        Searching for registration number "{{ props.status.regNumber }}"
      </Message>
      <ProgressBar mode="indeterminate" />
    </div>
    <div v-if="props.status.mode == SearchStatusMode.error">
      <Message :closable="false" :severity="MessageSeverity.error">
        <b>
          Encountered error while searching for registration number #{{
            props.status.regNumber
          }}
        </b>
        <br />
        <br />
        {{ props.status.message }}
      </Message>
    </div>
    <div v-if="props.status.mode == SearchStatusMode.idle_no_data">
      <Message :closable="false" :severity="MessageSeverity.info">
        No pending operations ...
      </Message>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  SearchStatusMode,
  type SearchStatus,
} from "@/types/internal/component/regnumsearch";
import { MessageSeverity } from "@/types/internal/primevue";
import Message from "@/volt/Message.vue";
import ProgressBar from "@/volt/ProgressBar.vue";

interface Props {
  status: SearchStatus;
}
const props: Props = defineProps<Props>();
</script>
