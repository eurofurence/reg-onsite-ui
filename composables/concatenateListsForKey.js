export function concatenateListsForKey(keysToMatch, dictionary) {
    const concatenatedLists = [];
    for (const [matchKey, matchValue] of Object.entries(dictionary)) {
        if (matchKey.startsWith("!")) {
            if (!keysToMatch?.includes(matchKey.slice(1))) {
                concatenatedLists.push(...matchValue);
            }
        } else {
            if (keysToMatch?.includes(matchKey)) {
                concatenatedLists.push(...matchValue);
            }
        }
    }
    return concatenatedLists;
}
