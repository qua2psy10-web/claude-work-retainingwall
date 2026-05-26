import type { ForcePoint, WallSpec, WallCheckResult } from '../types';

/**
 * 壁体断面照査
 * σ = Mmax / Z ≤ σa
 */
export function calcWallCheck(
  forcePoints: ForcePoint[],
  wall: WallSpec
): WallCheckResult {
  // Max absolute bending moment
  const Mmax = Math.max(...forcePoints.map((fp) => Math.abs(fp.M)));

  // σ = M / Z  (M: kN·m/m, Z: cm³/m → convert)
  // M in kN·m/m, Z in cm³/m: σ [N/mm²] = M [kN·m/m] * 1000 / Z [cm³/m]
  const sigmaMax = (Mmax * 1000) / wall.Z; // N/mm²

  return {
    Mmax,
    sigmaMax,
    sigmaAllow: wall.allowableStress,
    ratio: sigmaMax / wall.allowableStress,
    ok: sigmaMax <= wall.allowableStress,
  };
}
