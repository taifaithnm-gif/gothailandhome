import type { Metadata } from "next";
import { notFound } from "next/navigation";
import path from "node:path";

import {
  isGothReviewConsoleEnabled,
  loadReviewConsoleBundle,
} from "@/lib/review-console";

import { ReviewConsoleClient } from "./review-console-client";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export const metadata: Metadata = {
  title: "Goth Batch Review Console (local)",
  robots: {
    index: false,
    follow: false,
    googleBot: { index: false, follow: false },
  },
};

type PageProps = {
  params: Promise<{ batchId: string }>;
};

export default async function GothReviewConsolePage({ params }: PageProps) {
  if (!isGothReviewConsoleEnabled()) {
    notFound();
  }

  const { batchId } = await params;
  const repoRoot = process.cwd();

  let bundle;
  try {
    bundle = loadReviewConsoleBundle(repoRoot, batchId);
  } catch {
    notFound();
  }

  // Never pass absolute paths to the client
  const safeBundle = JSON.parse(
    JSON.stringify(bundle)
      .replaceAll(path.resolve(repoRoot), ".")
      .replace(/\/Users\/[^"]+/g, "[redacted]")
      .replace(/\/Volumes\/[^"]+/g, "[redacted]"),
  );

  return (
    <main className="min-h-screen bg-[#0f1419] text-[#e8eef4]">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <header className="mb-8 border-b border-white/10 pb-6">
          <p className="text-xs uppercase tracking-[0.2em] text-amber-300/80">
            Local dry-run · read-only
          </p>
          <h1 className="mt-2 font-serif text-3xl tracking-tight text-white">
            Goth Batch Human Review Console
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-white/70">
            Batch <code className="text-amber-200">{batchId}</code> — no
            database writes, no storage uploads, no approve/publish actions.
          </p>
        </header>
        <ReviewConsoleClient batchId={batchId} bundle={safeBundle} />
      </div>
    </main>
  );
}
