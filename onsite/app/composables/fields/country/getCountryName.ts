import { convertListToMap } from "@/composables/collection_tools/convertListToMap";
import { lookupInMap } from "@/composables/collection_tools/lookupInMap";
import { type CountryCode, setupCountries } from "@/config/setupCountries";

const countryCodeToNameMap: Map<CountryCode, string> = convertListToMap(
  setupCountries,
  "label"
);

export function getCountryName(country_code: CountryCode): string {
  return lookupInMap(countryCodeToNameMap, country_code, country_code);
}
