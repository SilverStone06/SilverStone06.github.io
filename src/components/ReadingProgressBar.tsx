// src/components/ReadingProgressBar.tsx
import { memo } from "react";

interface ReadingProgressBarProps {
  progress: number; // 0 ~ 100
}

const ReadingProgressBar = ({ progress }: ReadingProgressBarProps) => {
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "4px",
        zIndex: 50,
        pointerEvents: "none",
        background: "transparent",
      }}
    >
      <div
        style={{
          height: "100%",
          width: `${progress}%`,
          maxWidth: "100%",
          transition: "width 0.15s ease-out",
          backgroundColor: "#fbbf24", 
        }}
      />
    </div>
  );
};

export default memo(ReadingProgressBar);
