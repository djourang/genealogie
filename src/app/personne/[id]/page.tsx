// src/app/personne/[id]/page.tsx
"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import FamilyDiagram from "@/components/FamilyDiagram";
import { getAllPersons, getPersonById } from "@/lib/genealogie";

export default function PersonSchemaPage() {
  const params = useParams(); // <-- vient de l'URL
  const raw = params?.id;

  // si jamais Next renvoie un tableau (rare), on prend le 1er
  const idUrl = decodeURIComponent(
    Array.isArray(raw) ? raw[0] : raw ?? ""
  ).trim();

  const examples = getAllPersons()
    .slice(0, 20)
    .map((p) => p.id);

  const person = idUrl ? getPersonById(idUrl) : undefined;

  return (
    <main className="p-6 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Schéma</h1>
        <Link className="underline" href="/personne">
          ← Retour
        </Link>
      </div>

      {!idUrl ? (
        <div className="text-red-600">Paramètre [id] non reçu.</div>
      ) : !person ? (
        <div className="text-red-600">
          Personne introuvable pour cet ID. (Vérifie que l’ID correspond bien à
          un ID du JSON.)
        </div>
      ) : (
        <FamilyDiagram focusId={idUrl} />
      )}
    </main>
  );
}
