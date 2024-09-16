export function deepCopy<Type>(data: Type): Type {
  return JSON.parse(JSON.stringify(data));
}
