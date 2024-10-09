import { sortByLabel } from "@/composables/collection_tools/sortByLabel";
import type { LabeledValue } from "@/types/internal/infos";
import type { Branded } from "@/composables/brand";
import { getMetadataList } from "@/composables/collection_tools/getMetadataList";
import type { MetadataRecord } from "@/composables/collection_tools/getMetadataEntry";

export type LanguageCode = Branded<string, "LanguageCode">;

export const metadataRecordForLanguage: MetadataRecord<
  LabeledValue<LanguageCode>
> = {
  ["ady" as LanguageCode]: { label: "Adyghe" },
  ["af" as LanguageCode]: { label: "Afrikaans" },
  ["ak" as LanguageCode]: { label: "Akan" },
  ["ar" as LanguageCode]: { label: "Arabic" },
  ["az" as LanguageCode]: { label: "Azerbaijani" },
  ["bg" as LanguageCode]: { label: "Bulgarian" },
  ["bn" as LanguageCode]: { label: "Bengali" },
  ["br" as LanguageCode]: { label: "Breton" },
  ["ca" as LanguageCode]: { label: "Catalan" },
  ["cak" as LanguageCode]: { label: "Kaqchikel" },
  ["cs" as LanguageCode]: { label: "Czech" },
  ["cy" as LanguageCode]: { label: "Welsh" },
  ["da" as LanguageCode]: { label: "Danish" },
  ["de" as LanguageCode]: { label: "German" },
  ["dsb" as LanguageCode]: { label: "Lower Sorbian" },
  ["el" as LanguageCode]: { label: "Greek" },
  ["en" as LanguageCode]: { label: "English" },
  ["eo" as LanguageCode]: { label: "Esperanto" },
  ["es" as LanguageCode]: { label: "Spanish" },
  ["et" as LanguageCode]: { label: "Estonian" },
  ["eu" as LanguageCode]: { label: "Basque" },
  ["fa" as LanguageCode]: { label: "Persian" },
  ["ff" as LanguageCode]: { label: "Fulah" },
  ["fi" as LanguageCode]: { label: "Finnish" },
  ["fil" as LanguageCode]: { label: "Filipino" },
  ["fo" as LanguageCode]: { label: "Faroese" },
  ["fr" as LanguageCode]: { label: "French" },
  ["ga" as LanguageCode]: { label: "Irish" },
  ["gd" as LanguageCode]: { label: "Gaelic" },
  ["gl" as LanguageCode]: { label: "Galician" },
  ["gv" as LanguageCode]: { label: "Manx" },
  ["he" as LanguageCode]: { label: "Hebrew" },
  ["hi" as LanguageCode]: { label: "Hindi" },
  ["hr" as LanguageCode]: { label: "Croatian" },
  ["hsb" as LanguageCode]: { label: "Upper Sorbian" },
  ["ht" as LanguageCode]: { label: "Haitian Creole" },
  ["hu" as LanguageCode]: { label: "Hungarian" },
  ["hy" as LanguageCode]: { label: "Armenian" },
  ["id" as LanguageCode]: { label: "Indonesian" },
  ["is" as LanguageCode]: { label: "Icelandic" },
  ["it" as LanguageCode]: { label: "Italian" },
  ["ja" as LanguageCode]: { label: "Japanese" },
  ["kab" as LanguageCode]: { label: "Kabyle" },
  ["kl" as LanguageCode]: { label: "Greenlandic" },
  ["km" as LanguageCode]: { label: "Khmer" },
  ["kn" as LanguageCode]: { label: "Kannada" },
  ["ko" as LanguageCode]: { label: "Korean" },
  ["kw" as LanguageCode]: { label: "Cornish" },
  ["la" as LanguageCode]: { label: "Latin" },
  ["lb" as LanguageCode]: { label: "Luxembourgish" },
  ["lt" as LanguageCode]: { label: "Lithuanian" },
  ["lv" as LanguageCode]: { label: "Latvian" },
  ["mai" as LanguageCode]: { label: "Maithili" },
  ["mk" as LanguageCode]: { label: "Macedonian" },
  ["ml" as LanguageCode]: { label: "Malayalam" },
  ["mr" as LanguageCode]: { label: "Marathi" },
  ["ms" as LanguageCode]: { label: "Malay" },
  ["mt" as LanguageCode]: { label: "Maltese" },
  ["my" as LanguageCode]: { label: "Burmese" },
  ["nb" as LanguageCode]: { label: "Norwegian (bokmal)" },
  ["ne" as LanguageCode]: { label: "Nepali" },
  ["nl" as LanguageCode]: { label: "Dutch" },
  ["no" as LanguageCode]: { label: "Norwegian" },
  ["oc" as LanguageCode]: { label: "Occitan" },
  ["pa" as LanguageCode]: { label: "Punjabi" },
  ["pl" as LanguageCode]: { label: "Polish" },
  ["pt" as LanguageCode]: { label: "Portuguese" },
  ["ro" as LanguageCode]: { label: "Romanian" },
  ["ru" as LanguageCode]: { label: "Russian" },
  ["sh" as LanguageCode]: { label: "Serbo-Croatian" },
  ["sk" as LanguageCode]: { label: "Slovak" },
  ["sl" as LanguageCode]: { label: "Slovenian" },
  ["sq" as LanguageCode]: { label: "Albanian" },
  ["sr" as LanguageCode]: { label: "Serbian" },
  ["su" as LanguageCode]: { label: "Sundanese" },
  ["sv" as LanguageCode]: { label: "Swedish" },
  ["sw" as LanguageCode]: { label: "Swahili" },
  ["ta" as LanguageCode]: { label: "Tamil" },
  ["te" as LanguageCode]: { label: "Telugu" },
  ["tg" as LanguageCode]: { label: "Tajik" },
  ["th" as LanguageCode]: { label: "Thai" },
  ["tl" as LanguageCode]: { label: "Tagalog" },
  ["tlh" as LanguageCode]: { label: "Klingon" },
  ["tr" as LanguageCode]: { label: "Turkish" },
  ["uk" as LanguageCode]: { label: "Ukrainian" },
  ["ur" as LanguageCode]: { label: "Urdu" },
  ["uz" as LanguageCode]: { label: "Uzbek" },
  ["vi" as LanguageCode]: { label: "Vietnamese" },
  ["yi" as LanguageCode]: { label: "Yiddish" },
  ["zh" as LanguageCode]: { label: "Chinese" },
};

export const metadataListForLanguage: LabeledValue<LanguageCode>[] =
  sortByLabel<LanguageCode>(getMetadataList(metadataRecordForLanguage));