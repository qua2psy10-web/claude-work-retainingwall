import { useRef, useState } from 'react';
import type { AppInput, CalcResults } from '../types';
import * as XLSX from 'xlsx';

interface Props {
  input: AppInput;
  results: CalcResults;
  onChange: (next: AppInput) => void;
}

function exportToExcel(input: AppInput, results: CalcResults) {
  const wb = XLSX.utils.book_new();

  // Sheet 1: 入力条件
  const inputData = [
    ['項目', '値', '単位'],
    ['壁体工法', input.methodType, ''],
    ['支保工形式', input.supportType, ''],
    ['土圧計算式', input.earthPressureMethod, ''],
    ['掘削深さ H', input.geometry.excavationDepth, 'm'],
    ['壁体長 L', input.geometry.wallLength, 'm'],
    ['掘削幅 B', input.geometry.excavationWidth, 'm'],
    ['地下水位 hw', input.geometry.waterTableDepth, 'm'],
    ['上載荷重 q', input.geometry.surcharge, 'kN/m²'],
    ['壁体型番', input.wall.name, ''],
    ['断面係数 Z', input.wall.Z, 'cm³/m'],
    ['許容応力度 σa', input.wall.allowableStress, 'N/mm²'],
  ];
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(inputData), '入力条件');

  // Sheet 2: 断面力
  const forceData = [
    ['深度 (m)', '曲げモーメント M (kN·m/m)', 'せん断力 Q (kN/m)'],
    ...results.forcePoints.map((fp) => [fp.depth.toFixed(2), fp.M.toFixed(3), fp.Q.toFixed(3)]),
  ];
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(forceData), '断面力');

  // Sheet 3: 照査結果
  const checkData = [
    ['照査項目', '計算値', '許容値', '判定'],
    ['壁体 σmax (N/mm²)', results.wallCheck.sigmaMax.toFixed(1), results.wallCheck.sigmaAllow.toFixed(0), results.wallCheck.ok ? 'OK' : 'NG'],
    ['腹起し σw (N/mm²)', results.walerCheck.sigmaW.toFixed(1), results.walerCheck.sigmaWAllow.toFixed(0), results.walerCheck.ok ? 'OK' : 'NG'],
    ['切梁 σ (N/mm²)', results.strutCheck.sigma.toFixed(1), results.strutCheck.sigmaAllow.toFixed(0), results.strutCheck.ok ? 'OK' : 'NG'],
    ['ヒービング Fs', results.stability.heaving.applicable ? results.stability.heaving.Fs.toFixed(2) : 'N/A', results.stability.heaving.FsRequired.toFixed(1), results.stability.heaving.ok ? 'OK' : 'NG'],
    ['ボイリング Fs', results.stability.boiling.applicable ? results.stability.boiling.Fs.toFixed(2) : 'N/A', results.stability.boiling.FsRequired.toFixed(1), results.stability.boiling.ok ? 'OK' : 'NG'],
    ['パイピング C', isFinite(results.stability.piping.C) ? results.stability.piping.C.toFixed(2) : '∞', results.stability.piping.CRequired.toFixed(1), results.stability.piping.ok ? 'OK' : 'NG'],
  ];
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(checkData), '照査結果');

  XLSX.writeFile(wb, '土留め工設計結果.xlsx');
}

function exportToJson(input: AppInput) {
  const json = JSON.stringify(input, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = '土留め工入力データ.json';
  a.click();
  URL.revokeObjectURL(url);
}

export default function ExportButtons({ input, results, onChange }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loadMsg, setLoadMsg] = useState<string | null>(null);

  function handleJsonLoad(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const loaded = JSON.parse(ev.target?.result as string) as AppInput;
        onChange(loaded);
        setLoadMsg('✓ 読み込み完了');
        setTimeout(() => setLoadMsg(null), 2000);
      } catch {
        setLoadMsg('⚠ 読み込み失敗');
        setTimeout(() => setLoadMsg(null), 2000);
      }
      // Reset input so same file can be reloaded
      if (fileInputRef.current) fileInputRef.current.value = '';
    };
    reader.readAsText(file);
  }

  return (
    <div className="flex items-center gap-1">
      {loadMsg && (
        <span className="text-xs text-gray-500 mr-1">{loadMsg}</span>
      )}
      <button
        onClick={() => exportToExcel(input, results)}
        className="text-xs bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded font-semibold"
        title="Excel出力（断面力・照査結果）"
      >
        📥 Excel
      </button>
      <button
        onClick={() => exportToJson(input)}
        className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded"
        title="入力データを JSON で保存"
      >
        💾 保存
      </button>
      <button
        onClick={() => fileInputRef.current?.click()}
        className="text-xs bg-gray-500 hover:bg-gray-600 text-white px-2 py-1 rounded"
        title="JSON ファイルを読み込む"
      >
        📂 読込
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        className="hidden"
        onChange={handleJsonLoad}
      />
    </div>
  );
}
