import {
  type GoodiesLevelValue,
  packageSponsor,
  packageSuperSponsor,
  packageTShirt,
  packageTemplateRegular,
} from "@/config/packages/setupPackages";
import type { PackageInfo } from "@/types/internal";

export const setupGoodiesLevels: PackageInfo<GoodiesLevelValue>[] = [
  {
    ...packageTemplateRegular,
    ...{ search: { packages: { tshirt: 0, sponsor: 0, sponsor2: 0 } } },
  },
  packageTShirt,
  packageSponsor,
  packageSuperSponsor,
];
