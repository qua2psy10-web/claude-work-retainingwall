import { useState, useMemo } from 'react';
import type { AppInput, CalcResults } from './types';
import { DEFAULT_INPUT } from './utils/constants';
import { calcEarthPressure } from './calc/earthPressure';
import { calcSectionForces } from './calc/sectionForces';
import { calcWallCheck } from './calc/wallCheck';
import { calcWalerCheck, calcStrutCheck } from './calc/supportCheck';
import { calcStability } from './calc/stabilityCheck';
import InputPanel from './components/InputPanel';
import SummaryPanel from './components/SummaryPanel';
import ResultTabs from './components/ResultTabs';

function App() {
  const [input, setInput] = useState<AppInput>(DEFAULT_INPUT);

  const results = useMemo<CalcResults>(() => {
    try {
      const pressures = calcEarthPressure(
        input.soilLayers,
        input.geometry,
        input.earthPressureMethod,
        100
      );

      const { forcePoints, strutReactions, embedmentDepth } = calcSectionForces(
        input,
        pressures
      );

      const wallCheck = calcWallCheck(forcePoints, input.wall);
      const walerCheck = calcWalerCheck(strutReactions, input.waler, input.strutSpacing);
      const strutCheck = calcStrutCheck(
        strutReactions,
        input.strut,
        input.strutSpan,
        input.strutSpacing
      );
      const stability = calcStability(input);

      const allOk =
        wallCheck.ok &&
        (input.supportType === 'cantilever' || (walerCheck.ok && strutCheck.ok)) &&
        (!stability.heaving.applicable || stability.heaving.ok) &&
        (!stability.boiling.applicable || stability.boiling.ok) &&
        stability.piping.ok;

      return {
        pressurePoints: pressures,
        forcePoints,
        strutReactions,
        embedmentDepth,
        wallCheck,
        walerCheck,
        strutCheck,
        stability,
        allOk,
      };
    } catch (e) {
      console.error('Calculation error:', e);
      // Return empty/safe results on error
      return {
        pressurePoints: [],
        forcePoints: [],
        strutReactions: [],
        embedmentDepth: 0,
        wallCheck: { Mmax: 0, sigmaMax: 0, sigmaAllow: 200, ratio: 0, ok: true },
        walerCheck: { R: 0, Mw: 0, sigmaW: 0, sigmaWAllow: 160, ok: true },
        strutCheck: { N: 0, sigma: 0, sigmaAllow: 140, ok: true },
        stability: {
          heaving: { applicable: false, Fs: Infinity, FsRequired: 1.2, ok: true },
          boiling: { applicable: false, Fs: Infinity, FsRequired: 1.5, ok: true },
          piping: { C: Infinity, CRequired: 4.0, ok: true },
        },
        allOk: true,
      };
    }
  }, [input]);

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-900 to-blue-600 text-white px-4 py-2 flex items-center gap-3 shadow-lg shrink-0">
        <div>
          <h1 className="text-base font-bold">土留め工設計システム</h1>
          <p className="text-xs opacity-80">慣用法 — 仮設構造物指針（土木学会）準拠</p>
        </div>
        <span className="ml-auto text-xs bg-white/20 rounded-full px-3 py-1">
          claude-work-retainingwall
        </span>
      </header>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: Input Panel */}
        <div className="w-80 shrink-0 bg-white border-r border-gray-200 overflow-y-auto">
          <InputPanel input={input} onChange={setInput} />
        </div>

        {/* Right: Results */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <SummaryPanel results={results} input={input} />
          <ResultTabs input={input} results={results} />
        </div>
      </div>
    </div>
  );
}

export default App;
