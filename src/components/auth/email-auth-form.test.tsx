import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { vi } from "vitest";
import { EmailAuthForm } from "./email-auth-form";

const createClientMock = vi.fn();

vi.mock("../../lib/supabase/browser", () => ({
  createClient: () => createClientMock(),
}));

describe("EmailAuthForm", () => {
  beforeEach(() => {
    createClientMock.mockReset();
  });

  it("keeps password input exact on sign in and shows a truthful success message", async () => {
    const signInWithPassword = vi.fn().mockResolvedValue({ error: null });

    createClientMock.mockReturnValue({
      auth: {
        signInWithPassword,
      },
    });

    render(<EmailAuthForm mode="sign-in" />);

    fireEvent.change(screen.getByLabelText(/邮箱/i), {
      target: { value: " crew@viby.ai " },
    });
    fireEvent.change(screen.getByLabelText(/密码/i), {
      target: { value: "  secret pass  " },
    });
    fireEvent.click(screen.getByRole("button", { name: /登录/i }));

    await waitFor(() => {
      expect(signInWithPassword).toHaveBeenCalledWith({
        email: "crew@viby.ai",
        password: "  secret pass  ",
      });
    });

    expect(
      screen.getByText(/登录成功，现在可以继续使用 viby/i),
    ).toBeInTheDocument();
  });

  it("surfaces thrown submit errors and resets submitting state", async () => {
    const signUp = vi.fn().mockRejectedValue(new Error("网络异常，请稍后再试。"));

    createClientMock.mockReturnValue({
      auth: {
        signUp,
      },
    });

    render(<EmailAuthForm mode="sign-up" />);

    fireEvent.change(screen.getByLabelText(/邮箱/i), {
      target: { value: "hello@viby.ai" },
    });
    fireEvent.change(screen.getByLabelText(/密码/i), {
      target: { value: "pass word" },
    });
    fireEvent.click(screen.getByRole("button", { name: /创建账号/i }));

    expect(await screen.findByText("网络异常，请稍后再试。")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /创建账号/i })).toBeInTheDocument();
  });
});
