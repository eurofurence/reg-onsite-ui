import { getUrl } from "@/composables/api/base/getUrl";
import { smartFetch } from "@/composables/api/base/smartFetch";

export async function putApi(api: string, data: any): Promise<Response> {
  return smartFetch(getUrl(api), {
    method: "PUT",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}
