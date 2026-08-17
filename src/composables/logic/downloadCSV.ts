const UTF8_BOM = "\uFEFF";

export function downloadCSV(csvContent: string, filename: string) {
  const blob = new Blob([UTF8_BOM + csvContent], {
    type: "text/csv;charset=utf-8;",
  });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
