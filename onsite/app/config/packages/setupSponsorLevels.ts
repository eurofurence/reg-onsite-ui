import {
  type GoodiesLevelValue,
  packageSponsor,
  packageSuperSponsor,
  packageTemplateRegular,
} from "@/config/packages/setupPackages";
import type { PackageInfo } from "@/types/internal";

export const setupSponsorLevels: PackageInfo<GoodiesLevelValue>[] = [
  {
    ...packageTemplateRegular,
    ...{ search: { packages: { sponsor: 0, sponsor2: 0 } } },
  },
  packageSponsor,
  packageSuperSponsor,
];
