"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";
import { MAX_DOCUMENT_JSON_LENGTH, readTextFile, textToDocument, validateTextFile } from "@/lib/text-import";

async function userId() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Unauthorized");
  return session.user.id;
}

async function createOwnedDocument(ownerId: string, title: string, content: Prisma.InputJsonValue) {
  const document = await prisma.document.create({ data: { ownerId, title, content }, select: { id: true } });
  revalidatePath("/");
  return document;
}

export async function createDocument() {
  const ownerId = await userId();
  const document = await createOwnedDocument(ownerId, "Untitled document", { type: "doc", content: [{ type: "paragraph" }] });
  redirect(`/documents/${document.id}`);
}

export async function importDocument(formData: FormData): Promise<{ id?: string; error?: string }> {
  const ownerId = await userId();
  const file = formData.get("file");
  if (!(file instanceof File)) return { error: "Choose a .txt file." };
  const error = validateTextFile(file);
  if (error) return { error };
  let text: string;
  try {
    text = await readTextFile(file);
  } catch (error) {
    return { error: error instanceof TypeError ? "The file could not be read as UTF-8 text." : error instanceof Error ? error.message : "The file could not be read." };
  }
  try {
    const document = await createOwnedDocument(ownerId, file.name.slice(0, -4).trim(), textToDocument(text));
    return { id: document.id };
  } catch {
    return { error: "The document could not be imported. Please try again." };
  }
}

export async function renameDocument(id: string, title: string) {
  const ownerId = await userId();
  const trimmed = typeof title === "string" ? title.trim() : "";
  if (!trimmed || trimmed.length > 200) throw new Error("Title must be between 1 and 200 characters.");
  const result = await prisma.document.updateMany({ where: { id, ownerId }, data: { title: trimmed } });
  if (!result.count) throw new Error("Document not found");
  revalidatePath("/");
  return trimmed;
}

export async function saveDocument(id: string, content: string) {
  const ownerId = await userId();
  if (typeof content !== "string" || content.length > MAX_DOCUMENT_JSON_LENGTH) throw new Error("Document is too large to save.");
  const parsed: unknown = JSON.parse(content);
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed) || !("type" in parsed) || parsed.type !== "doc") {
    throw new Error("Invalid document content.");
  }
  const result = await prisma.document.updateMany({
    where: { id, ownerId },
    data: { content: parsed as Prisma.InputJsonValue },
  });
  if (!result.count) throw new Error("Document not found");
}
