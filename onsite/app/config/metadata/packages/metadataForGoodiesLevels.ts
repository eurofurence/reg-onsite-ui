import {
  GoodiesLevel,
  type GoodiesLevelValue,
  packageSponsor,
  packageSuperSponsor,
  packageTemplateRegular,
  packageTShirt,
} from "@/config/metadata/packages/metadataForPerks";
import type { PackageInfo } from "@/types/internal/infos";
import type { MetadataRecord } from "@/composables/collection_tools/getMetadataEntry";
import { getMetadataList } from "@/composables/collection_tools/getMetadataList";

export const metadataRecordForGoodiesLevels: MetadataRecord<
  PackageInfo<GoodiesLevelValue>
> = {
  [GoodiesLevel.regular]: {
    ...packageTemplateRegular,
    ...{ search: { packages: { sponsor: 0, sponsor2: 0 } } },
  },
  [GoodiesLevel.tshirt]: packageTShirt,
  [GoodiesLevel.sponsor]: packageSponsor,
  [GoodiesLevel.super_sponsor]: packageSuperSponsor,
};

export const metadataListForGoodiesLevels: PackageInfo<GoodiesLevelValue>[] =
  getMetadataList<PackageInfo<GoodiesLevelValue>>(
    metadataRecordForGoodiesLevels
  );
