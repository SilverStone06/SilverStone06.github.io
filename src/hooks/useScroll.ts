// src/hooks/useScroll.ts
import { useEffect, useState } from "react";

/**
 * useScroll
 * 글 본문(또는 특정 컨텐츠)에 대한 스크롤 읽기 진행률을 계산하는 Hook
 *
 * @param targetRef 진행률을 계산할 대상 요소 ref (보통 글 전체를 감싼 div)
 * @param offsetTop 고정 헤더 높이 등으로 조정하고 싶을 때 사용 (기본 0)
 * @returns completion (0~100 범위의 스크롤 진행 퍼센트)
 */
const useScroll = (
  targetRef: React.RefObject<HTMLElement>,
  offsetTop: number = 0
) => {
  const [completion, setCompletion] = useState(0);

  useEffect(() => {
    const calculateProgress = () => {
      const target = targetRef.current;
      if (!target) return;

      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;

      // 본문 시작 지점
      const elementTop =
        target.getBoundingClientRect().top + window.scrollY - offsetTop;

      // 본문 전체 길이
      const elementHeight = target.offsetHeight;

      // 본문이 너무 짧은 경우 (한 화면보다 짧음)
      if (elementHeight <= windowHeight) {
        setCompletion(scrollY <= elementTop ? 0 : 100);
        return;
      }

      // 스크롤 가능한 최대값
      const maxScroll = elementTop + elementHeight - windowHeight;

      // 본문 들어가기 전
      if (scrollY <= elementTop) {
        setCompletion(0);
        return;
      }

      // 본문 다 읽었을 때
      if (scrollY >= maxScroll) {
        setCompletion(100);
        return;
      }

      // 중간 구간 (0~100 계산)
      const progress =
        ((scrollY - elementTop) / (maxScroll - elementTop)) * 100;
      setCompletion(Math.min(100, Math.max(0, progress)));
    };

    // 스크롤 부하 줄이기 위한 requestAnimationFrame
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          calculateProgress();
          ticking = false;
        });
        ticking = true;
      }
    };

    calculateProgress(); // 초기 계산

    window.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, [targetRef, offsetTop]);

  return completion;
};

export default useScroll;
