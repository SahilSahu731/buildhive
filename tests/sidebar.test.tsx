// @vitest-environment jsdom
import { useCallback, useState } from "react";
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
import { Sidebar } from "@/components/layout/sidebar";
import { useSidebarPreference } from "@/components/layout/use-sidebar-preference";
import { demoProfiles } from "@/lib/demo-data";

const actions = { compose: vi.fn(), settings: vi.fn() };
let mobile = false;

function Harness() {
  const [collapsed, toggle] = useSidebarPreference();
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);
  return (
    <>
      <button onClick={() => setOpen(true)}>Open navigation</button>
      <Sidebar
        pathname="/messages"
        me={demoProfiles[0]}
        demo
        collapsed={collapsed}
        mobileOpen={open}
        pendingRequests={2}
        unreadMessages={3}
        onToggle={toggle}
        onClose={close}
        onCompose={actions.compose}
        settingsOpen={false}
        onSettings={actions.settings}
      />
    </>
  );
}

beforeEach(() => {
  mobile = false;
  localStorage.clear();
  vi.clearAllMocks();
  vi.stubGlobal(
    "matchMedia",
    vi.fn(() => ({
      matches: mobile,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  );
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("collapsible sidebar", () => {
  it("saves the rail preference, restores it after remount, and syncs cross-tab changes", async () => {
    const user = userEvent.setup();
    const first = render(<Harness />);
    await user.click(screen.getByRole("button", { name: "Collapse sidebar" }));
    expect(
      screen
        .getByRole("button", { name: "Expand sidebar" })
        .getAttribute("aria-expanded"),
    ).toBe("false");
    expect(localStorage.getItem("buildwithme:sidebar-collapsed")).toBe("true");
    first.unmount();
    render(<Harness />);
    expect(screen.getByRole("button", { name: "Expand sidebar" })).toBeTruthy();
    act(() => {
      localStorage.setItem("buildwithme:sidebar-collapsed", "false");
      window.dispatchEvent(
        new StorageEvent("storage", { key: "buildwithme:sidebar-collapsed" }),
      );
    });
    await screen.findByRole("button", { name: "Collapse sidebar" });
  });

  it("keeps navigation and actions named and working in the icon rail", async () => {
    localStorage.setItem("buildwithme:sidebar-collapsed", "true");
    const user = userEvent.setup();
    render(<Harness />);
    expect(
      screen
        .getByRole("link", { name: "Messages" })
        .getAttribute("aria-current"),
    ).toBe("page");
    expect(screen.getByLabelText("3 unread messages").textContent).toBe("3");
    expect(screen.getByLabelText("2 pending requests").textContent).toBe("2");
    await user.click(screen.getByRole("button", { name: "Create a post" }));
    expect(
      screen.queryByRole("button", { name: "Search builders and projects" }),
    ).toBeNull();
    await user.click(screen.getByRole("button", { name: "Settings" }));
    expect(actions.compose).toHaveBeenCalledTimes(1);
    expect(actions.settings).toHaveBeenCalledTimes(1);
    expect(
      screen
        .getByRole("link", { name: `Your profile, ${demoProfiles[0].name}` })
        .getAttribute("href"),
    ).toBe("/profile");
  });

  it("traps focus in the mobile drawer, closes with Escape, and restores focus without changing the rail preference", async () => {
    mobile = true;
    localStorage.setItem("buildwithme:sidebar-collapsed", "true");
    const user = userEvent.setup();
    render(<Harness />);
    const opener = screen.getByRole("button", { name: "Open navigation" });
    await user.click(opener);
    const close = screen.getByRole("button", {
      name: "Close navigation",
    });
    expect(document.activeElement).toBe(close);
    expect(
      screen
        .getByRole("dialog", { name: "Sidebar" })
        .getAttribute("aria-modal"),
    ).toBe("true");
    expect(document.body.classList.contains("overflow-hidden")).toBe(true);
    const home = screen.getByRole("link", { name: "BuildWithMe home" });
    home.focus();
    fireEvent.keyDown(home, { key: "Tab", shiftKey: true });
    expect(document.activeElement).toBe(
      screen.getByRole("link", {
        name: `Your profile, ${demoProfiles[0].name}`,
      }),
    );
    fireEvent.keyDown(document.activeElement!, { key: "Tab" });
    expect(document.activeElement).toBe(home);
    await user.keyboard("{Escape}");
    await waitFor(() => expect(document.activeElement).toBe(opener));
    expect(screen.queryByRole("dialog", { name: "Sidebar" })).toBeNull();
    expect(document.body.classList.contains("overflow-hidden")).toBe(false);
    expect(localStorage.getItem("buildwithme:sidebar-collapsed")).toBe("true");
  });

  it("still collapses when browser storage is blocked", async () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new DOMException("Storage blocked", "SecurityError");
    });
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new DOMException("Storage blocked", "SecurityError");
    });
    const user = userEvent.setup();
    render(<Harness />);
    const toggle = screen.getByRole("button", {
      name: /sidebar$/,
    });
    const before = toggle.getAttribute("aria-expanded");
    await user.click(toggle);
    expect(
      screen
        .getByRole("button", { name: /sidebar$/ })
        .getAttribute("aria-expanded"),
    ).not.toBe(before);
    vi.restoreAllMocks();
  });
});
