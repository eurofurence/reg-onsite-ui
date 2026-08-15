import { getRecordEntries } from "@/composables/collection_tools/getRecordEntries";

export function concatenateListsForMatchingKeys<InputType, ReturnType>(
  keysToMatch: InputType[],
  dictionary: Record<string, ReturnType[]>
): ReturnType[] {
  const concatenatedLists: ReturnType[] = [];
  for (const [matchKey, matchValue] of getRecordEntries(dictionary)) {
    if (matchKey.startsWith("!")) {
      const negatedKey = matchKey.slice(1);
      if (negatedKey.startsWith("!")) {
        throw new Error(`Double-negated key is not supported: "${matchKey}"`);
      }
      if (!keysToMatch.includes(negatedKey as InputType)) {
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
