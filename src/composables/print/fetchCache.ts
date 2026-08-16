export type FetchCache<T> = Map<string, T | null>

export function createFetchCache<T>(): FetchCache<T> {
  return new Map()
}

export async function fetchCached<T>(
  key: string,
  cache: FetchCache<T>,
  fetchValue: (key: string) => Promise<T | null>,
): Promise<T | null> {
  if (cache.has(key)) {
    return cache.get(key) ?? null
  }
  const value = await fetchValue(key)
  cache.set(key, value)
  return value
}
