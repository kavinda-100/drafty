"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Upload } from "lucide-react";
import { importDocument } from "@/app/documents/actions";
import { Button } from "@/components/ui/button";
import { readTextFile, validateTextFile } from "@/lib/text-import";

export function ImportDocument() {
  const input = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setError("");
    const validationError = validateTextFile(file);
    if (validationError) { setError(validationError); return; }
    setLoading(true);
    try {
      try {
        await readTextFile(file);
      } catch (error) {
        setError(error instanceof TypeError ? "The file could not be read as UTF-8 text." : error instanceof Error ? error.message : "The file could not be read.");
        return;
      }
      const formData = new FormData();
      formData.set("file", file);
      const result = await importDocument(formData);
      if (result.error || !result.id) { setError(result.error ?? "The document could not be imported."); return; }
      router.push(`/documents/${result.id}?imported=1`);
    } catch {
      setError("The document could not be imported. Please try again.");
    } finally { setLoading(false); }
  }

  return <div className="flex flex-col gap-1">
    <input ref={input} type="file" accept=".txt,text/plain" className="sr-only" tabIndex={-1} onChange={handleFile} aria-label="Select a text file to import" />
    <Button type="button" variant="outline" disabled={loading} onClick={() => input.current?.click()}><Upload data-icon="inline-start" />{loading ? "Importing…" : "Import Document"}</Button>
    <p className="text-xs text-muted-foreground">UTF-8 .txt only, up to 1 MB</p>
    {error && <p role="alert" className="max-w-64 text-xs text-destructive">{error}</p>}
  </div>;
}
