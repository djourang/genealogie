import React, { Suspense } from "react";
import Container from "@/components/site/Container";
import { Card, LinkButton } from "@/components/ui/ui";
import SchemaClient from "./SchemaClient";

export default function SchemaPage() {
  return (
    <main className="py-10">
      <Container>
        <div className="space-y-6">
          <div className="flex items-center justify-between gap-3">
            <h1 className="text-2xl font-bold">Schéma du lien de parenté</h1>
            <LinkButton href="/relation">← Retour</LinkButton>
          </div>

          <Suspense
            fallback={
              <Card className="max-w-3xl mx-auto">
                <div className="text-sm text-gray-600">Chargement…</div>
              </Card>
            }
          >
            <SchemaClient />
          </Suspense>
        </div>
      </Container>
    </main>
  );
}
