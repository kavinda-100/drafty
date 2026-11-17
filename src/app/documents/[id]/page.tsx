import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import { DocumentEditor } from "@/components/documents/document-editor";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default function DocumentPage({ params }: { params: Promise<{ id: string }> }) {
  return <Suspense fallback={<p className="px-6 py-10">Loading document…</p>}><DocumentLoader params={params} /></Suspense>;
}

async function DocumentLoader({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");
  const { id } = await params;
  const document = await prisma.document.findFirst({ where: { id, ownerId: session.user.id } });
  if (!document) notFound();
  return <DocumentEditor id={document.id} initialTitle={document.title} initialContent={JSON.stringify(document.content)} />;
}
