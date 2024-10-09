<template>
  <div class="flex flex-wrap align-items-center gap-2">
    <div class="flex align-items-center">
      <RadioButton
        v-model="shippingInfoRef.shipping_email"
        inputId="shipping_email_status"
        :name="componentId"
        :value="ShippingEmailUse.email_can_be_shared_with_logistics"
      />
      <label for="shipping_email_status" class="ml-2">{{
        descriptionsRef.shipping_email_status
      }}</label>
    </div>
    <div class="flex flex-rows align-items-center gap-5 pl-1">
      <label class="w-5rem font-bold text-right" for="email">{{
        descriptionsRef.email
      }}</label>
      <InputText
        :disabled="
          shippingInfoRef.shipping_email !==
          ShippingEmailUse.email_can_be_shared_with_logistics
        "
        id="email"
        v-model="shippingInfoRef.email"
      />
    </div>
  </div>
  <div class="flex align-items-center">
    <RadioButton
      v-model="shippingInfoRef.shipping_email"
      inputId="shipping_email_none"
      :name="componentId"
      :value="ShippingEmailUse.email_is_private"
    />
    <label for="shipping_email_none" class="ml-2">{{
      descriptionsRef.shipping_email_none
    }}</label>
  </div>
</template>

<script setup lang="ts">
import type { ShippingI18N } from "@/config/i18n/shipping";
import type { ModelRef } from "vue";
import {
  ShippingEmailUse,
  type ApiShippingAddInfo,
} from "@/types/external/attsrv/additional-info/shipping";

const shippingInfoRef: ModelRef<ApiShippingAddInfo> =
  defineModel<ApiShippingAddInfo>({
    required: true,
  });
const descriptionsRef: ModelRef<ShippingI18N> = defineModel<ShippingI18N>(
  "descriptions",
  {
    required: true,
  }
);
const componentId: string = generateId(useId());
</script>
