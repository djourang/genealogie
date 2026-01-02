"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Container from "@/components/site/Container";
import { Button, Card, LinkButton } from "@/components/ui/ui";
import PersonSuggestInput from "@/components/ui/PersonSuggestInput";
import { getPersonById } from "@/lib/genealogie";

export default function RelationPage() {
  const router = useRouter();

  const [aLabel, setALabel] = useState("");
  const [bLabel, setBLabel] = useState("");

  const [aId, setAId] = useState<string | null>(null);
  const [bId, setBId] = useState<string | null>(null);

  const pa = useMemo(() => (aId ? getPersonById(aId) : null), [aId]);
  const pb = useMemo(() => (bId ? getPersonById(bId) : null), [bId]);

  const ready = Boolean(pa && pb);

  function afficher() {
    if (!pa || !pb) return;

    router.push(
      `/relation/schema?aId=${encodeURIComponent(
        pa.id
      )}&bId=${encodeURIComponent(pb.id)}`
    );
  }

  return (
    <main className="py-10">
      <Container>
        <div className="space-y-6">
          <div className="flex items-center justify-between gap-3">
            <h1 className="text-2xl font-bold">Lien de parenté</h1>
            <LinkButton href="/">Accueil</LinkButton>
          </div>

          <Card className="max-w-3xl mx-auto space-y-5">
            <div className="grid gap-5 sm:grid-cols-2">
              <PersonSuggestInput
                label="Personne A"
                value={aLabel}
                onChange={(v) => {
                  setALabel(v);
                  setAId(null);
                }}
                onPick={({ id, label }) => {
                  setAId(id);
                  setALabel(label);
                }}
                placeholder="Tape un nom…"
                limit={10}
              />

              <PersonSuggestInput
                label="Personne B"
                value={bLabel}
                onChange={(v) => {
                  setBLabel(v);
                  setBId(null);
                }}
                onPick={({ id, label }) => {
                  setBId(id);
                  setBLabel(label);
                }}
                placeholder="Tape un nom…"
                limit={10}
              />
            </div>

            <div className="flex items-center justify-end">
              <Button ready={ready} onClick={afficher}>
                Afficher
              </Button>
            </div>
          </Card>
        </div>
      </Container>
    </main>
  );
}
