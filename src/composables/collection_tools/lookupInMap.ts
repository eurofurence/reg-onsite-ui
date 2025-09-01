export function lookupInMap<MapKeyType, MapValueType>(
  mapping: Map<MapKeyType, MapValueType>,
  key: MapKeyType,
  defaultValue: MapValueType
): any {
  const lookupValue: any = mapping.get(key);
  return lookupValue !== undefined ? lookupValue : defaultValue;
}
