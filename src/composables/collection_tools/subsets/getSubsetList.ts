export function getSubsetList<TypeSubset extends TypeSuperset, TypeSuperset>(
  data: TypeSuperset[] | null,
  subset: TypeSubset[]
): TypeSubset[] | null {
  if (data === null) {
    return null;
  }
  const subsetAsSuperset: Set<TypeSuperset> = new Set(subset);
  return data.filter((value: TypeSuperset) =>
    subsetAsSuperset.has(value)
  ) as TypeSubset[];
}
