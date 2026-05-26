import type { SoilLayer, GeometryInput, PressurePoint } from '../types';
import { GAMMA_W } from '../utils/constants';

const toRad = (deg: number) => (deg * Math.PI) / 180;

/** ランキン式 主働土圧係数 */
export function rankineKa(phi: number): number {
  const rad = toRad(phi);
  return Math.tan(Math.PI / 4 - rad / 2) ** 2;
}

/** ランキン式 受働土圧係数 */
export function rankineKp(phi: number): number {
  const rad = toRad(phi);
  return Math.tan(Math.PI / 4 + rad / 2) ** 2;
}

/** クーロン式 主働土圧係数 */
export function coulombKa(phi: number, delta: number, alpha = 0, beta = 0): number {
  const p = toRad(phi);
  const d = toRad(delta);
  // alpha and beta params kept for signature compatibility but use simplified vertical-wall formula
  void alpha;
  void beta;
  // Ka = sin²(α+φ) / [sin²α · sin(α-δ) · (1 + sqrt(sin(φ+δ)sin(φ-β)/sin(α-δ)sin(α+β)))²]
  // Simplified (vertical wall α=90°, horizontal backfill β=0°):
  const denom =
    (1 +
      Math.sqrt(
        (Math.sin(p + d) * Math.sin(p)) /
          (Math.sin(Math.PI / 2 - d) * Math.sin(Math.PI / 2))
      )) **
    2;
  return (
    Math.sin(Math.PI / 2 + p) ** 2 /
    (Math.sin(Math.PI / 2 - d) * denom)
  );
}

/**
 * 土圧分布を計算する。
 * @param soilLayers 土層配列（上から順）
 * @param geometry 幾何学条件
 * @param method 'rankine' | 'coulomb'
 * @param numPoints 分割点数
 * @returns 深度 0 〜 wallLength の圧力分布点
 */
export function calcEarthPressure(
  soilLayers: SoilLayer[],
  geometry: GeometryInput,
  method: 'rankine' | 'coulomb',
  numPoints = 100
): PressurePoint[] {
  const { wallLength, waterTableDepth, surcharge } = geometry;
  const points: PressurePoint[] = [];

  for (let i = 0; i <= numPoints; i++) {
    const z = (wallLength * i) / numPoints;

    // Find which soil layer applies at depth z (for Ka/Kp and c)
    let phi = soilLayers[0].phi;
    let c = soilLayers[0].c;
    let delta = soilLayers[0].wallFriction;

    let cumDepth = 0;
    for (const layer of soilLayers) {
      const layerBot = cumDepth + layer.thickness;
      if (z <= layerBot || layer === soilLayers[soilLayers.length - 1]) {
        phi = layer.phi;
        c = layer.c;
        delta = layer.wallFriction;
        break;
      }
      cumDepth += layer.thickness;
    }

    // Earth pressure coefficients
    const Ka =
      method === 'rankine' ? rankineKa(phi) : coulombKa(phi, delta);
    const Kp =
      method === 'rankine' ? rankineKp(phi) : 1 / Ka; // simplified Kp for coulomb

    // Effective vertical stress (σv) at depth z
    let sigmaV = surcharge;
    let cumulativeDepth = 0;
    for (const layer of soilLayers) {
      const layerTop = cumulativeDepth;
      const layerBot = cumulativeDepth + layer.thickness;
      if (z <= layerTop) break;
      const zInLayer = Math.min(z, layerBot) - layerTop;
      const aboveWater = Math.max(0, Math.min(z, waterTableDepth) - layerTop);
      const belowWater = Math.max(0, zInLayer - aboveWater);
      sigmaV += layer.gamma * aboveWater + layer.gammaSub * belowWater;
      cumulativeDepth = layerBot;
      if (z <= layerBot) break;
    }

    // Active earth pressure pa = Ka * σv - 2c * sqrt(Ka)
    const pa = Math.max(0, Ka * sigmaV - 2 * c * Math.sqrt(Ka));

    // Passive earth pressure pp (below excavation bottom)
    const excavBottom = geometry.excavationDepth;
    let pp = 0;
    if (z > excavBottom) {
      const zEmbed = z - excavBottom; // 根入れ深さ内
      let sigmaVP = 0;
      let cumulD = 0;
      for (const layer of soilLayers) {
        const layerTop = cumulD;
        const layerBot = cumulD + layer.thickness;
        if (zEmbed <= layerTop) break;
        const zIn = Math.min(zEmbed, layerBot) - layerTop;
        const aboveW = Math.max(0, Math.min(zEmbed, waterTableDepth - excavBottom) - layerTop);
        const belowW = Math.max(0, zIn - aboveW);
        sigmaVP += layer.gamma * Math.max(0, aboveW) + layer.gammaSub * belowW;
        cumulD = layerBot;
        if (zEmbed <= layerBot) break;
      }
      pp = Kp * sigmaVP + 2 * c * Math.sqrt(Kp);
    }

    // Water pressure
    const pw = z > waterTableDepth ? GAMMA_W * (z - waterTableDepth) : 0;

    points.push({
      depth: z,
      pa,
      pp,
      pw,
      pTotal: pa + pw,
    });
  }

  return points;
}
