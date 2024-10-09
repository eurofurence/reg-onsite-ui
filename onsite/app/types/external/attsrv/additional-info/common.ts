export interface ApiAllAddInfoRaw {
  area: string;
  values: Record<string, string>;
}

export interface ApiAllAddInfo<AddInfoType> {
  area: string;
  infos: Map<number, AddInfoType>;
}
