/** @type {import('next').NextConfig} */
const nextConfig = {
  // 🔸 GitHub Pages 호스팅을 위한 정적 내보내기
  output: 'export',

  // 🔸 정적 호스팅에서 next/image 최적화 비활성(필수)
  images: {
    unoptimized: true,
    domains: [
      'www.notion.so',
      'lh5.googleusercontent.com',
      's3-us-west-2.amazonaws.com',
    ],
  },

  // 🔸 정적 경로 안정화(폴더형 경로로 내보냄)
  trailingSlash: true,

  // 필요하면 추가 옵션 여기(예: reactStrictMode 등)
  // reactStrictMode: true,
};

module.exports = nextConfig;
