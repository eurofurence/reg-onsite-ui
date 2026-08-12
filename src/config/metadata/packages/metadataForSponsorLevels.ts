import type { MetadataRecord } from "@/composables/collection_tools/metadata/getMetadataEntryFromRecord";
import {
  packageContributor,
  packageSponsor,
  packageSuperSponsor,
  packageTemplateRegular,
  SponsorLevel,
  type SponsorLevelValue,
} from "@/config/metadata/packages/metadataForPerks";
import type { PackageInfo } from "@/types/internal/infos";

export const metadataRecordForSponsorLevels: MetadataRecord<
  PackageInfo<SponsorLevelValue>
> = {
  [SponsorLevel.no_sponsor]: {
    ...packageTemplateRegular,
    ...{ search: { packages: { contributor: 0, sponsor: 0, sponsor2: 0 } } },
  },
  [SponsorLevel.contributor]: packageContributor,
  [SponsorLevel.sponsor]: packageSponsor,
  [SponsorLevel.super_sponsor]: packageSuperSponsor,
};
