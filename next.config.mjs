/** @type {import('next').NextConfig} */
const removed = ["/village", "/jeotgal", "/post", "/picnic", "/album", "/quests"];
const nextConfig = {
  reactStrictMode: true,
  // 범위를 줄이며 없앤 화면: 예전 링크·QR로 들어와도 첫 장으로 안내
  async redirects() { return removed.map((source) => ({ source, destination: "/", permanent: false })); },
};
export default nextConfig;
