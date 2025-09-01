<template>
  <div class="flex flex-wrap gap-2">
    <FirstName v-model="attendeeInfoRef.first_name" />
    <LastName v-model="attendeeInfoRef.last_name" />
  </div>
  <div class="flex flex-wrap gap-2">
    <Street v-model="attendeeInfoRef.street" :showSkeleton="false" />
  </div>
  <div class="flex flex-wrap gap-2">
    <Zip v-model="attendeeInfoRef.zip" :showSkeleton="false" />
    <City v-model="attendeeInfoRef.city" :showSkeleton="false" />
  </div>
  <div class="flex flex-wrap gap-2">
    <Country v-model="attendeeInfoRef.country" />
    <State v-model="attendeeInfoRef.state" :showSkeleton="false" />
  </div>
</template>

<script setup lang="ts">
import City from "@/components/common/field/City.vue";
import Country from "@/components/common/field/Country.vue";
import FirstName from "@/components/common/field/FirstName.vue";
import LastName from "@/components/common/field/LastName.vue";
import State from "@/components/common/field/State.vue";
import Street from "@/components/common/field/Street.vue";
import Zip from "@/components/common/field/Zip.vue";
import type { ApiShippingAddInfo } from "@/types/external/attsrv/additional-info/shipping";
import type { ModelRef } from "vue";

const attendeeInfoRef: ModelRef<ApiShippingAddInfo> =
  defineModel<ApiShippingAddInfo>({
    required: true,
  });
</script>
