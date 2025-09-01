import { getConventionSetup } from "@/composables/logic/getConventionSetup";
import { type CountryCode } from "@/config/metadata/metadataForCountry";

export function getCountryName(country_code: CountryCode): string {
  return (
    getConventionSetup().metadata.forCountry.record[country_code]?.label ||
    country_code
  );
}
