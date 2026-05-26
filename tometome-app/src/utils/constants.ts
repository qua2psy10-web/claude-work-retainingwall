import type { WallSpec, WalerSpec, StrutSpec, AppInput } from '../types';

// 鋼矢板テーブル (NSP = 日本製鉄)
export const SHEET_PILE_TABLE: WallSpec[] = [
  { name: 'NSP-IIw',   Z: 1200, I: 8500,  t: 10.5, allowableStress: 200 },
  { name: 'NSP-IIIw',  Z: 1700, I: 13000, t: 11.5, allowableStress: 200 },
  { name: 'NSP-IVw',   Z: 2400, I: 19000, t: 13.0, allowableStress: 200 },
  { name: 'NSP-VIw',   Z: 3200, I: 27000, t: 15.5, allowableStress: 200 },
  // ハット形矢板
  { name: '10H',  Z: 1000, I: 8000,  t: 9.5,  allowableStress: 200 },
  { name: '25H',  Z: 2500, I: 22000, t: 12.7, allowableStress: 200 },
  { name: '50H',  Z: 5000, I: 46000, t: 16.0, allowableStress: 200 },
];

// H形鋼テーブル (腹起し・切梁共用)
export const H_STEEL_TABLE: WalerSpec[] = [
  { name: 'H-200×200×8×12',  A: 6353,  Z: 472,  I: 4720,  allowableStress: 160 },
  { name: 'H-250×250×9×14',  A: 9218,  Z: 867,  I: 10800, allowableStress: 160 },
  { name: 'H-300×300×10×15', A: 11980, Z: 1360, I: 20400, allowableStress: 160 },
  { name: 'H-350×350×12×19', A: 17370, Z: 2140, I: 40300, allowableStress: 160 },
  { name: 'H-400×400×13×21', A: 21870, Z: 2880, I: 66600, allowableStress: 160 },
];

// 切梁テーブル (圧縮材として使用するH形鋼)
export const STRUT_TABLE: StrutSpec[] = [
  { name: 'H-200×200×8×12',  A: 6353,  i: 50.2, allowableStress: 140 },
  { name: 'H-250×250×9×14',  A: 9218,  i: 62.5, allowableStress: 140 },
  { name: 'H-300×300×10×15', A: 11980, i: 75.1, allowableStress: 140 },
  { name: 'H-350×350×12×19', A: 17370, i: 87.8, allowableStress: 140 },
  { name: 'H-400×400×13×21', A: 21870, i: 100.4, allowableStress: 140 },
];

// 水の単位重量
export const GAMMA_W = 9.8; // kN/m³

// デフォルト入力値
export const DEFAULT_INPUT: AppInput = {
  methodType: 'sheet-pile',
  supportType: 'strut-1',
  earthPressureMethod: 'rankine',
  geometry: {
    excavationDepth: 6.0,
    wallLength: 12.0,
    waterTableDepth: 2.0,
    surcharge: 10.0,
    excavationWidth: 8.0,
  },
  strutPositions: [
    { depth: 1.0 },
  ],
  soilLayers: [
    { thickness: 12.0, gamma: 18.0, gammaSub: 8.2, phi: 30, c: 0, wallFriction: 15 },
  ],
  wall: SHEET_PILE_TABLE[2], // NSP-IVw
  waler: H_STEEL_TABLE[2],   // H-300×300
  strut: STRUT_TABLE[2],     // H-300×300
  strutSpacing: 3.0,
  strutSpan: 8.0,
};
