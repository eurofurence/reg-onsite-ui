export function getFirstElementFromList<Type>(
  data: Type[] | null,
  emptyValue: Type
): Type | null {
  if (data === null) {
    return null;
  }
  if (data.length === 0 || data[0] === undefined) {
    return emptyValue;
  }
  return data[0];
}
