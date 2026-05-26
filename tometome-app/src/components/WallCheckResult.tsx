import type { CalcResults, AppInput } from '../types';

interface Props {
  results: CalcResults;
  input: AppInput;
}

export default function WallCheckResult({ results, input }: Props) {
  const { wallCheck } = results;
  const ok = wallCheck.ok;

  return (
    <div className="bg-white rounded border border-gray-200 p-4 max-w-lg">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">壁体断面照査</h3>
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
            <td className="border border-gray-200 px-2 py-1">最大曲げモーメント Mmax</td>
            <td className="border border-gray-200 px-2 py-1 text-right">{wallCheck.Mmax.toFixed(2)} kN·m/m</td>
            <td className="border border-gray-200 px-2 py-1 text-right">—</td>
            <td className="border border-gray-200 px-2 py-1 text-center">—</td>
          </tr>
          <tr>
            <td className="border border-gray-200 px-2 py-1">断面係数 Z</td>
            <td className="border border-gray-200 px-2 py-1 text-right">{input.wall.Z} cm³/m</td>
            <td className="border border-gray-200 px-2 py-1 text-right">—</td>
            <td className="border border-gray-200 px-2 py-1 text-center">—</td>
          </tr>
          <tr>
            <td className="border border-gray-200 px-2 py-1">最大応力度 σmax</td>
            <td className="border border-gray-200 px-2 py-1 text-right font-semibold">{wallCheck.sigmaMax.toFixed(1)} N/mm²</td>
            <td className="border border-gray-200 px-2 py-1 text-right">{wallCheck.sigmaAllow.toFixed(0)} N/mm²</td>
            <td className={`border border-gray-200 px-2 py-1 text-center font-bold ${ok ? 'text-green-600' : 'text-red-600'}`}>
              {ok ? 'OK' : 'NG'} ({wallCheck.ratio.toFixed(2)})
            </td>
          </tr>
        </tbody>
      </table>
      <p className="text-xs text-gray-400 mt-2">型番: {input.wall.name}</p>
    </div>
  );
}
