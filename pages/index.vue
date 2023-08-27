<!-- eslint-disable vue/multi-word-component-names -->
<template>
    <OnsitePageBase title="On-Site Applications">
        <div class="flex align-items-center justify-content-center min-h-screen">
            <Card>
                <template #content>
                    <div class="flex flex-column gap-3">
                        <NuxtLink to="/regdesk/">
                            <Button class="w-full" label="Registration Desk" icon="pi pi-id-card" />
                        </NuxtLink>
                        <NuxtLink to="/sponsordesk/">
                            <Button class="w-full" label="Sponsor Desk" icon="pi pi-heart-fill" />
                        </NuxtLink>
                        <a :href="getDDFrontDeskLink()" v-if="globalState.isDDWorker || !globalState.isDDWorker">
                            <Button class="w-full" label="DD Checkin Desk" icon="pi pi-shopping-cart" />
                        </a>
                    </div>
                </template>
            </Card>
        </div>
    </OnsitePageBase>
</template>

<script setup>
import Button from "primevue/button";
import Card from "primevue/card";
import OnsitePageBase from "@/components/OnsitePageBase.vue";
import { globalState } from "@/components/global";

function getDDFrontDeskLink() {
    // eslint-disable-next-line no-undef
    const config = useRuntimeConfig();
    if (config.public.DEPLOY_ENV === "dev") {
        return "https://dealers.test.eurofurence.org/frontdesk";
    }
    return "https://dealers.eurofurence.org/frontdesk";
}
</script>
