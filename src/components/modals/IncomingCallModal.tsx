import { Phone, PhoneOff } from "lucide-react";
import { useAppStore } from "@/store/app";

export default function IncomingCallModal() {
  const incomingCall = useAppStore((s) => s.incomingCall);
  const answerCall = useAppStore((s) => s.answerCall);
  const rejectCall = useAppStore((s) => s.rejectCall);

  if (!incomingCall) return null;

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" />
      <div
        className="relative w-[85%] max-w-sm animate-popIn rounded-2xl border p-6 text-center"
        style={{
          borderColor: "var(--card-border)",
          background: "var(--card)",
        }}
      >
        <div
          className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full text-4xl font-bold"
          style={{ background: "var(--her-card)" }}
        >
          {incomingCall.contactAvatar}
        </div>
        <div
          className="mb-2 font-serif text-xl font-bold"
          style={{ color: "var(--text)" }}
        >
          {incomingCall.contactName}
        </div>
        <div
          className="mb-8 text-sm animate-pulse"
          style={{ color: "#2ECC71" }}
        >
          来电中...
        </div>

        <div className="flex justify-center gap-8">
          <button
            onClick={rejectCall}
            className="flex h-16 w-16 items-center justify-center rounded-full transition hover:scale-105 active:scale-95"
            style={{
              background: "#E74C3C",
              color: "white",
              boxShadow: "0 4px 15px rgba(231, 76, 60, 0.4)",
            }}
          >
            <PhoneOff className="h-8 w-8" />
          </button>
          <button
            onClick={answerCall}
            className="flex h-16 w-16 items-center justify-center rounded-full transition hover:scale-105 active:scale-95"
            style={{
              background: "#2ECC71",
              color: "white",
              boxShadow: "0 4px 15px rgba(46, 204, 113, 0.4)",
            }}
          >
            <Phone className="h-8 w-8" />
          </button>
        </div>
      </div>
    </div>
  );
}
