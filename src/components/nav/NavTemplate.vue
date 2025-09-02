<template>
  <div class="flex flex-grow">
    <div class="m-auto">
      <Card>
        <template #content>
          <div class="grid grid-cols-2 gap-3 pb-3 onsite-nav">
            <Fieldset
              legend="Registration"
              :disabled="
                checkDisabled(AuthGroups.registration, AuthGroups.security)
              "
              v-if="checkShown(AuthGroups.registration, AuthGroups.security)"
            >
              <div class="flex flex-col gap-3 m-2">
                <LinkButton :href="getLink('/regdesk')" class="w-full">
                  <i class="pi pi-id-card" />Registration Desk
                </LinkButton>
                <LinkButton :href="getLink('/cashierdesk')" class="w-full">
                  <i class="pi pi-money-bill" />Cashier Desk
                </LinkButton>
                <LinkButton :href="getLink('/quickregdesk')" class="w-full">
                  <i class="pi pi-bolt" />Quick Registration Desk
                </LinkButton>
              </div>
            </Fieldset>
            <Fieldset legend="Goodies">
              <div class="flex flex-col gap-3 m-2">
                <LinkButton
                  :disabled="checkDisabled(AuthGroups.sponsorDesk)"
                  v-if="checkShown(AuthGroups.sponsorDesk)"
                  :href="getLink('/sponsordesk')"
                  class="w-full"
                >
                  <i class="pi pi-heart-fill pr-2" />Sponsor Desk<br />(First
                  Day)
                </LinkButton>
                <LinkButton
                  :disabled="checkDisabled(AuthGroups.dealersDen)"
                  v-if="checkShown(AuthGroups.dealersDen)"
                  :href="getLink('/constore')"
                  class="w-full"
                >
                  <i class="pi pi-shopping-cart pr-2" />Con Store Desk<br />(In
                  the DD)
                </LinkButton>
                <LinkButton :href="getLink('/shipping')" class="w-full">
                  <i class="pi pi-envelope" />Shipping Form
                </LinkButton>
              </div>
            </Fieldset>
            <Fieldset
              legend="Statistics"
              :disabled="
                checkDisabled(
                  AuthGroups.dealersDen,
                  AuthGroups.registration,
                  AuthGroups.security
                )
              "
              v-if="
                checkShown(
                  AuthGroups.dealersDen,
                  AuthGroups.registration,
                  AuthGroups.security
                )
              "
            >
              <div class="flex flex-col gap-3 m-2">
                <LinkButton :href="getLink('/stats')" class="w-full">
                  <i class="pi pi-chart-line" />Statistics
                </LinkButton>
              </div>
            </Fieldset>
            <Fieldset
              legend="Dealer's Den"
              :disabled="checkDisabled(AuthGroups.dealersDen)"
              v-if="checkShown(AuthGroups.dealersDen)"
            >
              <div class="flex flex-col gap-3 m-2">
                <LinkButton
                  :href="environmentSettings.dealerFrontdeskUrl.toString()"
                  class="w-full"
                >
                  <i class="pi pi-palette" />DD Checkin Desk
                </LinkButton>
              </div>
            </Fieldset>
            <Fieldset legend="Other Services">
              <div class="flex flex-col gap-3 m-2">
                <LinkButton
                  href="https://critter.eurofurence.org"
                  class="w-full"
                >
                  <i class="pi pi-briefcase" />Critter System
                </LinkButton>
                <LinkButton
                  href="https://stream.eurofurence.org"
                  class="w-full"
                >
                  <i class="pi pi-video" />Live Stream
                </LinkButton>
              </div>
            </Fieldset>
          </div>
          <LabeledToggleSwitch
            label="Show disabled apps"
            v-model="showDisabled"
          />
        </template>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import LabeledToggleSwitch from "@/components/common/LabeledToggleSwitch.vue";
import LinkButton from "@/components/common/LinkButton.vue";
import { environmentSettings } from "@/composables/services/environmentService";
import { isInAnyGroup } from "@/composables/state/authState";
import { AuthGroups, type AuthGroupValue } from "@/types/internal/convention";
import Card from "@/volt/Card.vue";
import Fieldset from "@/volt/Fieldset.vue";
import { ref, type Ref } from "vue";

const showDisabled: Ref<boolean> = ref(false);

function checkDisabled(...groupNameList: AuthGroupValue[]) {
  return !isInAnyGroup(...groupNameList);
}

function checkShown(...groupNameList: AuthGroupValue[]) {
  return isInAnyGroup(...groupNameList) || showDisabled.value;
}

function getLink(relativePath: string): string {
  return `${import.meta.env.BASE_URL}${relativePath}`;
}
</script>
