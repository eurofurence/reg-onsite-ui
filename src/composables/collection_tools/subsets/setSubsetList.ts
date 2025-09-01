export function setSubsetList<TypeSubset extends TypeSuperset, TypeSuperset>(
  new_value: TypeSubset[],
  data: TypeSuperset[],
  subset: TypeSubset[]
): TypeSuperset[] {
  // List of entries that are not captured by the possible subset
  const invertedList: TypeSuperset[] = data.filter(
    (value: TypeSuperset) => !(subset as TypeSuperset[]).includes(value)
  );
  return invertedList.concat(new_value);
}
