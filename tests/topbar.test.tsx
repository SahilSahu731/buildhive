// @vitest-environment jsdom
import type { ReactNode } from "react";
import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { Topbar } from "@/components/layout/topbar";
import { makeDemoData, demoProfiles } from "@/lib/demo-data";

const workspace = {
  data: makeDemoData(),
  me: demoProfiles[0],
  demo: true,
  loading: false,
  error: null,
  notify: vi.fn(),
};
vi.mock("@/components/providers/workspace-provider", () => ({
  useWorkspace: () => workspace,
}));
vi.mock("@/components/ui/modal", () => ({
  Modal: ({
    open,
    title,
    children,
  }: {
    open: boolean;
    title: string;
    children: ReactNode;
  }) =>
    open ? (
      <section role="dialog" aria-label={title}>
        {children}
      </section>
    ) : null,
}));
beforeEach(() => {
  localStorage.clear();
  workspace.demo = true;
  workspace.loading = false;
  workspace.data = makeDemoData();
  vi.clearAllMocks();
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

const props = {
  label: "Feed",
  pathname: "/",
  menuOpen: false,
  onMenu: vi.fn(),
  onSearch: vi.fn(),
  onCompose: vi.fn(),
};

describe("topbar", () => {
  it("shows only a sign-in link when signed out, with no account dropdown", () => {
    const view = render(<Topbar {...props} />);
    const header = screen.getByRole("banner");
    expect(
      within(header)
        .getByRole("link", { name: "Sign in" })
        .getAttribute("href"),
    ).toBe("/login");
    expect(
      within(header).queryByRole("button", { name: "Account menu" }),
    ).toBeNull();
    workspace.demo = false;
    view.rerender(<Topbar {...props} />);
    expect(within(header).queryByRole("link", { name: "Sign in" })).toBeNull();
    expect(
      within(header).queryByRole("button", { name: "Account menu" }),
    ).toBeNull();
    workspace.demo = true;
    workspace.loading = true;
    view.rerender(<Topbar {...props} />);
    expect(within(header).queryByRole("link", { name: "Sign in" })).toBeNull();
  });
  it("opens notifications in place, supports unread filtering, and persists mark-all-read", async () => {
    const user = userEvent.setup();
    const view = render(<Topbar {...props} />);
    const bell = screen.getByRole("button", { name: "Notifications" });
    await user.click(bell);
    const dropdown = screen.getByRole("dialog", { name: "Notifications" });
    expect(document.activeElement).toBe(dropdown);
    expect(within(dropdown).getAllByRole("link")).toHaveLength(2);
    expect(
      within(dropdown)
        .getByRole("link", { name: /sent you a message/ })
        .getAttribute("href"),
    ).toBe("/messages?conversation=convo-maya");
    await user.click(
      within(dropdown).getByRole("button", { name: "Mark all read" }),
    );
    await user.click(within(dropdown).getByRole("button", { name: "Unread" }));
    expect(within(dropdown).getByText("You're all caught up")).toBeTruthy();
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog", { name: "Notifications" })).toBeNull();
    expect(document.activeElement).toBe(bell);
    view.unmount();
    render(<Topbar {...props} />);
    expect(screen.queryByLabelText(/unread notifications/)).toBeNull();
  });

  it("dismisses a dropdown outside and exposes working search and help actions", async () => {
    const user = userEvent.setup();
    render(
      <>
        <Topbar {...props} />
        <button>Outside</button>
      </>,
    );
    await user.click(
      screen.getByRole("button", { name: "Search builders and projects" }),
    );
    expect(props.onSearch).toHaveBeenCalledOnce();
    await user.click(screen.getByRole("button", { name: "Notifications" }));
    await user.click(screen.getByRole("button", { name: "Outside" }));
    expect(screen.queryByRole("dialog", { name: "Notifications" })).toBeNull();
    await user.click(
      screen.getByRole("button", { name: "Help and shortcuts" }),
    );
    await user.click(
      screen.getByRole("button", { name: /Share what you're building/ }),
    );
    expect(props.onCompose).toHaveBeenCalledOnce();
  });

  it("sends validated feedback for a signed-in user and reports success only after saving", async () => {
    const user = userEvent.setup();
    workspace.demo = false;
    const fetch = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal("fetch", fetch);
    render(<Topbar {...props} />);
    await user.click(screen.getByRole("button", { name: "Feedback" }));
    await user.type(
      screen.getByLabelText("Tell us a little more"),
      "Please improve project categories.",
    );
    await user.click(screen.getByRole("button", { name: "Send feedback" }));
    expect(fetch).toHaveBeenCalledWith(
      "/api/feedback",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          category: "idea",
          message: "Please improve project categories.",
          path: "/",
        }),
      }),
    );
    expect(workspace.notify).toHaveBeenCalledWith(
      expect.stringContaining("Feedback received"),
    );
    expect(
      screen.queryByRole("dialog", { name: "Help shape BuildWithMe" }),
    ).toBeNull();
  });

  it("keeps failed feedback available for retry and requires sign-in in preview", async () => {
    const user = userEvent.setup();
    workspace.demo = false;
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        json: async () => ({ error: "Please try again later." }),
      }),
    );
    const view = render(<Topbar {...props} />);
    await user.click(screen.getByRole("button", { name: "Feedback" }));
    await user.type(
      screen.getByLabelText("Tell us a little more"),
      "A useful feedback message.",
    );
    await user.click(screen.getByRole("button", { name: "Send feedback" }));
    expect(screen.getByRole("alert").textContent).toBe(
      "Please try again later.",
    );
    expect(
      (screen.getByLabelText("Tell us a little more") as HTMLTextAreaElement)
        .value,
    ).toBe("A useful feedback message.");
    expect(workspace.notify).not.toHaveBeenCalled();
    view.unmount();
    workspace.demo = true;
    render(<Topbar {...props} />);
    await user.click(screen.getByRole("button", { name: "Feedback" }));
    expect(screen.queryByRole("button", { name: "Send feedback" })).toBeNull();
    expect(
      within(screen.getByRole("dialog", { name: "Help shape BuildWithMe" }))
        .getByRole("link", { name: "Sign in" })
        .getAttribute("href"),
    ).toBe("/login");
  });
});
