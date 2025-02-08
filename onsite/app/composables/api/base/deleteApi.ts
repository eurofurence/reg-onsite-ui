import { getUrl } from "@/composables/api/base/getUrl";
import { smartFetch } from "@/composables/api/base/smartFetch";

export async function deleteApi(api: string): Promise<Response> {
  return smartFetch(getUrl(api), {
    method: "DELETE",
    credentials: "include",
  });
}
