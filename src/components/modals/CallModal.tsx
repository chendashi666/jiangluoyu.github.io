import React, { useEffect, useRef } from "react";
import { Phone, PhoneOff, Minimize2 } from "lucide-react";
import { useAppStore } from "@/store/app";

export default function CallModal() {
  const activeCall = useAppStore((s) => s.activeCall);
  const activeCallDuration = useAppStore((s) => s.activeCallDuration);
  const callModalOpen = useAppStore((s) => s.callModalOpen);
  const setCallModalOpen = useAppStore((s) => s.setCallModalOpen);
  const endActiveCall = useAppStore((s) => s.endActiveCall);
  const updateActiveCallDuration = useAppStore((s) => s.updateActiveCallDuration);
  const minimizeActiveCall = useAppStore((s) => s.minimizeActiveCall);

  const timerRef = useRef<number | null>(null);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  useEffect(() => {
    if (activeCall?.status === "connected") {
      timerRef.current = window.setInterval(() => {
        updateActiveCallDuration(activeCallDuration + 1);
      }, 1000);
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [activeCall?.status, activeCallDuration, updateActiveCallDuration]);

  const handleEndCall = () => {
    endActiveCall();
  };

  const handleClose = () => {
    if (activeCall?.status === "connected") return;
    setCallModalOpen(false);
  };

  const handleMinimize = () => {
    minimizeActiveCall();
  };

  if (!callModalOpen || !activeCall) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/60"
        onClick={
          activeCall.status === "rejected" || activeCall.status === "ended"
            ? handleClose
            : undefined
        }
      />

      <div
        className="relative flex w-[90%] max-w-xs flex-col items-center rounded-2xl border p-8 shadow-2xl animate-popIn"
        style={{
          borderColor: "var(--card-border)",
          background: "var(--card)",
        }}
      >
        {activeCall.status === "connected" && (
          <button
            onClick={handleMinimize}
            className="absolute right-4 top-4 flex h-7 w-7 items-center justify-center rounded-full transition hover:bg-black/5"
            style={{ color: "var(--text-soft)" }}
            aria-label="最小化"
          >
            <Minimize2 className="h-4 w-4" />
          </button>
        )}

        <div
          className="mb-4 flex h-20 w-20 items-center justify-center rounded-full text-3xl font-bold"
          style={{ background: "var(--bg)", color: "var(--text)" }}
        >
          {activeCall.contactAvatar || "他"}
        </div>

        <div
          className="mb-1 text-lg font-bold"
          style={{ color: "var(--text)" }}
        >
          {activeCall.contactName}
        </div>

        <div
          className="mb-8 text-sm"
          style={{ color: "var(--text-soft)" }}
        >
          {activeCall.status === "calling" && "呼叫中..."}
          {activeCall.status === "rejected" && "对方已挂断"}
          {activeCall.status === "connected" && formatDuration(activeCallDuration)}
          {activeCall.status === "ended" && "通话结束"}
        </div>

        {activeCall.status === "calling" && (
          <button
            onClick={handleEndCall}
            className="flex h-16 w-16 items-center justify-center rounded-full transition hover:scale-105 active:scale-95"
            style={{
              background: "#E74C3C",
              color: "white",
              boxShadow: "0 4px 15px rgba(231, 76, 60, 0.4)",
            }}
            aria-label="挂断电话"
          >
            <PhoneOff className="h-8 w-8" />
          </button>
        )}

        {activeCall.status === "connected" && (
          <button
            onClick={handleEndCall}
            className="flex h-16 w-16 items-center justify-center rounded-full transition hover:scale-105 active:scale-95"
            style={{
              background: "#E74C3C",
              color: "white",
              boxShadow: "0 4px 15px rgba(231, 76, 60, 0.4)",
            }}
            aria-label="挂断电话"
          >
            <PhoneOff className="h-8 w-8" />
          </button>
        )}

        {(activeCall.status === "rejected" || activeCall.status === "ended") && (
            <button
              onClick={handleClose}
              className="flex h-16 w-16 items-center justify-center rounded-full transition hover:scale-105 active:scale-95"
              style={{
                background: "#E74C3C",
                color: "white",
                boxShadow: "0 4px 15px rgba(231, 76, 60, 0.4)",
              }}
              aria-label="关闭"
            >
              <PhoneOff className="h-8 w-8" />
            </button>
          )}
      </div>
    </div>
  );
}
