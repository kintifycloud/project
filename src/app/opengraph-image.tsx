import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Kintify VeriKernel on kintify.cloud";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          height: "100%",
          width: "100%",
          background: "linear-gradient(135deg, #030712 0%, #071627 55%, #0c2942 100%)",
          color: "#f8fafc",
          padding: "64px",
          fontFamily: "Inter, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            flex: 1,
            border: "1px solid rgba(148, 163, 184, 0.22)",
            borderRadius: "32px",
            padding: "44px",
            background: "linear-gradient(180deg, rgba(15, 23, 42, 0.88), rgba(15, 23, 42, 0.62))",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", width: "100%" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "20px", maxWidth: "860px" }}>
              <div
                style={{
                  display: "flex",
                  width: "fit-content",
                  alignItems: "center",
                  gap: "10px",
                  borderRadius: "999px",
                  background: "rgba(34, 211, 238, 0.12)",
                  padding: "12px 18px",
                  fontSize: "24px",
                }}
              >
                kintify.cloud
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
                <div style={{ fontSize: "66px", fontWeight: 800, lineHeight: 1.05 }}>
                  Kintify VeriKernel
                </div>
                <div style={{ fontSize: "34px", lineHeight: 1.3, color: "#cbd5e1" }}>
                  Instant cryptographic cloud trust for any .cloud with live DNS + HTTP proofs.
                </div>
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "28px", color: "#94a3b8" }}>
                <span>.cloud proof injection</span>
                <span>Readable trust signals</span>
              </div>
              <div
                style={{
                  display: "flex",
                  borderRadius: "28px",
                  border: "1px solid rgba(45, 212, 191, 0.28)",
                  padding: "20px 24px",
                  fontSize: "24px",
                  color: "#99f6e4",
                }}
              >
                verisig: vk_7xbm8r_2f8n1y
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
    size,
  );
}
