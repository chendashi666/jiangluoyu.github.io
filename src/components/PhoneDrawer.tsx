import { Smartphone, X } from "lucide-react";
import { useAppStore } from "@/store/app";
import PhoneTabs from "./phone/PhoneTabs";

export default function PhoneDrawer() {
  const open = useAppStore((s) => s.phoneOpen);
  const setOpen = useAppStore((s) => s.setPhoneOpen);
  const conversations = useAppStore((s) => s.conversations);
  const activeConversationId = useAppStore((s) => s.activeConversationId);
  const contacts = useAppStore((s) => s.contacts);

  const conv = conversations.find((c) => c.id === activeConversationId);
  let title = "他的手机";
  if (conv && conv.type === "private" && conv.memberIds[0]) {
    const contact = contacts.find((c) => c.id === conv.memberIds[0]);
    if (contact) title = `${contact.name}的手机`;
  }

  return (
    <>
      <div
        onClick={() => setOpen(false)}
        className={`fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity duration-300 lg:hidden ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      <aside
        className={`fixed right-0 top-0 z-50 h-full w-[380px] max-w-[90vw] transform transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]`}
        style={{
          transform: open ? "translateX(0)" : "translateX(100%)",
          background: "var(--bg)",
        }}
      >
        <div
          className="flex h-full flex-col border-l"
          style={{ borderColor: "var(--card-border)" }}
        >
          <header
            className="flex items-center justify-between border-b px-5 py-3"
            style={{ borderColor: "var(--card-border)" }}
          >
            <div className="flex items-center gap-2">
              <Smartphone className="h-4 w-4" style={{ color: "var(--accent)" }} />
              <span
                className="font-serif text-sm font-bold"
                style={{ color: "var(--text)" }}
              >
                {title}
              </span>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="flex h-7 w-7 items-center justify-center rounded-full transition hover:bg-black/10"
              style={{ color: "var(--text-soft)" }}
              aria-label="收起"
            >
              <X className="h-4 w-4" />
            </button>
          </header>

          <div className="fancy-scroll flex-1 overflow-y-auto p-4">
            <PhoneTabs />
            <p
              className="mt-4 text-center text-[10px]"
              style={{ color: "color-mix(in srgb, var(--text) 40%, transparent)" }}
            >
              偷看一眼就好——他不会知道的。
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}
