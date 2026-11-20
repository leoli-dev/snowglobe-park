// Global dimensions of the snow globe world (1 unit = 1 m of the miniature world)
export const GLOBE = {
  cx: 0, cy: 40, cz: 0,
  R: 150,          // glass radius
  cutY: -20,       // glass is cut flat here and sits in the base collar
};
export const PARK_R = 114;   // flat park radius
export const TRACK_R = 126;  // railroad ring on the berm
export const TRACK_Y = 5;    // berm top height
export const MONO_R = 138;   // monorail ring
export const MONO_Y = 17.5;  // monorail beam top
export const BASE_BOTTOM = -96;
export const TEX_HALF = 150; // ground texture covers [-150,150]^2

export const DEG = Math.PI / 180;

// polar helper: angle measured from north (-z) clockwise (east = 90)
export function P(angleDeg, r) {
  const a = angleDeg * DEG;
  return [r * Math.sin(a), -r * Math.cos(a)];
}
// facing angle (rotation about Y) so that local +z points toward (tx,tz) from (x,z)
export function faceTo(x, z, tx, tz) {
  return Math.atan2(tx - x, tz - z);
}

export function smoothstep(a, b, x) {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
}
export const clamp = (x, a, b) => Math.min(b, Math.max(a, x));
export const lerp = (a, b, t) => a + (b - a) * t;
