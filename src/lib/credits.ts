export const COSTS = {
  brief_generation: 5,
  scene_generation: 10,
  shot_generation: 10,
  image_generation: 20,
  repair_generation: 8,
} as const;

export type CreditAction = keyof typeof COSTS;

export function grantTrialCredits() {
  return { points: 120 };
}

export function debitCredits(currentPoints: number, action: CreditAction) {
  return currentPoints - COSTS[action];
}
