"use client";

import React, { useMemo } from "react";
import { useRouter } from "next/navigation";
import PersonNode from "@/components/PersonNode";
import { findKinPath, getPersonById, KinStep } from "@/lib/genealogie";

type Edge = {
  from: { x: number; y: number };
  to: { x: number; y: number };
};

function midIndex(len: number) {
  if (len <= 1) return 0;
  return Math.floor((len - 1) / 2);
}

export default function KinPathDiagram({
  aId,
  bId,
  focusId,
}: {
  aId: string;
  bId: string;
  focusId?: string; // ✅ pivot à mettre en évidence
}) {
  const router = useRouter();

  const path = useMemo(() => findKinPath(aId, bId), [aId, bId]);
  if (path === null) {
    return (
      <div className="text-red-600">
        Aucun chemin trouvé entre ces deux personnes.
      </div>
    );
  }

  const ids = useMemo(() => {
    const list: string[] = [aId];
    for (const step of path as KinStep[]) list.push(step.toId);
    return list;
  }, [aId, path]);

  const focus = focusId ?? ids[midIndex(ids.length)];

  // Layout
  const nodeW = 260;
  const nodeH = 80;
  const gapX = 80;

  const startX = 40;
  const y = 70;

  const canvasW = ids.length * nodeW + (ids.length - 1) * gapX + 2 * startX;
  const canvasH = 240;

  const nodes = ids.map((id, i) => {
    const p = getPersonById(id);
    return {
      id,
      x: startX + i * (nodeW + gapX),
      y,
      w: nodeW,
      h: nodeH,
      p,
      isFocus: id === focus,
      isEnd: id === aId || id === bId,
    };
  });

  const edges: Edge[] = [];
  for (let i = 0; i < nodes.length - 1; i++) {
    const from = nodes[i];
    const to = nodes[i + 1];
    edges.push({
      from: { x: from.x + from.w, y: from.y + from.h / 2 },
      to: { x: to.x, y: to.y + to.h / 2 },
    });
  }

  return (
    <div className="w-full overflow-auto border rounded-2xl bg-white">
      <svg width={canvasW} height={canvasH} className="block">
        {/* Lignes */}
        {edges.map((e, i) => (
          <line
            key={i}
            x1={e.from.x}
            y1={e.from.y}
            x2={e.to.x}
            y2={e.to.y}
            className="stroke-black"
          />
        ))}

        {/* Nodes */}
        {nodes.map((n) => (
          <g
            key={n.id}
            style={{ cursor: "pointer" }}
            onClick={() => router.push(`/personne/${encodeURIComponent(n.id)}`)}
          >
            {/* Halo d’emphase autour du pivot */}
            {n.isFocus ? (
              <rect
                x={n.x - 10}
                y={n.y - 10}
                width={n.w + 20}
                height={n.h + 20}
                rx={18}
                ry={18}
                fill="none"
                stroke="black"
                strokeWidth={3}
              />
            ) : null}

            {/* petite emphase sur A et B */}
            {n.isEnd && !n.isFocus ? (
              <rect
                x={n.x - 6}
                y={n.y - 6}
                width={n.w + 12}
                height={n.h + 12}
                rx={16}
                ry={16}
                fill="none"
                stroke="black"
                strokeWidth={1}
                opacity={0.35}
              />
            ) : null}

            <PersonNode
              x={n.x}
              y={n.y}
              width={n.w}
              height={n.h}
              person={n.p}
              sexeHint="m"
            />
          </g>
        ))}

        {/* Label pivot en bas */}
        <text
          x={canvasW / 2}
          y={canvasH - 20}
          textAnchor="middle"
          className="fill-black text-[12px]"
        >
          Pivot du lien : {focus}
        </text>
      </svg>
    </div>
  );
}
