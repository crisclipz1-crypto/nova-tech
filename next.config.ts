import type { NextConfig } from "next";

/**
 * Cabeceras de seguridad aplicadas a todas las respuestas.
 *
 * No se incluye Content-Security-Policy: hacerla útil en Next exige propagar
 * un nonce por request desde el proxy hasta cada `<script>`, y una CSP con
 * `'unsafe-inline'` no aporta protección real contra XSS. Ver README →
 * "Siguientes pasos" antes de añadirla.
 */
const securityHeaders = [
  // Nada de esta app debe cargarse dentro de un iframe ajeno (clickjacking).
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  { key: "X-DNS-Prefetch-Control", value: "on" },
];

const nextConfig: NextConfig = {
  // Los drivers de base de datos son módulos nativos: se cargan en tiempo de
  // ejecución en vez de empaquetarse.
  serverExternalPackages: [
    "@prisma/adapter-better-sqlite3",
    "better-sqlite3",
    "@prisma/adapter-pg",
    "pg",
  ],

  images: {
    /**
     * Lista blanca deliberada. El optimizador de imágenes descarga la URL desde
     * el servidor, así que dejar `hostname: "**"` convertiría la tienda en un
     * proxy abierto. Añade aquí el CDN que uses para las fotos de producto.
     */
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "**.public.blob.vercel-storage.com" },
    ],
    formats: ["image/avif", "image/webp"],
  },

  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },

  async redirects() {
    return [
      // Alias cómodos hacia las rutas reales en español.
      { source: "/products", destination: "/productos", permanent: true },
      { source: "/cart", destination: "/carrito", permanent: true },
      { source: "/bag", destination: "/carrito", permanent: true },
    ];
  },
};

export default nextConfig;
