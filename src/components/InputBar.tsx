import { useState, useRef, type KeyboardEvent } from "react";
import { Send, Smile, X, ImageIcon } from "lucide-react";
import { useAppStore } from "@/store/app";
import { compressImage } from "@/lib/utils";

export default function InputBar() {
  const conversations = useAppStore((s) => s.conversations);
  const activeConversationId = useAppStore((s) => s.activeConversationId);
  const send = useAppStore((s) => s.send);
  const sendStickerInConv = useAppStore((s) => s.sendStickerInConv);
  const sendImageInConv = useAppStore((s) => s.sendImageInConv);
  const stickers = useAppStore((s) => s.stickers);
  const quotingMessageId = useAppStore((s) => s.quotingMessageId);
  const [text, setText] = useState("");
  const [showStickers, setShowStickers] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeConv = conversations.find((c) => c.id === activeConversationId);
  const isGroup = activeConv?.type === "group";
  const quotedMsg = quotingMessageId ? activeConv?.messages.find((m) => m.id === quotingMessageId) : null;

  const onSend = () => {
    if (!text.trim() || !activeConv) return;
    send(activeConv.id, text);
    setText("");
  };

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  const onPickSticker = (image: string) => {
    if (!activeConv) return;
    sendStickerInConv(activeConv.id, image, "me");
    setShowStickers(false);
  };

  const onPickImage = async (files: FileList | null) => {
    if (!files || !activeConv) return;
    const file = files[0];
    if (!file || !file.type.startsWith("image/")) return;
    try {
      const compressed = await compressImage(file, 800, 0.8);
      sendImageInConv(activeConv.id, compressed, "me");
    } catch (err) {
      console.error("图片发送失败", err);
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const placeholder = isGroup
    ? "说点什么吧"
    : "说点什么吧（Enter 发送）";

  return (
    <div
      className="border-t px-4 py-3 backdrop-blur md:px-8 cute-input-bar"
      style={{
        borderColor: "var(--card-border)",
        background: "color-mix(in srgb, var(--bg-deep) 70%, transparent)",
        paddingBottom: "calc(0.75rem + env(safe-area-inset-bottom))",
      }}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => onPickImage(e.target.files)}
      />

      {quotedMsg && (
        <div className="mx-auto mb-2 flex max-w-3xl items-center gap-2 rounded-lg border-l-2 px-3 py-2"
          style={{
            background: "color-mix(in srgb, var(--accent) 15%, transparent)",
            borderColor: "var(--accent)",
          }}
        >
          <div className="flex-1 min-w-0">
            <div className="text-[11px] font-semibold" style={{ color: "var(--accent)" }}>
              {quotedMsg.sender === "me" ? "我" : "对方"}
            </div>
            <div className="truncate text-[13px] leading-snug" style={{ color: "var(--text)" }}>
              {quotedMsg.text || (quotedMsg.sticker ? "[表情包]" : quotedMsg.image ? "[图片]" : "")}
            </div>
          </div>
          <button
            onClick={() => useAppStore.setState({ quotingMessageId: null })}
            className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full transition hover:bg-black/10"
            style={{ color: "var(--text)" }}
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      )}

      {showStickers && (
        <div
          className="mx-auto mb-2 max-w-3xl animate-slideUp rounded-2xl border p-2"
          style={{
            borderColor: "var(--card-border)",
            background: "var(--card)",
          }}
        >
          <div className="mb-1 flex items-center justify-between px-1">
            <span className="text-[11px]" style={{ color: "var(--text-soft)" }}>
              表情包 · 点击发送
            </span>
            <button
              onClick={() => setShowStickers(false)}
              className="flex h-6 w-6 items-center justify-center rounded-full transition hover:bg-black/10"
              style={{ color: "var(--text-soft)" }}
              aria-label="关闭"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="fancy-scroll max-h-40 overflow-y-auto">
            {stickers.length === 0 ? (
              <div
                className="py-6 text-center text-[11px]"
                style={{ color: "var(--text-soft)" }}
              >
                暂无表情包，去「设置 → 字卡库 → 表情包」导入
              </div>
            ) : (
              <div className="grid grid-cols-6 gap-1.5 p-1 sm:grid-cols-8">
                {stickers.map((st) => (
                  <button
                    key={st.id}
                    onClick={() => onPickSticker(st.image)}
                    className="aspect-square overflow-hidden rounded-lg transition active:scale-90"
                    style={{
                      background: "var(--bg)",
                      border: "1px solid var(--card-border)",
                    }}
                  >
                    <img
                      src={st.image}
                      alt="sticker"
                      className="h-full w-full object-contain"
                      draggable={false}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="mx-auto flex max-w-3xl items-end gap-3 px-1">
        <button
          onClick={() => setShowStickers(!showStickers)}
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border transition hover:bg-black/5 cute-sticker-btn"
          style={{
            borderColor: showStickers ? "var(--accent)" : "var(--card-border)",
            background: showStickers ? "var(--accent)" : "var(--card)",
            color: showStickers ? "var(--card)" : "var(--text-soft)",
          }}
          aria-label="表情包"
          title="表情包"
        >
          <Smile className="h-5 w-5" />
        </button>

        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border transition hover:bg-black/5 cute-image-btn"
          style={{
            borderColor: "var(--card-border)",
            background: "var(--card)",
            color: "var(--text-soft)",
          }}
          aria-label="发送图片"
          title="发送图片"
        >
          <ImageIcon className="h-5 w-5" />
        </button>

        <div
          className="flex-1 rounded-2xl border px-4 py-2.5 shadow-inner focus-within:border-[var(--accent)]"
          style={{
            background: "var(--card)",
            borderColor: "var(--card-border)",
          }}
        >
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={onKeyDown}
            rows={1}
            placeholder={placeholder}
            className="block w-full resize-none bg-transparent text-[15px] leading-relaxed placeholder:opacity-50 focus:outline-none"
            style={{ color: "var(--text)" }}
          />
        </div>
        <button
          onClick={onSend}
          disabled={!text.trim()}
          className="group flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl transition disabled:cursor-not-allowed cute-send-btn"
          style={{
            background: "var(--accent)",
            color: "var(--card)",
            boxShadow: "0 2px 0 rgba(0,0,0,0.15)",
            opacity: !text.trim() ? 0.4 : 1,
          }}
          aria-label="发送"
        >
          <Send className="h-5 w-5 transition group-hover:-translate-y-0.5" />
        </button>
      </div>
    </div>
  );
}
