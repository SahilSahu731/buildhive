import { ImageResponse } from "next/og";
export const alt = "BuildHive — Build it. Test it. Ship it.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export default function Image() {
  return new ImageResponse(
    <div
      style={{
        height: "100%",
        width: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: 72,
        background: "#17232f",
        color: "#f5f7f9",
        fontFamily: "sans-serif",
      }}
    >
      <div style={{ display: "flex", fontSize: 35, fontWeight: 700 }}>
        BuildHive<span style={{ color: "#efbd58" }}>.</span>
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          fontSize: 67,
          fontWeight: 700,
          letterSpacing: -3,
          lineHeight: 1.1,
        }}
      >
        <span>You build the next big thing.</span>
        <span style={{ color: "#efbd58" }}>We check the little things.</span>
      </div>
      <div style={{ display: "flex", fontSize: 22, color: "#abb9c6" }}>
        Real browser tests. Clear answers. Confident releases.
      </div>
    </div>,
    size,
  );
}
