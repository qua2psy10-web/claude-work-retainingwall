// 壁体工法
export type MethodType = 'sheet-pile' | 'h-pile' | 'soldier';

// 支保工形式
export type SupportType = 'cantilever' | 'strut-1' | 'strut-multi';

// 土圧計算式
export type EarthPressureMethod = 'rankine' | 'coulomb';

// 土層
export interface SoilLayer {
  thickness: number;    // 層厚 (m)
  gamma: number;        // 単位重量 (kN/m³)
  gammaSub: number;     // 水中単位重量 (kN/m³) = gamma - 9.8
  phi: number;          // 内部摩擦角 (degrees)
  c: number;            // 粘着力 (kN/m²)
  wallFriction: number; // 壁摩擦角 delta (degrees) - used for Coulomb
}

// 幾何学条件
export interface GeometryInput {
  excavationDepth: number;   // 掘削深さ H (m)
  wallLength: number;        // 壁体長 L (m)
  waterTableDepth: number;   // 地下水位 (GL からの深さ m)
  surcharge: number;         // 上載荷重 q (kN/m²)
  excavationWidth: number;   // 掘削幅 B (m) - for heaving check
}

// 支保工位置
export interface StrutPosition {
  depth: number;   // GL からの深さ (m)
}

// 壁体諸元
export interface WallSpec {
  name: string;        // 型番
  Z: number;           // 断面係数 (cm³/m)
  I: number;           // 断面二次モーメント (cm⁴/m)
  t: number;           // 板厚 (mm)
  allowableStress: number;  // 許容曲げ応力度 σa (N/mm²)
}

// 腹起し諸元
export interface WalerSpec {
  name: string;     // H形鋼サイズ名
  A: number;        // 断面積 (mm²)
  Z: number;        // 断面係数 (cm³)
  I: number;        // 断面二次モーメント (cm⁴)
  allowableStress: number;   // 許容曲げ応力度 (N/mm²)
}

// 切梁諸元
export interface StrutSpec {
  name: string;
  A: number;        // 断面積 (mm²)
  i: number;        // 最小回転半径 (mm)
  allowableStress: number;   // 許容圧縮応力度 (N/mm²) - after buckling reduction
}

// アプリ全入力
export interface AppInput {
  methodType: MethodType;
  supportType: SupportType;
  earthPressureMethod: EarthPressureMethod;
  geometry: GeometryInput;
  strutPositions: StrutPosition[];   // 支保位置（段数に応じて）
  soilLayers: SoilLayer[];
  wall: WallSpec;
  waler: WalerSpec;
  strut: StrutSpec;
  strutSpacing: number;     // 切梁間隔 b (m)
  strutSpan: number;        // 切梁スパン L (m)
}

// 土圧分布の1点
export interface PressurePoint {
  depth: number;    // GL からの深さ (m)
  pa: number;       // 主働土圧 (kN/m²)
  pp: number;       // 受働土圧 (kN/m²)
  pw: number;       // 水圧 (kN/m²)
  pTotal: number;   // 合計側圧 (kN/m²) = pa + pw
}

// 断面力の1点
export interface ForcePoint {
  depth: number;    // GL からの深さ (m)
  M: number;        // 曲げモーメント (kN·m/m)
  Q: number;        // せん断力 (kN/m)
}

// 切梁反力
export interface StrutReaction {
  level: number;    // 段（1始まり）
  depth: number;    // GL からの深さ (m)
  R: number;        // 反力 (kN/m)
}

// 壁体照査結果
export interface WallCheckResult {
  Mmax: number;         // 最大曲げモーメント (kN·m/m)
  sigmaMax: number;     // 最大応力度 (N/mm²)
  sigmaAllow: number;   // 許容応力度 (N/mm²)
  ratio: number;        // sigma/sigmaAllow
  ok: boolean;
}

// 腹起し照査結果
export interface WalerCheckResult {
  R: number;            // 切梁反力 (kN/m) - 最大段
  Mw: number;           // 腹起し曲げモーメント (kN·m)
  sigmaW: number;       // 腹起し応力度 (N/mm²)
  sigmaWAllow: number;  // 許容応力度 (N/mm²)
  ok: boolean;
}

// 切梁照査結果
export interface StrutCheckResult {
  N: number;            // 切梁軸力 (kN)
  sigma: number;        // 圧縮応力度 (N/mm²)
  sigmaAllow: number;   // 許容応力度（座屈考慮後） (N/mm²)
  ok: boolean;
}

// ヒービング結果
export interface HeavingResult {
  applicable: boolean;  // 粘土地盤かどうか
  Fs: number;           // 安全率
  FsRequired: number;   // 必要安全率 (1.2)
  ok: boolean;
}

// ボイリング結果
export interface BoilingResult {
  applicable: boolean;  // 砂質地盤かどうか
  Fs: number;
  FsRequired: number;   // 必要安全率 (1.5)
  ok: boolean;
}

// パイピング結果
export interface PipingResult {
  C: number;            // 浸透路長比
  CRequired: number;    // 必要浸透路長比
  ok: boolean;
}

// 安定性照査結果
export interface StabilityResult {
  heaving: HeavingResult;
  boiling: BoilingResult;
  piping: PipingResult;
}

// 計算結果全体
export interface CalcResults {
  pressurePoints: PressurePoint[];    // 土圧分布（深度 0 〜 L、50点程度）
  forcePoints: ForcePoint[];          // 断面力（深度 0 〜 L）
  strutReactions: StrutReaction[];    // 切梁反力
  embedmentDepth: number;             // 根入れ深さ (m) - 自立式のみ自動計算
  wallCheck: WallCheckResult;
  walerCheck: WalerCheckResult;
  strutCheck: StrutCheckResult;
  stability: StabilityResult;
  // 全照査の概要
  allOk: boolean;
}
