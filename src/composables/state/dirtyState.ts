import { reactive, type Reactive } from "vue";

export const dirtyState: Reactive<{ [key: string]: any }> = reactive({});
