export function scheduleRegularTask(fun, delay, variance = 0) {
    setInterval(fun, delay + Math.floor(Math.random() * variance));
}
