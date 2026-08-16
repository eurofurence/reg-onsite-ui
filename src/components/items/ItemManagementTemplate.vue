<template>
  <Toast :group="toastService.toastGroup" position="bottom-right" />

  <div class="flex flex-col flex-grow p-4 overflow-auto">
    <Splitter class="flex-grow">
      <SplitterPanel :size="18" :minSize="14" class="!overflow-auto !block">
        <Menu :model="visibleNavGroups" class="w-full border-none">
          <template #item="{ item }">
            <a
              @click="activeTab = item.value"
              class="flex items-center gap-2 px-3 py-2 text-sm cursor-pointer rounded-sm"
              :class="
                activeTab === item.value
                  ? 'bg-primary text-primary-contrast'
                  : 'hover:bg-surface-100 dark:hover:bg-surface-800'
              "
            >
              <i :class="item.icon" />
              {{ item.label }}
              <i v-if="item.adminOnly" class="pi pi-shield text-xs ml-auto opacity-60" v-tooltip.right="'Restricted access: director'" />
            </a>
          </template>
        </Menu>
      </SplitterPanel>
      <SplitterPanel :size="82" class="!overflow-auto">
        <Tabs :value="activeTab" class="w-full">
          <TabPanels>
            <TabPanel value="assign">
              <ItemAssignTab :toastService="toastService" />
            </TabPanel>
            <TabPanel value="transfer">
              <ItemTransferTab :toastService="toastService" />
            </TabPanel>
            <TabPanel value="tree">
              <ItemTreeTab :toastService="toastService" />
            </TabPanel>
            <TabPanel value="inventory-management">
              <ItemInventoryManagementTab :toastService="toastService" />
            </TabPanel>
            <TabPanel value="sumup">
              <ItemSumUpTab :toastService="toastService" />
            </TabPanel>
            <TabPanel value="history">
              <ItemHistoryTab :toastService="toastService" />
            </TabPanel>
            <TabPanel value="attendee-history">
              <ItemAttendeeHistoryTab :toastService="toastService" />
            </TabPanel>
            <TabPanel value="comments">
              <ItemCommentsTab :toastService="toastService" />
            </TabPanel>
            <TabPanel value="lookup">
              <ItemLookupTab :toastService="toastService" />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </SplitterPanel>
    </Splitter>
  </div>
</template>

<script setup lang="ts">
import ItemAssignTab from "@/components/items/ItemAssignTab.vue";
import ItemAttendeeHistoryTab from "@/components/items/ItemAttendeeHistoryTab.vue";
import ItemCommentsTab from "@/components/items/ItemCommentsTab.vue";
import ItemHistoryTab from "@/components/items/ItemHistoryTab.vue";
import ItemInventoryManagementTab from "@/components/items/ItemInventoryManagementTab.vue";
import ItemLookupTab from "@/components/items/ItemLookupTab.vue";
import ItemSumUpTab from "@/components/items/ItemSumUpTab.vue";
import ItemTransferTab from "@/components/items/ItemTransferTab.vue";
import ItemTreeTab from "@/components/items/ItemTreeTab.vue";
import { generateId } from "@/composables/generateId";
import { isInAnyGroup } from "@/composables/state/authState";
import { OnsiteToastService } from "@/composables/services/toastService";
import { AuthGroups } from "@/types/internal/convention";
import Menu from "@/volt/Menu.vue";
import Splitter from "@/volt/Splitter.vue";
import TabPanel from "@/volt/TabPanel.vue";
import TabPanels from "@/volt/TabPanels.vue";
import Tabs from "@/volt/Tabs.vue";
import Toast from "@/volt/Toast.vue";
import { useLocalStorage } from "@vueuse/core";
import { SplitterPanel } from "primevue";
import type { MenuItem } from "primevue/menuitem";
import { computed, useId, watch } from "vue";

const toastService = new OnsiteToastService(generateId(useId()));
const activeTab = useLocalStorage<string>("item-mgmt-active-tab", "assign");

const isAdmin = computed(() => isInAnyGroup(AuthGroups.director));

const navGroups: MenuItem[] = [
  {
    label: "Attendee Actions",
    items: [
      { value: "assign", label: "Assign Items", icon: "pi pi-plus-circle", adminOnly: true },
      { value: "transfer", label: "Transfer Items", icon: "pi pi-arrow-right-arrow-left" },
    ],
  },
  {
    label: "Inventory",
    items: [
      { value: "tree", label: "Overview", icon: "pi pi-list-check" },
      { value: "inventory-management", label: "Manage Counts", icon: "pi pi-box" },
      { value: "sumup", label: "SumUp", icon: "pi pi-credit-card", adminOnly: true },
    ],
  },
  {
    label: "History & Audit",
    items: [
      { value: "history", label: "Change Log", icon: "pi pi-clock", adminOnly: true },
      { value: "attendee-history", label: "Attendee History", icon: "pi pi-user" },
      { value: "comments", label: "Comments", icon: "pi pi-comment" },
    ],
  },
  {
    label: "Tools",
    items: [
      { value: "lookup", label: "Attendee Lookup", icon: "pi pi-search", adminOnly: true },
    ],
  },
];

const visibleNavGroups = computed<MenuItem[]>(() =>
  navGroups
    .map((group) => ({
      ...group,
      items: (group.items as MenuItem[]).filter((item) => isAdmin.value || !item.adminOnly),
    }))
    .filter((group) => group.items.length > 0)
);

const adminTabValues = new Set(
  navGroups.flatMap((group) => (group.items as MenuItem[]).filter((item) => item.adminOnly).map((item) => item.value as string))
);

watch(
  isAdmin,
  () => {
    if (!isAdmin.value && adminTabValues.has(activeTab.value)) {
      activeTab.value = visibleNavGroups.value[0]!.items![0]!.value as string;
    }
  },
  { immediate: true }
);
</script>
