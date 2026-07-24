import { useEffect, useState } from "react";

interface Props {
  minDuration?: number; // ms
}

export default function LoadingScreen({ minDuration = 1000 }: Props) {
  const [visible, setVisible] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const startTime = Date.now();
    let raf = 0;

    const tick = () => {
      const elapsed = Date.now() - startTime;
      const p = Math.min(100, (elapsed / minDuration) * 100);
      setProgress(p);
      if (p < 100) {
        raf = requestAnimationFrame(tick);
      }
    };
    raf = requestAnimationFrame(tick);

    const t = window.setTimeout(() => {
      setProgress(100);
      setFadeOut(true);
      window.setTimeout(() => setVisible(false), 400);
    }, minDuration + 150);

    return () => {
      clearTimeout(t);
      cancelAnimationFrame(raf);
    };
  }, [minDuration]);

  if (!visible) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center transition-opacity duration-400"
      style={{
        background: "var(--bg)",
        opacity: fadeOut ? 0 : 1,
      }}
    >
      {/* 苜蓿小图标 */}
      <div className="mb-4">
        <svg
          width="48"
          height="48"
          viewBox="0 0 80 80"
          fill="none"
          style={{ color: "var(--accent)" }}
        >
          <g transform="translate(40 40)">
            <path
              d="M 0 -22 C -8 -28, -16 -20, -14 -10 C -12 -2, -6 2, 0 -4 C 6 2, 12 -2, 14 -10 C 16 -20, 8 -28, 0 -22 Z"
              fill="currentColor"
              opacity="0.9"
            />
            <path
              d="M 22 0 C 28 -8, 20 -16, 10 -14 C 2 -12, -2 -6, 4 0 C -2 6, 2 12, 10 14 C 20 16, 28 8, 22 0 Z"
              fill="currentColor"
              opacity="0.75"
            />
            <path
              d="M 0 22 C 8 28, 16 20, 14 10 C 12 2, 6 -2, 0 4 C -6 -2, -12 2, -14 10 C -16 20, -8 28, 0 22 Z"
              fill="currentColor"
              opacity="0.85"
            />
            <path
              d="M -22 0 C -28 8, -20 16, -10 14 C -2 12, 2 6, -4 0 C 2 -6, -2 -12, -10 -14 C -20 -16, -28 -8, -22 0 Z"
              fill="currentColor"
              opacity="0.7"
            />
            <circle cx="0" cy="0" r="4" fill="currentColor" opacity="1" />
          </g>
        </svg>
      </div>

      {/* 标题 */}
      <h1
        className="mb-5 font-serif text-xl font-bold tracking-[0.25em]"
        style={{ color: "var(--text)" }}
      >
        苜 蓿
      </h1>

      {/* 进度条容器 */}
      <div className="relative w-48">
        <div
          className="h-3 w-full overflow-hidden rounded-full"
          style={{
            background: "color-mix(in srgb, var(--accent) 15%, transparent)",
          }}
        >
          <div
            className="h-full rounded-full transition-all duration-100"
            style={{
              width: `${progress}%`,
              background: "linear-gradient(90deg, var(--accent), color-mix(in srgb, var(--accent) 70%, var(--card)))",
              boxShadow: "0 0 8px color-mix(in srgb, var(--accent) 50%, transparent)",
            }}
          />
        </div>

        {/* 小装饰点 */}
        <div
          className="absolute -top-1 flex gap-1 transition-all duration-100"
          style={{ left: `calc(${progress}% - 6px)` }}
        >
          <span
            className="h-2 w-2 rounded-full"
            style={{ background: "var(--accent)" }}
          />
          <span
            className="h-2 w-2 rounded-full opacity-50"
            style={{ background: "var(--accent)" }}
          />
        </div>
      </div>

      {/* 进度文字 */}
      <p
        className="mt-2 text-[11px] tracking-widest"
        style={{ color: "color-mix(in srgb, var(--text) 45%, transparent)" }}
      >
        {Math.round(progress)}%
      </p>
    </div>
  );
}
