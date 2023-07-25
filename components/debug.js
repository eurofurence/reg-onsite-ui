import { reactive } from "vue";
import { globalState } from "@/components/global";

export const debugState = reactive({ globalState: globalState });
