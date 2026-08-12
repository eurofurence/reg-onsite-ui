import { ColorsPalette } from "@/composables/theme/colors";
import type { PackageInfo, PackageTemplateInfo } from "@/types/internal/infos";
import { NoPackage } from "@/types/internal/missing";

export const enum GoodiesLevelApi {
  tshirt = "tshirt",
  contributor = "contributor",
  sponsor = "sponsor",
  super_sponsor = "sponsor2",
}

export type GoodiesLevelApiValue = `${GoodiesLevelApi}`;

export const enum GoodiesLevel {
  no_sponsor = NoPackage.no_package,
  contributor = GoodiesLevelApi.contributor,
  tshirt = GoodiesLevelApi.tshirt,
  sponsor = GoodiesLevelApi.sponsor,
  super_sponsor = GoodiesLevelApi.super_sponsor,
}

export type GoodiesLevelValue = `${GoodiesLevel}`;

export const enum SponsorLevel {
  no_sponsor = GoodiesLevel.no_sponsor,
  contributor = GoodiesLevelApi.contributor,
  sponsor = GoodiesLevelApi.sponsor,
  super_sponsor = GoodiesLevelApi.super_sponsor,
}

export type SponsorLevelValue = `${SponsorLevel}`;

export const packageTemplateRegular: PackageTemplateInfo<GoodiesLevelValue> = {
  value: GoodiesLevel.no_sponsor,
  label: "Regular",
  color: ColorsPalette.green_400,
  textColor: ColorsPalette.inverted_text,
  icon: "pi pi-ticket",
  // search must be defined as the inverse of other provided packages
};

export const packageTShirt: PackageInfo<GoodiesLevelValue> = {
  value: GoodiesLevel.tshirt,
  label: "T-Shirt",
  color: ColorsPalette.green_400,
  textColor: ColorsPalette.inverted_text,
  icon: "pi pi-user",
  search: { packages: { tshirt: 1 } },
};

export const packageContributor: PackageInfo<GoodiesLevelValue> = {
  value: GoodiesLevel.contributor,
  label: "Contributor",
  color: ColorsPalette.teal_300,
  textColor: ColorsPalette.inverted_text,
  icon: "pi pi-heart",
  search: { packages: { contributor: 1 } },
};

export const packageSponsor: PackageInfo<GoodiesLevelValue> = {
  value: GoodiesLevel.sponsor,
  label: "Sponsor",
  color: ColorsPalette.yellow_400,
  textColor: ColorsPalette.inverted_text,
  icon: "pi pi-angle-up",
  search: { packages: { sponsor: 1 } },
};

export const packageSuperSponsor: PackageInfo<GoodiesLevelValue> = {
  value: GoodiesLevel.super_sponsor,
  label: "Super-Sponsor",
  color: ColorsPalette.purple_400,
  textColor: ColorsPalette.inverted_text,
  icon: "pi pi-angle-double-up",
  search: { packages: { sponsor2: 1 } },
};
