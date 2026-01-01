// src/components/FamilyDiagram.tsx
import { getPersonById, getUnionsOf } from "@/lib/genealogie";
import PersonNode from "./PersonNode";

export default function FamilyDiagram({ focusId }: { focusId: string }) {
  const person = getPersonById(focusId);
  if (!person) return <div>Personne introuvable</div>;

  const father = person.pereId ? getPersonById(person.pereId) : null;
  const mother = person.mereId ? getPersonById(person.mereId) : null;

  const unions = getUnionsOf(person.id);

  // --- dimensions des noeuds (doivent matcher PersonNode) ---
  const nodeW = 260;
  const nodeH = 80;

  // --- ascendance (parents + mariage) ---
  const parentsY = 40;

  const parentsGapX = 60; // espace horizontal entre père et mère
  const fatherX = 350;
  const motherX = fatherX + nodeW + parentsGapX;

  const marriageY = parentsY + nodeH + 15;
  const fatherCenterX = fatherX + nodeW / 2;
  const motherCenterX = motherX + nodeW / 2;

  const marriageDotX = (fatherCenterX + motherCenterX) / 2;

  // --- pivot ---
  const focusX = marriageDotX - nodeW / 2;
  const focusY = marriageY + 55;

  // --- descendance (layout) ---
  const unionStartX = 200;
  const unionGapX = 520; // augmenté car noeuds plus larges

  const partnerY = focusY + nodeH + 90;

  const childrenStartOffsetY = 90;
  const childGapY = 125;
  const childXOffset = 320;

  // --- calcul dynamique largeur/hauteur du SVG ---
  const maxChildren = unions.reduce((m, u) => Math.max(m, u.enfants.length), 0);

  const childrenBlockHeight =
    maxChildren > 0
      ? childrenStartOffsetY + (maxChildren - 1) * childGapY + nodeH + 60
      : 0;

  const contentBottomY = partnerY + nodeH + childrenBlockHeight;

  const svgH = Math.max(1050, contentBottomY + 120);
  const svgW = Math.max(1600, unionStartX + unions.length * unionGapX + 700);

  return (
    <div
      style={{
        width: "100%",
        overflow: "auto",
        border: "1px solid #e5e7eb",
        borderRadius: 12,
      }}
    >
      <svg width={svgW} height={svgH}>
        {/* ===== PARENTS (toujours visibles, même vides) ===== */}
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

        {/* ===== Mariage parents + lien vers pivot : TOUJOURS ===== */}
        {/* ===== Mariage parents + lien vers pivot : TOUJOURS (sans pénétrer les formes) ===== */}
        {(() => {
          // bas des formes parents
          const fatherBottomY = parentsY + nodeH;
          const motherBottomY = parentsY + nodeH;

          // ligne d’union juste sous les formes
          const unionY = Math.max(fatherBottomY, motherBottomY) + 10;

          // courte descente depuis chaque parent vers la ligne d’union
          const drop = 10;

          // on évite d’entrer dans les formes : on part des centres, mais la ligne horizontale
          // est tracée ENTRE les 2 petites descentes (donc hors des formes)
          const fx = fatherCenterX;
          const mx = motherCenterX;

          // point de jonction au milieu
          const dotX = (fx + mx) / 2;

          return (
            <>
              {/* descentes */}
              <line
                x1={fx}
                y1={fatherBottomY}
                x2={fx}
                y2={unionY}
                stroke="black"
              />
              <line
                x1={mx}
                y1={motherBottomY}
                x2={mx}
                y2={unionY}
                stroke="black"
              />

              {/* union horizontale (ne traverse aucune forme) */}
              <line x1={fx} y1={unionY} x2={mx} y2={unionY} stroke="black" />

              {/* point central + descente vers l’enfant pivot */}
              <circle cx={dotX} cy={unionY} r={4} fill="black" />
              <line
                x1={dotX}
                y1={unionY}
                x2={dotX}
                y2={focusY}
                stroke="black"
              />
            </>
          );
        })()}

        {/* ===== PERSONNE PIVOT ===== */}
        <PersonNode
          x={focusX}
          y={focusY}
          person={person}
          width={nodeW}
          height={nodeH}
        />

        {/* ===== DESCENDANCE PAR UNIONS (tronc soutenu par la mère/partenaire) ===== */}
        {unions.map((u, index) => {
          const baseX = unionStartX + index * unionGapX;

          const partnerSexHint = person.sexe === "m" ? "f" : "m";

          const partnerCenterX = baseX + nodeW / 2;
          const partnerBottomY = partnerY + nodeH;

          const trunkX = partnerCenterX;
          const trunkTopY = partnerBottomY;

          const childrenStartY = partnerBottomY + childrenStartOffsetY;
          const branchOffsetY = 28; // une seule source

          const trunkBottomY =
            u.enfants.length > 0
              ? childrenStartY +
                (u.enfants.length - 1) * childGapY +
                branchOffsetY
              : trunkTopY;

          return (
            <g key={index}>
              {/* Ligne pivot -> partenaire (union) */}
              <line
                x1={focusX + nodeW / 2}
                y1={focusY + nodeH}
                x2={partnerCenterX}
                y2={partnerY}
                stroke="black"
              />

              {/* Partenaire (forme visible même si inconnu) */}
              <PersonNode
                x={baseX}
                y={partnerY}
                person={u.partner ?? null}
                sexeHint={partnerSexHint}
                width={nodeW}
                height={nodeH}
              />

              {/* Tronc vertical soutenu par le partenaire */}
              {u.enfants.length > 0 && (
                <line
                  x1={trunkX}
                  y1={trunkTopY}
                  x2={trunkX}
                  y2={trunkBottomY}
                  stroke="black"
                />
              )}

              {/* Enfants raccordés au tronc */}
              {u.enfants.map((e, i) => {
                const childX = baseX + childXOffset;
                const childY = childrenStartY + i * childGapY;

                const childCenterX = childX + nodeW / 2;
                const branchY = childY + 28;

                return (
                  <g key={e.id}>
                    <line
                      x1={trunkX}
                      y1={branchY}
                      x2={childCenterX}
                      y2={branchY}
                      stroke="black"
                    />
                    <line
                      x1={childCenterX}
                      y1={branchY}
                      x2={childCenterX}
                      y2={childY}
                      stroke="black"
                    />
                    <PersonNode
                      x={childX}
                      y={childY}
                      person={e}
                      width={nodeW}
                      height={nodeH}
                    />
                  </g>
                );
              })}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
