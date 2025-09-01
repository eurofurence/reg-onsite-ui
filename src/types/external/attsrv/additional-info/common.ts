import type { RegNumber } from "@/types/external/attsrv/attendees/attendee";

export interface ApiAllAddInfoRaw {
  area: string;
  values: Record<string, string>;
}

export interface ApiAllAddInfo<AddInfoType> {
  area: string;
  infos: Map<RegNumber, AddInfoType>;
}
