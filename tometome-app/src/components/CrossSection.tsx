import type { AppInput, CalcResults } from '../types';

interface Props {
  input: AppInput;
  results: CalcResults;
}

export default function CrossSection({ input, results: _results }: Props) {
  const { geometry, strutPositions, supportType, soilLayers } = input;
  const H = geometry.excavationDepth;
  const L = geometry.wallLength;
  const hw = geometry.waterTableDepth;

  const SVG_H = 280;
  const SVG_W = 180;
  const topMargin = 20;
  const bottomMargin = 20;
  const drawH = SVG_H - topMargin - bottomMargin;
  const scale = drawH / L;

  const yOf = (depth: number) => topMargin + depth * scale;

  return (
    <div className="bg-white rounded border border-gray-200 p-2 w-44 shrink-0">
      <p className="text-xs font-semibold text-gray-600 mb-1">断面図</p>
      <svg width={SVG_W} height={SVG_H} viewBox={`0 0 ${SVG_W} ${SVG_H}`}>
        {/* Soil background */}
        <rect x={0} y={topMargin} width={SVG_W} height={drawH} fill="#e8d5b7" opacity={0.4} />

        {/* Layer boundaries */}
        {(() => {
          let cumD = 0;
          return soilLayers.slice(0, -1).map((l, i) => {
            cumD += l.thickness;
            return (
              <line key={i} x1={0} y1={yOf(cumD)} x2={SVG_W} y2={yOf(cumD)}
                stroke="#c4a882" strokeWidth={1} strokeDasharray="4,2" />
            );
          });
        })()}

        {/* Excavation side (left) */}
        <rect x={0} y={yOf(H)} width={80} height={drawH - H * scale} fill="#f0f0f0" opacity={0.6} />

        {/* Ground surface lines */}
        <line x1={0} y1={yOf(0)} x2={80} y2={yOf(0)} stroke="#8B6914" strokeWidth={1.5} strokeDasharray="5,2" />
        <line x1={100} y1={yOf(0)} x2={SVG_W} y2={yOf(0)} stroke="#8B6914" strokeWidth={1.5} strokeDasharray="5,2" />
        <text x={2} y={yOf(0) - 3} fontSize={8} fill="#8B6914">GL</text>

        {/* Excavation bottom */}
        <line x1={0} y1={yOf(H)} x2={82} y2={yOf(H)} stroke="#666" strokeWidth={1} strokeDasharray="3,2" />
        <text x={2} y={yOf(H) - 2} fontSize={7} fill="#555">掘削底</text>

        {/* Water table */}
        {hw < L && (
          <>
            <line x1={0} y1={yOf(hw)} x2={82} y2={yOf(hw)} stroke="#3b82f6" strokeWidth={1} strokeDasharray="4,2" opacity={0.8} />
            <text x={2} y={yOf(hw) - 2} fontSize={7} fill="#3b82f6">hw</text>
          </>
        )}

        {/* Wall */}
        <rect x={82} y={yOf(0) - 8} width={8} height={drawH + 8} fill="#2563eb" rx={1} />

        {/* Struts */}
        {supportType !== 'cantilever' && strutPositions.map((sp, i) => (
          <g key={i}>
            <line x1={10} y1={yOf(sp.depth)} x2={82} y2={yOf(sp.depth)}
              stroke="#f59e0b" strokeWidth={4} strokeLinecap="round" />
            <circle cx={82} cy={yOf(sp.depth)} r={3} fill="#f59e0b" />
            <text x={14} y={yOf(sp.depth) - 2} fontSize={7} fill="#d97706">{i + 1}段</text>
          </g>
        ))}

        {/* Dimension: H */}
        <line x1={155} y1={yOf(0)} x2={155} y2={yOf(H)} stroke="#999" strokeWidth={0.8} />
        <line x1={151} y1={yOf(0)} x2={159} y2={yOf(0)} stroke="#999" strokeWidth={0.8} />
        <line x1={151} y1={yOf(H)} x2={159} y2={yOf(H)} stroke="#999" strokeWidth={0.8} />
        <text x={158} y={yOf(H / 2)} fontSize={8} fill="#666">H={H}m</text>

        {/* Embedment depth */}
        <line x1={165} y1={yOf(H)} x2={165} y2={yOf(L)} stroke="#aaa" strokeWidth={0.8} />
        <line x1={161} y1={yOf(H)} x2={169} y2={yOf(H)} stroke="#aaa" strokeWidth={0.8} />
        <line x1={161} y1={yOf(L)} x2={169} y2={yOf(L)} stroke="#aaa" strokeWidth={0.8} />
        <text x={168} y={yOf((H + L) / 2)} fontSize={7} fill="#aaa">D={(L - H).toFixed(1)}m</text>
      </svg>
    </div>
  );
}
