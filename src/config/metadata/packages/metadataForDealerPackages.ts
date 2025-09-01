import type { MetadataRecord } from "@/composables/collection_tools/metadata/getMetadataEntryFromRecord";
import type { LabeledValue } from "@/types/internal/infos";
import { NoPackage } from "@/types/internal/missing";

const enum DealerTableApi {
  dt0p5x1 = "dealer-half",
  dt1p0x1 = "dealer-full",
  dt1p5x1 = "dealer-fullplus",
  dt2p0x1 = "dealer-double",
  dt2p0x2 = "dealer-quad",
}

export const enum DealerTable {
  none = NoPackage.no_package,
  dt0p5x1 = DealerTableApi.dt0p5x1,
  dt1p0x1 = DealerTableApi.dt1p0x1,
  dt1p5x1 = DealerTableApi.dt1p5x1,
  dt2p0x1 = DealerTableApi.dt2p0x1,
  dt2p0x2 = DealerTableApi.dt2p0x2,
}

export type DealerTableApiValue = `${DealerTableApi}`;
export type DealerTableValue = `${DealerTable}`;

export const metadataRecordForDealerPackages: MetadataRecord<
  LabeledValue<DealerTableValue>
> = {
  [DealerTable.none]: { label: "No Art Show Table" },
  [DealerTable.dt0p5x1]: { label: "DD 0.5" },
  [DealerTable.dt1p0x1]: { label: "DD 1.0" },
  [DealerTable.dt1p5x1]: { label: "DD 1.5" },
  [DealerTable.dt2p0x1]: { label: "DD 2.0" },
  [DealerTable.dt2p0x2]: { label: "DD 2x2" },
};
