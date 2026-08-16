<script setup lang="ts">
import { onMounted, useId } from 'vue'
import OnsitePage from '@/components/common/OnsitePage.vue'
import BadgeMapping from '@/components/badge/BadgeMapping.vue'
import BadgeTypeManager from '@/components/badge/BadgeTypeManager.vue'
import MassPrint from '@/components/badge/MassPrint.vue'
import PrintHistory from '@/components/badge/PrintHistory.vue'
import PrintSettingsView from '@/components/badge/PrintSettings.vue'
import { usePageSizeStyle } from '@/composables/usePageSizeStyle'
import { getErrorHandlerFunction } from '@/composables/api/base/getErrorHandlerFunction'
import { generateId } from '@/composables/generateId'
import { loadBadgeConfig, printSettingsRef } from '@/composables/services/badgeConfigStore'
import { OnsiteToastService } from '@/composables/services/toastService'
import Tab from '@/volt/Tab.vue'
import TabList from '@/volt/TabList.vue'
import TabPanel from '@/volt/TabPanel.vue'
import TabPanels from '@/volt/TabPanels.vue'
import Tabs from '@/volt/Tabs.vue'
import Toast from '@/volt/Toast.vue'

const componentId = generateId(useId())
const toastService = new OnsiteToastService(componentId)
const errorHandler = getErrorHandlerFunction(toastService)

onMounted(() => loadBadgeConfig(errorHandler))

usePageSizeStyle(printSettingsRef)

const pageTips: string[] = [
  "Use the Print Settings tab to configure page size and layout before printing.",
  "The Badge Designer tab lets you define how each badge type looks.",
  "The Badge Mapping tab controls which badge design is used for which attendee type.",
  "The Mass Print tab lets you print badges for many attendees at once.",
  "The Print History tab shows a record of previously printed badges.",
  "Badge designs are shared across all attendees mapped to the same badge type.",
  "Mass Print applies the badge mapping configured for each attendee type.",
  "You can retry failed prints directly from the Mass Print tab.",
]
</script>

<template>
  <OnsitePage title="Badge Management" :pageTips="pageTips">
    <Toast :group="toastService.toastGroup" position="bottom-right" />
    <Tabs value="print-settings" class="flex flex-col flex-grow">
      <TabList pt:content="flex justify-center">
        <Tab value="print-settings">Settings</Tab>
        <Tab value="designer">Badge Designer</Tab>
        <Tab value="badge-mapping">Badge Mapping</Tab>
        <Tab value="mass-print">Mass Print</Tab>
        <Tab value="print-history">Print History</Tab>
      </TabList>
      <TabPanels>
        <TabPanel value="print-settings">
          <PrintSettingsView v-model="printSettingsRef" :errorHandler="errorHandler" />
        </TabPanel>
        <TabPanel value="designer">
          <BadgeTypeManager :errorHandler="errorHandler" />
        </TabPanel>
        <TabPanel value="badge-mapping">
          <BadgeMapping :errorHandler="errorHandler" />
        </TabPanel>
        <TabPanel value="mass-print">
          <MassPrint :errorHandler="errorHandler" />
        </TabPanel>
        <TabPanel value="print-history">
          <PrintHistory :errorHandler="errorHandler" />
        </TabPanel>
      </TabPanels>
    </Tabs>
  </OnsitePage>
</template>
