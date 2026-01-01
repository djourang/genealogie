"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import RelationDiagram from "@/components/RelationDiagram";
import { findKinPath, formatNomComplet, getPersonById } from "@/lib/genealogie";

export default function RelationPage() {
  const [a, setA] = useState("p_tahir");
  const [b, setB] = useState("p_guisma");

  const pa = useMemo(() => getPersonById(a.trim()), [a]);
  const pb = useMemo(() => getPersonById(b.trim()), [b]);

  const path = useMemo(() => {
    const A = a.trim();
    const B = b.trim();
    if (!A || !B) return null;
    return findKinPath(A, B);
  }, [a, b]);

  return (
    <main className="p-6 space-y-5">
      <h1 className="text-2xl font-bold">Lien de parenté</h1>

      <div className="p-4 border rounded-xl space-y-3 max-w-2xl">
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium">Personne A (ID)</label>
            <input
              className="w-full border rounded-lg px-3 py-2"
              value={a}
              onChange={(e) => setA(e.target.value)}
            />
            <div className="text-xs text-gray-600 mt-1">
              {pa ? formatNomComplet(pa) : "ID inconnu"}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium">Personne B (ID)</label>
            <input
              className="w-full border rounded-lg px-3 py-2"
              value={b}
              onChange={(e) => setB(e.target.value)}
            />
            <div className="text-xs text-gray-600 mt-1">
              {pb ? formatNomComplet(pb) : "ID inconnu"}
            </div>
          </div>
        </div>

        <div className="flex gap-3 text-sm">
          {pa ? (
            <Link className="underline" href={`/personne/${pa.id}`}>
              Voir A en schéma
            </Link>
          ) : null}
          {pb ? (
            <Link className="underline" href={`/personne/${pb.id}`}>
              Voir B en schéma
            </Link>
          ) : null}
        </div>
      </div>

      {/* Schéma du chemin */}
      {pa && pb ? (
        <RelationDiagram aId={pa.id} bId={pb.id} />
      ) : (
        <div className="text-red-600">IDs invalides.</div>
      )}

      {/* Texte du chemin (optionnel) */}
      <div className="p-4 border rounded-xl max-w-2xl space-y-2">
        <div className="font-semibold">Détails</div>
        {path === null ? (
          <div className="text-red-600">Aucun chemin trouvé.</div>
        ) : path?.length === 0 ? (
          <div>Même personne.</div>
        ) : (
          <ol className="list-decimal pl-6 space-y-1">
            {path?.map((s, i) => {
              const from = getPersonById(s.fromId);
              const to = getPersonById(s.toId);
              const fromName = from ? formatNomComplet(from) : s.fromId;
              const toName = to ? formatNomComplet(to) : s.toId;
              const label =
                s.type === "pere"
                  ? "→ père"
                  : s.type === "mere"
                  ? "→ mère"
                  : "→ enfant";
              return (
                <li key={i}>
                  <span className="font-medium">{fromName}</span> {label}{" "}
                  <span className="font-medium">{toName}</span>
                </li>
              );
            })}
          </ol>
        )}
      </div>
    </main>
  );
}
