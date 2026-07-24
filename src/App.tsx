import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "@/pages/Home";
import ThemeApplier from "@/theme/ThemeApplier";
import FloatingPhone from "@/components/FloatingPhone";
import FloatingMusic from "@/components/FloatingMusic";
import MusicPlayerModal from "@/components/MusicPlayerModal";
import DriftBottleModal from "@/components/modals/DriftBottleModal";
import ErrorBoundary from "@/components/ErrorBoundary";
import { useEffect, useRef, useState } from "react";
import { useAppStore } from "@/store/app";

const basename = import.meta.env.BASE_URL;
const NOTIFICATION_ICON = "https://i.postimg.cc/ZKVRS4kH/retouch-2026071501420750.png";

export default function App() {
  const [notificationGranted, setNotificationGranted] = useState(false);
  const beauty = useAppStore((s) => s.beauty);
  const pushNotification = useAppStore((s) => s.chat.pushNotification);
  const lastMsgIdRef = useRef<string | null>(null);
  const lastMemoIdRef = useRef<string | null>(null);

  useEffect(() => {
    if ("Notification" in window) {
      Notification.requestPermission().then((permission) => {
        setNotificationGranted(permission === "granted");
      });
    }
  }, []);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && notificationGranted && pushNotification) {
        document.title = "💬 苜蓿 · 有新消息";
      } else {
        document.title = "苜蓿";
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [notificationGranted, pushNotification]);

  useEffect(() => {
    const checkNewMessage = () => {
      if (!notificationGranted || !document.hidden || !pushNotification) return;

      const state = useAppStore.getState();
      const activeConv = state.conversations.find((c) => c.id === state.activeConversationId);
      const messages = activeConv?.messages || [];
      const lastMsg = messages[messages.length - 1];
      if (!lastMsg || lastMsg.id === lastMsgIdRef.current) return;
      lastMsgIdRef.current = lastMsg.id;

      if (lastMsg.type === "system") {
        new Notification("苜蓿", {
          body: lastMsg.systemText,
          icon: NOTIFICATION_ICON,
        });
      } else if (lastMsg.sender !== "me" && lastMsg.text) {
        const senderName = lastMsg.sender === "her"
          ? beauty.herName
          : state.contacts.find((c) => c.id === lastMsg.sender)?.name || "对方";
        new Notification(`${senderName} 回复了你的消息`, {
          body: lastMsg.text.substring(0, 100),
          icon: NOTIFICATION_ICON,
        });
      }
    };

    const checkNewMemo = () => {
      if (!notificationGranted || !document.hidden || !pushNotification) return;

      const state = useAppStore.getState();
      const latest = state.memos[0];
      if (!latest || latest.id === lastMemoIdRef.current) return;
      lastMemoIdRef.current = latest.id;

      if (latest.from === "me") return;
      if (Date.now() - latest.timestamp > 10000) return;

      const senderName =
        state.contacts.find((c) => c.id === latest.from)?.name || beauty.herName;
      new Notification(`${senderName} 给你发来一封信`, {
        body: latest.text.substring(0, 100),
        icon: NOTIFICATION_ICON,
      });
    };

    const unsubscribe = useAppStore.subscribe(() => {
      checkNewMessage();
      checkNewMemo();
    });

    return unsubscribe;
  }, [notificationGranted, beauty.herName, pushNotification]);

  return (
    <>
      <ThemeApplier />
      <ErrorBoundary>
        <Router basename={basename}>
          <Routes>
            <Route path="/" element={<Home />} />
          </Routes>
        </Router>
      </ErrorBoundary>
      <ErrorBoundary fallback={<></>}>
        <FloatingPhone />
      </ErrorBoundary>
      <ErrorBoundary fallback={<></>}>
        <FloatingMusic />
      </ErrorBoundary>
      <ErrorBoundary fallback={<></>}>
        <MusicPlayerModal />
      </ErrorBoundary>
      <ErrorBoundary fallback={<></>}>
        <DriftBottleModal />
      </ErrorBoundary>
    </>
  );
}
