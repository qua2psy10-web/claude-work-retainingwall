import type { CalcResults, AppInput } from '../types';

interface Props {
  results: CalcResults;
  input: AppInput;
}

export default function SupportCheckResult({ results, input }: Props) {
  const { walerCheck, strutCheck, strutReactions } = results;

  if (input.supportType === 'cantilever') {
    return (
      <div className="bg-white rounded border border-gray-200 p-4">
        <p className="text-sm text-gray-500">自立式のため腹起し・切梁の照査はありません。</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 max-w-lg">
      {/* Strut reactions */}
      <div className="bg-white rounded border border-gray-200 p-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-2">切梁反力</h3>
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="bg-gray-50">
              <th className="border border-gray-200 px-2 py-1">段</th>
              <th className="border border-gray-200 px-2 py-1 text-right">深さ GL-</th>
              <th className="border border-gray-200 px-2 py-1 text-right">反力 R (kN/m)</th>
            </tr>
          </thead>
          <tbody>
            {strutReactions.map((sr) => (
              <tr key={sr.level}>
                <td className="border border-gray-200 px-2 py-1 text-center">{sr.level}段目</td>
                <td className="border border-gray-200 px-2 py-1 text-right">{sr.depth.toFixed(1)} m</td>
                <td className="border border-gray-200 px-2 py-1 text-right font-semibold">{sr.R.toFixed(1)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Waler check */}
      <div className="bg-white rounded border border-gray-200 p-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-2">腹起し照査（{input.waler.name}）</h3>
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="bg-gray-50">
              <th className="border border-gray-200 px-2 py-1 text-left">項目</th>
              <th className="border border-gray-200 px-2 py-1 text-right">計算値</th>
              <th className="border border-gray-200 px-2 py-1 text-right">許容値</th>
              <th className="border border-gray-200 px-2 py-1 text-center">判定</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-gray-200 px-2 py-1">最大曲げモーメント Mw</td>
              <td className="border border-gray-200 px-2 py-1 text-right">{walerCheck.Mw.toFixed(2)} kN·m</td>
              <td className="border border-gray-200 px-2 py-1 text-right">—</td>
              <td className="border border-gray-200 px-2 py-1 text-center">—</td>
            </tr>
            <tr>
              <td className="border border-gray-200 px-2 py-1">腹起し応力度 σw</td>
              <td className="border border-gray-200 px-2 py-1 text-right font-semibold">{walerCheck.sigmaW.toFixed(1)} N/mm²</td>
              <td className="border border-gray-200 px-2 py-1 text-right">{walerCheck.sigmaWAllow.toFixed(0)} N/mm²</td>
              <td className={`border border-gray-200 px-2 py-1 text-center font-bold ${walerCheck.ok ? 'text-green-600' : 'text-red-600'}`}>
                {walerCheck.ok ? 'OK' : 'NG'}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Strut check */}
      <div className="bg-white rounded border border-gray-200 p-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-2">切梁照査（{input.strut.name}）</h3>
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="bg-gray-50">
              <th className="border border-gray-200 px-2 py-1 text-left">項目</th>
              <th className="border border-gray-200 px-2 py-1 text-right">計算値</th>
              <th className="border border-gray-200 px-2 py-1 text-right">許容値</th>
              <th className="border border-gray-200 px-2 py-1 text-center">判定</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-gray-200 px-2 py-1">切梁軸力 N</td>
              <td className="border border-gray-200 px-2 py-1 text-right">{strutCheck.N.toFixed(1)} kN</td>
              <td className="border border-gray-200 px-2 py-1 text-right">—</td>
              <td className="border border-gray-200 px-2 py-1 text-center">—</td>
            </tr>
            <tr>
              <td className="border border-gray-200 px-2 py-1">圧縮応力度 σ</td>
              <td className="border border-gray-200 px-2 py-1 text-right font-semibold">{strutCheck.sigma.toFixed(1)} N/mm²</td>
              <td className="border border-gray-200 px-2 py-1 text-right">{strutCheck.sigmaAllow.toFixed(0)} N/mm²</td>
              <td className={`border border-gray-200 px-2 py-1 text-center font-bold ${strutCheck.ok ? 'text-green-600' : 'text-red-600'}`}>
                {strutCheck.ok ? 'OK' : 'NG'}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
