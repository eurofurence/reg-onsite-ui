import type { CountryCode } from "@/config/metadata/metadataForCountry";

export function getFlagCSSClass(country_code: CountryCode): string {
  return `fi fi-${country_code.toLowerCase()}`;
}
