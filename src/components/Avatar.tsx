import { useAppStore } from "@/store/app";

interface AvatarProps {
  senderId: string;
  size?: "sm" | "md";
  className?: string;
}

export default function Avatar({ senderId, size = "md", className }: AvatarProps) {
  const beauty = useAppStore((s) => s.beauty);
  const contacts = useAppStore((s) => s.contacts);

  const isMe = senderId === "me";
  let text: string;
  let image: string;

  if (isMe) {
    text = beauty.myAvatar;
    image = beauty.myAvatarImage;
  } else {
    const contact = contacts.find((c) => c.id === senderId);
    if (contact) {
      text = contact.avatar;
      image = contact.avatarImage;
    } else {
      text = "?";
      image = "";
    }
  }

  const dim = size === "sm" ? "h-9 w-9 text-xs" : "h-11 w-11 text-sm";
  const bgVar = isMe ? "var(--accent)" : "var(--text)";
  const textVar = "var(--card)";

  if (image) {
    return (
      <div
        className={`shrink-0 overflow-hidden rounded-xl select-none ${dim} ${className ?? ""}`}
        style={{ boxShadow: "0 2px 0 rgba(0,0,0,0.15)" }}
      >
        <img src={image} alt="avatar" className="h-full w-full object-cover" />
      </div>
    );
  }

  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-xl font-stamp select-none ${dim} ${className ?? ""}`}
      style={{
        background: bgVar,
        color: textVar,
        boxShadow: "0 2px 0 rgba(0,0,0,0.15)",
      }}
    >
      {text}
    </div>
  );
}
