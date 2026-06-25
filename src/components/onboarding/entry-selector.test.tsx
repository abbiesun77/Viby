import { render, screen, fireEvent } from "@testing-library/react";
import { EntrySelector } from "./entry-selector";

describe("onboarding entry selector", () => {
  it("offers the two creation paths", () => {
    render(<EntrySelector />);

    expect(screen.getByText("我有一个想法")).toBeInTheDocument();
    expect(screen.getByText("我已有完整剧本")).toBeInTheDocument();
  });

  it("warns that the script path skips script generation", () => {
    render(<EntrySelector />);

    fireEvent.click(screen.getByText("我已有完整剧本"));

    expect(screen.getByText(/系统不会再生成剧本/)).toBeInTheDocument();
  });
});
