import { getMetadataList } from "@/composables/collection_tools/getMetadataList";
import { metadataRecordForConBookChoice } from "@/config/metadata/flags/metadataForConBookChoice";
import type { LabeledValue } from "@/types/internal/infos";
import type {
  ConventionSharedMetadata,
  MetadataEntry,
} from "@/types/internal/convention";
import type { MetadataRecord } from "@/composables/collection_tools/getMetadataEntry";
import { metadataRecordForArtShowPanels } from "@/config/metadata/packages/metadataForArtShowPanels";
import { metadataRecordForArtShowTables } from "@/config/metadata/packages/metadataForArtShowTables";
import { metadataRecordForAttendance } from "@/config/metadata/packages/metadataForAttendance";
import { metadataRecordForBoatLevel } from "@/config/metadata/packages/metadataForBoatLevel";
import { metadataRecordForCountry } from "@/config/metadata/metadataForCountry";
import { metadataRecordForDealerPackages } from "@/config/metadata/packages/metadataForDealerPackages";
import { metadataRecordForGoodiesLevels } from "@/config/metadata/packages/metadataForGoodiesLevels";
import { metadataRecordForLanguage } from "@/config/metadata/metadataForLanguage";
import { metadataRecordForSponsorLevels } from "@/config/metadata/packages/metadataForSponsorLevels";
import { metadataRecordForStatus } from "@/config/metadata/metadataForStatus";
import { metadataRecordForTicketType } from "@/config/metadata/packages/metadataForTicketType";
import { metadataRecordForTShirtShape } from "@/config/metadata/tshirt/metadataForTShirtShapes";
import { metadataRecordForTShirtSizes } from "@/config/metadata/tshirt/metadataForTShirtSizes";
import { metadataListForTShirtTypes } from "@/config/metadata/tshirt/metadataForTShirtTypes";
import { sortByLabel } from "@/composables/collection_tools/sortByLabel";

function entryFromRecord<
  Type extends LabeledValue<ValueType>,
  ValueType extends string = Type["value"]
>(record: MetadataRecord<Type>): MetadataEntry<Type> {
  return {
    record: record,
    list: getMetadataList<Type>(record),
  };
}

function entrySortedByLabelFromRecord<
  Type extends LabeledValue<ValueType>,
  ValueType extends string = Type["value"]
>(record: MetadataRecord<Type>): MetadataEntry<Type> {
  return {
    record: record,
    list: sortByLabel<Type, ValueType>(getMetadataList<Type>(record)),
  };
}

export const conventionSharedMetadata: ConventionSharedMetadata = {
  forArtShowPanels: entryFromRecord(metadataRecordForArtShowPanels),
  forArtShowTables: entryFromRecord(metadataRecordForArtShowTables),
  forAttendance: entryFromRecord(metadataRecordForAttendance),
  forBoatLevel: entryFromRecord(metadataRecordForBoatLevel),
  forConBook: entryFromRecord(metadataRecordForConBookChoice),
  forCountry: entrySortedByLabelFromRecord(metadataRecordForCountry),
  forDealerPackage: entryFromRecord(metadataRecordForDealerPackages),
  forGoodiesLevels: entryFromRecord(metadataRecordForGoodiesLevels),
  forLanguage: entrySortedByLabelFromRecord(metadataRecordForLanguage),
  forSponsorLevels: entryFromRecord(metadataRecordForSponsorLevels),
  forStatus: entryFromRecord(metadataRecordForStatus),
  forTicketType: entryFromRecord(metadataRecordForTicketType),
  forTShirtShapes: entryFromRecord(metadataRecordForTShirtShape),
  forTShirtSizes: entryFromRecord(metadataRecordForTShirtSizes),
  forTShirtTypes: { list: metadataListForTShirtTypes },
};
