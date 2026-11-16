// @vitest-environment jsdom
import { useState, type ReactNode } from "react";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { SettingsDialog } from "@/components/layout/settings-dialog";
import { demoProfiles } from "@/lib/demo-data";

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
afterEach(cleanup);

function Harness({
  demo = true,
  onReset = vi.fn(),
  onClose = vi.fn(),
  onSignOut = vi.fn(),
}) {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <SettingsDialog
      open
      onClose={onClose}
      me={demoProfiles[0]}
      demo={demo}
      collapsed={collapsed}
      onToggleSidebar={() => setCollapsed((value) => !value)}
      onResetDemo={onReset}
      onSignOut={onSignOut}
    />
  );
}

describe("sidebar settings", () => {
  it("lets the user toggle compact mode and access their profile", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    const toggle = screen.getByRole<HTMLInputElement>("switch", {
      name: "Compact sidebar",
    });
    expect(toggle.checked).toBe(false);
    await user.click(toggle);
    expect(toggle.checked).toBe(true);
    await user.keyboard(" ");
    expect(toggle.checked).toBe(false);
    expect(
      screen
        .getByRole("link", { name: /View and edit your profile/ })
        .getAttribute("href"),
    ).toBe("/profile");
  });

  it("keeps demo reset available in settings and closes after resetting", async () => {
    const user = userEvent.setup(),
      onReset = vi.fn(),
      onClose = vi.fn();
    render(<Harness onReset={onReset} onClose={onClose} />);
    await user.click(
      screen.getByRole("button", { name: "Reset demo workspace" }),
    );
    expect(onReset).toHaveBeenCalledOnce();
    expect(onClose).toHaveBeenCalledOnce();
    expect(
      screen.getByRole("link", { name: "Sign in" }).getAttribute("href"),
    ).toBe("/login");
  });

  it("offers sign out for a real account", async () => {
    const user = userEvent.setup(),
      onSignOut = vi.fn();
    render(<Harness demo={false} onSignOut={onSignOut} />);
    await user.click(screen.getByRole("button", { name: "Sign out" }));
    expect(onSignOut).toHaveBeenCalledOnce();
    expect(
      screen.queryByRole("button", { name: "Reset demo workspace" }),
    ).toBeNull();
  });
});
