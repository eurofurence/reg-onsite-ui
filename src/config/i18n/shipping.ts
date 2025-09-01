export interface ShippingI18N {
  header: string;
  please_update: string;
  first_name: string;
  last_name: string;
  street: string;
  zip: string;
  city: string;
  email: string;
  country: string;
  state: string;
  comments: string;
  tshirt_size: string;
  tshirt_shape: string;
  stored_ok: string;
  stored_failed: string;
  shipping_cup: string;
  shipping_cup_postal: string;
  shipping_cup_ef: string;
  shipping_email: string;
  shipping_email_status: string;
  shipping_email_none: string;
  comments_placeholder: string;
  nothing_missing: string;
}

type I18NMap = Map<string, ShippingI18N>;

function getShippingI18NMap(): I18NMap {
  const i18nMap: I18NMap = new Map<string, ShippingI18N>();
  i18nMap.set("en-US", {
    header: "Shipping Details for",
    please_update:
      "Please update the fields below to receive the missing items:",
    first_name: "First Name",
    last_name: "Last Name",
    street: "Street",
    zip: "Zip Code",
    city: "City",
    email: "Email",
    country: "Country",
    state: "State",
    comments: "Comments",
    tshirt_size: "T-Shirt Size",
    tshirt_shape: "T-Shirt Shape",
    stored_ok: "Shipping information successfully stored!",
    stored_failed: "Error while storing shipping information!",
    shipping_cup:
      "According to our data, you still lack the EF27 mug. Mugs are unfortunately a very delicate item to transport, and there is always a certain risk that the mug may get damaged during shipping. Therefore, we give you the option to receive the mug now by mail or at EF28.",
    shipping_cup_postal: "I would like to receive the mug by mail",
    shipping_cup_ef: "I will pick up the mug at EF28 myself",
    shipping_email:
      "If desired, we can send you status updates for your package. To do so, we will provide your email address to Deutsche Post DHL once for shippign. By providing an email address here, you are simultaneously granting us permission for disclosure in accordance with Art. 6 (1) GDPR.",
    shipping_email_status:
      "I would like to receive status updates and grant permission for the disclosure of my address",
    shipping_email_none: "I do not want to receive status updates.",
    comments_placeholder: "e.g. merging of orders.",
    nothing_missing: "You are not missing any items according to our data!",
  });
  i18nMap.set("de-DE", {
    header: "Versanddetails für",
    please_update:
      "Bitte aktualisiere die folgenden Felder für den Nachversand der fehlenden Gegenstände:",
    first_name: "Vorname",
    last_name: "Nachname",
    street: "Straße",
    zip: "Postleitzahl",
    city: "Stadt",
    email: "E-Mail",
    country: "Land",
    state: "Bundesland",
    comments: "Anmerkungen",
    tshirt_size: "T-Shirt Größe",
    tshirt_shape: "T-Shirt Form",
    stored_ok: "Versandinformationen gespeichert!",
    stored_failed: "Fehler beim speichern der Versandinformationen!",
    shipping_cup:
      "Laut unseren Daten fehlt dir noch die EF27-Tasse. Tassen sind leider ein sehr schwieriges Transportgut und es besteht immer ein gewisses Risiko, dass die Tasse auf dem Versandweg beschädigt wird. Wir geben dir daher die Wahl, ob du die Tasse jetzt per Post oder auf EF28 erhalten willst.",
    shipping_cup_postal: "Ich möchte die Tasse auf dem Postweg erhalten",
    shipping_cup_ef: "Ich hole die Tasse auf EF28 selber ab",
    shipping_email:
      "Wenn gewünscht, können wir dir Statusnachrichten zu deinem Paket übermitteln. Dazu geben wir deine E-Mail-Adresse einmalig an Deutsche Post DHL weiter. Wenn du hier eine E-Mail-Adresse angibst, erteilst du uns damit gleichzeitig die Erlaubnis zur Weitergabe gemäß Art. 6 (1) DSGVO.",
    shipping_email_status:
      "Ich möchte Statusnachrichten erhalten und erteile die Erlaubnis zur Adressweitergabe",
    shipping_email_none: "Ich möchte keine Statusnachrichten erhalten",
    comments_placeholder: "z.B. Zusammenlegung von Bestellungen",
    nothing_missing: "Laut unseren Informationen fehlen dir keine Goodies.",
  });
  return i18nMap;
}

export function getShippingI18N(locale: string | null): ShippingI18N {
  const i18nMap: I18NMap = getShippingI18NMap();
  const defaultLocaleTemp: ShippingI18N | undefined = i18nMap.get("en-US");
  if (!defaultLocaleTemp) {
    throw new Error("Default locale is missing!");
  }
  const defaultLocale: ShippingI18N = <ShippingI18N>defaultLocaleTemp;
  if (locale === locale) {
    return defaultLocale;
  }
  return i18nMap.get(locale as string) || defaultLocale;
}
