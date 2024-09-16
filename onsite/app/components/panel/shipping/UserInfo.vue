<template>
  <div class="flex flex-wrap gap-2">
    <FieldFirstName v-model="attendeeInfoRef.first_name" />
    <FieldLastName v-model="attendeeInfoRef.last_name" />
  </div>
  <div class="flex flex-wrap gap-2">
    <FieldStreet v-model="attendeeInfoRef.street" />
  </div>
  <div class="flex flex-wrap gap-2">
    <FieldZip v-model="attendeeInfoRef.zip" />
    <FieldCity v-model="attendeeInfoRef.city" />
  </div>
  <div class="flex flex-wrap gap-2">
    <FieldCountry v-model="attendeeInfoRef.country" />
    <FieldState v-model="attendeeInfoRef.state" />
  </div>
</template>

<script setup lang="ts">
import type { ModelRef } from "vue";
import type { ApiShippingAddInfo } from "@/types/external";

const attendeeInfoRef: ModelRef<ApiShippingAddInfo> =
  defineModel<ApiShippingAddInfo>({
    required: true,
  });
</script>
