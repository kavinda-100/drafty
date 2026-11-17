import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import { DocumentEditor } from "@/components/documents/document-editor";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default function DocumentPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ imported?: string }> }) {
  return <Suspense fallback={<p className="px-6 py-10">Loading document…</p>}><DocumentLoader params={params} searchParams={searchParams} /></Suspense>;
}

async function DocumentLoader({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ imported?: string }> }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");
  const { id } = await params;
  const document = await prisma.document.findFirst({ where: { id, ownerId: session.user.id } });
  if (!document) notFound();
  const imported = (await searchParams).imported === "1";
  return <>{imported && <p role="status" className="mx-auto w-full max-w-4xl px-6 pt-4 text-sm text-muted-foreground">Document imported successfully.</p>}<DocumentEditor id={document.id} initialTitle={document.title} initialContent={JSON.stringify(document.content)} /></>;
}
