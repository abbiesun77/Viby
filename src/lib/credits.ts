export const COSTS = {
  brief_generation: 5,
  scene_generation: 10,
  shot_generation: 10,
  image_generation: 20,
  repair_generation: 8,
} as const;

export type CreditAction = keyof typeof COSTS;
export type CreditBalance = { points: number };

function createBalance(points: number): CreditBalance {
  return { points: Math.max(0, points) };
}

function applyDebit(balance: CreditBalance, action: CreditAction): CreditBalance {
  return createBalance(balance.points - COSTS[action]);
}

export function grantTrialCredits() {
  return createBalance(120);
}

export function debitCredits(currentPoints: number, action: CreditAction) {
  return applyDebit(createBalance(currentPoints), action).points;
}
