import type { MailTemplate } from "@/types/internal/mails";

const templateVariablePattern = /\{\{\s*([\w.\-]+)\s*\}\}/g;

export function extractMailTemplateVariables(
  template: MailTemplate,
): string[] {
  const content: string = `${template.subject ?? ""}\n${template.text ?? ""}\n${template.html ?? ""}`;
  const names: string[] = [];
  const seen = new Set<string>();
  const pattern: RegExp = new RegExp(
    templateVariablePattern.source,
    templateVariablePattern.flags
  );
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(content)) !== null) {
    const name: string = match[1] ?? "";
    const normalized: string = name
      .trim()
      .toLowerCase()
      .replace(/[\s.]+/g, "_");
    if (normalized && !seen.has(normalized)) {
      seen.add(normalized);
      names.push(normalized);
    }
  }
  return names;
}