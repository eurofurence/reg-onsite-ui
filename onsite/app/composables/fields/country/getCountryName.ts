import { convertListToMap } from "@/composables/collection_tools/convertListToMap";
import { lookupInMap } from "@/composables/collection_tools/lookupInMap";
import {
  type CountryCode,
  metadataListForCountry,
} from "@/config/metadata/metadataForCountry";

const countryCodeToNameMap: Map<CountryCode, string> = convertListToMap(
  metadataListForCountry,
  "label"
);

export function getCountryName(country_code: CountryCode): string {
  return lookupInMap(countryCodeToNameMap, country_code, country_code);
}
