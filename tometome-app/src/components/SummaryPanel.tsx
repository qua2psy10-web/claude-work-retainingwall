import type { CalcResults, AppInput } from '../types';
import ExportButtons from './ExportButtons';

interface Props {
  results: CalcResults;
  input: AppInput;
  onChange: (next: AppInput) => void;
}

function Chip({ label, ok }: { label: string; ok: boolean }) {
  return (
    <span
      className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
        ok ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
      }`}
    >
      {label} {ok ? '✓' : '✗'}
    </span>
  );
}

export default function SummaryPanel({ results, input, onChange }: Props) {
  const isSupported = input.supportType !== 'cantilever';
  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-white border-b border-gray-200 flex-wrap shrink-0">
      <span className="text-xs text-gray-500 mr-1">照査：</span>
      <Chip label="壁体" ok={results.wallCheck.ok} />
      {isSupported && <Chip label="腹起し" ok={results.walerCheck.ok} />}
      {isSupported && <Chip label="切梁" ok={results.strutCheck.ok} />}
      {results.stability.heaving.applicable && (
        <Chip label="ヒービング" ok={results.stability.heaving.ok} />
      )}
      {results.stability.boiling.applicable && (
        <Chip label="ボイリング" ok={results.stability.boiling.ok} />
      )}
      <Chip label="パイピング" ok={results.stability.piping.ok} />
      <span
        className={`ml-2 text-xs font-bold px-2 py-0.5 rounded ${
          results.allOk ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
        }`}
      >
        {results.allOk ? 'ALL OK' : 'NG あり'}
      </span>
      <div className="ml-auto">
        <ExportButtons input={input} results={results} onChange={onChange} />
      </div>
    </div>
  );
}
