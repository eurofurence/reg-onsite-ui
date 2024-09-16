export function getPropertyFromCollection<Type>(
  inputData: Type[],
  key: keyof Type
): Type[keyof Type][] {
  const valueList: Type[keyof Type][] = inputData.map(
    (item: Type) => item[key]
  );
  return valueList;
}
