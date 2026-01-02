import Container from "@/components/site/Container";
import { ActionCard, Notice } from "@/components/ui/ui";

export default function Home() {
  return (
    <main className="py-10">
      <Container>
        <div className="space-y-5">
          <div className="space-y-2">
            <h1 className="text-3xl font-extrabold">Généalogie familiale</h1>
            <p className="text-gray-600">
              Rechercher une personne, visualiser son schéma, et comprendre les
              liens de parenté (parents, enfants, unions, clans).
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 pt-2">
            <ActionCard
              href="/personne"
              title="Voir une personne"
              description="Recherche (nom / père / grand-père), puis affichage du schéma."
              example="Mourno Moursal"
            />
            <ActionCard
              href="/relation"
              title="Lien de parenté"
              description="Trouver un chemin entre deux personnes (père / mère / enfant)."
              example="mourno moursal et Hassan Digo Anou"
            />
          </div>

          <Notice label="Astuce">
            utilise les Noms des Persone suggerer apres vos premières lettre
            d'etrée <span className="font-mono">“Personne introuvable”</span>.
          </Notice>
        </div>
      </Container>
    </main>
  );
}
