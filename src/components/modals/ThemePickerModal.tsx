import { useState } from "react";
import { X, Sun, Moon, Sparkles, Palette } from "lucide-react";
import { useAppStore } from "@/store/app";
import { FLAVOR_THEMES, SIMPLE_THEMES, RICH_THEMES, LIGHT_EXTRA_THEMES, DARK_THEMES } from "@/theme/themes";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

type TabKey = "flavor" | "light" | "dark" | "simple" | "rich";

const TABS: { key: TabKey; label: string; icon: React.ReactNode }[] = [
  { key: "flavor", label: "风味", icon: <Sparkles className="h-3.5 w-3.5" /> },
  { key: "light", label: "浅色", icon: <Sun className="h-3.5 w-3.5" /> },
  { key: "dark", label: "深色", icon: <Moon className="h-3.5 w-3.5" /> },
  { key: "simple", label: "简约", icon: <Palette className="h-3.5 w-3.5" /> },
  { key: "rich", label: "丰富", icon: <Sparkles className="h-3.5 w-3.5" /> },
];

export default function ThemePickerModal({ isOpen, onClose }: Props) {
  const themeId = useAppStore((s) => s.beauty.themeId);
  const setBeauty = useAppStore((s) => s.setBeauty);
  const [tab, setTab] = useState<TabKey>("flavor");

  if (!isOpen) return null;

  const themeMap: Record<TabKey, typeof FLAVOR_THEMES> = {
    flavor: FLAVOR_THEMES,
    light: LIGHT_EXTRA_THEMES,
    dark: DARK_THEMES,
    simple: SIMPLE_THEMES,
    rich: RICH_THEMES,
  };

  const themes = themeMap[tab];

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-popIn"
      onClick={onClose}
    >
      <div
        className="relative flex max-h-[88vh] w-[420px] max-w-[94vw] flex-col overflow-hidden rounded-2xl shadow-2xl"
        style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 顶部标题栏 - X 按钮独立位置，不与任何图标重叠 */}
        <header
          className="flex shrink-0 items-center justify-between px-5 py-4"
          style={{ borderBottom: "1px solid var(--card-border)" }}
        >
          <div className="flex items-center gap-2">
            <Palette className="h-5 w-5" style={{ color: "var(--accent)" }} />
            <span className="font-serif text-base font-bold" style={{ color: "var(--text)" }}>
              更换主题
            </span>
          </div>
          <button
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-full transition hover:bg-black/10 active:scale-90"
            style={{ color: "var(--text-soft)" }}
            aria-label="关闭"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        {/* 分类标签 */}
        <div
          className="flex shrink-0 gap-1 px-3 py-2"
          style={{ borderBottom: "1px solid var(--card-border)" }}
        >
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-medium transition ${
                tab === t.key ? "shadow" : "opacity-70 hover:opacity-100"
              }`}
              style={{
                background: tab === t.key ? "var(--accent)" : "transparent",
                color: tab === t.key ? "var(--card)" : "var(--text)",
              }}
            >
              {t.icon}
              <span>{t.label}</span>
            </button>
          ))}
        </div>

        {/* 主题列表 - 可滚动 */}
        <div className="fancy-scroll flex-1 overflow-y-auto p-4">
          {tab === "simple" ? (
            <div className="grid grid-cols-4 gap-3">
              {themes.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setBeauty({ themeId: t.id })}
                  className="group flex flex-col items-center gap-1.5 rounded-lg p-1.5 transition hover:scale-105"
                  title={t.name}
                >
                  <div
                    className={`h-10 w-10 rounded-full border-2 shadow ${themeId === t.id ? "ring-2 ring-offset-2 ring-offset-transparent" : ""}`}
                    style={{
                      background: t.accent,
                      borderColor: themeId === t.id ? t.accent : "var(--card-border)",
                      "--tw-ring-color": t.accent,
                    } as React.CSSProperties}
                  />
                  <span className="text-[10px]" style={{ color: "var(--text-soft)" }}>
                    {t.name.split("·")[1] || t.name}
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3">
              {themes.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setBeauty({ themeId: t.id })}
                  className={`group flex flex-col items-center gap-1.5 rounded-lg p-2 text-left transition hover:scale-105 ${
                    themeId === t.id ? "shadow-md" : "opacity-90 hover:opacity-100"
                  }`}
                  style={{
                    background: t.bg,
                    border: themeId === t.id ? `2px solid ${t.accent}` : `1px solid ${t.cardBorder}`,
                  }}
                >
                  <div
                    className="h-12 w-full rounded-md"
                    style={{
                      background: `linear-gradient(135deg, ${t.bg} 0%, ${t.card} 60%, ${t.myBubble} 100%)`,
                    }}
                  />
                  <span
                    className="text-[10px] font-medium leading-tight"
                    style={{ color: themeId === t.id ? t.accent : t.text }}
                  >
                    {t.name}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 底部状态 */}
        <footer
          className="flex shrink-0 items-center justify-between px-5 py-3"
          style={{ borderTop: "1px solid var(--card-border)", background: "var(--bg-deep)" }}
        >
          <span className="text-[11px]" style={{ color: "var(--text-soft)" }}>
            当前主题
          </span>
          <span className="font-serif text-sm font-bold" style={{ color: "var(--accent)" }}>
            {[...FLAVOR_THEMES, ...SIMPLE_THEMES, ...RICH_THEMES, ...LIGHT_EXTRA_THEMES, ...DARK_THEMES].find((t) => t.id === themeId)?.name || "默认"}
          </span>
        </footer>
      </div>
    </div>
  );
}
