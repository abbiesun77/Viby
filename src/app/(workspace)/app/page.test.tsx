import { render, screen } from "@testing-library/react";
import AppHomePage from "./page";

describe("signed-in home page", () => {
  it("shows the welcome copy, trial credit story, and the three project entry options", () => {
    render(<AppHomePage />);

    expect(
      screen.getByRole("heading", { name: "欢迎来到 Viby" }),
    ).toBeInTheDocument();
    expect(screen.getByText(/Viby Credit/i)).toBeInTheDocument();
    expect(
      screen.getByText(/先用试用额度跑通从想法到分镜、参考素材和素材包的流程，之后再切到自己的 Key 继续。/),
    ).toBeInTheDocument();
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
