import { findKinPath, formatNomComplet, getPersonById } from "@/lib/genealogie";

type NodeKind = "male" | "female";

type Node = {
  id: string;
  kind: NodeKind;
  x: number;
  y: number;
  w: number;
  h: number;
  title: string;
  subtitle: string;
};

type Edge = {
  from: { x: number; y: number };
  to: { x: number; y: number };
  label: string;
};

function RectNode({
  x,
  y,
  w,
  h,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
}) {
  return (
    <rect
      x={x}
      y={y}
      width={w}
      height={h}
      rx={12}
      ry={12}
      className="fill-white stroke-black"
    />
  );
}

function ConeNode({
  x,
  y,
  w,
  h,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
}) {
  const topW = w;
  const bottomW = Math.max(40, w * 0.65);
  const dx = (topW - bottomW) / 2;
  const d = `
    M ${x} ${y}
    L ${x + topW} ${y}
    L ${x + topW - dx} ${y + h}
    L ${x + dx} ${y + h}
    Z
  `;
  return <path d={d} className="fill-white stroke-black" />;
}

function Label({
  x,
  y,
  w,
  h,
  title,
  subtitle,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  title: string;
  subtitle: string;
}) {
  return (
    <>
      <text
        x={x + w / 2}
        y={y + h / 2 - 2}
        textAnchor="middle"
        className="fill-black text-[12px] font-semibold"
      >
        {title}
      </text>
      {subtitle ? (
        <text
          x={x + w / 2}
          y={y + h / 2 + 14}
          textAnchor="middle"
          className="fill-black text-[11px]"
        >
          {subtitle}
        </text>
      ) : null}
    </>
  );
}

function EdgeLine({ e }: { e: Edge }) {
  return (
    <>
      <line
        x1={e.from.x}
        y1={e.from.y}
        x2={e.to.x}
        y2={e.to.y}
        className="stroke-black"
      />
      <text
        x={(e.from.x + e.to.x) / 2}
        y={(e.from.y + e.to.y) / 2 - 6}
        textAnchor="middle"
        className="fill-black text-[11px]"
      >
        {e.label}
      </text>
    </>
  );
}

export default function RelationDiagram({
  aId,
  bId,
}: {
  aId: string;
  bId: string;
}) {
  const A = aId.trim();
  const B = bId.trim();

  const path = findKinPath(A, B);
  if (path === null)
    return (
      <div className="text-red-600">
        Aucun chemin trouvé entre ces deux personnes.
      </div>
    );

  // Construit la liste d'IDs du chemin : A -> ... -> B
  const ids: string[] = [A];
  for (const step of path) ids.push(step.toId);

  // Dimensions
  const nodeW = 240;
  const nodeH = 64;
  const gapX = 60;

  const canvasW = ids.length * nodeW + (ids.length - 1) * gapX + 80;
  const canvasH = 220;
  const startX = 40;
  const y = 80;

  // Noeuds
  const nodes: Node[] = ids.map((id, i) => {
    const p = getPersonById(id);
    const title = p ? formatNomComplet(p) : id;
    const subtitle = p?.clan ?? "";
    const kind: NodeKind = p?.sexe === "f" ? "female" : "male";

    return {
      id,
      kind,
      x: startX + i * (nodeW + gapX),
      y,
      w: nodeW,
      h: nodeH,
      title,
      subtitle,
    };
  });

  // Lignes (avec label: père / mère / enfant)
  const edges: Edge[] = [];
  for (let i = 0; i < path.length; i++) {
    const from = nodes[i];
    const to = nodes[i + 1];
    const label =
      path[i].type === "pere"
        ? "père"
        : path[i].type === "mere"
        ? "mère"
        : "enfant";

    edges.push({
      from: { x: from.x + from.w, y: from.y + from.h / 2 },
      to: { x: to.x, y: to.y + to.h / 2 },
      label,
    });
  }

  return (
    <div className="w-full overflow-auto border rounded-xl bg-white">
      <svg width={canvasW} height={canvasH} className="block">
        {edges.map((e, i) => (
          <EdgeLine key={i} e={e} />
        ))}

        {nodes.map((n) => (
          <g key={n.id}>
            {n.kind === "female" ? (
              <ConeNode x={n.x} y={n.y} w={n.w} h={n.h} />
            ) : (
              <RectNode x={n.x} y={n.y} w={n.w} h={n.h} />
            )}
            <Label
              x={n.x}
              y={n.y}
              w={n.w}
              h={n.h}
              title={n.title}
              subtitle={n.subtitle}
            />
          </g>
        ))}
      </svg>
    </div>
  );
}
