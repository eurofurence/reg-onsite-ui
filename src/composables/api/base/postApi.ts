import { getUrl } from "@/composables/api/base/getUrl";
import { smartFetch } from "@/composables/api/base/smartFetch";

export async function postApi(api: string, data: any): Promise<Response> {
  return smartFetch(getUrl(api), {
    method: "POST",
    credentials: "include",
    body: JSON.stringify(data),
  });
}
