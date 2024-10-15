const nuxtConfig = useRuntimeConfig();

export type AssetPath = Branded<string, "AssetPath">;
export type AssetURL = Branded<string, "AssetURL">;

export function getAsset(path: AssetPath): AssetURL {
  const baseUrl = nuxtConfig.app.baseURL;
  return `${baseUrl}/${path}` as AssetURL;
}
