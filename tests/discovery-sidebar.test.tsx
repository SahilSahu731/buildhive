// @vitest-environment jsdom
import type { ReactNode } from "react";
import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DiscoverySidebar } from "@/components/layout/discovery-sidebar";
import { demoProfiles, makeDemoData } from "@/lib/demo-data";

const workspace = {
  data: makeDemoData(),
  me: demoProfiles[0],
  demo: false,
  loading: false,
  notify: vi.fn(),
  requestConnection: vi.fn(),
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
  workspace.data = makeDemoData();
  workspace.demo = false;
  workspace.loading = false;
  vi.clearAllMocks();
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("feed discovery sidebar", () => {
  it("links real popular projects and opens profiles for available, unconnected builders", async () => {
    const user = userEvent.setup();
    workspace.data.projects.push({
      ...workspace.data.projects[0],
      id: "my-project",
      ownerId: workspace.me.id,
      upvotes: 1000,
    });
    render(<DiscoverySidebar pathname="/" />);
    const projects = screen.getByRole("region", {
      name: "Products to discover",
    });
    expect(within(projects).getAllByRole("link")[0].getAttribute("href")).toBe(
      "/explore?project=folio",
    );
    expect(
      within(projects).queryByRole("link", { name: /1000 upvotes/ }),
    ).toBeNull();
    expect(
      screen.queryByRole("button", { name: "View Maya Chen's profile" }),
    ).toBeNull();
    expect(
      screen.queryByRole("button", { name: "View Nina Park's profile" }),
    ).toBeNull();
    expect(
      screen.queryByRole("button", { name: "View James Wilson's profile" }),
    ).toBeNull();
    await user.click(
      screen.getByRole("button", { name: "View Arjun Patel's profile" }),
    );
    const profile = screen.getByRole("dialog", { name: "Builder profile" });
    await user.click(
      within(profile).getByRole("button", { name: "Let's connect" }),
    );
    expect(workspace.requestConnection).toHaveBeenCalledWith("arjun");
  });

  it("submits a promotion request through the existing private feedback endpoint", async () => {
    const user = userEvent.setup(),
      fetch = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal("fetch", fetch);
    render(<DiscoverySidebar pathname="/bookmarks" />);
    await user.click(
      screen.getByRole("button", { name: "Promote your product" }),
    );
    const dialog = screen.getByRole("dialog", { name: "Promote your product" });
    expect(within(dialog).queryByRole("radio")).toBeNull();
    const message =
      "My product: https://example.test — a tool for indie builders.";
    await user.type(
      within(dialog).getByLabelText("Your product, link, and ideal audience"),
      message,
    );
    await user.click(
      within(dialog).getByRole("button", { name: "Send request" }),
    );
    expect(fetch).toHaveBeenCalledWith(
      "/api/feedback",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          category: "other",
          message: `Product promotion request\n\n${message}`,
          path: "/bookmarks",
        }),
      }),
    );
    expect(workspace.notify).toHaveBeenCalledWith(
      "Your product promotion request has been received.",
    );
    expect(
      screen.queryByRole("dialog", { name: "Promote your product" }),
    ).toBeNull();
  });

  it("handles empty discovery data and requires sign-in for promotion requests in preview", async () => {
    const user = userEvent.setup();
    workspace.data.projects = [];
    workspace.data.profiles = [workspace.me];
    workspace.demo = true;
    render(<DiscoverySidebar pathname="/" />);
    expect(
      screen
        .getByRole("link", { name: "Explore all projects" })
        .getAttribute("href"),
    ).toBe("/explore");
    expect(
      screen
        .getByRole("link", { name: "Discover more builders" })
        .getAttribute("href"),
    ).toBe("/cofounders");
    expect(screen.queryByRole("button", { name: /View .+profile/ })).toBeNull();
    await user.click(
      screen.getByRole("button", { name: "Promote your product" }),
    );
    const dialog = screen.getByRole("dialog", { name: "Promote your product" });
    expect(
      within(dialog).queryByRole("button", { name: "Send request" }),
    ).toBeNull();
    expect(
      within(dialog)
        .getByRole("link", { name: "Sign in" })
        .getAttribute("href"),
    ).toBe("/login");
  });
});
