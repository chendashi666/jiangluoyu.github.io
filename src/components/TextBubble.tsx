import Avatar from "./Avatar";
import type { Message } from "@/types";
import { useAppStore } from "@/store/app";

interface Props {
  message: Message;
  side: "left" | "right";
  showAvatar: boolean;
}

export default function TextBubble({ message, side, showAvatar }: Props) {
  const beauty = useAppStore((s) => s.beauty);
  const isLeft = side === "left";
  const isHer = message.sender !== "me";
  const time = new Date(message.timestamp).toLocaleTimeString("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
  });

  // 表情包消息
  if (message.type === "sticker" && message.sticker) {
    return (
      <div className={`flex items-center gap-2 ${isLeft ? "justify-start" : "justify-end"}`}>
        {isLeft && <div className="w-11 shrink-0">{showAvatar && <Avatar senderId={message.sender} />}</div>}
        <div className={`flex flex-col ${isLeft ? "items-start" : "items-end"}`}>
          {message.moodTag && (
            <span
              className="mb-1 ml-1 inline-flex items-center rounded-full px-2 py-0.5 text-[10px]"
              style={{
                background: "color-mix(in srgb, var(--accent) 15%, transparent)",
                color: "var(--accent)",
                border: "1px solid color-mix(in srgb, var(--accent) 30%, transparent)",
              }}
            >
              💭 {message.moodTag}
            </span>
          )}
          <img
            src={message.sticker}
            alt="sticker"
            className="max-h-32 max-w-[60%] animate-bubbleIn rounded-xl object-contain"
          />
          <span className="mt-1 px-1 text-[10px]" style={{ color: "color-mix(in srgb, var(--text) 50%, transparent)" }}>
            {time}
          </span>
        </div>
        {!isLeft && <div className="w-11 shrink-0">{showAvatar && <Avatar senderId={message.sender} />}</div>}
      </div>
    );
  }

  const bubbleStyle = getBubbleStyle(beauty.bubbleStyle);
  const bgColor = isHer ? "var(--her-card)" : "var(--my-bubble)";

  return (
    <div className={`flex items-center gap-2 ${isLeft ? "justify-start" : "justify-end"}`}>
      {isLeft && (
        <div className="flex w-11 shrink-0 justify-center">{showAvatar && <Avatar senderId={message.sender} />}</div>
      )}
      <div className={`flex flex-col ${isLeft ? "items-start" : "items-end"} max-w-[78%]`}>
        {message.moodTag && (
          <span
            className="mb-1 ml-1 inline-flex items-center rounded-full px-2 py-0.5 text-[10px]"
            style={{
              background: "color-mix(in srgb, var(--accent) 15%, transparent)",
              color: "var(--accent)",
              border: "1px solid color-mix(in srgb, var(--accent) 30%, transparent)",
            }}
          >
            💭 {message.moodTag}
          </span>
        )}
        <div className="relative animate-bubbleIn" style={{ maxWidth: "100%" }}>
          <div
            style={{
              ...bubbleStyle,
              background: bgColor,
              color: "var(--text)",
              overflowWrap: "anywhere",
              wordBreak: "break-word",
            }}
            className="px-4 py-2.5 text-[15px] leading-relaxed"
          >
            {message.text}
          </div>
        </div>
        <span className="mt-1 px-1 text-[10px]" style={{ color: "color-mix(in srgb, var(--text) 50%, transparent)" }}>
          {time}
        </span>
      </div>
      {!isLeft && (
        <div className="flex w-11 shrink-0 justify-center">{showAvatar && <Avatar senderId={message.sender} />}</div>
      )}
    </div>
  );
}

function getBubbleStyle(style: string): React.CSSProperties {
  switch (style) {
    case "round":
      return { borderRadius: "1.25rem", boxShadow: "0 2px 8px -2px rgba(0,0,0,0.15)" };
    case "paper":
      return {
        borderRadius: "0.75rem",
        border: "1px solid var(--card-border)",
        boxShadow: "0 2px 0 rgba(0,0,0,0.06), 0 8px 18px -8px rgba(0,0,0,0.2)",
      };
    case "card":
      return {
        borderRadius: "0.5rem",
        border: "1px solid var(--card-border)",
        boxShadow: "0 1px 0 rgba(0,0,0,0.08)",
      };
    case "cloud":
      return {
        borderRadius: "1.5rem",
        boxShadow: "0 2px 10px -3px rgba(0,0,0,0.18)",
      };
    case "tail":
      return {
        borderRadius: "1rem",
        boxShadow: "0 1px 6px -2px rgba(0,0,0,0.12)",
      };
    case "minimal":
      return {
        borderRadius: "0.5rem",
        boxShadow: "none",
      };
    case "soft":
      return {
        borderRadius: "1.5rem",
        boxShadow: "0 4px 16px -4px rgba(0,0,0,0.1), 0 0 0 1px color-mix(in srgb, var(--accent) 8%, transparent)",
      };
    default:
      return { borderRadius: "1rem" };
  }
}
