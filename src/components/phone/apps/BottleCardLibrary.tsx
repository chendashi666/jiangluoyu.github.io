import { useState, useRef } from "react";
import { ArrowLeft, Plus, Trash2, FileText, Volume2 } from "lucide-react";
import { useAppStore } from "@/store/app";

type CardType = "note" | "whisper";

const CARD_CONFIG: Record<CardType, { title: string; icon: React.ReactNode; color: string }> = {
  note: { title: "纸条库", icon: <FileText className="h-4 w-4" />, color: "#FFB347" },
  whisper: { title: "悄悄话库", icon: <Volume2 className="h-4 w-4" />, color: "#0066B3" },
};

export default function BottleCardLibrary({ onBack, contactId }: { onBack: () => void; contactId: string | null }) {
  const bottleData = useAppStore((s) => contactId ? s.bottleData[contactId] : null);
  const bottleNoteCards = bottleData?.noteCards || [];
  const bottleWhisperCards = bottleData?.whisperCards || [];
  const addBottleNoteCards = useAppStore((s) => s.addBottleNoteCards);
  const deleteBottleNoteCard = useAppStore((s) => s.deleteBottleNoteCard);
  const addBottleWhisperCards = useAppStore((s) => s.addBottleWhisperCards);
  const deleteBottleWhisperCard = useAppStore((s) => s.deleteBottleWhisperCard);

  const [activeType, setActiveType] = useState<CardType>("note");
  const [inputText, setInputText] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const cards = activeType === "note" ? bottleNoteCards : bottleWhisperCards;

  const handleAdd = () => {
    if (!contactId) return;
    const text = inputText.trim();
    if (!text) return;
    const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
    if (activeType === "note") addBottleNoteCards(contactId, lines);
    else addBottleWhisperCards(contactId, lines);
    setInputText("");
  };

  const handleDelete = (id: string) => {
    if (!contactId) return;
    if (activeType === "note") deleteBottleNoteCard(contactId, id);
    else deleteBottleWhisperCard(contactId, id);
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!contactId) return;
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = String(ev.target?.result || "");
      const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
      if (activeType === "note") addBottleNoteCards(contactId, lines);
      else addBottleWhisperCards(contactId, lines);
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  return (
    <div className="flex h-screen flex-col">
      <div className="flex items-center gap-2 border-b px-4 py-3" style={{ borderColor: "var(--card-border)", background: "var(--card)" }}>
        <button onClick={onBack} className="flex h-8 w-8 items-center justify-center rounded-full hover:bg-black/10" style={{ color: "var(--text)" }}>
          <ArrowLeft className="h-4 w-4" />
        </button>
        <h2 className="font-serif text-base font-bold" style={{ color: "var(--text)" }}>字卡库</h2>
      </div>

      <div className="flex gap-1 border-b px-3 py-2" style={{ borderColor: "var(--card-border)" }}>
        {(Object.keys(CARD_CONFIG) as CardType[]).map((t) => {
          const cfg = CARD_CONFIG[t];
          const list = t === "note" ? bottleNoteCards : bottleWhisperCards;
          return (
            <button
              key={t}
              onClick={() => setActiveType(t)}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-lg py-1.5 text-[11px] font-medium transition"
              style={{
                background: activeType === t ? cfg.color : "transparent",
                color: activeType === t ? "#fff" : "var(--text)",
              }}
            >
              {cfg.icon}
              <span>{cfg.title}</span>
              <span className="opacity-70">({list.length})</span>
            </button>
          );
        })}
      </div>

      <div className="flex-1 overflow-y-auto fancy-scroll px-3 py-3">
        <div className="space-y-2">
          {cards.length === 0 ? (
            <div className="py-10 text-center text-[12px]" style={{ color: "var(--text-soft)" }}>
              暂无字卡
            </div>
          ) : (
            cards.map((card) => (
              <div
                key={card.id}
                className="flex items-start gap-2 rounded-xl border p-3"
                style={{ borderColor: "var(--card-border)", background: "var(--card)" }}
              >
                <div className="flex-1 text-[13px] leading-relaxed" style={{ color: "var(--text)" }}>
                  {card.content}
                </div>
                <button
                  onClick={() => handleDelete(card.id)}
                  className="shrink-0 rounded-lg p-1.5 transition hover:bg-red-50"
                  style={{ color: "#ef4444" }}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="border-t px-3 py-2" style={{ borderColor: "var(--card-border)", background: "var(--card)" }}>
        <div className="mb-2 flex gap-2">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="输入字卡内容，每行一条..."
            className="flex-1 rounded-xl border px-3 py-2 text-[12px] focus:outline-none resize-none"
            style={{
              borderColor: "var(--card-border)",
              background: "var(--bg)",
              color: "var(--text)",
              height: 60,
            }}
          />
          <div className="flex flex-col gap-1">
            <button
              onClick={handleAdd}
              disabled={!inputText.trim()}
              className="flex items-center justify-center gap-1 rounded-xl px-3 py-2 text-[11px] font-medium transition disabled:opacity-40"
              style={{ background: CARD_CONFIG[activeType].color, color: "#fff" }}
            >
              <Plus className="h-3 w-3" />
              添加
            </button>
            <button
              onClick={() => fileRef.current?.click()}
              className="flex items-center justify-center gap-1 rounded-xl border px-3 py-2 text-[11px] transition hover:bg-black/5"
              style={{ borderColor: "var(--card-border)", color: "var(--text)" }}
            >
              <FileText className="h-3 w-3" />
              导入
            </button>
            <input ref={fileRef} type="file" accept=".txt" onChange={handleFileImport} className="hidden" />
          </div>
        </div>
        <div className="text-[10px]" style={{ color: "var(--text-soft)" }}>
          导入时自动去重
        </div>
      </div>
    </div>
  );
}
