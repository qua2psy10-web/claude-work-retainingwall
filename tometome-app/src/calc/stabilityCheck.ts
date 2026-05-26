import type { AppInput, StabilityResult, HeavingResult, BoilingResult, PipingResult } from '../types';
import { GAMMA_W } from '../utils/constants';

/**
 * ヒービング照査（Terzaghi 式）
 * Fs = Nc * cu / (γ * H) ≥ 1.2
 * 粘着力 c > 0 の地盤にのみ適用
 */
function calcHeaving(input: AppInput): HeavingResult {
  const { soilLayers, geometry } = input;
  const H = geometry.excavationDepth;

  // Use first layer properties (simplified)
  const c = soilLayers[0].c;
  const gamma = soilLayers[0].gamma;

  if (c === 0) {
    return { applicable: false, Fs: Infinity, FsRequired: 1.2, ok: true };
  }

  // Terzaghi bearing capacity factor Nc = 5.14 for strip
  const Nc = 5.14;

  // Simplified commonly used form: Fs = Nc * c / (γ * H)
  const denominator = gamma * H;
  const Fs = denominator > 0 ? (Nc * c) / denominator : Infinity;

  return {
    applicable: true,
    Fs,
    FsRequired: 1.2,
    ok: Fs >= 1.2,
  };
}

/**
 * ボイリング照査
 * Fs = γ' * D / (γw * hw) ≥ 1.5
 * 砂質地盤（c ≈ 0）にのみ適用
 */
function calcBoiling(input: AppInput): BoilingResult {
  const { soilLayers, geometry } = input;
  const H = geometry.excavationDepth;
  const L = geometry.wallLength;
  const hw = Math.max(0, geometry.waterTableDepth);

  const c = soilLayers[0].c;

  if (c > 5) {
    // Cohesive soil, boiling not applicable
    return { applicable: false, Fs: Infinity, FsRequired: 1.5, ok: true };
  }

  const D = L - H; // 根入れ深さ
  const gammaSub = soilLayers[0].gammaSub;
  const hw_diff = Math.max(0, H - hw); // 水位差

  if (hw_diff === 0 || D === 0) {
    return { applicable: true, Fs: Infinity, FsRequired: 1.5, ok: true };
  }

  const Fs = (gammaSub * D) / (GAMMA_W * hw_diff);

  return {
    applicable: true,
    Fs,
    FsRequired: 1.5,
    ok: Fs >= 1.5,
  };
}

/**
 * パイピング照査（レーン法）
 * 浸透路長比 C = L_seepage / Δh ≥ C_required
 * C_required depends on soil type (3〜6 typically)
 */
function calcPiping(input: AppInput): PipingResult {
  const { geometry } = input;
  const H = geometry.excavationDepth;
  const L = geometry.wallLength;
  const hw = geometry.waterTableDepth;

  const hw_diff = Math.max(0, H - hw); // 有効水頭差

  if (hw_diff === 0) {
    return { C: Infinity, CRequired: 4.0, ok: true };
  }

  // Seepage path length = 2 * embedment depth (both sides of wall)
  const D = L - H;
  const L_seepage = 2 * D;
  const C = L_seepage / hw_diff;

  return {
    C,
    CRequired: 4.0, // 砂質土の標準値
    ok: C >= 4.0,
  };
}

/**
 * 安定性照査メイン関数
 */
export function calcStability(input: AppInput): StabilityResult {
  return {
    heaving: calcHeaving(input),
    boiling: calcBoiling(input),
    piping: calcPiping(input),
  };
}
