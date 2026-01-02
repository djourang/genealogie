// src/lib/genealogie.ts
import personnesData from "@/data/personnes.json";

export type Sexe = "m" | "f";

export type Person = {
  id: string;

  // Identité selon ton modèle NOM PERE GRANDPERE
  nom: string;
  nomPere?: string | null;
  nomGrandPere?: string | null;

  sexe: Sexe;
  clan?: string | null;

  // Liens généalogiques (quand tu connais l'ID exact)
  pereId?: string | null;
  mereId?: string | null;

  // Optionnel
  jumeauId?: string | null;
};

const personnes: Person[] = personnesData as Person[];

/** Normalisation robuste (minuscules, sans accents, espaces normalisés) */
function norm(s?: string | null): string {
  return (s ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ");
}

/** Construit "NOM PERE GRANDPERE" en ignorant ce qui est manquant */
export function formatNomComplet(
  p: Pick<Person, "nom" | "nomPere" | "nomGrandPere">
): string {
  const parts = [p.nom, p.nomPere ?? "", p.nomGrandPere ?? ""]
    .map((s) => (s ?? "").trim())
    .filter(Boolean);
  return parts.join(" ");
}

export function getAllPersons(): Person[] {
  return personnes;
}

/**
 * Résout un identifiant "legacy" vers un identifiant réel du JSON.
 *
 * Supporte :
 * - id exact du JSON : "issa_mamia_000012"
 * - id avec/sans prefix "p_" (si jamais tu l'ajoutes plus tard)
 * - ancien id : "p_issa" (on retrouve par nom = ISSA)
 */
export function resolvePersonId(inputId: string): string | undefined {
  const raw = (inputId ?? "").trim();
  if (!raw) return undefined;

  // 1) match direct
  if (personnes.some((p) => p.id === raw)) return raw;

  // 2) compat prefix p_
  if (raw.startsWith("p_")) {
    const without = raw.slice(2);
    if (personnes.some((p) => p.id === without)) return without;
  } else {
    const withp = `p_${raw}`;
    if (personnes.some((p) => p.id === withp)) return withp;
  }

  // 3) legacy "p_nom" ou "nom" -> recherche par nom (unique dans ton dataset actuel)
  const slug = raw.startsWith("p_") ? raw.slice(2) : raw;
  const slugN = norm(slug);

  const candidates = personnes.filter((p) => norm(p.nom) === slugN);

  if (candidates.length === 1) return candidates[0].id;

  // Si plusieurs homonymes : on prend celui avec l'ID le plus petit (stable)
  if (candidates.length > 1) {
    const sorted = candidates.slice().sort((a, b) => a.id.localeCompare(b.id));
    return sorted[0].id;
  }

  return undefined;
}

/** Trouve une personne par id (tolère anciens formats) */
export function getPersonById(id: string): Person | undefined {
  const resolved = resolvePersonId(id);
  if (!resolved) return undefined;
  return personnes.find((p) => p.id === resolved);
}

export function getFather(id: string): Person | undefined {
  const p = getPersonById(id);
  if (!p?.pereId) return undefined;
  return getPersonById(p.pereId);
}

export function getMother(id: string): Person | undefined {
  const p = getPersonById(id);
  if (!p?.mereId) return undefined;
  return getPersonById(p.mereId);
}

export function getParents(id: string): { pere?: Person; mere?: Person } {
  return { pere: getFather(id), mere: getMother(id) };
}

/** Tous les enfants d’une personne (en tant que père OU mère) */
export function getChildrenOf(parentId: string): Person[] {
  const pid = resolvePersonId(parentId) ?? parentId;

  return personnes
    .filter((p) => p.pereId === pid || p.mereId === pid)
    .slice()
    .sort((a, b) => formatNomComplet(a).localeCompare(formatNomComplet(b)));
}

/** Enfants d’un homme (père), groupés par mère (mereId) */
export function getChildrenGroupedByMother(fatherId: string): Array<{
  mere?: Person;
  mereId?: string | null;
  enfants: Person[];
}> {
  const fid = resolvePersonId(fatherId) ?? fatherId;

  const enfantsDuPere = personnes.filter((p) => p.pereId === fid);

  // Groupe par mereId
  const map = new Map<string, Person[]>();
  for (const e of enfantsDuPere) {
    const key = e.mereId ?? "UNKNOWN_MOTHER";
    const arr = map.get(key) ?? [];
    arr.push(e);
    map.set(key, arr);
  }

  const result = Array.from(map.entries()).map(([mereId, enfants]) => {
    const mere =
      mereId !== "UNKNOWN_MOTHER" ? getPersonById(mereId) : undefined;

    return {
      mere,
      mereId: mereId === "UNKNOWN_MOTHER" ? null : mereId,
      enfants: enfants
        .slice()
        .sort((a, b) => formatNomComplet(a).localeCompare(formatNomComplet(b))),
    };
  });

  // Trie mères par nom
  result.sort((a, b) => {
    const na = a.mere ? formatNomComplet(a.mere) : "ZZZ";
    const nb = b.mere ? formatNomComplet(b.mere) : "ZZZ";
    return na.localeCompare(nb);
  });

  return result;
}

/** Recherche simple sur le nom complet (NOM PERE GRANDPERE) */
export function searchPersons(query: string): Person[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  return personnes
    .filter((p) => formatNomComplet(p).toLowerCase().includes(q))
    .slice()
    .sort((a, b) => formatNomComplet(a).localeCompare(formatNomComplet(b)));
}

/** Trouver jumeau/jumelle si renseigné */
export function getTwin(id: string): Person | undefined {
  const p = getPersonById(id);
  if (!p?.jumeauId) return undefined;
  return getPersonById(p.jumeauId);
}

/* -------------------------------------------------------
   LIEN DE PARENTÉ (chemin le plus court via BFS)
------------------------------------------------------- */

export type KinStep = {
  fromId: string;
  toId: string;
  type: "pere" | "mere" | "enfant";
};

export function findKinPath(fromId: string, toId: string): KinStep[] | null {
  const startResolved = resolvePersonId(fromId?.trim());
  const goalResolved = resolvePersonId(toId?.trim());

  if (!startResolved || !goalResolved) return null;
  if (startResolved === goalResolved) return [];

  function neighbors(id: string): Array<{ nid: string; step: KinStep }> {
    const p = getPersonById(id);
    const out: Array<{ nid: string; step: KinStep }> = [];

    // vers père
    if (p?.pereId)
      out.push({
        nid: p.pereId,
        step: { fromId: id, toId: p.pereId, type: "pere" },
      });

    // vers mère
    if (p?.mereId)
      out.push({
        nid: p.mereId,
        step: { fromId: id, toId: p.mereId, type: "mere" },
      });

    // vers enfants
    const enfants = personnes.filter((c) => c.pereId === id || c.mereId === id);
    for (const c of enfants) {
      out.push({ nid: c.id, step: { fromId: id, toId: c.id, type: "enfant" } });
    }

    return out;
  }

  // BFS (plus court chemin)
  const queue: string[] = [startResolved];
  const visited = new Set<string>([startResolved]);
  const prev = new Map<string, { prevId: string; step: KinStep }>();

  while (queue.length) {
    const cur = queue.shift()!;
    for (const { nid, step } of neighbors(cur)) {
      if (visited.has(nid)) continue;
      visited.add(nid);
      prev.set(nid, { prevId: cur, step });

      if (nid === goalResolved) {
        const steps: KinStep[] = [];
        let x = goalResolved;

        while (x !== startResolved) {
          const item = prev.get(x);
          if (!item) break;
          steps.push(item.step);
          x = item.prevId;
        }

        steps.reverse();
        return steps;
      }

      queue.push(nid);
    }
  }

  return null;
}

export function getUnionsOf(personId: string): Array<{
  partner?: Person;
  partnerId?: string | null;
  enfants: Person[];
}> {
  const resolvedMeId = resolvePersonId(personId) ?? personId;
  const me = getPersonById(resolvedMeId);
  if (!me) return [];

  const isMale = me.sexe === "m";

  // Mes enfants (où je suis père si homme, mère si femme)
  const myKids = personnes.filter((p) =>
    isMale ? p.pereId === resolvedMeId : p.mereId === resolvedMeId
  );

  // Groupement par partenaire (mereId si homme, pereId si femme)
  const map = new Map<string, Person[]>();
  for (const kid of myKids) {
    const partnerKey = (isMale ? kid.mereId : kid.pereId) ?? "UNKNOWN_PARTNER";
    const arr = map.get(partnerKey) ?? [];
    arr.push(kid);
    map.set(partnerKey, arr);
  }

  const unions = Array.from(map.entries()).map(([partnerId, enfants]) => {
    const partner =
      partnerId !== "UNKNOWN_PARTNER" ? getPersonById(partnerId) : undefined;

    return {
      partner,
      partnerId: partnerId === "UNKNOWN_PARTNER" ? null : partnerId,
      enfants: enfants
        .slice()
        .sort((a, b) => formatNomComplet(a).localeCompare(formatNomComplet(b))),
    };
  });

  // Tri pour stabilité visuelle
  unions.sort((a, b) => {
    const na = a.partner ? formatNomComplet(a.partner) : "ZZZ";
    const nb = b.partner ? formatNomComplet(b.partner) : "ZZZ";
    return na.localeCompare(nb);
  });

  return unions;
}

export type PersonQuery = {
  nom?: string;
  nomPere?: string;
  nomGrandPere?: string;
};

export type PersonMatch = {
  person: Person;
  score: number;
};

export function suggestPersons(q: PersonQuery, limit = 12): PersonMatch[] {
  const qNom = norm(q.nom);
  const qPere = norm(q.nomPere);
  const qGP = norm(q.nomGrandPere);

  // Rien saisi => rien suggérer
  if (!qNom && !qPere && !qGP) return [];

  const results: PersonMatch[] = [];

  for (const p of personnes) {
    const pNom = norm(p.nom);
    const pPere = norm(p.nomPere);
    const pGP = norm(p.nomGrandPere);

    let score = 0;

    // NOM : si fourni, doit matcher un minimum
    if (qNom) {
      if (pNom === qNom) score += 60;
      else if (pNom.startsWith(qNom)) score += 45;
      else if (pNom.includes(qNom)) score += 30;
      else continue;
    }

    // PERE : si fourni, doit matcher un minimum
    if (qPere) {
      if (pPere === qPere) score += 25;
      else if (pPere.startsWith(qPere)) score += 15;
      else if (pPere.includes(qPere)) score += 8;
      else continue;
    }

    // GRAND-PERE : si fourni, doit matcher un minimum
    if (qGP) {
      if (pGP === qGP) score += 15;
      else if (pGP.startsWith(qGP)) score += 10;
      else if (pGP.includes(qGP)) score += 5;
      else continue;
    }

    // petit bonus (stabilité)
    if (p.clan) score += 1;

    results.push({ person: p, score });
  }

  results.sort((a, b) => b.score - a.score);
  return results.slice(0, limit);
}
