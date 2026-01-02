"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { cx, TextInput } from "@/components/ui/ui";
import { suggestPersons, formatNomComplet } from "@/lib/genealogie";

/* ───────────────────────── Types ───────────────────────── */

type PersonLite = {
  id: string;
  nom: string;
  nomPere?: string | null;
  nomGrandPere?: string | null;
  clan?: string | null;
  sexe?: "m" | "f";
};

type Match = {
  person: PersonLite;
  score: number;
};

/* ─────────────────── Hook click extérieur ───────────────── */

function useOutsideClick(
  ref: React.RefObject<HTMLElement>,
  onOutside: () => void
) {
  const onOutsideRef = useRef(onOutside);

  useEffect(() => {
    onOutsideRef.current = onOutside;
  }, [onOutside]);

  useEffect(() => {
    function onDown(e: MouseEvent) {
      const el = ref.current;
      if (!el) return;
      if (!el.contains(e.target as Node)) onOutsideRef.current();
    }
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [ref]);
}

/* ───────────────── Input avec suggestions ───────────────── */

export default function PersonSuggestInput({
  label,
  value,
  onChange,
  onPick,
  placeholder = "Tape un nom…",
  limit = 10,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  onPick: (picked: { id: string; label: string }) => void;
  placeholder?: string;
  limit?: number;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  useOutsideClick(wrapRef, () => setOpen(false));

  const q = value.trim();

  const matches = useMemo(() => {
    if (!q) return [] as Match[];
    // suggestPersons retourne déjà le bon format Match dans ton projet
    return suggestPersons({ nom: q, nomPere: "", nomGrandPere: "" }, limit) as
      | Match[]
      | [];
  }, [q, limit]);

  useEffect(() => {
    if (q && matches.length > 0) setOpen(true);
    if (!q) setOpen(false);
    setActiveIndex(0);
  }, [q, matches.length]);

  function pick(m: Match) {
    const p = m.person;
    onPick({ id: p.id, label: formatNomComplet(p as any) });
    setOpen(false);
  }

  return (
    <div ref={wrapRef} className="relative">
      {/* ✅ On réutilise ton TextInput (design global) */}
      <TextInput
        label={label}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        onFocus={() => {
          if (q && matches.length > 0) setOpen(true);
        }}
        onKeyDown={(e) => {
          if (!open) return;

          if (e.key === "Escape") setOpen(false);

          if (e.key === "ArrowDown") {
            e.preventDefault();
            setActiveIndex((i) => Math.min(i + 1, matches.length - 1));
          }
          if (e.key === "ArrowUp") {
            e.preventDefault();
            setActiveIndex((i) => Math.max(i - 1, 0));
          }
          if (e.key === "Enter") {
            const m = matches[activeIndex];
            if (m) {
              e.preventDefault();
              pick(m);
            }
          }
        }}
      />

      {open && matches.length > 0 && (
        <div className="absolute z-20 mt-2 w-full rounded-2xl border bg-white shadow-lg overflow-hidden">
          <ul className="max-h-72 overflow-auto">
            {matches.map((m, idx) => {
              const p = m.person;
              const active = idx === activeIndex;

              return (
                <li key={p.id}>
                  <button
                    type="button"
                    onMouseEnter={() => setActiveIndex(idx)}
                    onClick={() => pick(m)}
                    className={cx(
                      "w-full text-left px-4 py-3 transition",
                      active ? "bg-gray-100" : "hover:bg-gray-50"
                    )}
                  >
                    <div className="text-sm font-semibold">
                      {formatNomComplet(p as any)}
                    </div>
                    <div className="text-xs text-gray-600 mt-0.5">
                      Père: {p.nomPere ?? "?"} • Grand-père:{" "}
                      {p.nomGrandPere ?? "?"} • Clan: {p.clan ?? "?"}
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
