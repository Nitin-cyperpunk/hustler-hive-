import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Hustlers Hive — Ideas Meet Impact";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "flex-start",
          padding: "80px",
          background: "linear-gradient(135deg, #080B12 0%, #0D1422 50%, #121C2C 100%)",
          fontFamily: "Inter, system-ui, sans-serif",
        }}
      >
        {/* Cyan accent bar */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "4px",
            background: "linear-gradient(to right, #22D3EE, #FACC15)",
          }}
        />

        {/* Ambient glow */}
        <div
          style={{
            position: "absolute",
            top: "50%",
            right: "10%",
            width: "400px",
            height: "400px",
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(34,211,238,0.15), transparent 70%)",
            transform: "translateY(-50%)",
          }}
        />

        {/* Eyebrow */}
        <div
          style={{
            fontSize: 16,
            fontWeight: 600,
            letterSpacing: "0.2em",
            color: "#22D3EE",
            textTransform: "uppercase" as const,
            marginBottom: 24,
          }}
        >
          Student Tech Community · Nashik
        </div>

        {/* Headline */}
        <div
          style={{
            fontSize: 72,
            fontWeight: 800,
            lineHeight: 1.1,
            color: "#F8FAFC",
            display: "flex",
            flexWrap: "wrap",
          }}
        >
          Ideas Meet{" "}
          <span style={{ color: "#FACC15", marginLeft: 18 }}>Impact</span>
        </div>

        {/* Description */}
        <div
          style={{
            fontSize: 22,
            lineHeight: 1.5,
            color: "#94A3B8",
            maxWidth: 600,
            marginTop: 24,
          }}
        >
          A student-driven technology community building the next generation of
          technologists through collaboration and open source.
        </div>

        {/* Brand footer */}
        <div
          style={{
            position: "absolute",
            bottom: 60,
            left: 80,
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <div
            style={{
              fontSize: 24,
              fontWeight: 700,
              color: "#F8FAFC",
              display: "flex",
              gap: 8,
            }}
          >
            <span style={{ color: "#22D3EE" }}>Hustlers</span>
            <span style={{ color: "#FACC15" }}>Hive</span>
          </div>
        </div>

        {/* URL */}
        <div
          style={{
            position: "absolute",
            bottom: 60,
            right: 80,
            fontSize: 16,
            color: "#64748B",
          }}
        >
          hustlerhive.vercel.app
        </div>
      </div>
    ),
    { ...size },
  );
}
