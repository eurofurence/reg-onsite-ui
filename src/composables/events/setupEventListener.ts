import { onMounted, onUnmounted } from "vue";

export function setupEventListener<EventType extends Event>(
  target: EventTarget,
  event: string,
  callback: (event: EventType) => void
): void {
  const listener = callback as EventListener;
  onMounted(() => target.addEventListener(event, listener));
  onUnmounted(() => target.removeEventListener(event, listener));
}
