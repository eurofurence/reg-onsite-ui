import type { MetadataRecord } from "@/composables/collection_tools/metadata/getMetadataEntryFromRecord";
import {
  GoodiesLevel,
  type GoodiesLevelValue,
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
    ...{ search: { packages: { sponsor: 0, sponsor2: 0 } } },
  },
  [GoodiesLevel.tshirt]: packageTShirt,
  [GoodiesLevel.sponsor]: packageSponsor,
  [GoodiesLevel.super_sponsor]: packageSuperSponsor,
};
