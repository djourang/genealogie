"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { suggestPersons } from "@/lib/genealogie";

export default function PersonChooserPage() {
  const router = useRouter();

  const [nom, setNom] = useState("");
  const [nomPere, setNomPere] = useState("");
  const [nomGrandPere, setNomGrandPere] = useState("");

  const matches = useMemo(() => {
    return suggestPersons({ nom, nomPere, nomGrandPere }, 12);
  }, [nom, nomPere, nomGrandPere]);

  function goToPerson(personId: string) {
    // ✅ ON ENVOIE L’ID JSON RÉEL
    router.push(`/personne/${encodeURIComponent(personId)}`);
  }

  return (
    <main className="p-6 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Voir une personne</h1>
        <Link href="/" className="underline">
          Accueil
        </Link>
      </div>

      <div className="p-4 border rounded-xl space-y-3 max-w-3xl">
        <div className="grid gap-3 sm:grid-cols-3">
          <div>
            <label className="block text-sm font-medium">Nom</label>
            <input
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
              placeholder="ex: ISSA"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Nom du père</label>
            <input
              value={nomPere}
              onChange={(e) => setNomPere(e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
              placeholder="ex: MOURSAL"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">
              Nom du grand-père
            </label>
            <input
              value={nomGrandPere}
              onChange={(e) => setNomGrandPere(e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
              placeholder="ex: OURBO"
            />
          </div>
        </div>

        <div>
          <div className="text-sm font-semibold mb-2">Suggestions</div>

          {matches.length === 0 ? (
            <div className="text-sm text-gray-600">
              Commence à taper puis clique sur une personne.
            </div>
          ) : (
            <ul className="space-y-2">
              {matches.map(({ person }) => (
                <li key={person.id}>
                  <button
                    type="button"
                    onClick={() => goToPerson(person.id)}
                    className="w-full text-left p-3 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="font-semibold">{person.nom}</div>
                    <div className="text-sm text-gray-600">
                      Père: {person.nomPere ?? "?"} • Grand-père:{" "}
                      {person.nomGrandPere ?? "?"} • Clan: {person.clan ?? "?"}
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </main>
  );
}
