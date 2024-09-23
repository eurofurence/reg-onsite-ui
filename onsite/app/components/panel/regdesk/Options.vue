<template>
  <Tabs value="0">
    <TabList>
      <Tab value="0">UI Settings</Tab>
      <Tab value="1">Runner UI Settings</Tab>
      <Tab value="2">Column Settings</Tab>
      <Tab value="3">Preset Filters</Tab>
      <Tab value="4">Advanced Settings</Tab>
    </TabList>
    <TabPanels class="min-h-[35rem] min-w-[56rem]">
      <TabPanel value="0">
        <div class="flex flex-col gap-2">
          <div class="flex flex-col gap-1 w-20rem">
            <label for="displayRowsPerPage">Number of results per page</label>
            <Select
              id="displayRowsPerPage"
              v-model="displayOptionsRef.displayRowsPerPage"
              :options="attendeeTableDisplayOptionChoices.displayRowsPerPage"
            />
          </div>
          <div class="flex flex-col gap-1">
            <label for="autoSelect">
              Auto-select if there is just one match
            </label>
            <ToggleSwitch
              id="autoSelect"
              v-model="displayOptionsRef.filterAutoSelect"
            />
          </div>
          <div class="flex flex-col gap-1">
            <label for="autoSelect">
              Close dialog / deselect attendee when checking in
            </label>
            <ToggleSwitch
              id="autoSelect"
              v-model="displayOptionsRef.checkinAutoClose"
            />
          </div>
          <div class="flex flex-col gap-1">
            <label for="filterDisplay">Layout of the filter elements</label>
            <SelectButton
              id="filterDisplay"
              v-model="displayOptionsRef.filterInputDisplay"
              :options="attendeeTableDisplayOptionChoices.filterInputDisplay"
              optionLabel="label"
              optionValue="value"
            />
          </div>
          <div class="flex flex-col gap-1">
            <label for="displayType">How the check-in is shown</label>
            <SelectButton
              id="displayType"
              v-model="displayOptionsRef.displayCheckinLocation"
              :options="
                attendeeTableDisplayOptionChoices.displayCheckinLocation
              "
              optionLabel="label"
              optionValue="value"
            />
          </div>
        </div>
      </TabPanel>

      <TabPanel value="1">
        <div class="flex flex-col gap-2 w-full">
          <div class="flex flex-col gap-1">
            Enable runner window on selection
            <ToggleSwitch
              id="autoSelect"
              v-model="displayOptionsRef.displayRunner.enabled"
            />
          </div>
          <div class="flex flex-col gap-1">
            <label for="labelRunnerSize">
              Duration of the runner window
              {{
                Math.round(displayOptionsRef.displayRunner.duration / 100) / 10
              }}s ({{
                Math.round(
                  (displayOptionsRef.displayRunner.duration * 100) /
                    defaultAttendeeTableDisplayOptions.displayRunner.duration
                )
              }}%)
            </label>
            <Slider
              id="labelRunnerSize"
              v-model="displayOptionsRef.displayRunner.duration"
              :step="500"
              :min="500"
              :max="20000"
            />
          </div>
          <div class="flex flex-col gap-1">
            <label for="labelRunnerSize">
              Font Size:
              {{
                Math.round(
                  (displayOptionsRef.displayRunner.size * 100) /
                    defaultAttendeeTableDisplayOptions.displayRunner.size
                )
              }}%
            </label>
            <Slider
              id="labelRunnerSize"
              v-model="displayOptionsRef.displayRunner.size"
              :step="2"
              :min="2"
              :max="20"
            />
          </div>
          <div class="flex flex-col gap-1">
            Location of the runner window on the screen
            <span class="capitalize">{{
              displayOptionsRef.displayRunner.location?.replace("-", " ")
            }}</span>
            <div
              class="flex grid grid-cols-3 border-4 justify-items-center p-2 gap-8"
            >
              <div>
                <RadioButton
                  v-model="displayOptionsRef.displayRunner.location"
                  value="top-left"
                />
              </div>
              <div>
                <RadioButton
                  v-model="displayOptionsRef.displayRunner.location"
                  value="top-center"
                />
              </div>
              <div>
                <RadioButton
                  v-model="displayOptionsRef.displayRunner.location"
                  value="top-right"
                />
              </div>
              <div></div>
              <div>
                <RadioButton
                  v-model="displayOptionsRef.displayRunner.location"
                  value="center"
                />
              </div>
              <div></div>
              <div>
                <RadioButton
                  v-model="displayOptionsRef.displayRunner.location"
                  value="bottom-left"
                />
              </div>
              <div>
                <RadioButton
                  v-model="displayOptionsRef.displayRunner.location"
                  value="bottom-center"
                />
              </div>
              <div>
                <RadioButton
                  v-model="displayOptionsRef.displayRunner.location"
                  value="bottom-right"
                />
              </div>
            </div>
          </div>
        </div>
      </TabPanel>

      <TabPanel value="2">
        <div class="flex flex-rows gap-2 w-full">
          <div class="flex flex-col gap-1 w-80">
            <label for="displayColumns">Visible columns</label>
            <Listbox
              id="displayColumns"
              v-model="displayOptionsRef.displayColumns"
              :options="attendeeTableDisplayOptionChoices.displayColumns"
              optionLabel="label"
              optionValue="fieldName"
              scrollHeight="35rem"
              multiple
            />
          </div>
          <div class="flex flex-col gap-1 w-80">
            <label for="globalSearchColumns"
              >Columns included in the global search</label
            >
            <Listbox
              id="globalSearchColumns"
              v-model="dataOptionsRef.globalFilterFields"
              :options="attendeeDataOptionChoices.globalFilterFields"
              optionLabel="label"
              optionValue="fieldName"
              scrollHeight="35rem"
              multiple
            />
            <small>To enable searching for the full name, please select both first and last name.</small>
          </div>
        </div>
      </TabPanel>

      <TabPanel value="3">
        <div class="flex flex-col gap-2">
          <div class="flex flex-col gap-1 h-5rem">
            <label for="country">Country Filter</label>
            <CustomRegdeskTableSearchFieldCountry
              id="country"
              v-model="dataOptionsRef.filters.country.value"
              :columnDefinition="null"
              :filterCallback="() => {}"
            />
          </div>
          <div class="flex flex-col gap-1 h-5rem">
            <label for="status">Status Filter</label>
            <CustomRegdeskTableSearchFieldTag
              id="status"
              v-model="dataOptionsRef.filters.status.value"
              :columnDefinition="null"
              :filterCallback="() => {}"
              :configItems="attendeeDataOptionChoices.filters.status"
            />
          </div>
          <div class="flex flex-col gap-1 h-5rem">
            <label for="roles">Role Filter</label>
            <CustomRegdeskTableSearchFieldTag
              id="roles"
              v-model="dataOptionsRef.filters.transConRole.value"
              :columnDefinition="null"
              :filterCallback="() => {}"
              :configItems="attendeeDataOptionChoices.filters.transConRole"
            />
          </div>
          <div class="flex flex-col gap-1 h-5rem">
            <label for="sponsor">Sponsor Level Filter</label>
            <CustomRegdeskTableSearchFieldTag
              id="sponsor"
              v-model="dataOptionsRef.filters.transSponsorChoice.value"
              :columnDefinition="null"
              :filterCallback="() => {}"
              :configItems="
                attendeeDataOptionChoices.filters.transSponsorChoice
              "
            />
          </div>
        </div>
      </TabPanel>

      <TabPanel value="4">
        <div class="flex flex-col gap-1">
          <label for="queryMode">Attendee query settings</label>
          <SelectButton
            id="queryMode"
            v-model="dataOptionsRef.queryMode"
            :options="attendeeDataOptionChoices.queryMode"
            optionLabel="label"
            optionValue="value"
            :disabled="true"
          />
        </div>
      </TabPanel>
    </TabPanels>
  </Tabs>
</template>

<script setup lang="ts">
import type { ModelRef } from "vue";
import {
  defaultAttendeeTableDisplayOptions,
  setupColumnDefinitionList,
} from "@/config/app/regdesk";
import { setupAttendeeQueryStrategy } from "@/config/app/regdesk";
import { setupCheckinDisplay, setupTableFilterDisplay } from "@/config/app/regdesk";
import { setupConRoles } from "@/config/setupConRoles";
import type { GoodiesLevelValue } from "@/config/packages/setupPackages";
import { setupSponsorLevels } from "@/config/packages/setupSponsorLevels";
import { setupStatus } from "@/config/setupStatus";
import {
  type AttendeeDataOptions,
  type AttendeeQueryStrategyValue,
  type AttendeeTableDisplayOptions,
  type CheckinDisplayValue,
  type ColumnDefinition,
  type ConRoleInfo,
  type LabeledValue,
  type PackageInfo,
  type StatusInfo,
  type TableFilterDisplayValue,
} from "@/types/internal";

interface AttendeeTableDisplayOptionChoices {
  displayRowsPerPage: number[];
  filterInputDisplay: LabeledValue<TableFilterDisplayValue>[];
  displayCheckinLocation: LabeledValue<CheckinDisplayValue>[];
  displayColumns: ColumnDefinition[];
}

const attendeeTableDisplayOptionChoices: AttendeeTableDisplayOptionChoices = {
  displayRowsPerPage: [1, 2, 5, 10, 20, 50, 100, 1000, 10000],
  filterInputDisplay: setupTableFilterDisplay,
  displayCheckinLocation: setupCheckinDisplay,
  displayColumns: setupColumnDefinitionList,
};

interface AttendeeDataOptionChoices {
  globalFilterFields: ColumnDefinition[];
  queryMode: LabeledValue<AttendeeQueryStrategyValue>[];
  filters: {
    status: StatusInfo[];
    transConRole: ConRoleInfo[];
    transSponsorChoice: PackageInfo<GoodiesLevelValue>[];
  };
}

const attendeeDataOptionChoices: AttendeeDataOptionChoices = {
  globalFilterFields: setupColumnDefinitionList.filter(
    (item: ColumnDefinition) => item?.fieldCanBeUsedByGlobalSearch
  ),
  queryMode: setupAttendeeQueryStrategy,
  filters: {
    status: setupStatus,
    transConRole: setupConRoles,
    transSponsorChoice: setupSponsorLevels,
  },
};

const displayOptionsRef: ModelRef<AttendeeTableDisplayOptions> =
  defineModel<AttendeeTableDisplayOptions>("displayOptions", {
    required: true,
  });
const dataOptionsRef: ModelRef<AttendeeDataOptions> =
  defineModel<AttendeeDataOptions>("dataOptions", { required: true });
</script>

<style>
.p-listbox .p-listbox-list .p-listbox-item.p-highlight {
  background: var(--primary-300);
  color: white;
}

.p-listbox .p-listbox-list .p-listbox-item.p-highlight {
  background: var(--primary-300);
  color: white;
}

.p-listbox:not(.p-disabled) .p-listbox-item.p-highlight.p-focus {
  background: var(--primary-200);
}
</style>
