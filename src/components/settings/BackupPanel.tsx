import { useState, useRef } from "react";
import { Download, Upload, Database, AlertTriangle, Check } from "lucide-react";
import { useAppStore } from "@/store/app";

export default function BackupPanel() {
  const [status, setStatus] = useState<string>("");
  const [error, setError] = useState<string>("");
  const fileRef = useRef<HTMLInputElement>(null);

  const handleBackup = () => {
    try {
      const state = useAppStore.getState();
      const backupData = {
        version: 2,
        exportTime: new Date().toISOString(),
        contacts: state.contacts,
        conversations: state.conversations,
        songs: state.songs,
        stickers: state.stickers,
        cardGroups: state.cardGroups,
        beauty: state.beauty,
        chat: state.chat,
        callRecords: state.callRecords,
        memos: state.memos,
        driftBottles: state.driftBottles,
        tomatoStats: state.tomatoStats,
        groupConversationId: state.groupConversationId,
        activeConversationId: state.activeConversationId,
      };

      const json = JSON.stringify(backupData, null, 2);
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      const now = new Date();
      const ts = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}_${String(now.getHours()).padStart(2, "0")}${String(now.getMinutes()).padStart(2, "0")}`;
      a.href = url;
      a.download = `backup_${ts}.json`;
      a.click();
      URL.revokeObjectURL(url);

      const sizeKB = (blob.size / 1024).toFixed(1);
      setStatus(`备份成功！文件大小 ${sizeKB} KB`);
      setError("");
    } catch (e) {
      setError(`备份失败：${e instanceof Error ? e.message : String(e)}`);
      setStatus("");
    }
  };

  const handleRestore = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target?.result as string);
        if (!data.contacts || !data.conversations) {
          setError("文件格式不正确，不是有效的备份文件");
          setStatus("");
          return;
        }

        const state = useAppStore.getState();

        // 恢复数据
        useAppStore.setState({
          contacts: data.contacts,
          conversations: data.conversations,
          songs: data.songs || [],
          stickers: data.stickers || [],
          cardGroups: data.cardGroups || ["日常", "撒娇", "关心"],
          beauty: data.beauty || state.beauty,
          chat: data.chat || state.chat,
          callRecords: data.callRecords || [],
          memos: data.memos || [],
          driftBottles: data.driftBottles || [],
          tomatoStats: data.tomatoStats || {},
          groupConversationId: data.groupConversationId || "",
          activeConversationId: data.activeConversationId || "",
        });

        const contactCount = data.contacts?.length || 0;
        const convCount = data.conversations?.length || 0;
        const songCount = data.songs?.length || 0;
        const stickerCount = data.stickers?.length || 0;
        setStatus(`恢复成功！联系人 ${contactCount} 个，会话 ${convCount} 个，歌曲 ${songCount} 首，表情包 ${stickerCount} 张`);
        setError("");
      } catch (err) {
        setError(`恢复失败：${err instanceof Error ? err.message : String(err)}`);
        setStatus("");
      }
    };
    reader.onerror = () => {
      setError("读取文件失败");
      setStatus("");
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const state = useAppStore.getState();
  const dataSize = JSON.stringify({
    contacts: state.contacts,
    conversations: state.conversations,
    songs: state.songs,
    stickers: state.stickers,
  }).length;
  const sizeKB = (dataSize / 1024).toFixed(1);

  return (
    <div className="flex flex-col gap-3">
      <div
        className="rounded-xl p-4"
        style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}
      >
        <div className="mb-2 flex items-center gap-2">
          <Database className="h-5 w-5" style={{ color: "var(--accent)" }} />
          <span className="font-serif text-sm font-bold" style={{ color: "var(--text)" }}>
            全量备份
          </span>
        </div>
        <p className="text-[11px] leading-relaxed" style={{ color: "var(--text-soft)" }}>
          一键备份所有数据，包括联系人、字卡库、聊天记录、歌曲库、表情包、通话记录、备忘录、漂流瓶等。
        </p>
      </div>

      <div
        className="rounded-xl p-4"
        style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}
      >
        <div className="mb-3 text-[11px]" style={{ color: "var(--text-soft)" }}>
          当前数据量约 <span style={{ color: "var(--accent)" }}>{sizeKB} KB</span>
        </div>

        <div className="flex flex-col gap-2">
          <button
            onClick={handleBackup}
            className="flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-medium transition hover:opacity-90"
            style={{
              background: "var(--accent)",
              color: "var(--card)",
            }}
          >
            <Download className="h-4 w-4" />
            下载备份文件
          </button>

          <button
            onClick={() => fileRef.current?.click()}
            className="flex items-center justify-center gap-2 rounded-xl border py-3 text-sm font-medium transition hover:bg-black/5"
            style={{
              borderColor: "var(--card-border)",
              color: "var(--text)",
            }}
          >
            <Upload className="h-4 w-4" />
            从文件恢复
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            onChange={handleRestore}
            className="hidden"
          />
        </div>
      </div>

      {status && (
        <div
          className="flex items-start gap-2 rounded-xl p-3 text-[12px]"
          style={{
            background: "color-mix(in srgb, #22c55e 15%, transparent)",
            border: "1px solid color-mix(in srgb, #22c55e 40%, transparent)",
            color: "#16a34a",
          }}
        >
          <Check className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{status}</span>
        </div>
      )}

      {error && (
        <div
          className="flex items-start gap-2 rounded-xl p-3 text-[12px]"
          style={{
            background: "color-mix(in srgb, #ef4444 15%, transparent)",
            border: "1px solid color-mix(in srgb, #ef4444 40%, transparent)",
            color: "#dc2626",
          }}
        >
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div
        className="rounded-xl p-3 text-[10px] leading-relaxed"
        style={{
          background: "var(--card)",
          border: "1px solid var(--card-border)",
          color: "var(--text-soft)",
        }}
      >
        <p className="mb-1 font-medium">⚠️ 注意事项：</p>
        <ul className="list-disc space-y-0.5 pl-4">
          <li>恢复数据会覆盖当前所有数据</li>
          <li>建议定期下载备份文件并妥善保存</li>
          <li>备份文件包含所有联系人字卡库和聊天记录</li>
          <li>恢复后需要刷新页面才能完全生效</li>
        </ul>
      </div>
    </div>
  );
}
