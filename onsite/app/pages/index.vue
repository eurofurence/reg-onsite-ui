<!-- eslint-disable vue/multi-word-component-names -->
<template>
  <LayoutOnsitePage title="On-Site Applications">
    <div class="flex flex-grow">
      <div class="m-auto">
        <Card>
          <template #content>
            <div class="flex flex-col gap-3">
              <NuxtLink to="/regdesk/">
                <Button
                  class="w-full"
                  label="Registration Desk"
                  icon="pi pi-id-card"
                />
              </NuxtLink>
              <NuxtLink to="/quickregdesk/">
                <Button
                  class="w-full"
                  label="Quick Registration Desk"
                  icon="pi pi-bolt"
                />
              </NuxtLink>
              <NuxtLink to="/sponsordesk/">
                <Button
                  class="w-full"
                  label="Sponsor Desk"
                  icon="pi pi-heart-fill"
                />
              </NuxtLink>
              <NuxtLink to="/constore/">
                <Button
                  class="w-full"
                  label="Con Store Desk"
                  icon="pi pi-shopping-cart"
                />
              </NuxtLink>
              <NuxtLink to="/shipping/">
                <Button
                  class="w-full"
                  label="Shipping Form"
                  icon="pi pi-envelope"
                />
              </NuxtLink>
              <NuxtLink to="/stats/">
                <Button
                  class="w-full"
                  label="Statistics"
                  icon="pi pi-chart-line"
                />
              </NuxtLink>
              <a
                :href="environmentSettings.dealerFrontdeskUrl.toString()"
                v-if="authState.userCanAccessDDFrontdesk"
              >
                <Button
                  class="w-full"
                  label="DD Checkin Desk"
                  icon="pi pi-palette"
                />
              </a>
            </div>
          </template>
        </Card>
      </div>
    </div>
  </LayoutOnsitePage>
</template>

<script setup lang="ts">
import { environmentSettings } from "@/composables/services/environmentService";
import { authState } from "@/composables/state/authState";
</script>
