"use client";

export default function GlobalError({ retry }: { error: Error & { digest?: string }; retry: () => void }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, minHeight: "100vh", display: "grid", placeItems: "center", background: "#07101d", color: "#f5f9ff", fontFamily: "system-ui, sans-serif" }}>
        <main style={{ maxWidth: 420, padding: 28, textAlign: "center" }}>
          <p style={{ color: "#8cc0ff", fontSize: 11, fontWeight: 800, letterSpacing: ".14em", textTransform: "uppercase" }}>PRO Goaltending</p>
          <h1 style={{ fontSize: 34 }}>The athlete experience was interrupted.</h1>
          <p style={{ color: "#b8c7d9", lineHeight: 1.6 }}>Your local demo data remains in this browser.</p>
          <button onClick={retry} style={{ minHeight: 46, padding: "0 20px", border: 0, borderRadius: 13, background: "#0b66ff", color: "white", fontWeight: 700, cursor: "pointer" }}>Try again</button>
        </main>
      </body>
    </html>
  );
}
