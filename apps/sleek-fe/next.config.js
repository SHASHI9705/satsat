import nextPwa from 'next-pwa';

/** @type {import('next').NextConfig} */
const nextConfig = {};

const withPWA = nextPwa({
  // Completely disable next-pwa
  disable: true,
});

export default withPWA({
  ...nextConfig,
});
