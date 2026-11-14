/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
};

async function withSentryConfig(nextConfig) {
  const { withSentryConfig } = await import("@sentry/nextjs/config");
  return withSentryConfig(nextConfig, {
    org: process.env.SENTRY_ORG,
    project: process.env.SENTRY_PROJECT,
    authToken: process.env.SENTRY_AUTH_TOKEN,
    silent: !process.env.SENTRY_DSN,
    widenClientFileUpload: true,
    reactComponentAnnotation: {
      enabled: true,
    },
  });
}

export default withSentryConfig(nextConfig);