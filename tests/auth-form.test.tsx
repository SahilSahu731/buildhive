// @vitest-environment jsdom
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { AuthForm } from "@/components/auth/auth-form";

const mocks = vi.hoisted(() => ({
  send: vi.fn(),
  verify: vi.fn(),
  oauth: vi.fn(),
  replace: vi.fn(),
  refresh: vi.fn(),
}));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace: mocks.replace, refresh: mocks.refresh }),
}));
vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    auth: {
      signInWithOtp: mocks.send,
      verifyOtp: mocks.verify,
      signInWithOAuth: mocks.oauth,
    },
  }),
}));

beforeEach(() => {
  vi.resetAllMocks();
  mocks.send.mockResolvedValue({ error: null });
  mocks.verify.mockResolvedValue({ error: null });
});
afterEach(cleanup);

async function verification(nextPath = "/profile") {
  const user = userEvent.setup();
  render(<AuthForm configured nextPath={nextPath} />);
  await user.type(
    screen.getByLabelText("Email address"),
    "builder@example.com",
  );
  await user.keyboard("{Enter}");
  await screen.findByRole("group", { name: "Verification code" });
  const boxes = screen.getAllByRole<HTMLInputElement>("textbox", {
    name: /Digit \d of 6/,
  });
  await waitFor(() => expect(document.activeElement).toBe(boxes[0]));
  return { user, boxes };
}
const digits = (boxes: HTMLInputElement[]) =>
  boxes.map((box) => box.value).join("");

describe("email verification keyboard flow", () => {
  it("sends email and verifies a leading-zero code with Enter exactly once", async () => {
    const { user, boxes } = await verification();
    await user.keyboard("012345");
    expect(digits(boxes)).toBe("012345");
    expect(document.activeElement).toBe(boxes[5]);
    await user.keyboard("{Enter}");
    expect(mocks.send).toHaveBeenCalledTimes(1);
    expect(mocks.verify).toHaveBeenCalledTimes(1);
    expect(mocks.verify).toHaveBeenCalledWith({
      email: "builder@example.com",
      token: "012345",
      type: "email",
    });
    expect(mocks.replace).toHaveBeenCalledWith("/profile");
    expect(mocks.refresh).toHaveBeenCalledTimes(1);
  });

  it("pastes a formatted full code from any box", async () => {
    const { user, boxes } = await verification();
    await user.click(boxes[3]);
    await user.paste("123 456");
    expect(digits(boxes)).toBe("123456");
    expect(document.activeElement).toBe(boxes[5]);
    await user.keyboard("{Enter}");
    expect(mocks.verify).toHaveBeenCalledWith({
      email: "builder@example.com",
      token: "123456",
      type: "email",
    });
  });

  it("accepts native full-code autofill without truncating it to one digit", async () => {
    const { boxes } = await verification();
    fireEvent.change(boxes[0], { target: { value: "987654" } });
    expect(digits(boxes)).toBe("987654");
    fireEvent.keyDown(boxes[5], { key: "Enter" });
    await waitFor(() =>
      expect(mocks.verify).toHaveBeenCalledWith({
        email: "builder@example.com",
        token: "987654",
        type: "email",
      }),
    );
  });

  it("replaces digits and supports arrow, Home, End, and Backspace navigation", async () => {
    const { user, boxes } = await verification();
    await user.keyboard("123456");
    await user.keyboard("{Home}{ArrowRight}{ArrowRight}9");
    expect(digits(boxes)).toBe("129456");
    expect(document.activeElement).toBe(boxes[3]);
    await user.keyboard("{ArrowLeft}{Backspace}");
    expect(boxes[2].value).toBe("");
    await user.keyboard("{Backspace}");
    expect(document.activeElement).toBe(boxes[1]);
    expect(boxes[1].value).toBe("");
    await user.keyboard("{End}");
    expect(document.activeElement).toBe(boxes[5]);
  });

  it("does not verify an incomplete code and does not submit during composition", async () => {
    const { user, boxes } = await verification();
    await user.keyboard("12{Enter}");
    expect(mocks.verify).not.toHaveBeenCalled();
    fireEvent.change(boxes[0], { target: { value: "123456" } });
    fireEvent.keyDown(boxes[5], { key: "Enter", isComposing: true });
    expect(mocks.verify).not.toHaveBeenCalled();
  });

  it("ignores repeated Enter while verification is in flight", async () => {
    let complete!: (value: { error: null }) => void;
    mocks.verify.mockReturnValue(
      new Promise((resolve) => {
        complete = resolve;
      }),
    );
    const { user, boxes } = await verification();
    await user.keyboard("123456{Enter}{Enter}");
    expect(mocks.verify).toHaveBeenCalledTimes(1);
    expect(boxes.every((box) => box.disabled)).toBe(true);
    await act(async () => complete({ error: null }));
  });

  it("retains the code after an error and lets the user retry without a mouse", async () => {
    mocks.verify.mockResolvedValueOnce({ error: { code: "otp_expired" } });
    const { user, boxes } = await verification();
    await user.keyboard("123456{Enter}");
    expect((await screen.findByRole("alert")).textContent).toMatch(
      /incorrect or has expired/,
    );
    expect(digits(boxes)).toBe("123456");
    expect(document.activeElement).toBe(boxes[0]);
    await user.keyboard("654321{Enter}");
    expect(mocks.verify).toHaveBeenCalledTimes(2);
    expect(mocks.verify).toHaveBeenLastCalledWith({
      email: "builder@example.com",
      token: "654321",
      type: "email",
    });
  });
});

describe("email delivery failures", () => {
  it.each([
    [
      { code: "email_address_not_authorized", status: 403 },
      /restricted to approved test addresses/,
    ],
    [
      { code: "over_email_send_rate_limit", status: 429 },
      /limit has been reached/,
    ],
    [
      { code: "email_provider_disabled", status: 422 },
      /Email sign-in isn't enabled/,
    ],
    [
      {
        status: 500,
        message: "Error sending confirmation email",
      },
      /email service needs attention/,
    ],
  ])(
    "keeps the email form usable and explains a failed send (%j)",
    async (error, message) => {
      mocks.send.mockResolvedValueOnce({ error });
      const user = userEvent.setup();
      render(<AuthForm configured />);
      await user.type(
        screen.getByLabelText("Email address"),
        "builder@real-domain.dev",
      );
      await user.keyboard("{Enter}");
      expect((await screen.findByRole("alert")).textContent).toMatch(message);
      expect(
        screen.queryByRole("group", { name: "Verification code" }),
      ).toBeNull();
      expect(mocks.verify).not.toHaveBeenCalled();
      expect(
        (
          screen.getByRole("button", {
            name: "Continue with email",
          }) as HTMLButtonElement
        ).disabled,
      ).toBe(false);
      // A corrected backend configuration can be retried without losing the email.
      await user.keyboard("{Enter}");
      await screen.findByRole("group", { name: "Verification code" });
      expect(mocks.send).toHaveBeenCalledTimes(2);
    },
  );

  it("explains a network failure without exposing provider response contents", async () => {
    mocks.send.mockRejectedValueOnce(new TypeError("Failed to fetch"));
    const user = userEvent.setup();
    render(<AuthForm configured />);
    await user.type(
      screen.getByLabelText("Email address"),
      "builder@real-domain.dev",
    );
    await user.keyboard("{Enter}");
    expect((await screen.findByRole("alert")).textContent).toMatch(
      /Couldn't reach the sign-in service/,
    );
  });

  it("does not display arbitrary server messages", async () => {
    mocks.send.mockResolvedValueOnce({
      error: {
        code: "unknown_provider_error",
        status: 500,
        message: "private provider diagnostics: secret-value",
      },
    });
    const user = userEvent.setup();
    render(<AuthForm configured />);
    await user.type(
      screen.getByLabelText("Email address"),
      "builder@real-domain.dev",
    );
    await user.keyboard("{Enter}");
    const alert = await screen.findByRole("alert");
    expect(alert.textContent).toMatch(/couldn't send your code/);
    expect(alert.textContent).not.toContain("secret-value");
  });
});
