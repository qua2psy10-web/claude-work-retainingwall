import type {
  StrutReaction,
  WalerSpec,
  StrutSpec,
  WalerCheckResult,
  StrutCheckResult,
} from '../types';

/**
 * 腹起し照査
 * 切梁を集中荷重として、切梁間隔 b の単純梁モデル
 * M_w = R * b / 4  (中央集中荷重 → R は 1 本分の集中力)
 * R は kN/m * b (切梁間隔) = kN/本
 */
export function calcWalerCheck(
  strutReactions: StrutReaction[],
  waler: WalerSpec,
  strutSpacing: number // m
): WalerCheckResult {
  if (strutReactions.length === 0) {
    return {
      R: 0,
      Mw: 0,
      sigmaW: 0,
      sigmaWAllow: waler.allowableStress,
      ok: true,
    };
  }

  // Max strut reaction per unit length (kN/m)
  const Rmax = Math.max(...strutReactions.map((sr) => sr.R));

  // Convert to force per strut: N = R [kN/m] * spacing [m]
  const N_strut = Rmax * strutSpacing;

  // Waler treated as simple beam between struts with concentrated load at center
  // Mw = N * b / 4
  const Mw = (N_strut * strutSpacing) / 4; // kN·m

  // σ = M / Z (M: kN·m, Z: cm³)
  // σ [N/mm²] = M [kN·m] * 1000 / Z [cm³]
  const sigmaW = (Mw * 1000) / waler.Z; // N/mm²

  return {
    R: Rmax,
    Mw,
    sigmaW,
    sigmaWAllow: waler.allowableStress,
    ok: sigmaW <= waler.allowableStress,
  };
}

/**
 * 切梁照査（座屈込み）
 * N = R [kN/m] * 掘削幅/2
 * σ = N / A ≤ σa (許容圧縮応力度)
 */
export function calcStrutCheck(
  strutReactions: StrutReaction[],
  strut: StrutSpec,
  strutSpan: number,   // m
  strutSpacing: number // m
): StrutCheckResult {
  if (strutReactions.length === 0) {
    return { N: 0, sigma: 0, sigmaAllow: strut.allowableStress, ok: true };
  }

  const Rmax = Math.max(...strutReactions.map((sr) => sr.R));
  // 切梁軸力: R [kN/m] * 切梁間隔 [m]
  const N = Rmax * strutSpacing; // kN

  // σ = N [kN] * 1000 / A [mm²] = N/mm²
  const sigma = (N * 1000) / strut.A; // N/mm²

  // Slenderness ratio λ = L / i
  const lambda = (strutSpan * 1000) / strut.i; // L in mm, i in mm

  // Buckling reduction: simplified Euler check
  // σ_cr = π²E / λ² (E = 200,000 N/mm²)
  const E = 200000; // N/mm²
  const sigmaCr = (Math.PI ** 2 * E) / lambda ** 2;
  const sigmaAllow = Math.min(strut.allowableStress, sigmaCr / 1.5);

  return {
    N,
    sigma,
    sigmaAllow,
    ok: sigma <= sigmaAllow,
  };
}
