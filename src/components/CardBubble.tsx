import Avatar from "./Avatar";
import type { Message } from "@/types";
import { useAppStore } from "@/store/app";

interface Props {
  message: Message;
  side: "left" | "right";
  showAvatar: boolean;
  isNew?: boolean;
}

export default function CardBubble({ message, side, showAvatar }: Props) {
  const beauty = useAppStore((s) => s.beauty);
  const isLeft = side === "left";
  const card = message.card!;
  const time = new Date(message.timestamp).toLocaleTimeString("zh-CN", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div
      className={`flex items-end gap-2 ${isLeft ? "justify-start" : "justify-end"}`}
    >
      {isLeft && (
        <div className="w-11 shrink-0">{showAvatar && <Avatar senderId={message.sender} />}</div>
      )}
      <div className={`flex flex-col ${isLeft ? "items-start" : "items-end"} max-w-[78%]`}>
        {card.group && (
          <div
            className="mb-1 rounded-full px-2 py-0.5 text-[10px] animate-bubbleIn"
            style={{
              background: "color-mix(in srgb, var(--accent) 15%, transparent)",
              color: "var(--accent)",
            }}
          >
            {card.group}
          </div>
        )}
        <div
          className={`card-face animate-cardIn ${beauty.bubbleStyle === "round" ? "rounded-2xl" : ""}`}
          style={{ transform: isLeft ? "rotate(-2deg)" : "rotate(2deg)" }}
        >
          <div className="relative z-[1] w-56 px-4 py-4">
            <div
              className="font-serif text-lg font-bold leading-snug"
              style={{ color: "var(--text)" }}
            >
              {card.name}
            </div>
            <div className="mt-2 h-px w-full" style={{ background: "var(--card-border)" }} />
            <div
              className="mt-2 text-[13px] leading-relaxed"
              style={{ color: "color-mix(in srgb, var(--text) 70%, transparent)" }}
            >
              {card.content}
            </div>
          </div>
        </div>
        <span
          className="mt-1 px-1 text-[10px]"
          style={{ color: "color-mix(in srgb, var(--text) 50%, transparent)" }}
        >
          {time}
        </span>
      </div>
      {!isLeft && (
        <div className="w-11 shrink-0">{showAvatar && <Avatar senderId={message.sender} />}</div>
      )}
    </div>
  );
}