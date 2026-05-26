import type { CalcResults, AppInput } from '../types';

interface Props {
  results: CalcResults;
  input: AppInput;
}

export default function EarthPressureDiagram({ results, input }: Props) {
  const { pressurePoints } = results;
  const L = input.geometry.wallLength;
  if (pressurePoints.length === 0) return null;

  const SVG_W = 180;
  const SVG_H = 280;
  const leftMargin = 45;
  const topMargin = 20;
  const bottomMargin = 20;
  const drawH = SVG_H - topMargin - bottomMargin;
  const scale = drawH / L;

  const maxP = Math.max(...pressurePoints.map((p) => p.pTotal + p.pp), 1);
  const pressureScale = (SVG_W - leftMargin - 10) / maxP;

  const yOf = (depth: number) => topMargin + depth * scale;
  const xOf = (p: number) => leftMargin + p * pressureScale;

  const activePath = pressurePoints
    .map((p, i) => `${i === 0 ? 'M' : 'L'}${xOf(p.pa)},${yOf(p.depth)}`)
    .join(' ');

  const waterPoints = pressurePoints.filter((p) => p.pw > 0);
  const waterPath = waterPoints
    .map((p, i) => `${i === 0 ? 'M' : 'L'}${xOf(p.pw)},${yOf(p.depth)}`)
    .join(' ');

  const passivePoints = pressurePoints.filter((p) => p.pp > 0);
  const passivePath = passivePoints
    .map((p, i) => `${i === 0 ? 'M' : 'L'}${xOf(p.pp)},${yOf(p.depth)}`)
    .join(' ');

  const excavY = yOf(input.geometry.excavationDepth);

  const lastPoint = pressurePoints[pressurePoints.length - 1];
  const firstWaterPoint = waterPoints[0];
  const lastWaterPoint = waterPoints[waterPoints.length - 1];
  const firstPassivePoint = passivePoints[0];
  const lastPassivePoint = passivePoints[passivePoints.length - 1];

  return (
    <div className="bg-white rounded border border-gray-200 p-2 w-48 shrink-0">
      <p className="text-xs font-semibold text-gray-600 mb-1">土圧・水圧分布 (kN/m²)</p>
      <svg width={SVG_W} height={SVG_H} viewBox={`0 0 ${SVG_W} ${SVG_H}`}>
        {/* Axes */}
        <line x1={leftMargin} y1={topMargin} x2={leftMargin} y2={SVG_H - bottomMargin}
          stroke="#333" strokeWidth={1.5} />

        {/* Depth labels */}
        {[0, L / 4, L / 2, (3 * L) / 4, L].map((d) => (
          <text key={d} x={leftMargin - 3} y={yOf(d) + 3} fontSize={7} fill="#666" textAnchor="end">
            -{d.toFixed(1)}
          </text>
        ))}

        {/* Excavation line */}
        <line x1={leftMargin} y1={excavY} x2={SVG_W - 5} y2={excavY}
          stroke="#888" strokeWidth={0.8} strokeDasharray="3,2" />

        {/* Active earth pressure */}
        {activePath && lastPoint && (
          <>
            <path d={`${activePath} L${leftMargin},${yOf(L)} Z`}
              fill="rgba(239,68,68,0.15)" stroke="#ef4444" strokeWidth={1.5} />
            <text x={xOf(lastPoint.pa) + 2}
              y={yOf(L) - 2} fontSize={7} fill="#ef4444">
              {lastPoint.pa.toFixed(0)}
            </text>
          </>
        )}

        {/* Water pressure */}
        {waterPath && firstWaterPoint && lastWaterPoint && (
          <path d={`${waterPath} L${leftMargin},${yOf(lastWaterPoint.depth)} Z`}
            fill="rgba(59,130,246,0.15)" stroke="#3b82f6" strokeWidth={1} />
        )}

        {/* Passive earth pressure */}
        {passivePath && firstPassivePoint && lastPassivePoint && (
          <path d={`${passivePath} L${leftMargin},${yOf(lastPassivePoint.depth)} Z`}
            fill="rgba(34,197,94,0.15)" stroke="#22c55e" strokeWidth={1.5} />
        )}

        {/* Legend */}
        <line x1={leftMargin + 2} y1={topMargin + 5} x2={leftMargin + 12} y2={topMargin + 5} stroke="#ef4444" strokeWidth={2} />
        <text x={leftMargin + 14} y={topMargin + 8} fontSize={7} fill="#ef4444">主働</text>
        <line x1={leftMargin + 2} y1={topMargin + 15} x2={leftMargin + 12} y2={topMargin + 15} stroke="#3b82f6" strokeWidth={2} />
        <text x={leftMargin + 14} y={topMargin + 18} fontSize={7} fill="#3b82f6">水圧</text>
        <line x1={leftMargin + 2} y1={topMargin + 25} x2={leftMargin + 12} y2={topMargin + 25} stroke="#22c55e" strokeWidth={2} />
        <text x={leftMargin + 14} y={topMargin + 28} fontSize={7} fill="#22c55e">受働</text>
      </svg>
    </div>
  );
}
