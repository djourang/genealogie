"use client";

import React, { useMemo, useState } from "react";
import { Card, Button, cx } from "@/components/ui/ui";
import PersonSuggestInput from "@/components/ui/PersonSuggestInput";
import { getPersonById } from "@/lib/genealogie";

export default function PersonFinderPanel({
  title = "Rechercher",
  limit = 10,
  onPickPerson,
  className,
}: {
  title?: string;
  limit?: number;
  onPickPerson: (personId: string) => void;
  className?: string;
}) {
  // même approche que RelationPage: label + id
  const [label, setLabel] = useState("");
  const [id, setId] = useState<string | null>(null);

  const person = useMemo(() => (id ? getPersonById(id) : null), [id]);
  const ready = Boolean(person);

  return (
    <Card className={cx("max-w-3xl mx-auto space-y-5", className)}>
      <div className="text-lg font-semibold">{title}</div>

      <PersonSuggestInput
        label="Personne"
        value={label}
        onChange={(v) => {
          setLabel(v);
          setId(null);
        }}
        onPick={({ id, label }) => {
          setId(id);
          setLabel(label);
        }}
        placeholder="Tape un nom…"
        limit={limit}
      />

      <div className="flex items-center justify-end">
        <Button
          ready={ready}
          onClick={() => {
            if (!person) return;
            onPickPerson(person.id);
          }}
        >
          Ouvrir
        </Button>
      </div>
    </Card>
  );
}
