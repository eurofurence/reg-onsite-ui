export function getInputElement(elementId: string): HTMLInputElement {
    const inputElement: HTMLElement | null =
        document.getElementById(elementId);
    if (inputElement === null) {
        throw new Error(`Input element ${elementId} not found!`);
    }
    return <HTMLInputElement>inputElement;
}
