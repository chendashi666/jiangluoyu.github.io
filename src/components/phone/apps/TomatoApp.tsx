import { AppHeader } from "./HomeScreen";
import { useAppStore } from "@/store/app";

function getTodayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default function TomatoApp({ onBack }: { onBack: () => void }) {
  const conversations = useAppStore((s) => s.conversations);
  const activeConversationId = useAppStore((s) => s.activeConversationId);
  const tomatoStats = useAppStore((s) => s.tomatoStats);

  const activeConv = conversations.find((c) => c.id === activeConversationId);
  const activeContactId = activeConv?.type === "private" ? activeConv.memberIds[0] : undefined;

  const today = getTodayKey();

  const isPrivate = activeContactId !== undefined;
  const key = isPrivate ? `${activeContactId}:${today}` : "";
  const stat = isPrivate
    ? tomatoStats[key] || { thrownByMe: 0, thrownAtMe: 0 }
    : { thrownByMe: 0, thrownAtMe: 0 };

  const totalByMe = stat.thrownByMe;
  const totalAtMe = stat.thrownAtMe;
  const totalAll = totalByMe + totalAtMe;

  return (
    <div>
      <AppHeader title="番茄计数器" onBack={onBack} />
      <div className="flex flex-col gap-3 px-3 py-3">
        <div
          className="rounded-2xl p-5 text-center"
          style={{
            background: "linear-gradient(135deg, #FF6B6B22, #FF8E5322)",
            border: "1px solid var(--card-border)",
          }}
        >
          <div className="text-5xl">🍅</div>
          <div className="mt-2 font-serif text-xl font-bold" style={{ color: "var(--text)" }}>
            今日番茄大战
          </div>
          <div className="mt-1 text-[11px]" style={{ color: "var(--text-soft)" }}>
            {today}
          </div>
        </div>

        {!isPrivate ? (
          <div
            className="rounded-xl p-4 text-center text-[12px]"
            style={{
              background: "var(--card)",
              border: "1px solid var(--card-border)",
              color: "var(--text-soft)",
            }}
          >
            请在私聊中查看番茄计数
          </div>
        ) : (
          <>
            <div
              className="rounded-xl p-4"
              style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}
            >
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">😤</span>
                  <span className="text-[12px] font-medium" style={{ color: "var(--text)" }}>
                    我扔出
                  </span>
                </div>
                <span
                  className="font-serif text-lg font-bold"
                  style={{ color: "#FF6B6B" }}
                >
                  {totalByMe}
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full" style={{ background: "var(--bg-deep)" }}>
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: totalAll > 0 ? `${(totalByMe / totalAll) * 100}%` : "0%",
                    background: "linear-gradient(90deg, #FF6B6B, #FF8E53)",
                  }}
                />
              </div>
            </div>

            <div
              className="rounded-xl p-4"
              style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}
            >
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🥺</span>
                  <span className="text-[12px] font-medium" style={{ color: "var(--text)" }}>
                    被扔
                  </span>
                </div>
                <span
                  className="font-serif text-lg font-bold"
                  style={{ color: "#E91E63" }}
                >
                  {totalAtMe}
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full" style={{ background: "var(--bg-deep)" }}>
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: totalAll > 0 ? `${(totalAtMe / totalAll) * 100}%` : "0%",
                    background: "linear-gradient(90deg, #E91E63, #9C27B0)",
                  }}
                />
              </div>
            </div>

            <div
              className="rounded-xl p-4 text-center"
              style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}
            >
              <div className="text-[11px]" style={{ color: "var(--text-soft)" }}>
                今日总共扔了
              </div>
              <div
                className="mt-1 font-serif text-2xl font-bold"
                style={{ color: "var(--accent)" }}
              >
                {totalAll} 🍅
              </div>
              <div className="mt-1 text-[10px]" style={{ color: "var(--text-soft)" }}>
                {totalByMe > totalAtMe
                  ? "你赢了！对方被你扔惨了 😎"
                  : totalAtMe > totalByMe
                  ? "你输了…被对方追着扔 😢"
                  : "势均力敌，不分上下！⚔️"}
              </div>
            </div>
          </>
        )}

        <div
          className="rounded-xl p-3 text-[10px] leading-relaxed"
          style={{
            background: "var(--card)",
            border: "1px solid var(--card-border)",
            color: "var(--text-soft)",
          }}
        >
          <p>💡 小提示：</p>
          <ul className="mt-1 list-disc space-y-0.5 pl-4">
            <li>左滑对方头像可以扔番茄</li>
            <li>可以选择扔 1-3 个番茄</li>
            <li>番茄会在头像上停留 40 秒</li>
            <li>每天 0 点自动清零计数</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
