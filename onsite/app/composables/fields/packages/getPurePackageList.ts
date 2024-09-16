import type { PackageApiValue, PackageCountType } from "@/types/external";

export function getPurePackageList(
  data: PackageCountType<PackageApiValue>[] | null
): PackageApiValue[] | null {
  if (data === null) {
    return null;
  }
  return data.map((value: PackageCountType<PackageApiValue>) => value.name);
}
