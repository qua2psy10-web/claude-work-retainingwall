import type { CalcResults, AppInput } from '../types';

interface Props {
  results: CalcResults;
  input: AppInput;
}

export default function ForceDiagram({ results, input }: Props) {
  const { forcePoints, strutReactions } = results;
  const L = input.geometry.wallLength;
  if (forcePoints.length === 0) return null;

  const SVG_W = 260;
  const SVG_H = 280;
  const leftMargin = 40;
  const topMargin = 20;
  const bottomMargin = 30;
  const colW = (SVG_W - leftMargin) / 2;
  const drawH = SVG_H - topMargin - bottomMargin;
  const scale = drawH / L;

  const yOf = (depth: number) => topMargin + depth * scale;
  const midX = leftMargin + colW;

  const maxM = Math.max(...forcePoints.map((fp) => Math.abs(fp.M)), 1);
  const maxQ = Math.max(...forcePoints.map((fp) => Math.abs(fp.Q)), 1);
  const mScale = (colW - 10) / maxM;
  const qScale = (colW - 10) / maxQ;

  const mPath = forcePoints
    .map((fp, i) => `${i === 0 ? 'M' : 'L'}${midX + fp.M * mScale},${yOf(fp.depth)}`)
    .join(' ');

  const qMidX = midX + colW;
  const qPath = forcePoints
    .map((fp, i) => `${i === 0 ? 'M' : 'L'}${qMidX + fp.Q * qScale},${yOf(fp.depth)}`)
    .join(' ');

  return (
    <div className="bg-white rounded border border-gray-200 p-2 flex-1 min-w-[260px]">
      <p className="text-xs font-semibold text-gray-600 mb-1">断面力図</p>
      <svg width={SVG_W} height={SVG_H} viewBox={`0 0 ${SVG_W} ${SVG_H}`}>
        {/* Depth axis */}
        <line x1={leftMargin} y1={topMargin} x2={leftMargin} y2={SVG_H - bottomMargin}
          stroke="#333" strokeWidth={1} />
        {[0, L / 4, L / 2, (3 * L) / 4, L].map((d) => (
          <text key={d} x={leftMargin - 3} y={yOf(d) + 3} fontSize={7} fill="#666" textAnchor="end">
            -{d.toFixed(0)}m
          </text>
        ))}

        {/* M diagram */}
        <line x1={midX} y1={topMargin} x2={midX} y2={SVG_H - bottomMargin}
          stroke="#ccc" strokeWidth={0.8} />
        <text x={midX} y={topMargin - 5} fontSize={8} fill="#22c55e" textAnchor="middle">M (kN·m/m)</text>
        {mPath && (
          <path d={`${mPath} L${midX},${yOf(L)} Z`}
            fill="rgba(34,197,94,0.15)" stroke="#22c55e" strokeWidth={1.5} />
        )}
        <text x={midX + 2} y={SVG_H - bottomMargin + 10} fontSize={7} fill="#22c55e">
          {maxM.toFixed(1)}
        </text>

        {/* Q diagram */}
        <line x1={qMidX} y1={topMargin} x2={qMidX} y2={SVG_H - bottomMargin}
          stroke="#ccc" strokeWidth={0.8} />
        <text x={qMidX} y={topMargin - 5} fontSize={8} fill="#a855f7" textAnchor="middle">Q (kN/m)</text>
        {qPath && (
          <path d={`${qPath} L${qMidX},${yOf(L)} Z`}
            fill="rgba(168,85,247,0.12)" stroke="#a855f7" strokeWidth={1.5} />
        )}
        <text x={qMidX + 2} y={SVG_H - bottomMargin + 10} fontSize={7} fill="#a855f7">
          {maxQ.toFixed(1)}
        </text>

        {/* Strut reaction labels */}
        {strutReactions.map((sr) => (
          <text key={sr.level} x={leftMargin + 2} y={yOf(sr.depth) - 2} fontSize={7} fill="#f59e0b">
            R{sr.level}={sr.R.toFixed(1)}kN/m
          </text>
        ))}
      </svg>
    </div>
  );
}
