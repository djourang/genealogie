// src/components/RelationPivotDiagram.tsx
import { findKinPath, getPersonById, getUnionsOf } from "@/lib/genealogie";
import PersonNode from "./PersonNode";

type Step = { fromId: string; toId: string; type: "pere" | "mere" | "enfant" };

function buildPathIds(aId: string, path: Step[]) {
  const ids = [aId];
  for (const s of path) ids.push(s.toId);
  return ids;
}

/**
 * Pivot = parent commun (si possible)
 * Retourne:
 * - pivotId: le parent commun
 * - childToA: l'enfant du pivot côté A
 * - childToB: l'enfant du pivot côté B
 * - pivotIndex: index pivot dans ids
 * - ids: liste complète A->...->B
 */
function pickCommonParentPivot(path: Step[], aId: string) {
  const ids = buildPathIds(aId, path);

  for (let i = 1; i < ids.length - 1; i++) {
    const cur = ids[i];
    const prev = ids[i - 1];
    const next = ids[i + 1];

    const prevStep = path[i - 1];
    const nextStep = path[i];

    // prev -> cur est pere/mere => cur est parent de prev
    const curIsParentOfPrev =
      (prevStep.type === "pere" || prevStep.type === "mere") &&
      prevStep.fromId === prev &&
      prevStep.toId === cur;

    // cur est parent de next ?
    const curIsParentOfNext =
      (nextStep.type === "enfant" &&
        nextStep.fromId === cur &&
        nextStep.toId === next) ||
      ((nextStep.type === "pere" || nextStep.type === "mere") &&
        nextStep.fromId === next &&
        nextStep.toId === cur);

    if (curIsParentOfPrev && curIsParentOfNext) {
      // le chemin part de A => prev est côté A, next côté B
      return {
        pivotId: cur,
        childToA: prev,
        childToB: next,
        pivotIndex: i,
        ids,
      };
    }
  }

  // fallback = pivot milieu
  const mid = Math.floor((ids.length - 1) / 2);
  return {
    pivotId: ids[mid],
    childToA: ids[Math.max(0, mid - 1)],
    childToB: ids[Math.min(ids.length - 1, mid + 1)],
    pivotIndex: mid,
    ids,
  };
}

/**
 * Trouver le partenaire du pivot dans l'union qui contient childToA ou childToB
 */
function pickUnionPartnerForChildren(pivotId: string, childIds: string[]) {
  const unions = getUnionsOf(pivotId);
  for (const u of unions) {
    const kids = (u.enfants ?? []).map((e: any) => e.id);
    if (childIds.some((cid) => kids.includes(cid))) {
      return u.partner ?? null;
    }
  }
  return null;
}

export default function RelationPivotDiagram({
  aId,
  bId,
}: {
  aId: string;
  bId: string;
}) {
  const path = findKinPath(aId, bId) as Step[] | null;
  if (path === null) {
    return (
      <div className="text-red-600">
        Aucun lien trouvé entre ces deux personnes.
      </div>
    );
  }

  const { pivotId, childToA, childToB, pivotIndex, ids } =
    pickCommonParentPivot(path, aId);

  const A = getPersonById(aId);
  const B = getPersonById(bId);
  const pivot = getPersonById(pivotId);
  if (!pivot) return <div className="text-red-600">Pivot introuvable.</div>;

  // couple "issu de" (parents du pivot)
  const father = pivot.pereId ? getPersonById(pivot.pereId) : null;
  const mother = pivot.mereId ? getPersonById(pivot.mereId) : null;

  // couple pivot qui initie le lien (pivot + partenaire)
  const partner = pickUnionPartnerForChildren(pivotId, [childToA, childToB]);

  // anchors = enfants du couple pivot qui mènent à A et B
  const anchorA = getPersonById(childToA);
  const anchorB = getPersonById(childToB);

  // chemins à dérouler
  // pivot -> ... -> A
  const idsToA = ids.slice(0, pivotIndex + 1).reverse();
  // pivot -> ... -> B
  const idsToB = ids.slice(pivotIndex);

  const nodeW = 260;
  const nodeH = 80;

  // ===== Layout (même style que FamilyDiagram : unions + troncs) =====
  const svgW = 1600;

  const parentsY = 40;
  const parentsGapX = 60;
  const fatherX = 350;
  const motherX = fatherX + nodeW + parentsGapX;

  const fatherCenterX = fatherX + nodeW / 2;
  const motherCenterX = motherX + nodeW / 2;

  const unionParentsY = parentsY + nodeH + 10;
  const unionParentsDotX = (fatherCenterX + motherCenterX) / 2;

  const pivotX = unionParentsDotX - nodeW / 2;
  const pivotY = unionParentsY + 55;

  const coupleY = pivotY + nodeH + 90;
  const coupleGapX = 60;
  const partnerX = pivotX + nodeW + coupleGapX;

  const pivotCenterX = pivotX + nodeW / 2;
  const partnerCenterX = partnerX + nodeW / 2;

  const unionCoupleY = coupleY + nodeH + 10;
  const unionCoupleDotX = (pivotCenterX + partnerCenterX) / 2;

  const anchorsY = unionCoupleY + 70;
  const leftAnchorX = 260;
  const rightAnchorX = 1050;

  const leftAnchorCenterX = leftAnchorX + nodeW / 2;
  const rightAnchorCenterX = rightAnchorX + nodeW / 2;

  const chainStartY = anchorsY + nodeH + 70;
  const chainGapY = 125;

  const svgH = Math.max(
    1100,
    chainStartY + Math.max(idsToA.length, idsToB.length) * chainGapY + 300
  );

  return (
    <div className="w-full overflow-auto border rounded-xl bg-white">
      <svg width={svgW} height={svgH} className="block">
        {/* ===== parents (issu de) ===== */}
        <PersonNode
          x={fatherX}
          y={parentsY}
          person={father}
          sexeHint="m"
          width={nodeW}
          height={nodeH}
        />
        <PersonNode
          x={motherX}
          y={parentsY}
          person={mother}
          sexeHint="f"
          width={nodeW}
          height={nodeH}
        />

        {/* union parents -> pivot (copié logique FamilyDiagram) */}
        <line
          x1={fatherCenterX}
          y1={parentsY + nodeH}
          x2={fatherCenterX}
          y2={unionParentsY}
          stroke="black"
        />
        <line
          x1={motherCenterX}
          y1={parentsY + nodeH}
          x2={motherCenterX}
          y2={unionParentsY}
          stroke="black"
        />
        <line
          x1={fatherCenterX}
          y1={unionParentsY}
          x2={motherCenterX}
          y2={unionParentsY}
          stroke="black"
        />
        <circle cx={unionParentsDotX} cy={unionParentsY} r={4} fill="black" />
        <line
          x1={unionParentsDotX}
          y1={unionParentsY}
          x2={unionParentsDotX}
          y2={pivotY}
          stroke="black"
        />

        {/* pivot */}
        <PersonNode
          x={pivotX}
          y={pivotY}
          person={pivot}
          width={nodeW}
          height={nodeH}
        />

        {/* ===== couple qui initie le lien ===== */}
        <line
          x1={pivotCenterX}
          y1={pivotY + nodeH}
          x2={pivotCenterX}
          y2={coupleY}
          stroke="black"
        />

        <PersonNode
          x={pivotX}
          y={coupleY}
          person={pivot}
          width={nodeW}
          height={nodeH}
        />
        <PersonNode
          x={partnerX}
          y={coupleY}
          person={partner}
          sexeHint={pivot.sexe === "m" ? "f" : "m"}
          width={nodeW}
          height={nodeH}
        />

        <line
          x1={pivotCenterX}
          y1={coupleY + nodeH}
          x2={pivotCenterX}
          y2={unionCoupleY}
          stroke="black"
        />
        <line
          x1={partnerCenterX}
          y1={coupleY + nodeH}
          x2={partnerCenterX}
          y2={unionCoupleY}
          stroke="black"
        />
        <line
          x1={pivotCenterX}
          y1={unionCoupleY}
          x2={partnerCenterX}
          y2={unionCoupleY}
          stroke="black"
        />
        <circle cx={unionCoupleDotX} cy={unionCoupleY} r={4} fill="black" />

        {/* branches vers anchors */}
        <line
          x1={unionCoupleDotX}
          y1={unionCoupleY}
          x2={leftAnchorCenterX}
          y2={anchorsY}
          stroke="black"
        />
        <line
          x1={unionCoupleDotX}
          y1={unionCoupleY}
          x2={rightAnchorCenterX}
          y2={anchorsY}
          stroke="black"
        />

        <PersonNode
          x={leftAnchorX}
          y={anchorsY}
          person={anchorA}
          width={nodeW}
          height={nodeH}
        />
        <PersonNode
          x={rightAnchorX}
          y={anchorsY}
          person={anchorB}
          width={nodeW}
          height={nodeH}
        />

        {/* ===== dérouler vers A (colonne gauche) ===== */}
        {idsToA.map((pid, i) => {
          const p = getPersonById(pid);
          const x = leftAnchorX;
          const y = chainStartY + i * chainGapY;
          const cx = x + nodeW / 2;

          if (i === 0) {
            return (
              <g key={`A-${pid}-${i}`}>
                <line
                  x1={leftAnchorCenterX}
                  y1={anchorsY + nodeH}
                  x2={leftAnchorCenterX}
                  y2={y}
                  stroke="black"
                />
                <PersonNode
                  x={x}
                  y={y}
                  person={p}
                  width={nodeW}
                  height={nodeH}
                />
              </g>
            );
          }

          const prevY = chainStartY + (i - 1) * chainGapY;
          return (
            <g key={`A-${pid}-${i}`}>
              <line x1={cx} y1={prevY + nodeH} x2={cx} y2={y} stroke="black" />
              <PersonNode x={x} y={y} person={p} width={nodeW} height={nodeH} />
            </g>
          );
        })}

        {/* ===== dérouler vers B (colonne droite) ===== */}
        {idsToB.map((pid, i) => {
          const p = getPersonById(pid);
          const x = rightAnchorX;
          const y = chainStartY + i * chainGapY;
          const cx = x + nodeW / 2;

          if (i === 0) {
            return (
              <g key={`B-${pid}-${i}`}>
                <line
                  x1={rightAnchorCenterX}
                  y1={anchorsY + nodeH}
                  x2={rightAnchorCenterX}
                  y2={y}
                  stroke="black"
                />
                <PersonNode
                  x={x}
                  y={y}
                  person={p}
                  width={nodeW}
                  height={nodeH}
                />
              </g>
            );
          }

          const prevY = chainStartY + (i - 1) * chainGapY;
          return (
            <g key={`B-${pid}-${i}`}>
              <line x1={cx} y1={prevY + nodeH} x2={cx} y2={y} stroke="black" />
              <PersonNode x={x} y={y} person={p} width={nodeW} height={nodeH} />
            </g>
          );
        })}
      </svg>
    </div>
  );
}
