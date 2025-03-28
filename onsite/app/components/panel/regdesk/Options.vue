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
          <CustomLabeledToggleSwitch
            label="Auto-select if there is just one match"
            v-model="displayOptionsRef.filterAutoSelect"
          />
          <CustomLabeledToggleSwitch
            label="Close dialog / deselect attendee when checking in"
            v-model="displayOptionsRef.checkinAutoClose"
          />
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
          <CustomLabeledToggleSwitch
            label="Enable runner window on selection"
            v-model="displayOptionsRef.displayRunner.enabled"
          />
          <CustomLabeledRelativeSlider
            :label="`Duration of the runner window: ${
              Math.round(displayOptionsRef.displayRunner.duration / 100) / 10
            }s`"
            :withParens="true"
            v-model="displayOptionsRef.displayRunner.duration"
            :baseValue="
              defaultAttendeeTableDisplayOptions.displayRunner.duration
            "
            :step="500"
            :min="500"
            :max="20000"
          />
          <CustomLabeledRelativeSlider
            :label="`Font Size: ${
              Math.round(displayOptionsRef.displayRunner.duration / 100) / 10
            }s`"
            :withParens="true"
            v-model="displayOptionsRef.displayRunner.size"
            :baseValue="defaultAttendeeTableDisplayOptions.displayRunner.size"
            :step="2"
            :min="2"
            :max="20"
          />
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
              v-model="dataOptionsRef.filterConfig.globalFilterFields"
              :options="
                attendeeDataOptionChoices.filterConfig.globalFilterFields
              "
              optionLabel="label"
              optionValue="fieldName"
              scrollHeight="35rem"
              multiple
            />
            <small>
              To enable searching for the full name, please select both first
              and last name.
            </small>
          </div>
        </div>
      </TabPanel>

      <TabPanel value="3">
        <div class="flex flex-col gap-2">
          <div class="flex flex-col gap-1 h-5rem">
            <label for="country">Country Filter</label>
            <AttendeeTableSearchFieldCountry
              id="country"
              v-model="dataOptionsRef.filterConfig.filterValues.country.value"
              :columnDefinition="null"
              :filterCallback="() => {}"
            />
          </div>
          <div class="flex flex-col gap-1 h-5rem">
            <label for="status">Status Filter</label>
            <AttendeeTableSearchFieldTag
              id="status"
              v-model="dataOptionsRef.filterConfig.filterValues.status.value"
              :columnDefinition="null"
              :filterCallback="() => {}"
              :configItems="
                attendeeDataOptionChoices.filterConfig.filterValues.status
              "
            />
          </div>
          <div class="flex flex-col gap-1 h-5rem">
            <label for="roles">Role Filter</label>
            <AttendeeTableSearchFieldTag
              id="roles"
              v-model="
                dataOptionsRef.filterConfig.filterValues.transConRole.value
              "
              :columnDefinition="null"
              :filterCallback="() => {}"
              :configItems="
                attendeeDataOptionChoices.filterConfig.filterValues.transConRole
              "
            />
          </div>
          <div class="flex flex-col gap-1 h-5rem">
            <label for="sponsor">Sponsor Level Filter</label>
            <AttendeeTableSearchFieldTag
              id="sponsor"
              v-model="
                dataOptionsRef.filterConfig.filterValues.transSponsorChoice
                  .value
              "
              :columnDefinition="null"
              :filterCallback="() => {}"
              :configItems="
                attendeeDataOptionChoices.filterConfig.filterValues
                  .transSponsorChoice
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
} from "@/config/system/regdesk";
import { setupAttendeeQueryStrategy } from "@/config/system/regdesk";
import {
  setupCheckinDisplay,
  setupTableFilterDisplay,
} from "@/config/system/regdesk";
import type { GoodiesLevelValue } from "@/config/metadata/packages/metadataForPerks";
import {
  type ConRoleInfo,
  type LabeledValue,
  type PackageInfo,
  type StatusInfo,
} from "@/types/internal/infos";
import type {
  ColumnDefinition,
  TableFilterDisplayValue,
} from "@/types/internal/component/table";
import type {
  AttendeeDataOptions,
  AttendeeQueryStrategyValue,
  AttendeeTableDisplayOptions,
  CheckinDisplayValue,
} from "@/types/internal/system/regdesk";
import { getConventionSetup } from "@/composables/logic/getConventionSetup";

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
  queryMode: LabeledValue<AttendeeQueryStrategyValue>[];
  filterConfig: {
    globalFilterFields: ColumnDefinition[];
    filterValues: {
      status: StatusInfo[];
      transConRole: ConRoleInfo[];
      transSponsorChoice: PackageInfo<GoodiesLevelValue>[];
    };
  };
}

const attendeeDataOptionChoices: AttendeeDataOptionChoices = {
  queryMode: setupAttendeeQueryStrategy,
  filterConfig: {
    globalFilterFields: setupColumnDefinitionList.filter(
      (item: ColumnDefinition) => item.filterConfig?.canBeGlobalFilter
    ),
    filterValues: {
      status: getConventionSetup().metadata.forStatus.list,
      transConRole: getConventionSetup().metadata.forConRole.list,
      transSponsorChoice: getConventionSetup().metadata.forSponsorLevels.list,
    },
  },
};

const displayOptionsRef: ModelRef<AttendeeTableDisplayOptions> =
  defineModel<AttendeeTableDisplayOptions>("displayOptions", {
    required: true,
  });
const dataOptionsRef: ModelRef<AttendeeDataOptions> =
  defineModel<AttendeeDataOptions>("dataOptions", { required: true });
</script>

<style lang="css">
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
