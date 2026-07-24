import { useAppStore } from "@/store/app";
import { Flame } from "lucide-react";

export default function AngryModal() {
  const show = useAppStore((s) => s.angryAlert);
  const dismiss = useAppStore((s) => s.dismissAngry);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={dismiss} />
      <div
        className="animate-popIn relative w-full max-w-sm rounded-3xl p-6 text-center"
        style={{
          background: "var(--card)",
          border: "1px solid var(--card-border)",
          boxShadow: "0 30px 60px -15px rgba(0,0,0,0.4)",
        }}
      >
        <div
          className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full"
          style={{
            background: "color-mix(in srgb, var(--accent) 20%, transparent)",
          }}
        >
          <span className="text-4xl">😤</span>
        </div>
        <h3
          className="font-serif text-lg font-bold"
          style={{ color: "var(--accent)" }}
        >
          你的宝宝正在生气
        </h3>
        <p className="mt-2 text-[13px]" style={{ color: "var(--text-soft)" }}>
          快去哄哄他吧～
        </p>
        <button
          onClick={dismiss}
          className="mt-5 w-full rounded-xl py-2.5 text-sm font-medium transition hover:opacity-90"
          style={{ background: "var(--accent)", color: "var(--card)" }}
        >
          我知道了
        </button>
      </div>
    </div>
  );
}
