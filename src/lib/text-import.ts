export const MAX_TEXT_FILE_BYTES = 1024 * 1024;
// A file consisting mostly of line breaks expands substantially as Tiptap JSON.
export const MAX_DOCUMENT_JSON_LENGTH = 32 * 1024 * 1024;

export function validateTextFile(file: File): string | null {
  if (!/\.txt$/i.test(file.name)) return "Choose a .txt file.";
  const title = file.name.slice(0, -4).trim();
  if (!title || title.length > 200) return "The filename must contain 1–200 characters before .txt.";
  if (file.size === 0) return "The file is empty.";
  if (file.size > MAX_TEXT_FILE_BYTES) return "The file must be 1 MB or smaller.";
  return null;
}

export async function readTextFile(file: File): Promise<string> {
  const text = new TextDecoder("utf-8", { fatal: true }).decode(await file.arrayBuffer());
  if (!text.trim()) throw new Error("The file is empty.");
  // PostgreSQL text and JSONB cannot store null characters.
  if (text.includes("\0")) throw new Error("The file contains unsupported null characters.");
  return text;
}

export function textToDocument(text: string) {
  return {
    type: "doc" as const,
    content: text.replace(/\r\n?/g, "\n").split("\n").map((line) => ({
      type: "paragraph" as const,
      ...(line ? { content: [{ type: "text" as const, text: line }] } : {}),
    })),
  };
}
