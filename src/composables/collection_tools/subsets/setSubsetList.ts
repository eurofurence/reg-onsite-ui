export function setSubsetList<TypeSubset extends TypeSuperset, TypeSuperset>(
  new_value: TypeSubset[],
  data: TypeSuperset[],
  subset: TypeSubset[]
): TypeSuperset[] {
  const subsetAsSuperset: Set<TypeSuperset> = new Set(subset);
  // List of entries that are not captured by the possible subset
  const invertedList: TypeSuperset[] = data.filter(
    (value: TypeSuperset) => !subsetAsSuperset.has(value)
  );
  return invertedList.concat(new_value);
}
