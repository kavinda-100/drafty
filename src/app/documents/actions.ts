"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma/client";

async function userId() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new Error("Unauthorized");
  return session.user.id;
}

export async function createDocument() {
  const ownerId = await userId();
  const document = await prisma.document.create({
    data: { ownerId, title: "Untitled document", content: { type: "doc", content: [{ type: "paragraph" }] } },
    select: { id: true },
  });
  revalidatePath("/");
  redirect(`/documents/${document.id}`);
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
  if (typeof content !== "string" || content.length > 900_000) throw new Error("Document is too large to save.");
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
