import type { MetadataRecord } from "@/composables/collection_tools/metadata/getMetadataEntryFromRecord";
import {
  GoodiesLevel,
  type GoodiesLevelValue,
  packageContributor,
  packageSponsor,
  packageSuperSponsor,
  packageTemplateRegular,
  packageTShirt,
} from "@/config/metadata/packages/metadataForPerks";
import type { PackageInfo } from "@/types/internal/infos";

export const metadataRecordForGoodiesLevels: MetadataRecord<
  PackageInfo<GoodiesLevelValue>
> = {
  [GoodiesLevel.no_sponsor]: {
    ...packageTemplateRegular,
    ...{ search: { packages: { contributor: 0, sponsor: 0, sponsor2: 0 } } },
  },
  [GoodiesLevel.contributor]: packageContributor,
  [GoodiesLevel.tshirt]: packageTShirt,
  [GoodiesLevel.sponsor]: packageSponsor,
  [GoodiesLevel.super_sponsor]: packageSuperSponsor,
};
