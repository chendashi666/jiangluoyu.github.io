import React, { useState, useRef, useEffect } from "react";
import { PhoneOff, Maximize2, GripVertical } from "lucide-react";
import { useAppStore } from "@/store/app";

export default function FloatingPhone() {
  const floatingPhone = useAppStore((s) => s.floatingPhone);
  const activeCall = useAppStore((s) => s.activeCall);
  const activeCallDuration = useAppStore((s) => s.activeCallDuration);
  const setCallModalOpen = useAppStore((s) => s.setCallModalOpen);
  const endActiveCall = useAppStore((s) => s.endActiveCall);

  const [pos, setPos] = useState({ x: 16, y: 100 });
  const dragging = useRef(false);
  const moved = useRef(false);
  const offset = useRef({ x: 0, y: 0 });

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  useEffect(() => {
    if (floatingPhone && activeCall) {
      setPos({
        x: typeof window !== "undefined" ? window.innerWidth - 180 : 100,
        y: typeof window !== "undefined" ? window.innerHeight - 160 : 100,
      });
    }
  }, [floatingPhone, activeCall]);

  const startDrag = (clientX: number, clientY: number) => {
    dragging.current = true;
    moved.current = false;
    offset.current = {
      x: clientX - pos.x,
      y: clientY - pos.y,
    };
  };

  const onDrag = (clientX: number, clientY: number) => {
    if (!dragging.current) return;
    moved.current = true;
    const width = 170;
    const height = 52;
    setPos({
      x: Math.max(8, Math.min(window.innerWidth - width - 8, clientX - offset.current.x)),
      y: Math.max(8, Math.min(window.innerHeight - height - 8, clientY - offset.current.y)),
    });
  };

  const endDrag = () => {
    dragging.current = false;
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => onDrag(e.clientX, e.clientY);
    const handleMouseUp = () => endDrag();
    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        onDrag(e.touches[0].clientX, e.touches[0].clientY);
      }
    };
    const handleTouchEnd = () => endDrag();

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("touchmove", handleTouchMove, { passive: false });
    window.addEventListener("touchend", handleTouchEnd);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, []);

  const handleClick = () => {
    if (moved.current) return;
    setCallModalOpen(true);
  };

  const handleEndCall = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    endActiveCall();
  };

  if (!floatingPhone || !activeCall) return null;

  return (
    <div
      className="fixed z-[200] select-none"
      style={{ left: pos.x, top: pos.y }}
    >
      <div
        className="flex items-center gap-1.5 rounded-full border px-2 py-1.5 shadow-lg transition hover:shadow-xl"
        style={{
          borderColor: "var(--card-border)",
          background: "var(--card)",
        }}
      >
        <div
          className="flex h-8 w-6 shrink-0 items-center justify-center rounded-full cursor-grab active:cursor-grabbing hover:bg-black/5"
          style={{ color: "var(--text-soft)" }}
          onMouseDown={(e) => { e.preventDefault(); startDrag(e.clientX, e.clientY); }}
          onTouchStart={(e) => startDrag(e.touches[0].clientX, e.touches[0].clientY)}
          title="拖动移动"
        >
          <GripVertical className="h-4 w-4" />
        </div>

        <div
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold cursor-pointer"
          style={{ background: "var(--bg)", color: "var(--text)" }}
          onClick={handleClick}
          title="点击恢复通话"
        >
          {activeCall.contactAvatar || "他"}
        </div>

        <div className="flex flex-col cursor-pointer" onClick={handleClick}>
          <div
            className="text-xs font-bold leading-tight"
            style={{ color: "var(--text)" }}
          >
            {activeCall.contactName}
          </div>
          <div
            className="text-[10px] leading-tight"
            style={{ color: "#2ECC71" }}
          >
            {activeCall.status === "calling" && "呼叫中..."}
            {activeCall.status === "connected" && formatDuration(activeCallDuration)}
            {activeCall.status === "rejected" && "已挂断"}
          </div>
        </div>

        <button
          onClick={handleEndCall}
          onTouchStart={(e) => { e.stopPropagation(); }}
          className="ml-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition hover:scale-110"
          style={{
            background: "#E74C3C",
            color: "white",
          }}
          aria-label="挂断"
        >
          <PhoneOff className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
