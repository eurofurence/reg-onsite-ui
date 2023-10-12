<template>
  <Message severity="warn" v-if="attendeeMissingItems.length === 0">{{ descriptions.nothing_missing }}</Message>
  <Fieldset :legend="`${descriptions.header} ${attendeeShippingInfo.nickname} (#${attendeeShippingInfo.id})`"
    v-if="attendeeMissingItems.length > 0">
    <div class="flex flex-column gap-2">
      <div>
        {{ descriptions.please_update }}
      </div>
      <div class="flex flex-wrap gap-2">
        <div class="flex flex-rows align-items-center gap-1">
          <label :class="labelClass" for="first_name">{{ descriptions.first_name }}</label>
          <InputText :class="inputClass" id="first_name" v-model="attendeeShippingInfo.first_name" />
        </div>
        <div class="flex flex-rows align-items-center gap-1">
          <label :class="labelClass" for="last_name">{{ descriptions.last_name }}</label>
          <InputText :class="inputClass" id="last_name" v-model="attendeeShippingInfo.last_name" />
        </div>
      </div>
      <div class="flex flex-wrap gap-2">
        <div class="flex flex-rows align-items-center gap-1">
          <label :class="labelClass" for="street">{{ descriptions.street }}</label>
          <InputText :class="inputClass" id="street" v-model="attendeeShippingInfo.street" />
        </div>
      </div>
      <div class="flex flex-wrap gap-2">
        <div class="flex flex-rows align-items-center gap-1">
          <label :class="labelClass" for="zip">{{ descriptions.zip }}</label>
          <InputText :class="inputClass" id="zip" v-model="attendeeShippingInfo.zip" />
        </div>
        <div class="flex flex-rows align-items-center gap-1">
          <label :class="labelClass" for="city">{{ descriptions.city }}</label>
          <InputText :class="inputClass" id="city" v-model="attendeeShippingInfo.city" />
        </div>
      </div>
      <div class="flex flex-wrap gap-2">
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
      </div>

      <div class="flex flex-rows align-items-center gap-1">
        <label :class="labelClass" for="comments">{{ descriptions.comments }}</label>
        <InputText class="w-20rem" id="comments" v-model="attendeeShippingInfo.comments"
          :placeholder="descriptions.comments_placeholder" />
      </div>

      <div class="flex flex-wrap gap-2 align-items-top" v-if="attendeeMissingItems.includes('tshirt')">
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
      </div>

      <div class="flex flex-wrap gap-3" style="max-width: 55rem;" v-if="attendeeMissingItems.includes('cup')">
        {{ descriptions.shipping_cup }}
        <div class="flex align-items-center">
          <RadioButton v-model="attendeeShippingInfo.shipping_cup" inputId="shipping_cup_postal" name="shipping_cup"
            value="postal" />
          <label for="shipping_cup_postal" class="ml-2">{{ descriptions.shipping_cup_postal }}</label>
        </div>
        <div class="flex align-items-center">
          <RadioButton v-model="attendeeShippingInfo.shipping_cup" inputId="shipping_cup_ef" name="shipping_cup"
            value="ef" />
          <label for="shipping_cup_ef" class="ml-2">{{ descriptions.shipping_cup_ef }}</label>
        </div>
      </div>

      <div class="flex flex-wrap gap-3" style="max-width: 55rem;">
        {{ descriptions.shipping_email }}
        <div class="flex flex-wrap align-items-center gap-2">
          <div class="flex align-items-center">
            <RadioButton v-model="attendeeShippingInfo.shipping_email" inputId="shipping_email_status"
              name="shipping_email" value="status" />
            <label for="shipping_email_status" class="ml-2">{{ descriptions.shipping_email_status }}</label>
          </div>
          <div class="flex flex-rows align-items-center gap-5 pl-1">
            <label class="w-5rem font-bold text-right" for="email">{{ descriptions.email }}</label>
            <InputText :disabled="attendeeShippingInfo.shipping_email !== 'status'" :class="inputClass" id="email"
              v-model="attendeeShippingInfo.email" />
          </div>
        </div>
        <div class="flex align-items-center">
          <RadioButton v-model="attendeeShippingInfo.shipping_email" inputId="shipping_email_none" name="shipping_email"
            value="none" />
          <label for="shipping_email_none" class="ml-2">{{ descriptions.shipping_email_none }}</label>
        </div>
      </div>

      <Button :disabled="JSON.stringify(oldAttendeeShippingInfo) === JSON.stringify(attendeeShippingInfo)" label="Save"
        @click="doSave" />
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
import { configFlagsToItemsMap, configPackageToItemsMap } from "@/ef.config";
import { concatenateListsForKey } from "@/composables/concatenateListsForKey";

import Message from 'primevue/message';
import Fieldset from 'primevue/fieldset';
import InputText from "primevue/inputtext";
import Dropdown from "primevue/dropdown";
import Button from "primevue/button";
import SelectButton from 'primevue/selectbutton';
import RadioButton from 'primevue/radiobutton';

// eslint-disable-next-line no-undef
const config = useRuntimeConfig();

const toast = useToast();

const labelClass = "font-bold w-7rem"
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

async function apiGetAttendeeItems(regId) {
  const response = await getApi(`attsrv/api/rest/v1/attendees/${regId}/additional-info/sponsordesk`);
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
    first_name: 'First Name',
    last_name: 'Last Name',
    street: 'Street',
    zip: 'Zip Code',
    city: 'City',
    email: 'Email',
    country: 'Country',
    state: 'State',
    comments: 'Comments',
    tshirt_size: 'T-Shirt Size',
    tshirt_shape: 'T-Shirt Shape',
    stored_ok: 'Shipping information successfully stored!',
    stored_failed: 'Error while storing shipping information!',
    shipping_cup: 'According to our data, you still lack the EF27 mug. Mugs are unfortunately a very delicate item to transport, and there is always a certain risk that the mug may get damaged during shipping. Therefore, we give you the option to receive the mug now by mail or at EF28.',
    shipping_cup_postal: 'I would like to receive the mug by mail',
    shipping_cup_ef: 'I will pick up the mug at EF28 myself',
    shipping_email: 'If desired, we can send you status updates for your package. To do so, we will provide your email address to Deutsche Post DHL once for shippign. By providing an email address here, you are simultaneously granting us permission for disclosure in accordance with Art. 6 (1) GDPR.',
    shipping_email_status: 'I would like to receive status updates and grant permission for the disclosure of my address',
    shipping_email_none: 'I do not want to receive status updates.',
    comments_placeholder: 'e.g. merging of orders.',
    nothing_missing: 'You are not missing any items according to our data!'
  },
  'de-DE': {
    header: 'Versanddetails für',
    please_update: 'Bitte aktualisiere die folgenden Felder für den Nachversand der fehlenden Gegenstände:',
    first_name: 'Vorname',
    last_name: 'Nachname',
    street: 'Straße',
    zip: 'Postleitzahl',
    city: 'Stadt',
    email: 'E-Mail',
    country: 'Land',
    state: 'Bundesland',
    comments: 'Anmerkungen',
    tshirt_size: 'T-Shirt Größe',
    tshirt_shape: 'T-Shirt Form',
    stored_ok: 'Versandinformationen gespeichert!',
    stored_failed: 'Fehler beim speichern der Versandinformationen!',
    shipping_cup: 'Laut unseren Daten fehlt dir noch die EF27-Tasse. Tassen sind leider ein sehr schwieriges Transportgut und es besteht immer ein gewisses Risiko, dass die Tasse auf dem Versandweg beschädigt wird. Wir geben dir daher die Wahl, ob du die Tasse jetzt per Post oder auf EF28 erhalten willst.',
    shipping_cup_postal: 'Ich möchte die Tasse auf dem Postweg erhalten',
    shipping_cup_ef: 'Ich hole die Tasse auf EF28 selber ab',
    shipping_email: 'Wenn gewünscht, können wir dir Statusnachrichten zu deinem Paket übermitteln. Dazu geben wir deine E-Mail-Adresse einmalig an Deutsche Post DHL weiter. Wenn du hier eine E-Mail-Adresse angibst, erteilst du uns damit gleichzeitig die Erlaubnis zur Weitergabe gemäß Art. 6 (1) DSGVO.',
    shipping_email_status: 'Ich möchte Statusnachrichten erhalten und erteile die Erlaubnis zur Adressweitergabe',
    shipping_email_none: 'Ich möchte keine Statusnachrichten erhalten',
    comments_placeholder: 'z.B. Zusammenlegung von Bestellungen',
    nothing_missing: 'Laut unseren Informationen fehlen dir keine Goodies.'
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
  email: '',
  country: 'DE',
  state: '',
  comments: '',
  tshirt_size: 'M',
  tshirt_shape: 'Regular',
  shipping_cup: 'postal',
  shipping_email: 'none',
}

async function initShippingFields() {
  const attendeeBaseInfo = await apiGetAttendeeBaseInfo(props.reg);
  descriptions.value = descriptions_i18n[attendeeBaseInfo.data.registration_language];
  const attendeeShippingInfoStored = await apiGetAttendeeShippingInfo(props.reg);
  const attendeeItemInfoStored = await apiGetAttendeeItems(props.reg);
  if (attendeeShippingInfoStored.response.ok) {
    attendeeShippingInfo.value = attendeeShippingInfoStored.data;
    oldAttendeeShippingInfo.value = JSON.parse(JSON.stringify(attendeeShippingInfo.value));
  } else {
    const keyList = ['id', 'nickname', 'first_name', 'last_name', 'email', 'street', 'zip', 'city', 'country', 'state'];
    keyList.forEach((key) => attendeeShippingInfo.value[key] = attendeeBaseInfo.data[key]);
    const tshirtItems = configTShirtItems.filter((item) => item.value === attendeeBaseInfo.data.tshirt_size);
    if (tshirtItems.length === 1) {
      attendeeShippingInfo.value.tshirt_size = tshirtItems[0]?.size;
      attendeeShippingInfo.value.tshirt_shape = tshirtItems[0]?.shape;
    }
  }
  const itemsForFlags = concatenateListsForKey(attendeeBaseInfo.data.flags.split(",").sort(), configFlagsToItemsMap);
  const itemsForPackages = concatenateListsForKey(attendeeBaseInfo.data.packages.split(",").sort(), configPackageToItemsMap);
  const owedItems = [...new Set([...itemsForFlags, ...itemsForPackages])];
  var issuedItems = [];
  if (attendeeItemInfoStored.response.ok) {
    issuedItems = attendeeItemInfoStored.data.issuedItems;
  }
  attendeeMissingItems.value = owedItems.filter(item => !issuedItems.includes(item));
}

const props = defineProps(["reg"]);
const attendeeMissingItems = ref([]);
const attendeeShippingInfo = ref(emptyShippignInfo);
const oldAttendeeShippingInfo = ref(JSON.parse(JSON.stringify(emptyShippignInfo)));
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
    oldAttendeeShippingInfo.value = JSON.parse(JSON.stringify(attendeeShippingInfo.value));
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
