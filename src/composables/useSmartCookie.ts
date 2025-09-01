import type { Branded } from "@/composables/brand";
import { deepCopy } from "@/composables/deepCopy";
import { ref, watch, type Ref } from "vue";

type HashValue = Branded<number, "HashValue">;

interface CookieInterface<Type> {
  hash: HashValue;
  data: Type;
}

function hash(s: string): HashValue {
  return s
    .split("")
    .reduce(
      (hash, c) => ((hash << 5) - hash + c.charCodeAt(0)) | 0,
      0
    ) as HashValue;
}

function decodeCookie<Type>(value: string, defaultValue: Type): Type {
  try {
    const tmp: CookieInterface<Type> = JSON.parse(decodeURIComponent(value));
    if (tmp?.hash !== hash(JSON.stringify(defaultValue))) {
      return deepCopy(defaultValue);
    }
    return tmp.data;
  } catch {
    return deepCopy(defaultValue);
  }
}

function encodeCookie<Type>(value: Type, defaultValue: Type): string {
  const defaultHash: HashValue = hash(JSON.stringify(defaultValue));
  const tmp: CookieInterface<Type> = {
    hash: defaultHash,
    data: value,
  };
  return encodeURIComponent(JSON.stringify(tmp));
}

const smartCookieStore = new Map<string, Ref<any>>();

export function useSmartCookie<Type>(
  name: string,
  defaultValue: Type
): Ref<Type> {
  if (smartCookieStore.has(name))
    return smartCookieStore.get(name) as Ref<Type>;

  const cookieValue = document.cookie
    .split("; ")
    .find((entry) => entry.startsWith(name + "="))
    ?.split("=")[1];

  const storedRef: Ref<Type> = ref<Type>(
    cookieValue
      ? decodeCookie(cookieValue, defaultValue)
      : deepCopy(defaultValue)
  ) as Ref<Type>;

  watch(
    storedRef,
    (value: Type) => {
      document.cookie = `${name}=${encodeCookie(
        value,
        defaultValue
      )}; path=/; SameSite=Lax;`;
    },
    { deep: true }
  );

  smartCookieStore.set(name, storedRef);
  return storedRef;
}
