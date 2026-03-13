/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    AI_SERVICE_URL: process.env.AI_SERVICE_URL,
  },
}
module.exports = nextConfig