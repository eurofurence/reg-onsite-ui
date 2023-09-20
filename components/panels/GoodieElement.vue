<template>
  <Fieldset :legend="`${descriptions.header} ${attendeeShippingInfo.nickname} (#${attendeeShippingInfo.id})`">
    <div class="flex flex-column gap-2">
      <div class="w-27rem">
        {{ descriptions.please_update }}
      </div>
      <div class="flex flex-rows align-items-center gap-1">
        <label :class="labelClass" for="first_name">{{ descriptions.first_name }}</label>
        <InputText :class="inputClass" id="first_name" v-model="attendeeShippingInfo.first_name" />
      </div>
      <div class="flex flex-rows align-items-center gap-1">
        <label :class="labelClass" for="last_name">{{ descriptions.last_name }}</label>
        <InputText :class="inputClass" id="last_name" v-model="attendeeShippingInfo.last_name" />
      </div>
      <div class="flex flex-rows align-items-center gap-1">
        <label :class="labelClass" for="street">{{ descriptions.street }}</label>
        <InputText :class="inputClass" id="street" v-model="attendeeShippingInfo.street" />
      </div>
      <div class="flex flex-rows align-items-center gap-1">
        <label :class="labelClass" for="zip">{{ descriptions.zip }}</label>
        <InputText :class="inputClass" id="zip" v-model="attendeeShippingInfo.zip" />
      </div>
      <div class="flex flex-rows align-items-center gap-1">
        <label :class="labelClass" for="city">{{ descriptions.city }}</label>
        <InputText :class="inputClass" id="city" v-model="attendeeShippingInfo.city" />
      </div>
      <div class="flex flex-rows align-items-center gap-1">
        <label :class="labelClass" for="country">{{ descriptions.country }}</label>
        <Dropdown id="tshirt_size" :class="inputClass" v-model="attendeeShippingInfo.country"
          :options="configCountryItems" optionValue="value" optionLabel="label" placeholder="" v-bind="$attrs">
          <template #value="slotProps">
            <div class="flex flex-rows gap-2">
              <span :class="getFlagCSSClass(slotProps.value)"></span>
              <span>{{ getCountryName(slotProps.value) }}</span>
            </div>
          </template>
          <template #option="slotProps">
            <div class="flex flex-rows gap-2">
              <span :class="getFlagCSSClass(slotProps.option.value)"></span>
              <span>{{ getCountryName(slotProps.option.value) }}</span>
            </div>
          </template>
        </Dropdown>
      </div>
      <div class="flex flex-rows align-items-center gap-1">
        <label :class="labelClass" for="state">{{ descriptions.state }}</label>
        <InputText :class="inputClass" id="state" v-model="attendeeShippingInfo.state" />
      </div>
      <div class="flex flex-rows align-items-center gap-1">
        <label :class="labelClass" for="tshirt_size">{{ descriptions.tshirt_size }}</label>
        <Dropdown id="tshirt_size" :class="inputClass" v-model="attendeeShippingInfo.tshirt_size"
          :options="configTShirtSizes" optionValue="value" optionLabel="label" placeholder="" v-bind="$attrs" />
      </div>
      <div class="flex flex-rows align-items-center gap-1">
        <label :class="labelClass" for="tshirt_shape">{{ descriptions.tshirt_shape }}</label>
        <SelectButton id="tshirt_shape" v-model="attendeeShippingInfo.tshirt_shape" :options="['Regular', 'Contoured']"
          :unselectable="true">
          <template #option="slotProps">
            <div class="flex flex-column">
              {{ slotProps.option }}
              <div class="flex align-items-center justify-content-center" style="width: 7.4rem; height: 7.4rem;">
                <img :src="`${config.public.CDN_BASE}${slotProps.option.toLowerCase()}.svg`" class="w-6rem h-6rem" />
              </div>
            </div>
          </template>
        </SelectButton>
      </div>

      <div class="flex flex-rows align-items-center gap-1">
        <label :class="labelClass" for="comments">{{ descriptions.comments }}</label>
        <InputText :class="inputClass" id="comments" v-model="attendeeShippingInfo.comments" />
      </div>
      <div class="flex flex-rows gap-1">
        <Checkbox v-model="saveEnabled" :binary="true" />
        <div class="w-20rem">
          {{ descriptions.gdrp_consent }}
        </div>
      </div>
      <Button :disabled="!saveEnabled" label="Save" @click="doSave" />
    </div>
  </Fieldset>
</template>

<script setup>
import { ref } from 'vue';
import { getApi, postApi } from "@/composables/restApi";
import { configCountryItems } from "@/composables/fields/useCountry";
import { getFlagCSSClass, getCountryName } from "@/composables/fields/useCountry";
import { configTShirtItems } from "@/ef.config";
import { useToast } from "primevue/usetoast";

import Fieldset from 'primevue/fieldset';
import InputText from "primevue/inputtext";
import Dropdown from "primevue/dropdown";
import Button from "primevue/button";
import SelectButton from 'primevue/selectbutton';
import Checkbox from 'primevue/checkbox';

// eslint-disable-next-line no-undef
const config = useRuntimeConfig();

const saveEnabled = ref(false);
const toast = useToast();

const labelClass = "w-7rem"
const inputClass = "w-20rem"

const configTShirtSizes = [
  {
    value: "XS",
    label: "X-Small",
  },
  {
    value: "S",
    label: "Small",
  },
  {
    value: "M",
    label: "Medium",
  },
  {
    value: "L",
    label: "Large",
  },
  {
    value: "XL",
    label: "X-Large",
  },
  {
    value: "XXL",
    label: "XX-Large",
  },
  {
    value: "3XL",
    label: "3X-Large",
  },
  {
    value: "4XL",
    label: "4X-Large",
  },
];

async function apiGetAttendeeBaseInfo(regId) {
  const response = await getApi(`attsrv/api/rest/v1/attendees/${regId}`);
  const data = await response.json();
  return { response, data };
}

async function apiGetAttendeeShippingInfo(regId) {
  const response = await getApi(`attsrv/api/rest/v1/attendees/${regId}/additional-info/shipping`);
  const data = await response.json();
  return { response, data };
}

async function apiPostAttendeeShippingInfo(regId, content) {
  const response = await postApi(`attsrv/api/rest/v1/attendees/${regId}/additional-info/shipping`, content);
  const data = await response.body.getReader().read();
  return { response, data };
}

const descriptions_i18n = {
  'en-US': {
    header: 'Shipping Details for',
    please_update: 'Please update the fields below to receive the missing items:',
    gdrp_consent: 'I confirm that personal information can be forwarded to DHL for shipping purposes',
    first_name: 'First Name',
    last_name: 'Last Name',
    street: 'Street',
    zip: 'Zip Code',
    city: 'City',
    country: 'Country',
    state: 'State',
    comments: 'Comments',
    tshirt_size: 'T-Shirt Size',
    tshirt_shape: 'T-Shirt Shape',
    stored_ok: 'Shipping information successfully stored!',
    stored_failed: 'Error while storing shipping information!',
  },
  'de-DE': {
    header: 'Versanddetails für',
    please_update: 'Bitte aktualisieren sie die folgenden Felder für den Nachversand der fehlenden Gegenstände:',
    gdrp_consent: 'Ich bestätige hiermit, dass persönlichen Informationen für den Versand an DHL weitergegeben werden dürfen.',
    first_name: 'Vorname',
    last_name: 'Nachname',
    street: 'Straße',
    zip: 'Postleitzahl',
    city: 'Stadt',
    country: 'Land',
    state: 'Bundesland',
    comments: 'Kommentare',
    tshirt_size: 'T-Shirt Größe',
    tshirt_shape: 'T-Shirt Form',
    stored_ok: 'Versandinformationen gespeichert!',
    stored_failed: 'Fehler beim speichern der Versandinformationen!',
  },
}
const descriptions = ref(descriptions_i18n['en-US']);

const emptyShippignInfo = {
  id: '',
  nickname: '',
  first_name: '',
  last_name: '',
  street: '',
  zip: '',
  city: '',
  country: 'DE',
  state: '',
  comments: '',
  tshirt_size: 'M',
  tshirt_shape: 'Regular',
}

async function initShippingFields() {
  const attendeeBaseInfo = await apiGetAttendeeBaseInfo(props.reg);
  descriptions.value = descriptions_i18n[attendeeBaseInfo.data.registration_language];
  const attendeeShippingInfoStored = await apiGetAttendeeShippingInfo(props.reg);
  if (attendeeShippingInfoStored.response.ok) {
    attendeeShippingInfo.value = attendeeShippingInfoStored.data;
  } else {
    const keyList = ['id', 'nickname', 'first_name', 'last_name', 'street', 'zip', 'city', 'country', 'state'];
    keyList.forEach((key) => attendeeShippingInfo.value[key] = attendeeBaseInfo.data[key]);
    const tshirtItems = configTShirtItems.filter((item) => item.value === attendeeBaseInfo.data.tshirt_size);
    if (tshirtItems.length === 1) {
      attendeeShippingInfo.value.tshirt_size = tshirtItems[0]?.size;
      attendeeShippingInfo.value.tshirt_shape = tshirtItems[0]?.shape;
    }
  }
}

const props = defineProps(["reg"]);
const attendeeShippingInfo = ref(emptyShippignInfo);
await initShippingFields(props.reg)

async function doSave() {
  const result = await apiPostAttendeeShippingInfo(props.reg, attendeeShippingInfo.value);
  if (result.response.ok) {
    toast.add({
      group: "global",
      severity: "success",
      summary: descriptions.value.stored_ok,
      life: 10000,
    });
    saveEnabled.value = false;
  } else {
    toast.add({
      group: "global",
      severity: "error",
      summary: descriptions.value.stored_failed,
      life: 10000,
    });
  }
}
</script>
