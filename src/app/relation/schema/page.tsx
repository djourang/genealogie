// src/app/relation/schema/page.tsx
"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import RelationPivotDiagram from "@/components/RelationPivotDiagram";
import { getPersonById } from "@/lib/genealogie";

export default function Page() {
  const sp = useSearchParams();

  // ✅ accepte ancien (a/b) ou nouveau (aId/bId)
  const aId = (sp.get("aId") ?? sp.get("a") ?? "").trim();
  const bId = (sp.get("bId") ?? sp.get("b") ?? "").trim();

  const pa = aId ? getPersonById(aId) : null;
  const pb = bId ? getPersonById(bId) : null;

  return (
    <main className="p-6 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Schéma du lien de parenté</h1>
        <Link href="/relation" className="underline">
          ← Retour
        </Link>
      </div>

      {!pa || !pb ? (
        <div className="text-red-600">
          Deux personnes valides sont requises (a/b ou aId/bId).
        </div>
      ) : (
        // ✅ Important: pas de card, pas de Container, pas de padding autour du diagramme
        <div className="w-full overflow-auto">
          <RelationPivotDiagram aId={pa.id} bId={pb.id} />
        </div>
      )}
    </main>
  );
}
