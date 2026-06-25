import { render, screen } from "@testing-library/react";
import HomePage from "./page";

describe("marketing landing page", () => {
  it("shows Viby's core promise and trial CTA", () => {
    render(<HomePage />);

    expect(
      screen.getByText(/少抽卡，更稳地做出想要的视频/i),
    ).toBeInTheDocument();
    expect(screen.getAllByRole("link", { name: /免费试用/i })[0]).toHaveAttribute(
      "href",
      "/sign-up",
    );
    expect(screen.getAllByRole("link", { name: /登录/i })[0]).toHaveAttribute(
      "href",
      "/sign-in",
    );
  });
});
