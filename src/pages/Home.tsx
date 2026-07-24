import { useEffect, useState, useMemo } from "react";
import { useAppStore } from "@/store/app";
import ChatHeader from "@/components/ChatHeader";
import InputBar from "@/components/InputBar";
import MessageList from "@/components/MessageList";
import DesktopPet from "@/components/DesktopPet";
import PhoneDrawer from "@/components/PhoneDrawer";
import SettingsDrawer from "@/components/SettingsDrawer";
import CaughtModal from "@/components/CaughtModal";
import AngryModal from "@/components/AngryModal";
import MealAlert from "@/components/MealAlert";
import IncomingCallModal from "@/components/modals/IncomingCallModal";
import CallModal from "@/components/modals/CallModal";
import LoadingScreen from "@/components/LoadingScreen";
import { Eye } from "lucide-react";
import type { CardModule } from "@/types/card";
import type { MealRecord } from "@/types";

export default function Home() {
  const conversations = useAppStore((s) => s.conversations);
  const activeConversationId = useAppStore((s) => s.activeConversationId);
  const contacts = useAppStore((s) => s.contacts);
  const toggleView = useAppStore((s) => s.toggleView);
  const pickRandomCard = useAppStore((s) => s.pickRandomCard);
  const beauty = useAppStore((s) => s.beauty);
  const [loading, setLoading] = useState(true);

  const activeConv = useMemo(
    () => conversations.find((c) => c.id === activeConversationId),
    [conversations, activeConversationId]
  );

  const isPrivate = activeConv?.type === "private";
  const isHer = activeConv?.view === "her";
  const contactId = isPrivate ? activeConv!.memberIds[0] : null;
  const contact = useMemo(
    () => (contactId ? contacts.find((c) => c.id === contactId) : undefined),
    [contacts, contactId]
  );
  const herStatus = contact?.status;
  const herMeals = herStatus?.meals || [];
  const herName = contact?.name || beauty.herName;

  useEffect(() => {
    const t = window.setTimeout(() => setLoading(false), 1150);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!isPrivate || !contactId) return;

    const check = () => {
      const state = useAppStore.getState();
      const currentContact = state.contacts.find((c) => c.id === contactId);
      if (!currentContact) return;

      const last = currentContact.status.body.lastUpdateAt;
      const now = Date.now();
      const elapsed = now - last;

      if (elapsed > 60 * 60 * 1000 && Math.random() < 0.3) {
        useAppStore.setState((s) => ({
          contacts: s.contacts.map((c) =>
            c.id === contactId
              ? {
                  ...c,
                  status: {
                    ...c.status,
                    body: {
                      ...c.status.body,
                      temp: Math.max(36, Math.min(37.5, c.status.body.temp + (Math.random() * 0.4 - 0.2))),
                      heartRate: Math.max(60, Math.min(95, c.status.body.heartRate + (Math.random() * 10 - 5))),
                      fatigue: Math.max(10, Math.min(90, c.status.body.fatigue + (Math.random() * 10 - 5))),
                      heartRateHistory: [
                        ...c.status.body.heartRateHistory.slice(-11),
                        Math.round(c.status.body.heartRate),
                      ],
                      lastUpdateAt: now,
                    },
                  },
                }
              : c
          ),
        }));
      }
    };

    const timer = setInterval(check, 10 * 60 * 1000);
    return () => clearInterval(timer);
  }, [isPrivate, contactId]);

  useEffect(() => {
    if (!isPrivate || !contactId) return;

    const checkMeals = () => {
      const now = new Date();
      const hour = now.getHours();
      const minute = now.getMinutes();
      const timeVal = hour * 60 + minute;
      const today = now.toISOString().slice(0, 10);

      const state = useAppStore.getState();
      const currentContact = state.contacts.find((c) => c.id === contactId);
      if (!currentContact) return;

      const todayMeals = new Set(
        currentContact.status.meals.filter((m) => m.date === today).map((m) => m.meal),
      );

      const tryRecordMeal = (meal: "breakfast" | "lunch" | "dinner", module: CardModule, probability: number) => {
        if (todayMeals.has(meal)) return;
        if (Math.random() >= probability) return;

        const card = state.pickRandomCard(contactId, module);
        if (!card) return;

        const hh = String(hour).padStart(2, "0");
        const mm = String(minute).padStart(2, "0");
        const record: MealRecord = {
          date: today,
          meal,
          name: card.name,
          content: card.content,
          time: `${hh}:${mm}`,
        };

        useAppStore.setState((s) => ({
          contacts: s.contacts.map((c) =>
            c.id === contactId
              ? {
                  ...c,
                  status: {
                    ...c.status,
                    meals: [...c.status.meals, record],
                  },
                }
              : c
          ),
          mealAlert: { meal, name: card.name },
        }));
      };

      if (timeVal >= 300 && timeVal <= 510) {
        tryRecordMeal("breakfast", "breakfast", 0.15);
      }

      if (timeVal >= 690 && timeVal <= 750) {
        tryRecordMeal("lunch", "lunch", 0.2);
      }

      if (timeVal >= 990 && timeVal <= 1170) {
        tryRecordMeal("dinner", "dinner", 0.12);
      }
    };

    const timer = setInterval(checkMeals, 60 * 1000);
    checkMeals();
    return () => clearInterval(timer);
  }, [isPrivate, contactId]);

  useEffect(() => {
    if (!isPrivate || !contactId) return;

    let lastWorkUpdateKey = "";

    const checkWorkUpdate = () => {
      const now = new Date();
      const hour = now.getHours();
      const today = now.toISOString().slice(0, 10);

      // 四个时间点：6点、12点、18点、0点（凌晨）
      const timePoints = [0, 6, 12, 18];
      const currentPoint = timePoints.filter((t) => t <= hour).pop() || 0;
      const updateKey = `${today}-${currentPoint}`;

      if (updateKey === lastWorkUpdateKey) return;
      lastWorkUpdateKey = updateKey;

      const state = useAppStore.getState();
      const currentContact = state.contacts.find((c) => c.id === contactId);
      if (!currentContact) return;

      // 随机抽取工作地点
      const locationCard = state.pickRandomCard(contactId, "workLocation");
      const contentCard = state.pickRandomCard(contactId, "workContent");

      let newStatus: "working" | "resting" | "off" = "working";
      if (currentPoint === 0) {
        newStatus = "off"; // 凌晨是下班状态
      } else if (currentPoint === 6) {
        newStatus = Math.random() > 0.3 ? "working" : "resting";
      } else if (currentPoint === 12) {
        newStatus = "resting"; // 中午休息
      } else if (currentPoint === 18) {
        newStatus = Math.random() > 0.4 ? "off" : "working"; // 下午6点可能下班也可能加班
      }

      useAppStore.setState((s) => ({
        contacts: s.contacts.map((c) =>
          c.id === contactId
            ? {
                ...c,
                status: {
                  ...c.status,
                  work: {
                    ...c.status.work,
                    status: newStatus,
                    content: contentCard?.content || c.status.work.content,
                    location: locationCard?.name || c.status.work.location,
                    lastStatusChange: Date.now(),
                  },
                },
              }
            : c
        ),
      }));
    };

    const timer = setInterval(checkWorkUpdate, 60 * 1000);
    checkWorkUpdate();
    return () => clearInterval(timer);
  }, [isPrivate, contactId]);

  if (!activeConv) {
    return (
      <div className="relative flex h-full flex-col">
        {loading && <LoadingScreen minDuration={1200} />}
        <ChatHeader />
        <main className="relative flex-1 overflow-hidden">
        <div className="relative h-full">
          <MessageList />
          <DesktopPet />
        </div>
      </main>
        <PhoneDrawer />
        <SettingsDrawer />
        <CaughtModal />
        <AngryModal />
        <MealAlert />
      </div>
    );
  }

  return (
    <div className="relative flex h-full flex-col">
      {loading && <LoadingScreen minDuration={1200} />}
      <ChatHeader />

      <main className="relative flex-1 overflow-hidden">
        <div key={activeConv.id + "-" + activeConv.view} className="relative flex h-full flex-col">
          <div className="relative flex flex-1 flex-col overflow-hidden">
            <MessageList />
            <DesktopPet />
          </div>
          {isPrivate && isHer ? (
            <div
              className="border-t px-4 py-4 backdrop-blur md:px-8"
              style={{
                borderColor: "var(--card-border)",
                background: "color-mix(in srgb, var(--bg-deep) 60%, transparent)",
                paddingBottom: "calc(1rem + env(safe-area-inset-bottom))",
              }}
            >
              <div
                className="mx-auto flex max-w-3xl items-center justify-center gap-2"
                style={{ color: "var(--text-soft)" }}
              >
                <Eye className="h-4 w-4" />
                <span className="text-[13px]">此为{herName}的视角，仅可查看</span>
                <button
                  onClick={() => toggleView(activeConv.id)}
                  className="ml-2 rounded-full px-3 py-1 text-[11px] font-medium transition hover:opacity-90"
                  style={{ background: "var(--accent)", color: "var(--card)" }}
                >
                  回到我的视角
                </button>
              </div>
            </div>
          ) : isPrivate && !isHer ? (
            <InputBar />
          ) : (
            <InputBar />
          )}
        </div>
      </main>

      <PhoneDrawer />
      <SettingsDrawer />
      <CaughtModal />
      <AngryModal />
      <MealAlert />
      <IncomingCallModal />
      <CallModal />
    </div>
  );
}
