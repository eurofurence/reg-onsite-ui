import { onMounted, onUnmounted } from "vue";

export function setupEventListener(
  target: any,
  event: string,
  callback: CallableFunction
): void {
  onMounted(() => target.addEventListener(event, callback));
  onUnmounted(() => target.removeEventListener(event, callback));
}
