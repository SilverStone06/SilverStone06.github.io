// next.config.mjs
export default {
  output: 'export',            // 정적 내보내기 (out/ 폴더 생성)
  images: { unoptimized: true }, // Pages에서 next/image 최적화 비활성
  trailingSlash: true,         // 정적 경로 안정화
}
