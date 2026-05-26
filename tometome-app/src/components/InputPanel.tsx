import { useState } from 'react';
import type { AppInput, SoilLayer } from '../types';
import {
  SHEET_PILE_TABLE,
  H_STEEL_TABLE,
  STRUT_TABLE,
} from '../utils/constants';

interface Props {
  input: AppInput;
  onChange: (next: AppInput) => void;
}

function Section({
  title,
  num,
  children,
}: {
  title: string;
  num: number;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(true);
  return (
    <div className="border-b border-gray-100">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-2 px-3 py-2 bg-gray-50 hover:bg-gray-100 text-left"
      >
        <span className="w-5 h-5 rounded bg-blue-500 text-white text-xs flex items-center justify-center font-bold shrink-0">
          {num}
        </span>
        <span className="text-xs font-semibold text-gray-700">{title}</span>
        <span className="ml-auto text-gray-400 text-xs">{open ? '▲' : '▼'}</span>
      </button>
      {open && <div className="px-3 py-2">{children}</div>}
    </div>
  );
}

function Row({
  label,
  children,
  unit,
}: {
  label: string;
  children: React.ReactNode;
  unit?: string;
}) {
  return (
    <div className="flex items-center gap-1 mb-1">
      <label className="w-28 text-xs text-gray-500 shrink-0">{label}</label>
      {children}
      {unit && <span className="text-xs text-gray-400 w-10">{unit}</span>}
    </div>
  );
}

const inputCls =
  'flex-1 h-6 border border-gray-200 rounded px-1.5 text-xs bg-gray-50 focus:outline-none focus:border-blue-400';
const selectCls =
  'flex-1 h-6 border border-gray-200 rounded px-1 text-xs bg-gray-50 focus:outline-none focus:border-blue-400';

export default function InputPanel({ input, onChange }: Props) {
  function set<K extends keyof AppInput>(key: K, value: AppInput[K]) {
    onChange({ ...input, [key]: value });
  }

  function setGeometry<K extends keyof AppInput['geometry']>(
    key: K,
    value: AppInput['geometry'][K]
  ) {
    onChange({ ...input, geometry: { ...input.geometry, [key]: value } });
  }

  function setSoilLayer(index: number, field: keyof SoilLayer, value: number) {
    const layers = input.soilLayers.map((l, i) =>
      i === index ? { ...l, [field]: value, gammaSub: field === 'gamma' ? value - 9.8 : l.gammaSub } : l
    );
    onChange({ ...input, soilLayers: layers });
  }

  function addSoilLayer() {
    onChange({
      ...input,
      soilLayers: [
        ...input.soilLayers,
        { thickness: 5.0, gamma: 18.0, gammaSub: 8.2, phi: 30, c: 0, wallFriction: 15 },
      ],
    });
  }

  function removeSoilLayer(index: number) {
    if (input.soilLayers.length <= 1) return;
    onChange({ ...input, soilLayers: input.soilLayers.filter((_, i) => i !== index) });
  }

  const strutCount =
    input.supportType === 'cantilever' ? 0 :
    input.supportType === 'strut-1' ? 1 :
    input.strutPositions.length;

  function setStrutCount(n: number) {
    const positions = Array.from({ length: n }, (_, i) =>
      input.strutPositions[i] ?? { depth: (i + 1) * (input.geometry.excavationDepth / (n + 1)) }
    );
    set('strutPositions', positions);
  }

  return (
    <div className="text-xs">
      {/* 1. 工法選択 */}
      <Section num={1} title="工法・支保工選択">
        <Row label="壁体工法">
          <select className={selectCls} value={input.methodType} onChange={(e) => set('methodType', e.target.value as AppInput['methodType'])}>
            <option value="sheet-pile">鋼矢板</option>
            <option value="h-pile">親杭横矢板（H形鋼）</option>
            <option value="soldier">柱列式地中連続壁</option>
          </select>
        </Row>
        <Row label="支保工形式">
          <select className={selectCls} value={input.supportType} onChange={(e) => {
            const v = e.target.value as AppInput['supportType'];
            let positions = input.strutPositions;
            if (v === 'strut-1' && input.strutPositions.length !== 1) {
              positions = [{ depth: input.geometry.excavationDepth / 2 }];
            } else if (v === 'strut-multi' && input.strutPositions.length < 2) {
              positions = [
                { depth: input.geometry.excavationDepth / 3 },
                { depth: (input.geometry.excavationDepth * 2) / 3 },
              ];
            }
            onChange({ ...input, supportType: v, strutPositions: positions });
          }}>
            <option value="cantilever">自立式（カンチレバー）</option>
            <option value="strut-1">1段切梁 / アンカー</option>
            <option value="strut-multi">多段切梁 / アンカー</option>
          </select>
        </Row>
        <Row label="土圧計算式">
          <select className={selectCls} value={input.earthPressureMethod} onChange={(e) => set('earthPressureMethod', e.target.value as AppInput['earthPressureMethod'])}>
            <option value="rankine">ランキン式</option>
            <option value="coulomb">クーロン式</option>
          </select>
        </Row>
      </Section>

      {/* 2. 掘削・壁体寸法 */}
      <Section num={2} title="掘削・壁体寸法">
        <Row label="掘削深さ H" unit="m">
          <input className={inputCls} type="number" step="0.1" value={input.geometry.excavationDepth}
            onChange={(e) => setGeometry('excavationDepth', parseFloat(e.target.value) || 0)} />
        </Row>
        <Row label="壁体長 L" unit="m">
          <input className={inputCls} type="number" step="0.1" value={input.geometry.wallLength}
            onChange={(e) => setGeometry('wallLength', parseFloat(e.target.value) || 0)} />
        </Row>
        <Row label="掘削幅 B" unit="m">
          <input className={inputCls} type="number" step="0.1" value={input.geometry.excavationWidth}
            onChange={(e) => setGeometry('excavationWidth', parseFloat(e.target.value) || 0)} />
        </Row>
        <Row label="地下水位 hw" unit="m">
          <input className={inputCls} type="number" step="0.1" value={input.geometry.waterTableDepth}
            onChange={(e) => setGeometry('waterTableDepth', parseFloat(e.target.value) || 0)} />
        </Row>
        <Row label="上載荷重 q" unit="kN/m²">
          <input className={inputCls} type="number" step="1" value={input.geometry.surcharge}
            onChange={(e) => setGeometry('surcharge', parseFloat(e.target.value) || 0)} />
        </Row>
      </Section>

      {/* 3. 支保工位置 */}
      {input.supportType !== 'cantilever' && (
        <Section num={3} title="支保工位置">
          {input.supportType === 'strut-multi' && (
            <Row label="支保段数">
              <select className={selectCls} value={strutCount} onChange={(e) => setStrutCount(parseInt(e.target.value))}>
                {[2, 3, 4, 5].map((n) => <option key={n} value={n}>{n}段</option>)}
              </select>
            </Row>
          )}
          {input.strutPositions.map((sp, i) => (
            <Row key={i} label={`${i + 1}段目 GL-`} unit="m">
              <input className={inputCls} type="number" step="0.1" value={sp.depth}
                onChange={(e) => {
                  const positions = input.strutPositions.map((p, j) =>
                    j === i ? { depth: parseFloat(e.target.value) || 0 } : p
                  );
                  set('strutPositions', positions);
                }} />
            </Row>
          ))}
        </Section>
      )}

      {/* 4. 地盤条件 */}
      <Section num={4} title="地盤条件（土層）">
        {input.soilLayers.map((layer, i) => {
          const topDepth = input.soilLayers.slice(0, i).reduce((s, l) => s + l.thickness, 0);
          return (
            <div key={i} className="bg-blue-50 border border-blue-100 rounded p-2 mb-2">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-blue-700">
                  第{i + 1}層（GL-{topDepth.toFixed(1)} 〜 -{(topDepth + layer.thickness).toFixed(1)}m）
                </span>
                {input.soilLayers.length > 1 && (
                  <button onClick={() => removeSoilLayer(i)} className="text-red-400 text-xs hover:text-red-600">✕</button>
                )}
              </div>
              <Row label="層厚" unit="m">
                <input className={inputCls} type="number" step="0.5" value={layer.thickness}
                  onChange={(e) => setSoilLayer(i, 'thickness', parseFloat(e.target.value) || 0)} />
              </Row>
              <Row label="単位重量 γ" unit="kN/m³">
                <input className={inputCls} type="number" step="0.5" value={layer.gamma}
                  onChange={(e) => setSoilLayer(i, 'gamma', parseFloat(e.target.value) || 0)} />
              </Row>
              <Row label="内部摩擦角 φ" unit="°">
                <input className={inputCls} type="number" step="1" value={layer.phi}
                  onChange={(e) => setSoilLayer(i, 'phi', parseFloat(e.target.value) || 0)} />
              </Row>
              <Row label="粘着力 c" unit="kN/m²">
                <input className={inputCls} type="number" step="1" value={layer.c}
                  onChange={(e) => setSoilLayer(i, 'c', parseFloat(e.target.value) || 0)} />
              </Row>
              <Row label="壁摩擦角 δ" unit="°">
                <input className={inputCls} type="number" step="1" value={layer.wallFriction}
                  onChange={(e) => setSoilLayer(i, 'wallFriction', parseFloat(e.target.value) || 0)} />
              </Row>
            </div>
          );
        })}
        <button
          onClick={addSoilLayer}
          className="text-xs text-blue-500 hover:text-blue-700 mt-1"
        >
          ＋ 土層を追加
        </button>
      </Section>

      {/* 5. 壁体諸元 */}
      <Section num={5} title="壁体諸元">
        <Row label="型番">
          <select className={selectCls} value={input.wall.name} onChange={(e) => {
            const found = SHEET_PILE_TABLE.find((w) => w.name === e.target.value);
            if (found) set('wall', found);
          }}>
            {SHEET_PILE_TABLE.map((w) => <option key={w.name} value={w.name}>{w.name}</option>)}
          </select>
        </Row>
        <Row label="断面係数 Z" unit="cm³/m">
          <input className={inputCls + ' bg-gray-100'} readOnly value={input.wall.Z} />
        </Row>
        <Row label="許容応力度 σa" unit="N/mm²">
          <input className={inputCls} type="number" value={input.wall.allowableStress}
            onChange={(e) => set('wall', { ...input.wall, allowableStress: parseFloat(e.target.value) || 0 })} />
        </Row>
      </Section>

      {/* 6. 腹起し・切梁 */}
      {input.supportType !== 'cantilever' && (
        <Section num={6} title="腹起し・切梁諸元">
          <Row label="腹起し（H形鋼）">
            <select className={selectCls} value={input.waler.name} onChange={(e) => {
              const found = H_STEEL_TABLE.find((h) => h.name === e.target.value);
              if (found) set('waler', found);
            }}>
              {H_STEEL_TABLE.map((h) => <option key={h.name} value={h.name}>{h.name}</option>)}
            </select>
          </Row>
          <Row label="切梁間隔 b" unit="m">
            <input className={inputCls} type="number" step="0.5" value={input.strutSpacing}
              onChange={(e) => set('strutSpacing', parseFloat(e.target.value) || 0)} />
          </Row>
          <Row label="切梁（H形鋼）">
            <select className={selectCls} value={input.strut.name} onChange={(e) => {
              const found = STRUT_TABLE.find((s) => s.name === e.target.value);
              if (found) set('strut', found);
            }}>
              {STRUT_TABLE.map((s) => <option key={s.name} value={s.name}>{s.name}</option>)}
            </select>
          </Row>
          <Row label="切梁スパン L" unit="m">
            <input className={inputCls} type="number" step="0.5" value={input.strutSpan}
              onChange={(e) => set('strutSpan', parseFloat(e.target.value) || 0)} />
          </Row>
        </Section>
      )}
    </div>
  );
}
