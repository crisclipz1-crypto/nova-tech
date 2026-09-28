"use client";

/**
 * Última red de seguridad: se activa si falla el propio layout raíz, cuando ya
 * no existe ningún estilo ni proveedor de la app. Por eso incluye sus propias
 * etiquetas `html`/`body` y estilos en línea en vez de clases de Tailwind.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="es-CO">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          padding: "2rem",
          background: "#ffffff",
          color: "#171717",
          fontFamily:
            "ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif",
        }}
      >
        <main style={{ maxWidth: "28rem", textAlign: "center" }}>
          <p
            style={{
              fontFamily: "ui-monospace, SFMono-Regular, monospace",
              fontSize: "0.75rem",
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "#737373",
              margin: 0,
            }}
          >
            NOVA TECH
          </p>

          <h1
            style={{
              fontSize: "1.75rem",
              lineHeight: 1.15,
              letterSpacing: "-0.03em",
              fontWeight: 500,
              margin: "1.5rem 0 0",
            }}
          >
            La tienda no pudo cargar
          </h1>

          <p
            style={{
              margin: "0.75rem 0 0",
              fontSize: "0.9375rem",
              lineHeight: 1.6,
              color: "#525252",
            }}
          >
            Fue un fallo nuestro, no tuyo. Recarga la página; si el problema
            sigue, escríbenos por WhatsApp y te atendemos directamente.
          </p>

          {error.digest && (
            <p
              style={{
                margin: "1rem 0 0",
                fontFamily: "ui-monospace, SFMono-Regular, monospace",
                fontSize: "0.6875rem",
                color: "#737373",
              }}
            >
              Referencia: {error.digest}
            </p>
          )}

          <button
            onClick={reset}
            style={{
              marginTop: "2rem",
              height: "3rem",
              padding: "0 1.75rem",
              borderRadius: "999px",
              border: "none",
              background: "#171717",
              color: "#ffffff",
              fontSize: "0.875rem",
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            Reintentar
          </button>
        </main>
      </body>
    </html>
  );
}
