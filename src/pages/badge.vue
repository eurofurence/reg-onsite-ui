<script setup lang="ts">
import { ref, watch } from 'vue'
import OnsitePage from '@/components/common/OnsitePage.vue'
import BadgeMapping from '@/components/badge/BadgeMapping.vue'
import BadgeTypeManager from '@/components/badge/BadgeTypeManager.vue'
import MassPrint from '@/components/badge/MassPrint.vue'
import PrintSettingsView from '@/components/badge/PrintSettings.vue'
import { usePageSizeStyle } from '@/composables/usePageSizeStyle'
import { localPrintSettingsStore } from '@/composables/services/printSettingsStore'
import Tab from '@/volt/Tab.vue'
import TabList from '@/volt/TabList.vue'
import TabPanel from '@/volt/TabPanel.vue'
import TabPanels from '@/volt/TabPanels.vue'
import Tabs from '@/volt/Tabs.vue'
import type { PrintSettings } from '@/types/printSettings'

const printSettings = ref<PrintSettings>(localPrintSettingsStore.load())

watch(printSettings, (value) => {
  localPrintSettingsStore.save(value)
}, { deep: true })

usePageSizeStyle(printSettings)
</script>

<template>
  <OnsitePage title="Badge Management">
    <Tabs value="print-settings" class="flex flex-col flex-grow">
      <TabList>
        <Tab value="print-settings">Settings</Tab>
        <Tab value="designer">Badge Designer</Tab>
        <Tab value="badge-mapping">Badge Mapping</Tab>
        <Tab value="mass-print">Mass Print</Tab>
      </TabList>
      <TabPanels>
        <TabPanel value="print-settings">
          <PrintSettingsView v-model="printSettings" />
        </TabPanel>
        <TabPanel value="designer">
          <BadgeTypeManager />
        </TabPanel>
        <TabPanel value="badge-mapping">
          <BadgeMapping />
        </TabPanel>
        <TabPanel value="mass-print">
          <MassPrint />
        </TabPanel>
      </TabPanels>
    </Tabs>
  </OnsitePage>
</template>
