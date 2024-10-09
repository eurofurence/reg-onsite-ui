export function getSubsetList<TypeSubset extends TypeSuperset, TypeSuperset>(
  data: TypeSuperset[] | null,
  subset: TypeSubset[]
): TypeSubset[] | null {
  if (data === null) {
    return null;
  }
  const subsetAsSuperset: TypeSuperset[] = subset;
  return data.filter((value: TypeSuperset) =>
    subsetAsSuperset.includes(value)
  ) as TypeSubset[];
}
