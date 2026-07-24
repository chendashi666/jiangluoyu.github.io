import { useState } from "react";
import { X, Palette, MessageSquare, Library, Smartphone, Database } from "lucide-react";
import { useAppStore } from "@/store/app";
import BeautyPanel from "./settings/BeautyPanel";
import ChatSettingPanel from "./settings/ChatSettingPanel";
import CardLibraryPanel from "./settings/CardLibraryPanel";
import PhoneAppPanel from "./settings/PhoneAppPanel";
import BackupPanel from "./settings/BackupPanel";

type Tab = "beauty" | "chat" | "cards" | "phone" | "backup";

const TABS: { key: Tab; label: string; icon: React.ReactNode }[] = [
  { key: "beauty", label: "美化", icon: <Palette className="h-4 w-4" /> },
  { key: "chat", label: "聊天设置", icon: <MessageSquare className="h-4 w-4" /> },
  { key: "cards", label: "字卡库", icon: <Library className="h-4 w-4" /> },
  { key: "phone", label: "手机小应用", icon: <Smartphone className="h-4 w-4" /> },
  { key: "backup", label: "备份", icon: <Database className="h-4 w-4" /> },
];

export default function SettingsDrawer() {
  const open = useAppStore((s) => s.settingsOpen);
  const setOpen = useAppStore((s) => s.setSettingsOpen);
  const [tab, setTab] = useState<Tab>("beauty");

  return (
    <>
      {/* 遮罩 */}
      <div
        onClick={() => setOpen(false)}
        className={`fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      <aside
        className={`fixed right-0 top-0 z-50 h-full w-[440px] max-w-[95vw] transform transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
        style={{ background: "var(--bg)" }}
      >
        <div className="flex h-full flex-col border-l" style={{ borderColor: "var(--card-border)" }}>
          {/* 顶部 */}
          <header
            className="flex items-center justify-between border-b px-5 py-3"
            style={{ borderColor: "var(--card-border)" }}
          >
            <div className="flex items-center gap-2">
              <span className="text-lg">🖤</span>
              <span className="font-serif text-base font-bold" style={{ color: "var(--text)" }}>
                设置
              </span>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="flex h-10 w-10 items-center justify-center rounded-full transition hover:bg-black/10 active:scale-90"
              style={{ color: "var(--text-soft)" }}
              aria-label="关闭"
            >
              <X className="h-5 w-5" />
            </button>
          </header>

          {/* Tabs */}
          <div
            className="flex gap-1 border-b px-3 py-2"
            style={{ borderColor: "var(--card-border)" }}
          >
            {TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-medium transition ${
                  tab === t.key ? "shadow" : "opacity-70 hover:opacity-100"
                }`}
                style={{
                  background: tab === t.key ? "var(--accent)" : "transparent",
                  color: tab === t.key ? "var(--card)" : "var(--text)",
                }}
              >
                {t.icon}
                <span className="hidden sm:inline">{t.label}</span>
              </button>
            ))}
          </div>

          {/* 内容 */}
          <div className="fancy-scroll flex-1 overflow-y-auto p-4">
            {tab === "beauty" && <BeautyPanel />}
            {tab === "chat" && <ChatSettingPanel />}
            {tab === "cards" && <CardLibraryPanel />}
            {tab === "phone" && <PhoneAppPanel />}
            {tab === "backup" && <BackupPanel />}
          </div>
        </div>
      </aside>
    </>
  );
}
