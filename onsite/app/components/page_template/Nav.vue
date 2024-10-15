<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <div class="flex flex-grow">
    <div class="m-auto">
      <Card>
        <template #content>
          <div class="grid grid-cols-2 gap-3 pb-3 onsite-nav">
            <Fieldset
              legend="Registration"
              :disabled="
                !isInAnyGroup(AuthGroups.registration, AuthGroups.security)
              "
            >
              <div class="flex flex-col gap-3">
                <Button
                  class="w-full"
                  label="Registration Desk"
                  icon="pi pi-id-card"
                  as="router-link"
                  to="/regdesk/"
                />
                <Button
                  class="w-full"
                  label="Quick Registration Desk"
                  icon="pi pi-bolt"
                  as="router-link"
                  to="/quickregdesk/"
                />
              </div>
            </Fieldset>
            <Fieldset legend="Goodies">
              <div class="flex flex-col gap-3">
                <Button
                  :disabled="!isInAnyGroup(AuthGroups.sponsorDesk)"
                  class="w-full"
                  label="Sponsor Desk"
                  icon="pi pi-heart-fill"
                  as="router-link"
                  to="/sponsordesk/"
                />
                <Button
                  :disabled="!isInAnyGroup(AuthGroups.dealersDen)"
                  class="w-full"
                  label="Con Store Desk"
                  icon="pi pi-shopping-cart"
                  as="router-link"
                  to="/constore/"
                />
                <Button
                  class="w-full"
                  label="Shipping Form"
                  icon="pi pi-envelope"
                  as="router-link"
                  to="/shipping/"
                />
              </div>
            </Fieldset>
            <Fieldset
              legend="Statistics"
              :disabled="
                !isInAnyGroup(
                  AuthGroups.dealersDen,
                  AuthGroups.registration,
                  AuthGroups.security
                )
              "
            >
              <Button
                class="w-full"
                label="Statistics"
                icon="pi pi-chart-line"
                as="router-link"
                to="/stats/"
              />
            </Fieldset>
            <Fieldset
              legend="Dealer's Den"
              :disabled="!isInAnyGroup(AuthGroups.dealersDen)"
            >
              <Button
                class="w-full"
                label="DD Checkin Desk"
                icon="pi pi-palette"
                as="a"
                :href="environmentSettings.dealerFrontdeskUrl.toString()"
              />
            </Fieldset>
          </div>
          <CustomLabeledToggleSwitch
            label="Show disabled apps"
            v-model="showDisabled"
          />
        </template>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { environmentSettings } from "@/composables/services/environmentService";
import { isInAnyGroup } from "@/composables/state/authState";
import { AuthGroups } from "@/types/internal/convention";

const showDisabled: Ref<boolean> = ref(false);
</script>

<style lang="css">
.onsite-nav .p-component:disabled {
  display: v-bind("showDisabled ? 'unset' : 'none'");
}
</style>
