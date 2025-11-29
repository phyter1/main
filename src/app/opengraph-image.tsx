import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Ryan Lowe | Full-Stack Engineer & Infrastructure Architect";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "60px",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {/* Main Content */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
          }}
        >
          {/* Name */}
          <div
            style={{
              fontSize: 72,
              fontWeight: 700,
              color: "#ffffff",
              marginBottom: 20,
              letterSpacing: "-0.02em",
            }}
          >
            Ryan Lowe
          </div>

          {/* Title */}
          <div
            style={{
              fontSize: 40,
              fontWeight: 400,
              color: "#a0a0a0",
              marginBottom: 40,
            }}
          >
            Full-Stack Engineer & Infrastructure Architect
          </div>

          {/* Tags */}
          <div
            style={{
              display: "flex",
              gap: 16,
              flexWrap: "wrap",
              justifyContent: "center",
            }}
          >
            {["TypeScript", "React", "Next.js", "AWS", "PostgreSQL"].map(
              (tag) => (
                <div
                  key={tag}
                  style={{
                    background: "rgba(255, 255, 255, 0.1)",
                    border: "1px solid rgba(255, 255, 255, 0.2)",
                    borderRadius: 8,
                    padding: "12px 24px",
                    fontSize: 24,
                    color: "#e0e0e0",
                  }}
                >
                  {tag}
                </div>
              ),
            )}
          </div>

          {/* Domain */}
          <div
            style={{
              fontSize: 28,
              color: "#606060",
              marginTop: 60,
              fontWeight: 300,
            }}
          >
            ryn.phytertek.com
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    },
  );
}
