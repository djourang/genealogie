// src/app/relation/schema/SchemaClient.tsx
"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { Card } from "@/components/ui/ui";
import { getPersonById, formatNomComplet } from "@/lib/genealogie";
import RelationPivotDiagram from "@/components/RelationPivotDiagram";

export default function SchemaClient() {
  const sp = useSearchParams();

  const aId = (sp.get("aId") ?? "").trim();
  const bId = (sp.get("bId") ?? "").trim();

  const personA = useMemo(() => (aId ? getPersonById(aId) : null), [aId]);
  const personB = useMemo(() => (bId ? getPersonById(bId) : null), [bId]);

  const labelA = personA ? formatNomComplet(personA) : aId || "—";
  const labelB = personB ? formatNomComplet(personB) : bId || "—";

  // 1) Paramètres manquants
  if (!aId || !bId) {
    return (
      <Card className="max-w-3xl mx-auto p-4">
        <div className="text-sm text-red-600">
          Deux personnes valides sont requises (paramètres <code>aId</code> et{" "}
          <code>bId</code> dans l’URL).
        </div>
      </Card>
    );
  }

  // 2) Personne introuvable
  if (!personA || !personB) {
    return (
      <Card className="max-w-3xl mx-auto p-4 space-y-2">
        <div className="text-sm text-red-600">
          Personne introuvable pour ces identifiants.
        </div>
        <div className="text-xs text-gray-500">
          aId: <code>{aId}</code> • bId: <code>{bId}</code>
        </div>
      </Card>
    );
  }

  // 3) Vue unique : schéma pivot
  return (
    <Card className="max-w-5xl mx-auto p-4 space-y-4">
      <div className="text-sm text-gray-700">
        Lien de parenté entre <span className="font-semibold">{labelA}</span> et{" "}
        <span className="font-semibold">{labelB}</span>.
      </div>

      <RelationPivotDiagram aId={aId} bId={bId} />
    </Card>
  );
}
