import { render, screen } from "@testing-library/react";
import SignUpPage from "./page";

describe("sign up page", () => {
  it("explains trial credits and email verification", () => {
    render(<SignUpPage />);

    expect(screen.getByLabelText(/邮箱/i)).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 1, name: /创建 viby 账号/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/注册后可获得 viby credit/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /创建账号/i }),
    ).toBeInTheDocument();
  });
});
