"use client";

import { useRouter } from "next/navigation";
import Container from "@/components/site/Container";
import { LinkButton } from "@/components/ui/ui";
import PersonFinderPanel from "@/components/ui/PersonFinderPanel";

export default function PersonChooserPage() {
  const router = useRouter();

  function goToPerson(personId: string) {
    router.push(`/personne/${encodeURIComponent(personId)}`);
  }

  return (
    <main className="py-10">
      <Container>
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between gap-3">
            <h1 className="text-2xl font-bold">Voir une personne</h1>
            <LinkButton href="/">Accueil</LinkButton>
          </div>

          {/* Bloc centralisé */}
          <PersonFinderPanel
            title="Recherche"
            limit={12}
            onPickPerson={goToPerson}
          />
        </div>
      </Container>
    </main>
  );
}
