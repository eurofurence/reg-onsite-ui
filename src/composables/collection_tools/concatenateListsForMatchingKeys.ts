import { getRecordEntries } from "@/composables/collection_tools/getRecordEntries";

export function concatenateListsForMatchingKeys<InputType, ReturnType>(
  keysToMatch: InputType[],
  dictionary: Record<string, ReturnType[]>
): ReturnType[] {
  const concatenatedLists: ReturnType[] = [];
  for (const [matchKey, matchValue] of getRecordEntries(dictionary)) {
    if (matchKey.startsWith("!")) {
      if (!keysToMatch.includes(matchKey.slice(1) as InputType)) {
        concatenatedLists.push(...matchValue);
      }
    } else {
      if (keysToMatch.includes(matchKey as InputType)) {
        concatenatedLists.push(...matchValue);
      }
    }
  }
  return concatenatedLists;
}
