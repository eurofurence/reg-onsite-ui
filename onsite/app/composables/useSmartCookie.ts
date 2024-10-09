import type { CookieRef } from "#app";
import { deepCopy } from "@/composables/deepCopy";

interface CookieInterface<Type> {
  hash: number;
  data: Type;
}

function hash(s: string): number {
  return s.split("").reduce(function (hash, c) {
    return ((hash << 5) - hash + c.charCodeAt(0)) | 0;
  }, 0);
}

function decodeCookie<Type>(value: string, defaultValue: Type): Type {
  const tmp: CookieInterface<Type> = JSON.parse(decodeURIComponent(value));
  if (tmp?.hash !== hash(JSON.stringify(defaultValue))) {
    return deepCopy(defaultValue);
  }
  return tmp.data;
}

function encodeCookie<Type>(value: Type, defaultValue: Type): string {
  const defaultHash: number = hash(JSON.stringify(defaultValue));
  const tmp: CookieInterface<Type> = {
    hash: defaultHash,
    data: value,
  };
  return encodeURIComponent(JSON.stringify(tmp));
}

export function useSmartCookie<Type>(
  name: string,
  defaultValue: Type
): CookieRef<Type> {
  return useCookie<Type>(name, {
    default: () => defaultValue,
    encode: (value: Type): string => encodeCookie(value, defaultValue),
    decode: (value: string): Type => decodeCookie(value, defaultValue),
    maxAge: 60 * 60 * 24 * 30,
  });
}
