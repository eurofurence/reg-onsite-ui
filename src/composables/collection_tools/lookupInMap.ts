export function lookupInMap<MapKeyType, MapValueType>(
  mapping: Map<MapKeyType, MapValueType>,
  key: MapKeyType,
  defaultValue: MapValueType
): MapValueType {
  const lookupValue: MapValueType | undefined = mapping.get(key);
  return lookupValue !== undefined ? lookupValue : defaultValue;
}
