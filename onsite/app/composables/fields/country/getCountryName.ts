import { type CountryCode } from "@/config/metadata/metadataForCountry";
import { getConventionSetup } from "@/composables/logic/getConventionSetup";

export function getCountryName(country_code: CountryCode): string {
  return (
    getConventionSetup().metadata.forCountry.record[country_code]?.label ||
    country_code
  );
}
