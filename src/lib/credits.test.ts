import { debitCredits, grantTrialCredits } from "./credits";

describe("credits", () => {
  it("grants onboarding credit and debits text/image actions differently", () => {
    const balance = grantTrialCredits();

    expect(balance.points).toBe(120);
    expect(debitCredits(balance.points, "brief_generation")).toBe(115);
    expect(debitCredits(balance.points, "image_generation")).toBe(100);
  });

  it("does not allow balances to go negative", () => {
    expect(debitCredits(10, "image_generation")).toBe(0);
  });
});
