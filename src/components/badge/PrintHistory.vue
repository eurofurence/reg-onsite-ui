<script setup lang="ts">
import { parseBadgePrintHistoryEntry } from '@/composables/services/attendee/badgePrintHistoryEntry'
import { attendeeService } from '@/composables/services/attendeeService'
import type { RestErrorHandler } from '@/composables/api/base/restErrorWrapper'
import type { RegNumber } from '@/types/external/attsrv/attendees/attendee'
import DataTable from '@/volt/DataTable.vue'
import { Column } from 'primevue'
import { computed, onMounted, ref } from 'vue'

interface Props { errorHandler: RestErrorHandler }
const props = defineProps<Props>()

interface PrintHistoryRow {
  regNumber: RegNumber
  attendeeName: string
  badgeTypeName: string
  by: string
  when: string
}

const rows = ref<PrintHistoryRow[]>([])
const loading = ref(false)

async function loadPrintHistory() {
  loading.value = true
  const [attendees, addInfos] = await Promise.all([
    attendeeService.getAllAttendees(props.errorHandler),
    attendeeService.addInfos.getAllRegDeskAddInfos(props.errorHandler),
  ])
  loading.value = false
  if (!attendees || !addInfos) {
    return
  }

  const nameByRegNumber = new Map(attendees.map((attendee) => [attendee.transId, attendee.transFullName]))

  const nextRows: PrintHistoryRow[] = []
  for (const [regNumber, addInfo] of addInfos.infos) {
    for (const raw of addInfo.badgePrintHistory) {
      const entry = parseBadgePrintHistoryEntry(raw)
      if (!entry) {
        continue
      }
      nextRows.push({
        regNumber,
        attendeeName: nameByRegNumber.get(`${regNumber}`) ?? '',
        badgeTypeName: entry.badgeTypeName,
        by: entry.by,
        when: entry.when,
      })
    }
  }
  rows.value = nextRows
}

onMounted(loadPrintHistory)

const sortedRows = computed(() =>
  [...rows.value].sort((rowA, rowB) => rowB.when.localeCompare(rowA.when))
)

function formatWhen(when: string): string {
  const date = new Date(when)
  return Number.isNaN(date.getTime()) ? when : date.toLocaleString()
}
</script>

<template>
  <div class="flex flex-col gap-4 pt-4">
    <DataTable :value="sortedRows" :loading="loading" scrollable scrollHeight="32rem" size="small">
      <Column field="when" header="Printed At">
        <template #body="{ data }">{{ formatWhen(data.when) }}</template>
      </Column>
      <Column field="by" header="Printed By" />
      <Column field="regNumber" header="Reg Number" />
      <Column field="attendeeName" header="Attendee" />
      <Column field="badgeTypeName" header="Badge Type" />
    </DataTable>
  </div>
</template>
