export function convertListToMap(list) {
    const map = {};
    list.forEach((item) => {
        map[item.value] = item;
    });
    return map;
}
