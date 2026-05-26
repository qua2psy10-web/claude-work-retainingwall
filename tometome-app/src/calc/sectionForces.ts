import type {
  AppInput,
  ForcePoint,
  StrutReaction,
  PressurePoint,
} from '../types';

/**
 * 自立式（カンチレバー）断面力計算
 * 根入れ長を受働土圧と主働土圧のモーメント釣合いで仮定し、
 * 壁体の M・Q を数値積分で求める。
 */
function calcCantilever(
  pressures: PressurePoint[],
  excavDepth: number
): { forcePoints: ForcePoint[]; strutReactions: StrutReaction[]; embedmentDepth: number } {
  const allDepths = pressures.map((p) => p.depth);
  const maxDepth = Math.max(...allDepths);

  const embedmentDepth = maxDepth - excavDepth;

  // Calculate section forces by numerical integration from top
  const forcePoints: ForcePoint[] = [];
  const dz = pressures.length > 1 ? pressures[1].depth - pressures[0].depth : 0.01;

  let Q = 0;
  let M = 0;

  for (let i = 0; i < pressures.length; i++) {
    const p = pressures[i];
    const netP = p.depth <= excavDepth ? p.pTotal : p.pTotal - p.pp;
    if (i > 0) {
      const prevNetP = pressures[i - 1].depth <= excavDepth
        ? pressures[i - 1].pTotal
        : pressures[i - 1].pTotal - pressures[i - 1].pp;
      const avgP = (netP + prevNetP) / 2;
      Q += avgP * dz;
      M += Q * dz;
    }
    forcePoints.push({ depth: p.depth, M, Q });
  }

  return { forcePoints, strutReactions: [], embedmentDepth };
}

/**
 * 1段支保（等値梁法）
 * 仮想支点法：掘削底面近傍を支点とした 2 連梁
 */
function calcSingleStrut(
  pressures: PressurePoint[],
  strutDepth: number,
  excavDepth: number
): { forcePoints: ForcePoint[]; strutReactions: StrutReaction[] } {
  const dz = pressures.length > 1 ? pressures[1].depth - pressures[0].depth : 0.01;

  const wallPressures = pressures.filter((p) => p.depth <= excavDepth);

  // Calculate strut reaction by moment equilibrium about virtual support (excav bottom)
  let momentAboutExcavBottom = 0;
  for (let i = 1; i < wallPressures.length; i++) {
    const p = wallPressures[i];
    const prev = wallPressures[i - 1];
    const avgP = (p.pTotal + prev.pTotal) / 2;
    const midDepth = (p.depth + prev.depth) / 2;
    const arm = excavDepth - midDepth;
    momentAboutExcavBottom += avgP * dz * arm;
  }

  const strutArm = excavDepth - strutDepth;
  const R1 = strutArm > 0 ? momentAboutExcavBottom / strutArm : 0;

  // Calculate total force
  let totalForce = 0;
  for (let i = 1; i < wallPressures.length; i++) {
    const avgP = (wallPressures[i].pTotal + wallPressures[i - 1].pTotal) / 2;
    totalForce += avgP * dz;
  }

  const R_bottom = totalForce - R1; // Reaction at virtual bottom support

  // Now calculate section forces
  const forcePoints: ForcePoint[] = [];
  let Q = 0;
  let M = 0;

  for (let i = 0; i < pressures.length; i++) {
    const p = pressures[i];
    if (i > 0) {
      const prev = pressures[i - 1];
      const avgP = p.depth <= excavDepth ? (p.pTotal + prev.pTotal) / 2 : -(p.pp + prev.pp) / 2;
      Q += avgP * dz;

      // Apply strut reaction at strutDepth
      if (prev.depth < strutDepth && p.depth >= strutDepth) {
        Q -= R1;
      }
      // Apply bottom reaction
      if (prev.depth < excavDepth && p.depth >= excavDepth) {
        Q -= R_bottom;
      }
      M += Q * dz;
    }
    forcePoints.push({ depth: p.depth, M, Q });
  }

  return {
    forcePoints,
    strutReactions: [{ level: 1, depth: strutDepth, R: R1 }],
  };
}

/**
 * 多段支保（連続梁モデル - 簡易版）
 * 支保点を支点とした多支点連続梁の近似解法
 */
function calcMultiStrut(
  pressures: PressurePoint[],
  strutDepths: number[],
  excavDepth: number
): { forcePoints: ForcePoint[]; strutReactions: StrutReaction[] } {
  const dz = pressures.length > 1 ? pressures[1].depth - pressures[0].depth : 0.01;
  const n = strutDepths.length;

  // Use tributary area method for simplicity
  const boundaries = [0, ...strutDepths, excavDepth];
  const midpoints: number[] = [];
  for (let i = 0; i < boundaries.length - 1; i++) {
    midpoints.push((boundaries[i] + boundaries[i + 1]) / 2);
  }

  const strutReactions: StrutReaction[] = [];
  for (let s = 0; s < n; s++) {
    const zTop = midpoints[s];
    const zBot = midpoints[s + 1];
    let R = 0;
    for (const p of pressures) {
      if (p.depth >= zTop && p.depth <= zBot) {
        R += p.pTotal * dz;
      }
    }
    strutReactions.push({ level: s + 1, depth: strutDepths[s], R });
  }

  // Calculate section forces
  const forcePoints: ForcePoint[] = [];
  let Q = 0;
  let M = 0;

  for (let i = 0; i < pressures.length; i++) {
    const p = pressures[i];
    if (i > 0) {
      const prev = pressures[i - 1];
      const netP = p.depth <= excavDepth ? (p.pTotal + prev.pTotal) / 2 : -(p.pp + prev.pp) / 2;
      Q += netP * dz;

      // Apply strut reactions
      for (const sr of strutReactions) {
        if (prev.depth < sr.depth && p.depth >= sr.depth) {
          Q -= sr.R;
        }
      }
      M += Q * dz;
    }
    forcePoints.push({ depth: p.depth, M, Q });
  }

  return { forcePoints, strutReactions };
}

/**
 * メイン断面力計算関数
 */
export function calcSectionForces(
  input: AppInput,
  pressures: PressurePoint[]
): {
  forcePoints: ForcePoint[];
  strutReactions: StrutReaction[];
  embedmentDepth: number;
} {
  const { supportType, strutPositions, geometry } = input;
  const H = geometry.excavationDepth;

  switch (supportType) {
    case 'cantilever': {
      return calcCantilever(pressures, H);
    }
    case 'strut-1': {
      const strutDepth = strutPositions[0]?.depth ?? H / 2;
      const { forcePoints, strutReactions } = calcSingleStrut(
        pressures,
        strutDepth,
        H
      );
      return { forcePoints, strutReactions, embedmentDepth: geometry.wallLength - H };
    }
    case 'strut-multi': {
      const depths = strutPositions.map((s) => s.depth);
      const { forcePoints, strutReactions } = calcMultiStrut(pressures, depths, H);
      return { forcePoints, strutReactions, embedmentDepth: geometry.wallLength - H };
    }
    default:
      return { forcePoints: [], strutReactions: [], embedmentDepth: 0 };
  }
}
