import type { ColumnDefinition } from "@/types/internal";

var resetMap: Map<string, () => void> = new Map<string, () => void>();

function getId(
  filterId: string | undefined,
  columnDefinition: ColumnDefinition | null
): string {
  // TODO: Handle multiple undefinied
  return `${filterId || "undef"}-${columnDefinition?.fieldName || "undef"}`;
}

function onMounted(
  filterId: string | undefined,
  columnDefinition: ColumnDefinition | null,
  resetCallback: () => void
) {
  return () => {
    resetMap.set(getId(filterId, columnDefinition), resetCallback);
  };
}

function onBeforeUnmount(
  filterId: string | undefined,
  columnDefinition: ColumnDefinition | null
) {
  return () => {
    resetMap.delete(getId(filterId, columnDefinition));
  };
}

function callAllResets(): void {
  for (let [_resetKey, resetCallback] of resetMap) {
    resetCallback();
  }
  return;
}

interface FilterComponentRegistry {
  onMounted: typeof onMounted;
  onBeforeUnmount: typeof onBeforeUnmount;
  callAllResets: typeof callAllResets;
}

export const filterComponentRegistry: FilterComponentRegistry = {
  onMounted: onMounted,
  onBeforeUnmount: onBeforeUnmount,
  callAllResets: callAllResets,
};
