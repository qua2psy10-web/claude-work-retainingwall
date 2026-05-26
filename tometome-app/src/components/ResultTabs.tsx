import { useState } from 'react';
import type { AppInput, CalcResults } from '../types';
import CrossSection from './CrossSection';
import EarthPressureDiagram from './EarthPressureDiagram';
import ForceDiagram from './ForceDiagram';
import WallCheckResult from './WallCheckResult';
import SupportCheckResult from './SupportCheckResult';
import StabilityResultPanel from './StabilityResult';

interface Props {
  input: AppInput;
  results: CalcResults;
}

const TABS = ['土圧・断面力図', '壁体照査', '腹起し・切梁', '安定性照査'] as const;
type TabName = (typeof TABS)[number];

export default function ResultTabs({ input, results }: Props) {
  const [activeTab, setActiveTab] = useState<TabName>('土圧・断面力図');

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Tab bar */}
      <div className="flex border-b-2 border-gray-200 bg-white px-3 shrink-0">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3 py-2 text-xs font-medium whitespace-nowrap border-b-2 -mb-0.5 transition-colors ${
              activeTab === tab
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-auto p-3 bg-gray-50">
        {activeTab === '土圧・断面力図' && (
          <div className="flex gap-3 h-full">
            <CrossSection input={input} results={results} />
            <EarthPressureDiagram results={results} input={input} />
            <ForceDiagram results={results} input={input} />
          </div>
        )}
        {activeTab === '壁体照査' && <WallCheckResult results={results} input={input} />}
        {activeTab === '腹起し・切梁' && <SupportCheckResult results={results} input={input} />}
        {activeTab === '安定性照査' && <StabilityResultPanel results={results} />}
      </div>
    </div>
  );
}
