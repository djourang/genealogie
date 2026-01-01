import Link from "next/link";

export default function Home() {
  return (
    <main className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Généalogie</h1>
      <p className="text-sm text-gray-600">Que veux-tu faire ?</p>

      <div className="grid gap-4 sm:grid-cols-2">
        <Link
          href="/personne"
          className="p-5 border rounded-xl hover:bg-gray-50 transition"
        >
          <div className="text-lg font-semibold">Voir une personne</div>
          <div className="text-sm text-gray-600">
            Afficher le schéma d’une personne
          </div>
        </Link>

        <Link
          href="/relation"
          className="p-5 border rounded-xl hover:bg-gray-50 transition"
        >
          <div className="text-lg font-semibold">Lien de parenté</div>
          <div className="text-sm text-gray-600">
            Trouver le lien entre deux personnes
          </div>
        </Link>
      </div>
    </main>
  );
}
