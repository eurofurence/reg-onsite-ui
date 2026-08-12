export const FROM_SIZE_VARIANT_VALUE = "from_size";
export const FROM_SIZE_SUFFIX = `_${FROM_SIZE_VARIANT_VALUE}`;

export function isFromSizeItem(item: string): boolean {
  return item.endsWith(FROM_SIZE_SUFFIX);
}

export function resolveFromSizeItem(
  item: string,
  tshirtSize: string | null | undefined
): string | null {
  if (!isFromSizeItem(item) || !tshirtSize) return null;
  return item.slice(0, -FROM_SIZE_SUFFIX.length) + "_" + tshirtSize;
}
