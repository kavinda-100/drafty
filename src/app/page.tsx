import Link from "next/link";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { FileText, Plus } from "lucide-react";
import { ImportDocument } from "@/components/documents/import-document";
import { LogoutButton } from "@/components/auth/logout-button";
import { Button } from "@/components/ui/button";
import { createDocument } from "@/app/documents/actions";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default function Home() {
  return <Suspense fallback={<p className="px-6 py-10">Loading your documents…</p>}><Dashboard /></Suspense>;
}

async function Dashboard() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/login");
  const documents = await prisma.document.findMany({
    where: { ownerId: session.user.id },
    select: { id: true, title: true, updatedAt: true },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="min-h-screen">
      <header className="border-b"><div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6"><span className="text-lg font-semibold tracking-tight">Drafty</span><LogoutButton /></div></header>
      <main className="mx-auto max-w-4xl px-6 py-12">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div><p className="text-sm text-muted-foreground">Your workspace</p><h1 className="mt-1 text-3xl font-semibold tracking-tight">Documents</h1><p className="mt-2 text-sm text-muted-foreground">A place for your ideas, {session.user.name}.</p></div>
          <div className="flex flex-wrap items-start gap-2"><ImportDocument /><form action={createDocument}><Button type="submit"><Plus data-icon="inline-start" />New document</Button></form></div>
        </div>
        <div className="mt-10 border-t">
          {documents.length === 0 ? <p className="py-10 text-sm text-muted-foreground">No documents yet. Create one to start writing.</p> : (
            <ul>{documents.map((document) => <li key={document.id} className="border-b"><Link href={`/documents/${document.id}`} className="flex items-center gap-4 rounded-md py-5 outline-none hover:bg-muted/50 focus-visible:ring-2 focus-visible:ring-ring"><FileText className="size-5 shrink-0 text-muted-foreground" aria-hidden="true" /><span className="min-w-0 flex-1 truncate font-medium">{document.title}</span><time className="shrink-0 text-xs text-muted-foreground" dateTime={document.updatedAt.toISOString()}>{new Intl.DateTimeFormat("en", { dateStyle: "medium", timeZone: "UTC" }).format(document.updatedAt)}</time></Link></li>)}</ul>
          )}
        </div>
      </main>
    </div>
  );
}
