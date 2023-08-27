<template>
    <Dialog
        v-model:visible="visible"
        modal
        :dismissableMask="true"
        :closeOnEscape="true"
        :maximizable="true"
        header="Statistics"
        :style="{ width: '80vw' }"
    >
        <div class="flex flex-rows gap-5 align-items-center align-content-center justify-content-center p-2">
            <div class="flex align-items-center">
                <RadioButton v-model="dataSource" inputId="dataSource1" name="dataSource1" value="search" />
                <label for="dataSource1" class="ml-2">Unfiltered search result</label>
            </div>
            <div class="flex align-items-center">
                <RadioButton v-model="dataSource" inputId="dataSource2" name="dataSource2" value="filtered" />
                <label for="dataSource2" class="ml-2">Filtered data</label>
            </div>
        </div>
        <div class="flex flex-wrap gap-5 justify-content-center">
            <Chart type="pie" :data="getOverviewData(dataSource, 'status', configStatusItems)" :options="chartOptions" class="w-25rem" />
            <Chart type="pie" :data="getOverviewData(dataSource, 'sponsor', configSponsorItems)" :options="chartOptions" class="w-25rem" />
            <Chart type="pie" :data="getOverviewData(dataSource, 'conbook', configConbookItems)" :options="chartOptions" class="w-25rem" />
            <Chart type="pie" :data="getOverviewData(dataSource, 'roles', configRoleItems, true)" :options="chartOptions" class="w-25rem" />
        </div>
    </Dialog>
</template>

<script setup>
import { ref } from "vue";

import Dialog from "primevue/dialog";
import Chart from "primevue/chart";
import RadioButton from "primevue/radiobutton";

import { configStatusItems, configSponsorItems, configConbookItems, configRoleItems } from "@/ef.config";
import { convertListToMap } from "@/composables/convertListToMap";
import { getColorVariants } from "@/composables/getColorVariants";
import { filterAttendees } from "@/composables/filterAttendees";

const dataSource = ref("search");

// eslint-disable-next-line no-undef
const visible = defineModel("visible");

const props = defineProps(["searchResult", "filters", "globalSearchColumns"]);

const chartOptions = ref({
    plugins: {
        legend: {
            labels: {
                usePointStyle: true,
            },
        },
    },
});

function getValueCounts(inputList) {
    return inputList.reduce((counts, value) => {
        counts.set(value, (counts.get(value) || 0) + 1);
        return counts;
    }, new Map());
}

function getValueCountsData(inputList) {
    const valueCounts = getValueCounts(inputList);
    return [Array.from(valueCounts.keys()), Array.from(valueCounts.values())];
}

function getMainColor(colorStr) {
    const documentStyle = getComputedStyle(document.body);
    return documentStyle.getPropertyValue(getColorVariants(colorStr)[0]);
}

function getAltColor(colorStr) {
    const documentStyle = getComputedStyle(document.body);
    return documentStyle.getPropertyValue(getColorVariants(colorStr)[1]);
}

function getOverviewData(dataSource, key, configItems, expand = false) {
    const data = dataSource == "search" ? props.searchResult : filterAttendees(props.searchResult, props.filters, props.globalSearchColumns);
    var statusData = data.map((item) => item[key]);
    if (expand) {
        statusData = [].concat(...statusData.map((entry) => (entry.length === 0 ? [""] : entry)));
    }
    const [statusLabel, statusCounts] = getValueCountsData(statusData);
    const statusInfo = convertListToMap(configItems);

    return {
        labels: statusLabel.map((value) => statusInfo[value].label),
        datasets: [
            {
                data: statusCounts,
                backgroundColor: statusLabel.map((value) => getMainColor(statusInfo[value].color)),
                hoverBackgroundColor: statusLabel.map((value) => getAltColor(statusInfo[value].color)),
            },
        ],
    };
}
</script>
