import {
  packageSponsor,
  packageSuperSponsor,
  packageTemplateRegular,
  SponsorLevel,
  type SponsorLevelValue,
} from "@/config/metadata/packages/metadataForPerks";
import type { PackageInfo } from "@/types/internal/infos";
import type { MetadataRecord } from "@/composables/collection_tools/getMetadataEntry";

export const metadataRecordForSponsorLevels: MetadataRecord<
  PackageInfo<SponsorLevelValue>
> = {
  [SponsorLevel.regular]: {
    ...packageTemplateRegular,
    ...{ search: { packages: { sponsor: 0, sponsor2: 0 } } },
  },
  [SponsorLevel.sponsor]: packageSponsor,
  [SponsorLevel.super_sponsor]: packageSuperSponsor,
};
