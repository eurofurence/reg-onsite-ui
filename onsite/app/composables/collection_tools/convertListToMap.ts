export function convertListToMap<ItemValueType, MapValueType>(
  inputList: { value: ItemValueType; [key: string]: any }[],
  lookup: string | null = null
): Map<ItemValueType, MapValueType> {
  const resultMap: Map<ItemValueType, MapValueType> = new Map<
    ItemValueType,
    MapValueType
  >();
  inputList.forEach((item: { value: ItemValueType; [key: string]: any }) => {
    if (lookup === null) {
      resultMap.set(item.value, item as MapValueType);
    } else {
      resultMap.set(item.value, item[lookup] as MapValueType);
    }
  });
  return resultMap;
}
