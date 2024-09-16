export function getDuesNote(dues_raw: number): string {
  if (dues_raw > 0) {
    return "Not fully paid yet!";
  } else if (dues_raw < 0) {
    return "Too much paid!";
  } else {
    return "";
  }
}
