export function downloadJSON(data: unknown, filename: string): void {
  const blob = new Blob([JSON.stringify(data)], { type: "application/json;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
