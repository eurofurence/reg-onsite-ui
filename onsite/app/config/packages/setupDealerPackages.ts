import type { LabeledValue } from "@/types/internal";

const enum DealerTableApi {
  dt0p5x1 = "dealer-half",
  dt1p0x1 = "dealer-full",
  dt1p5x1 = "dealer-fullplus",
  dt2p0x1 = "dealer-double",
  dt2p0x2 = "dealer-quad",
}

const enum DealerTable {
  none = "",
  dt0p5x1 = DealerTableApi.dt0p5x1,
  dt1p0x1 = DealerTableApi.dt1p0x1,
  dt1p5x1 = DealerTableApi.dt1p5x1,
  dt2p0x1 = DealerTableApi.dt2p0x1,
  dt2p0x2 = DealerTableApi.dt2p0x2,
}

export type DealerTableApiValue = `${DealerTableApi}`;
export type DealerTableValue = `${DealerTable}`;

export const setupDealerPackagesPlaceholder: LabeledValue<DealerTableValue> = {
  value: DealerTable.none,
  label: "No Dealer",
};

export const setupDealerPackages: LabeledValue<DealerTableValue>[] = [
  setupDealerPackagesPlaceholder,
  {
    value: DealerTable.dt0p5x1,
    label: "DD 0.5",
  },
  {
    value: DealerTable.dt0p5x1,
    label: "DD 1",
  },
  {
    value: DealerTable.dt1p5x1,
    label: "DD 1.5",
  },
  {
    value: DealerTable.dt2p0x1,
    label: "DD 2",
  },
  {
    value: DealerTable.dt2p0x2,
    label: "DD 2x2",
  },
];
