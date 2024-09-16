export function getDuesFlag(dues_raw: number): string {
  if (dues_raw > 0) {
    return "pi pi-exclamation-triangle";
  } else if (dues_raw < 0) {
    return "pi pi-money-bill";
  } else {
    return "";
  }
}
