import type { CalcResults } from '../types';

interface Props {
  results: CalcResults;
}

function StabilityRow({
  name,
  applicable,
  Fs,
  FsRequired,
  ok,
}: {
  name: string;
  applicable: boolean;
  Fs: number;
  FsRequired: number;
  ok: boolean;
}) {
  if (!applicable) {
    return (
      <tr>
        <td className="border border-gray-200 px-2 py-1">{name}</td>
        <td className="border border-gray-200 px-2 py-1 text-center text-gray-400" colSpan={3}>
          非適用（地盤条件より除外）
        </td>
      </tr>
    );
  }
  return (
    <tr>
      <td className="border border-gray-200 px-2 py-1">{name}</td>
      <td className="border border-gray-200 px-2 py-1 text-right font-semibold">
        {isFinite(Fs) ? Fs.toFixed(2) : '∞'}
      </td>
      <td className="border border-gray-200 px-2 py-1 text-right">{FsRequired.toFixed(1)}</td>
      <td className={`border border-gray-200 px-2 py-1 text-center font-bold ${ok ? 'text-green-600' : 'text-red-600'}`}>
        {ok ? 'OK' : 'NG'}
      </td>
    </tr>
  );
}

export default function StabilityResultPanel({ results }: Props) {
  const { heaving, boiling, piping } = results.stability;

  return (
    <div className="bg-white rounded border border-gray-200 p-4 max-w-lg">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">安定性照査</h3>
      <table className="w-full text-xs border-collapse">
        <thead>
          <tr className="bg-gray-50">
            <th className="border border-gray-200 px-2 py-1 text-left">照査項目</th>
            <th className="border border-gray-200 px-2 py-1 text-right">計算値</th>
            <th className="border border-gray-200 px-2 py-1 text-right">必要値</th>
            <th className="border border-gray-200 px-2 py-1 text-center">判定</th>
          </tr>
        </thead>
        <tbody>
          <StabilityRow
            name="ヒービング（Terzaghi 式）"
            applicable={heaving.applicable}
            Fs={heaving.Fs}
            FsRequired={heaving.FsRequired}
            ok={heaving.ok}
          />
          <StabilityRow
            name="ボイリング"
            applicable={boiling.applicable}
            Fs={boiling.Fs}
            FsRequired={boiling.FsRequired}
            ok={boiling.ok}
          />
          <tr>
            <td className="border border-gray-200 px-2 py-1">パイピング（レーン法）浸透路長比 C</td>
            <td className="border border-gray-200 px-2 py-1 text-right font-semibold">
              {isFinite(piping.C) ? piping.C.toFixed(2) : '∞'}
            </td>
            <td className="border border-gray-200 px-2 py-1 text-right">{piping.CRequired.toFixed(1)}</td>
            <td className={`border border-gray-200 px-2 py-1 text-center font-bold ${piping.ok ? 'text-green-600' : 'text-red-600'}`}>
              {piping.ok ? 'OK' : 'NG'}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}
