<template>
  <Toast :group="toastService.toastGroup" position="bottom-right" />

  <div class="flex flex-col flex-grow gap-4 p-4 overflow-auto">
    <Tabs v-model:value="activeTab">
      <TabList pt:content="flex justify-center">
        <Tab value="transfer"><i class="pi pi-arrow-right-arrow-left mr-2" />Transfer Items</Tab>
        <Tab value="assign"><i class="pi pi-plus-circle mr-2" />Assign Items</Tab>
        <Tab value="tree"><i class="pi pi-list-check mr-2" />Inventory</Tab>
        <Tab value="history"><i class="pi pi-clock mr-2" />History</Tab>
        <Tab value="sumup"><i class="pi pi-credit-card mr-2" />SumUp</Tab>
        <Tab value="lookup"><i class="pi pi-search mr-2" />Attendee Lookup</Tab>
      </TabList>
      <TabPanels>
        <TabPanel value="transfer">
          <ItemTransferTab :toastService="toastService" />
        </TabPanel>
        <TabPanel value="assign">
          <ItemAssignTab :toastService="toastService" />
        </TabPanel>
        <TabPanel value="tree">
          <ItemTreeTab :toastService="toastService" />
        </TabPanel>
        <TabPanel value="history">
          <ItemHistoryTab :toastService="toastService" />
        </TabPanel>
        <TabPanel value="sumup">
          <ItemSumUpTab :toastService="toastService" />
        </TabPanel>
        <TabPanel value="lookup">
          <ItemLookupTab :toastService="toastService" />
        </TabPanel>
      </TabPanels>
    </Tabs>
  </div>
</template>

<script setup lang="ts">
import ItemAssignTab from "@/components/items/ItemAssignTab.vue";
import ItemHistoryTab from "@/components/items/ItemHistoryTab.vue";
import ItemLookupTab from "@/components/items/ItemLookupTab.vue";
import ItemSumUpTab from "@/components/items/ItemSumUpTab.vue";
import ItemTransferTab from "@/components/items/ItemTransferTab.vue";
import ItemTreeTab from "@/components/items/ItemTreeTab.vue";
import { generateId } from "@/composables/generateId";
import { OnsiteToastService } from "@/composables/services/toastService";
import Tab from "@/volt/Tab.vue";
import TabList from "@/volt/TabList.vue";
import TabPanel from "@/volt/TabPanel.vue";
import TabPanels from "@/volt/TabPanels.vue";
import Tabs from "@/volt/Tabs.vue";
import Toast from "@/volt/Toast.vue";
import { useLocalStorage } from "@vueuse/core";
import { useId } from "vue";

const toastService = new OnsiteToastService(generateId(useId()));
const activeTab = useLocalStorage<string>("item-mgmt-active-tab", "transfer");
</script>
