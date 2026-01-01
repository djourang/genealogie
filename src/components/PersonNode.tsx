// src/components/PersonNode.tsx
import { Person } from "@/lib/genealogie";

type Props = {
  x: number;
  y: number;
  person?: Person | null;
  sexeHint?: "m" | "f";
  width?: number;
  height?: number;
};

export default function PersonNode({
  x,
  y,
  person,
  sexeHint,
  width = 260, // ✅ plus large
  height = 80, // ✅ plus haut
}: Props) {
  const sexe = person?.sexe ?? sexeHint ?? "m";

  const nom = (person?.nom ?? "").trim();
  const pere = (person?.nomPere ?? "").trim();
  const gp = (person?.nomGrandPere ?? "").trim();
  const clan = (person?.clan ?? "").trim();

  const topLine = [nom, pere, gp].filter((s) => s.length > 0).join("   ");
  const showTop = topLine.length > 0;
  const showClan = clan.length > 0;

  if (sexe === "m") {
    return (
      <g>
        <rect
          x={x}
          y={y}
          width={width}
          height={height}
          rx={8}
          fill="#f3f4f6"
          stroke="#000"
        />
        {showTop && (
          <text x={x + width / 2} y={y + 30} textAnchor="middle">
            {topLine}
          </text>
        )}
        {showClan && (
          <text x={x + width / 2} y={y + 58} fontSize="12" textAnchor="middle">
            {clan}
          </text>
        )}
      </g>
    );
  }

  return (
    <g>
      <ellipse
        cx={x + width / 2}
        cy={y + height / 2}
        rx={width / 2} // ✅ s’élargit automatiquement si width augmente
        ry={height / 2} // ✅ s’agrandit verticalement si height augmente
        fill="#fff7ed"
        stroke="#000"
      />
      {showTop && (
        <text x={x + width / 2} y={y + 30} textAnchor="middle">
          {topLine}
        </text>
      )}
      {showClan && (
        <text x={x + width / 2} y={y + 58} fontSize="12" textAnchor="middle">
          {clan}
        </text>
      )}
    </g>
  );
}
