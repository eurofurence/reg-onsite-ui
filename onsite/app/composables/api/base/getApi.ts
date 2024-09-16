import { getUrl } from "@/composables/api/base/getUrl";
import { smartFetch } from "@/composables/api/base/smartFetch";

export async function getApi(api: string): Promise<Response> {
  return smartFetch(getUrl(api), {
    method: "GET",
    credentials: "include",
  });
}
