import { render, screen } from "@testing-library/react";
import AppHomePage from "./page";

describe("signed-in home page", () => {
  it("shows Viby Credit and the three project entry options", () => {
    render(<AppHomePage />);

    expect(screen.getByText(/Viby Credit/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "一句话脑暴" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "段落转分镜" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "导入剧本" }),
    ).toBeInTheDocument();
  });
});
