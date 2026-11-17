"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { EditorContent, useEditor, useEditorState } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { ArrowLeft, Bold, Heading1, Heading2, Italic, List, ListOrdered, Underline } from "lucide-react";
import { renameDocument, saveDocument } from "@/app/documents/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type SaveState = "saved" | "saving" | "error";

export function DocumentEditor({ id, initialTitle, initialContent }: { id: string; initialTitle: string; initialContent: string }) {
  const [title, setTitle] = useState(initialTitle);
  const [savedTitle, setSavedTitle] = useState(initialTitle);
  const [titleError, setTitleError] = useState("");
  const [renaming, setRenaming] = useState(false);
  const [status, setStatus] = useState<SaveState>("saved");
  const latest = useRef(initialContent);
  const saved = useRef(initialContent);
  const inFlight = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mounted = useRef(true);
  const titleDirty = useRef(false);

  const flush = useCallback(async () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
    if (inFlight.current) return;
    if (latest.current === saved.current) {
      if (mounted.current) setStatus("saved");
      return;
    }
    inFlight.current = true;
    if (mounted.current) setStatus("saving");
    try {
      while (latest.current !== saved.current) {
        const content = latest.current;
        await saveDocument(id, content);
        saved.current = content;
      }
      inFlight.current = false;
      if (mounted.current) setStatus("saved");
    } catch {
      inFlight.current = false;
      if (mounted.current) setStatus("error");
    }
  }, [id]);

  const editor = useEditor({
    extensions: [StarterKit],
    content: JSON.parse(initialContent),
    immediatelyRender: false,
    editorProps: { attributes: { class: "document-content", "aria-label": "Document content" } },
    onUpdate: ({ editor }) => {
      latest.current = JSON.stringify(editor.getJSON());
      setStatus("saving");
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => void flush(), 800);
    },
  });
  const formatting = useEditorState({
    editor,
    selector: ({ editor }) => ({
      bold: editor?.isActive("bold") ?? false,
      italic: editor?.isActive("italic") ?? false,
      underline: editor?.isActive("underline") ?? false,
      h1: editor?.isActive("heading", { level: 1 }) ?? false,
      h2: editor?.isActive("heading", { level: 2 }) ?? false,
      bullet: editor?.isActive("bulletList") ?? false,
      ordered: editor?.isActive("orderedList") ?? false,
    }),
  });

  useEffect(() => {
    mounted.current = true;
    const warn = (event: BeforeUnloadEvent) => {
      if (latest.current !== saved.current || inFlight.current || titleDirty.current) event.preventDefault();
    };
    window.addEventListener("beforeunload", warn);
    return () => {
      mounted.current = false;
      window.removeEventListener("beforeunload", warn);
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  async function rename(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setRenaming(true);
    setTitleError("");
    try {
      const result = await renameDocument(id, title);
      setTitle(result);
      setSavedTitle(result);
      titleDirty.current = false;
    } catch {
      setTitleError("Could not rename this document. Enter a title of 1–200 characters and try again.");
    } finally { setRenaming(false); }
  }

  const controls = [
    { label: "Bold", icon: Bold, active: formatting?.bold, run: () => editor?.chain().focus().toggleBold().run() },
    { label: "Italic", icon: Italic, active: formatting?.italic, run: () => editor?.chain().focus().toggleItalic().run() },
    { label: "Underline", icon: Underline, active: formatting?.underline, run: () => editor?.chain().focus().toggleUnderline().run() },
    { label: "Heading 1", icon: Heading1, active: formatting?.h1, run: () => editor?.chain().focus().toggleHeading({ level: 1 }).run() },
    { label: "Heading 2", icon: Heading2, active: formatting?.h2, run: () => editor?.chain().focus().toggleHeading({ level: 2 }).run() },
    { label: "Bullet list", icon: List, active: formatting?.bullet, run: () => editor?.chain().focus().toggleBulletList().run() },
    { label: "Numbered list", icon: ListOrdered, active: formatting?.ordered, run: () => editor?.chain().focus().toggleOrderedList().run() },
  ];

  return <div className="min-h-screen">
    <header className="border-b"><div className="mx-auto flex min-h-16 max-w-5xl flex-wrap items-center justify-between gap-3 px-6 py-3">
      <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground" onClick={(event) => { if ((latest.current !== saved.current || inFlight.current || titleDirty.current) && !window.confirm("You have unsaved changes. Leave this document?")) event.preventDefault(); }}><ArrowLeft className="size-4" />Documents</Link>
      <div className="flex items-center gap-2 text-sm" role="status" aria-live="polite"><span className={status === "error" ? "text-destructive" : "text-muted-foreground"}>{status === "saved" ? "Saved" : status === "saving" ? "Saving…" : "Could not save"}</span>{status === "error" && <Button size="sm" variant="outline" onClick={() => void flush()}>Retry</Button>}</div>
    </div></header>
    <main className="mx-auto max-w-4xl px-6 py-10">
      <form onSubmit={rename} className="flex flex-wrap items-center gap-2">
        <label htmlFor="document-title" className="sr-only">Document title</label>
        <Input id="document-title" value={title} maxLength={200} disabled={renaming} onChange={(event) => { setTitle(event.target.value); titleDirty.current = event.target.value !== savedTitle; }} className="min-w-0 flex-1" />
        <Button type="submit" variant="outline" disabled={renaming || title === savedTitle}>{renaming ? "Renaming…" : "Rename"}</Button>
      </form>
      {titleError && <p role="alert" className="mt-2 text-sm text-destructive">{titleError}</p>}
      <div className="mt-8 rounded-xl border bg-card">
        <div className="flex flex-wrap gap-1 border-b p-2" role="toolbar" aria-label="Text formatting">{controls.map(({ label, icon: Icon, active, run }) => <Button key={label} type="button" size="icon" variant={active ? "secondary" : "ghost"} aria-label={label} aria-pressed={!!active} title={label} disabled={!editor} onClick={run}><Icon /></Button>)}</div>
        <EditorContent editor={editor} />
      </div>
    </main>
  </div>;
}
