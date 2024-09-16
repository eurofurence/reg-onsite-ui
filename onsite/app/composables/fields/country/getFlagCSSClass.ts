import type { CountryCode } from "@/config/setupCountries";

export function getFlagCSSClass(country_code: CountryCode): string {
  return `fi fi-${country_code.toLowerCase()}`;
}
