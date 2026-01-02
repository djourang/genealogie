"use client";

import { useSearchParams } from "next/navigation";
// importe ici tes composants et fonctions existantes
// ex: import RelationDiagram from "@/components/RelationDiagram";
// ex: import { findKinPath } from "@/lib/genealogie";

export default function SchemaClient() {
  const sp = useSearchParams();
  const aId = sp.get("aId") ?? "";
  const bId = sp.get("bId") ?? "";

  // TODO: mets ici TON code actuel qui utilisait useSearchParams()
  // Exemple:
  // if (!aId || !bId) return <div>Deux personnes valides sont requises…</div>;
  // const path = findKinPath(aId, bId);
  // return <RelationDiagram path={path} />;

  return (
    <div>
      {/* Remplace par ton UI existant */}
      <div className="text-sm text-gray-600">
        aId: {aId || "—"} • bId: {bId || "—"}
      </div>
    </div>
  );
}
