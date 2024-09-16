export function getSubsetList<TypeSubset extends TypeSuperset, TypeSuperset>(
  data: TypeSuperset[] | null,
  subset: TypeSubset[]
): TypeSubset[] | null {
  if (data === null) {
    return null;
  }
  return <TypeSubset[]>(
    data.filter((value: TypeSuperset) =>
      (<TypeSuperset[]>subset).includes(value)
    )
  );
}
