import type { NextConfig } from "next";

const securityHeaders = [
  // Prevent browsers from guessing MIME types — stops MIME-sniffing attacks
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Deny framing entirely — prevents clickjacking
  { key: "X-Frame-Options", value: "DENY" },
  // Stop referrer leaking to external sites
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Disable browser features not needed by the app
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), payment=()",
  },
  // Content Security Policy — restricts where scripts/styles can load from
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // unsafe-eval needed for Next.js dev; tighten in prod
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: blob:",
      "connect-src 'self' https://openrouter.ai",
      "frame-ancestors 'none'",
    ].join("; "),
  },
  // Enforce HTTPS for 1 year (enable once you have HTTPS in production)
  // { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        // Apply security headers to all routes
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
