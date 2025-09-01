export function getFirstFromList<Type>(
  data: Type[] | null
): Type | null {
  if (data === null || data.length === 0 || data[0] === undefined) {
    return null;
  }
  return data[0];
}
