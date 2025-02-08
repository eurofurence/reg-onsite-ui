const colorCache: Map<string, string> = new Map<string, string>();

export function getColorFromStyle(color: string): string {
  let result: undefined | string = colorCache.get(color);
  if (result === undefined) {
    const documentStyle: CSSStyleDeclaration = getComputedStyle(document.body);
    result = documentStyle.getPropertyValue(`--p-${color}`);
    colorCache.set(color, result);
  }
  return result;
}
