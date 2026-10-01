import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const alt = "Power Bank Bangladesh: generator sell, exchange, rental, service and spare parts";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  const logo = await readFile(join(process.cwd(), "public/pbb-logo.png"));
  const logoSrc = `data:image/png;base64,${logo.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: "#ffffff",
          color: "#14181b",
        }}
      >
        <div style={{ display: "flex", flex: 1, alignItems: "center", padding: "0 72px", gap: 48 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={logoSrc} width={220} height={220} alt="" />
          <div style={{ display: "flex", flexDirection: "column", gap: 18, width: 760 }}>
            <div style={{ fontSize: 30, fontWeight: 700, color: "#ed7423", letterSpacing: 1 }}>
              POWER BANK BANGLADESH
            </div>
            <div style={{ fontSize: 60, fontWeight: 800, lineHeight: 1.1 }}>
              Diesel Generators in Bangladesh
            </div>
            <div style={{ fontSize: 30, color: "#3f464c" }}>
              Sell, Exchange, Rental, Service & Spare Parts
            </div>
            <div style={{ fontSize: 26, color: "#3f464c" }}>Dhaka & Chattogram</div>
          </div>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            background: "#ed7423",
            color: "#ffffff",
            padding: "26px 72px",
            fontSize: 28,
            fontWeight: 700,
          }}
        >
          <div>+88 (0) 1989 474 447</div>
          <div>powerbankbangladesh.com</div>
        </div>
      </div>
    ),
    size,
  );
}
