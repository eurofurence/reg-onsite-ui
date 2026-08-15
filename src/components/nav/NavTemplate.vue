<template>
  <div class="flex flex-grow">
    <div class="m-auto">
      <Card>
        <template #content>
          <div class="grid grid-cols-2 gap-3 pb-3 onsite-nav">
            <template v-for="fieldset in allFieldsets" :key="fieldset.legend">
              <Fieldset
                :legend="fieldset.legend"
                :disabled="checkDisabled(...(fieldset.authGroups ?? []))"
                v-if="checkShown(...(fieldset.authGroups ?? []))"
              >
                <div class="flex flex-col gap-3 m-2">
                  <template
                    v-for="item in fieldset.items"
                    :key="item.label"
                  >
                    <LinkButton
                      :disabled="
                        checkDisabled(
                          ...(item.authGroups ?? fieldset.authGroups ?? [])
                        )
                      "
                      v-if="
                        checkShown(
                          ...(item.authGroups ?? fieldset.authGroups ?? [])
                        )
                      "
                      :href="resolveLink(item.link)"
                      class="w-full"
                    >
                      <i :class="item.icon" />{{ item.label
                      }}<template v-if="item.sublabel"
                        ><br />{{ item.sublabel }}</template
                      >
                    </LinkButton>
                  </template>
                </div>
              </Fieldset>
            </template>
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
import { navConfig } from "@/config/nav";
import { type AuthGroupValue } from "@/types/internal/convention";
import type { NavLink } from "@/types/internal/nav";
import Card from "@/volt/Card.vue";
import Fieldset from "@/volt/Fieldset.vue";
import { computed, ref, type Ref } from "vue";

const showDisabled: Ref<boolean> = ref(false);

const allFieldsets = computed(() => [
  ...navConfig,
  ...environmentSettings.externalFieldsets,
]);

function checkDisabled(...groupNameList: AuthGroupValue[]) {
  return !isInAnyGroup(...groupNameList);
}

function checkShown(...groupNameList: AuthGroupValue[]) {
  return isInAnyGroup(...groupNameList) || showDisabled.value;
}

function getLink(relativePath: string): string {
  return `${import.meta.env.BASE_URL}${relativePath}`;
}

function resolveLink(link: NavLink): string {
  if (link.kind === "internal") {
    return getLink(link.path);
  }
  return link.url.toString();
}
</script>
