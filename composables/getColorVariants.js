export function getColorVariants(colorString, offset = 100) {
    const colorInfo = colorString.split("-");
    const color = colorInfo[0];
    const colorValue = parseInt(colorInfo[1]);
    const mainColor = `--${color}-${colorValue}`;
    const altColor = `--${color}-${colorValue - offset}`;
    return [mainColor, altColor];
}
