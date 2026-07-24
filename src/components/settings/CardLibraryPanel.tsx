import { useRef, useState, useEffect, useMemo } from "react";
import { Plus, Trash2, Upload, RotateCcw, Check, FolderPlus, Download, Users, Search, Edit2, X } from "lucide-react";
import { useAppStore } from "@/store/app";
import { MODULE_LABELS, type CardModule } from "@/types/card";
import type { Card } from "@/types/card";

const MODULE_ORDER: CardModule[] = ["chat", "mood", "body", "workStatus", "workContent", "workLocation", "travel", "breakfast", "lunch", "dinner"];

export default function CardLibraryPanel() {
  const contacts = useAppStore((s) => s.contacts);
  const activeCardLibContactId = useAppStore((s) => s.activeCardLibContactId);
  const setActiveCardLibContactId = useAppStore((s) => s.setActiveCardLibContactId);
  const addCard = useAppStore((s) => s.addCard);
  const deleteCard = useAppStore((s) => s.deleteCard);
  const deleteCards = useAppStore((s) => s.deleteCards);
  const batchImport = useAppStore((s) => s.batchImport);
  const resetModule = useAppStore((s) => s.resetModule);
  const cardGroups = useAppStore((s) => s.cardGroups);
  const setCardGroup = useAppStore((s) => s.setCardGroup);
  const setCardsGroupBatch = useAppStore((s) => s.setCardsGroupBatch);
  const addCardGroup = useAppStore((s) => s.addCardGroup);
  const deleteCardGroup = useAppStore((s) => s.deleteCardGroup);
  const exportCards = useAppStore((s) => s.exportCards);
  const importCards = useAppStore((s) => s.importCards);
  const updateContact = useAppStore((s) => s.updateContact);
  const updateCard = useAppStore((s) => s.updateCard);

  const [tab, setTab] = useState<"cards" | "stickers">("cards");
  const [activeModule, setActiveModule] = useState<CardModule>("chat");
  const [activeGroup, setActiveGroup] = useState<string>("全部");
  const [searchText, setSearchText] = useState("");
  const [editingCard, setEditingCard] = useState<Card | null>(null);
  const [editName, setEditName] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editGroup, setEditGroup] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [importText, setImportText] = useState("");
  const [showImport, setShowImport] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [newCard, setNewCard] = useState({ name: "", content: "", stamp: "", mood: "", group: "日常" });
  const [importResult, setImportResult] = useState<{ added: number; duplicates: number } | null>(null);
  const [showNewGroup, setShowNewGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [importJsonResult, setImportJsonResult] = useState<{ success: boolean; message: string } | null>(null);
  const [showSearch, setShowSearch] = useState(false);
  const [searchModalText, setSearchModalText] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 30;
  const importFileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!activeCardLibContactId && contacts.length > 0) {
      setActiveCardLibContactId(contacts[0].id);
    }
  }, [activeCardLibContactId, contacts, setActiveCardLibContactId]);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeModule, activeGroup, searchText, searchModalText]);

  const currentContact = contacts.find((c) => c.id === activeCardLibContactId);
  const cards = currentContact?.cards ?? ({} as Record<CardModule, Card[]>);

  const doExport = () => {
    if (!activeCardLibContactId || !currentContact) return;
    const jsonStr = exportCards(activeCardLibContactId);
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${currentContact.name}-字卡库.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const doImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!activeCardLibContactId) return;
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = importCards(activeCardLibContactId, reader.result as string);
      setImportJsonResult(result);
      setTimeout(() => setImportJsonResult(null), 3000);
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const doBatchSetGroup = (group: string) => {
    if (!activeCardLibContactId || selected.size === 0) return;
    setCardsGroupBatch(activeCardLibContactId, Array.from(selected), group);
    setSelected(new Set());
  };

  const isChat = activeModule === "chat";
  const allList = cards[activeModule] ?? [];
  const searchQuery = searchText.trim() || searchModalText.trim();
  const list = allList.filter((c) => {
    let match = true;
    if (isChat && activeGroup !== "全部") {
      match = match && (c.group || "日常") === activeGroup;
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      match = match && (
        c.name.toLowerCase().includes(q) ||
        (c.content || "").toLowerCase().includes(q)
      );
    }
    return match;
  });

  const totalPages = Math.ceil(list.length / PAGE_SIZE);
  const paginatedList = list.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const s = new Set(prev);
      if (s.has(id)) s.delete(id);
      else {
        if (s.size >= 100) return s;
        s.add(id);
      }
      return s;
    });
  };

  const selectAll = () => {
    if (selected.size === list.length || selected.size >= 100) {
      setSelected(new Set());
    } else {
      setSelected(new Set(list.slice(0, 100).map((c) => c.id)));
    }
  };

  const doBatchDelete = () => {
    if (!activeCardLibContactId || selected.size === 0) return;
    if (!confirm(`确定删除选中的 ${selected.size} 张字卡？`)) return;
    deleteCards(activeCardLibContactId, activeModule, Array.from(selected));
    setSelected(new Set());
  };

  const doImport = () => {
    if (!activeCardLibContactId) return;
    const result = batchImport(activeCardLibContactId, activeModule, importText);
    setImportResult(result);
    if (result.added > 0) setImportText("");
    setTimeout(() => setImportResult(null), 3000);
  };

  const doAdd = () => {
    if (!activeCardLibContactId || !newCard.name.trim()) return;
    addCard(activeCardLibContactId, activeModule, {
      name: newCard.name.trim(),
      content: newCard.content.trim() || newCard.name.trim(),
      group: isChat ? (newCard.group || "日常") : undefined,
    });
    setNewCard({ name: "", content: "", stamp: "", mood: "", group: "日常" });
    setShowAdd(false);
  };

  const doReset = () => {
    if (!activeCardLibContactId) return;
    if (!confirm(`恢复「${MODULE_LABELS[activeModule]}」的默认字卡？`)) return;
    resetModule(activeCardLibContactId, activeModule);
    setSelected(new Set());
  };

  return (
    <div className="flex flex-col gap-3">
      {/* 顶部 Tab：字卡 / 表情包 */}
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => { setTab("cards"); setSelected(new Set()); }}
          className="rounded-full px-3 py-1.5 text-[12px] font-medium transition"
          style={{
            background: tab === "cards" ? "var(--accent)" : "var(--card)",
            color: tab === "cards" ? "var(--card)" : "var(--text)",
            border: "1px solid " + (tab === "cards" ? "var(--accent)" : "var(--card-border)"),
          }}
        >
          字卡
        </button>
        <button
          onClick={() => { setTab("stickers"); setSelected(new Set()); }}
          className="rounded-full px-3 py-1.5 text-[12px] font-medium transition"
          style={{
            background: tab === "stickers" ? "var(--accent)" : "var(--card)",
            color: tab === "stickers" ? "var(--card)" : "var(--text)",
            border: "1px solid " + (tab === "stickers" ? "var(--accent)" : "var(--card-border)"),
          }}
        >
          表情包
        </button>
      </div>

      {tab === "stickers" ? (
        <StickerSection />
      ) : (
        <>
      {/* 联系人选择器 */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5">
          <Users className="h-3.5 w-3.5" style={{ color: "var(--text-soft)" }} />
          <select
            value={activeCardLibContactId || ""}
            onChange={(e) => {
              setActiveCardLibContactId(e.target.value || null);
              setSelected(new Set());
            }}
            className="rounded-lg border px-2 py-1.5 text-[11px] outline-none focus:border-[var(--accent)]"
            style={{ borderColor: "var(--card-border)", background: "var(--card)", color: "var(--text)" }}
          >
            {contacts.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[11px]" style={{ color: "var(--text-soft)" }}>名字：</span>
          <input
            type="text"
            value={currentContact?.name || ""}
            onChange={(e) => {
              if (!activeCardLibContactId) return;
              updateContact(activeCardLibContactId, { name: e.target.value });
            }}
            placeholder="联系人名字"
            className="rounded-lg border px-2 py-1.5 text-[11px] outline-none focus:border-[var(--accent)] w-24"
            style={{ borderColor: "var(--card-border)", background: "var(--card)", color: "var(--text)" }}
          />
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[11px]" style={{ color: "var(--text-soft)" }}>备注：</span>
          <input
            type="text"
            value={currentContact?.myNickname || ""}
            onChange={(e) => {
              if (!activeCardLibContactId) return;
              updateContact(activeCardLibContactId, { myNickname: e.target.value });
            }}
            placeholder="对方对我的备注"
            className="rounded-lg border px-2 py-1.5 text-[11px] outline-none focus:border-[var(--accent)] w-28"
            style={{ borderColor: "var(--card-border)", background: "var(--card)", color: "var(--text)" }}
          />
        </div>
      </div>

      {importJsonResult && (
        <div
          className={`rounded-lg px-2 py-1 text-[11px] ${importJsonResult.success ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}
        >
          {importJsonResult.message}
        </div>
      )}

      {/* 模块切换 */}
      <div className="flex flex-wrap gap-1.5">
        {MODULE_ORDER.map((m) => (
          <button
            key={m}
            onClick={() => {
              setActiveModule(m);
              setSelected(new Set());
            }}
            className="rounded-full border px-2.5 py-1 text-[11px] transition"
            style={{
              background: activeModule === m ? "var(--accent)" : "var(--card)",
              color: activeModule === m ? "var(--card)" : "var(--text)",
              borderColor: activeModule === m ? "var(--accent)" : "var(--card-border)",
            }}
          >
            {MODULE_LABELS[m]}
            <span
              className="ml-1 opacity-60"
            >
              {cards[m]?.length ?? 0}
            </span>
          </button>
        ))}
      </div>

      {/* 分组切换（仅聊天模块） */}
      {isChat && (
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => { setActiveGroup("全部"); setSelected(new Set()); }}
            className="rounded-full border px-2 py-0.5 text-[10px] transition"
            style={{
              background: activeGroup === "全部" ? "var(--accent)" : "var(--card)",
              color: activeGroup === "全部" ? "var(--card)" : "var(--text-soft)",
              borderColor: activeGroup === "全部" ? "var(--accent)" : "var(--card-border)",
            }}
          >
            全部
          </button>
          {cardGroups.map((g) => (
            <div key={g} className="flex items-center gap-0.5">
              <button
                onClick={() => { setActiveGroup(g); setSelected(new Set()); }}
                className="rounded-full border px-2 py-0.5 text-[10px] transition"
                style={{
                  background: activeGroup === g ? "var(--accent)" : "var(--card)",
                  color: activeGroup === g ? "var(--card)" : "var(--text-soft)",
                  borderColor: activeGroup === g ? "var(--accent)" : "var(--card-border)",
                }}
              >
                {g}
              </button>
              <button
                onClick={() => { if (confirm(`删除分组「${g}」？分组内字卡将归入"日常"`)) deleteCardGroup(g); }}
                className="text-[9px] opacity-40 hover:opacity-100"
                style={{ color: "var(--accent)" }}
              >
                ×
              </button>
            </div>
          ))}
          <button
            onClick={() => setShowNewGroup(!showNewGroup)}
            className="flex items-center gap-0.5 rounded-full border border-dashed px-2 py-0.5 text-[10px] transition"
            style={{ borderColor: "var(--card-border)", color: "var(--text-soft)" }}
          >
            <FolderPlus className="h-2.5 w-2.5" />
            新建
          </button>
          {showNewGroup && (
            <div className="flex items-center gap-1">
              <input
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                placeholder="分组名"
                className="w-20 rounded-full border px-2 py-0.5 text-[10px] outline-none focus:border-[var(--accent)]"
                style={{ borderColor: "var(--card-border)", background: "var(--bg)", color: "var(--text)" }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && newGroupName.trim()) {
                    addCardGroup(newGroupName.trim());
                    setNewGroupName("");
                    setShowNewGroup(false);
                  }
                }}
              />
              <button
                onClick={() => {
                  if (newGroupName.trim()) {
                    addCardGroup(newGroupName.trim());
                    setNewGroupName("");
                    setShowNewGroup(false);
                  }
                }}
                className="text-[10px]"
                style={{ color: "var(--accent)" }}
              >
                <Check className="h-3 w-3" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* 操作栏 */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setShowSearch(true)}
          className="flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-[11px] transition hover:bg-black/5"
          style={{ borderColor: "var(--card-border)", color: "var(--text)" }}
        >
          <Search className="h-3.5 w-3.5" />
          搜索
        </button>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-[11px] transition hover:bg-black/5"
          style={{ borderColor: "var(--card-border)", color: "var(--text)" }}
        >
          <Plus className="h-3.5 w-3.5" />
          新增
        </button>
        <button
          onClick={() => setShowImport(!showImport)}
          className="flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-[11px] transition hover:bg-black/5"
          style={{ borderColor: "var(--card-border)", color: "var(--text)" }}
        >
          <Upload className="h-3.5 w-3.5" />
          批量导入
        </button>
        <button
          onClick={selectAll}
          className="rounded-lg border px-2.5 py-1.5 text-[11px] transition hover:bg-black/5"
          style={{ borderColor: "var(--card-border)", color: "var(--text)" }}
        >
          {selected.size > 0 ? `已选 ${selected.size}` : "全选"}
        </button>
        {isChat && selected.size > 0 && (
          <select
            onChange={(e) => {
              if (e.target.value) {
                doBatchSetGroup(e.target.value);
                e.target.value = "";
              }
            }}
            className="rounded-lg border px-2 py-1.5 text-[11px] outline-none focus:border-[var(--accent)]"
            style={{ borderColor: "var(--card-border)", background: "var(--card)", color: "var(--text)" }}
            defaultValue=""
          >
            <option value="" disabled>批量设置分组</option>
            {cardGroups.map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
        )}
        <button
          onClick={doBatchDelete}
          disabled={selected.size === 0}
          className="flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-[11px] transition hover:bg-red-50 disabled:opacity-40"
          style={{ borderColor: "var(--card-border)", color: "var(--accent)" }}
        >
          <Trash2 className="h-3.5 w-3.5" />
          删除选中
        </button>
        <button
          onClick={doReset}
          className="ml-auto flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-[11px] transition hover:bg-black/5"
          style={{ borderColor: "var(--card-border)", color: "var(--text-soft)" }}
        >
          <RotateCcw className="h-3.5 w-3.5" />
          恢复默认
        </button>
      </div>

      {/* 新增表单 */}
      {showAdd && (
        <div className="animate-slideUp rounded-xl border p-3" style={{ borderColor: "var(--card-border)", background: "var(--card)" }}>
          <div className="text-[11px] font-medium mb-2" style={{ color: "var(--text)" }}>
            新增字卡
          </div>
          <div className="grid grid-cols-2 gap-2">
            <input
              placeholder="卡片名 *"
              value={newCard.name}
              onChange={(e) => setNewCard({ ...newCard, name: e.target.value })}
              className="rounded-lg border px-2 py-1.5 text-xs outline-none focus:border-[var(--accent)]"
              style={{ borderColor: "var(--card-border)", background: "var(--bg)", color: "var(--text)" }}
            />
            {isChat && (
              <select
                value={newCard.group}
                onChange={(e) => setNewCard({ ...newCard, group: e.target.value })}
                className="rounded-lg border px-2 py-1.5 text-xs outline-none focus:border-[var(--accent)]"
                style={{ borderColor: "var(--card-border)", background: "var(--bg)", color: "var(--text)" }}
              >
                {cardGroups.map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            )}
          </div>
          <input
            placeholder="正文内容"
            value={newCard.content}
            onChange={(e) => setNewCard({ ...newCard, content: e.target.value })}
            className="mt-2 w-full rounded-lg border px-2 py-1.5 text-xs outline-none focus:border-[var(--accent)]"
            style={{ borderColor: "var(--card-border)", background: "var(--bg)", color: "var(--text)" }}
          />
          <button
            onClick={doAdd}
            className="mt-2 w-full rounded-lg py-1.5 text-xs font-medium text-white transition hover:opacity-90"
            style={{ background: "var(--accent)" }}
          >
            添加
          </button>
        </div>
      )}

      {/* 批量导入 */}
      {showImport && (
        <div className="animate-slideUp rounded-xl border p-3" style={{ borderColor: "var(--card-border)", background: "var(--card)" }}>
          <div className="text-[11px] font-medium mb-1" style={{ color: "var(--text)" }}>
            批量导入（隔行导入，每行一张）
          </div>
          <div className="mb-2 text-[10px]" style={{ color: "var(--text-soft)" }}>
            格式：<code>卡片名|正文|印章|心情</code>，仅填卡片名也行，自动去重
          </div>
          <textarea
            rows={5}
            placeholder={"好。|那就这样吧。|好|平静\n不行。|这条线不能过。|拒|生气\n……"}
            value={importText}
            onChange={(e) => setImportText(e.target.value)}
            className="w-full rounded-lg border px-2 py-1.5 text-xs outline-none focus:border-[var(--accent)]"
            style={{ borderColor: "var(--card-border)", background: "var(--bg)", color: "var(--text)" }}
          />
          {importResult && (
            <div className="mt-2 rounded-lg bg-green-50 px-2 py-1 text-[11px] text-green-700">
              新增 {importResult.added} 张，跳过重复 {importResult.duplicates} 张
            </div>
          )}
          <button
            onClick={doImport}
            className="mt-2 w-full rounded-lg py-1.5 text-xs font-medium text-white transition hover:opacity-90"
            style={{ background: "var(--accent)" }}
          >
            导入
          </button>
        </div>
      )}

      {/* 字卡列表 */}
      <div className="fancy-scroll max-h-[400px] overflow-y-auto pr-1">
        {list.length === 0 ? (
          <div className="py-8 text-center text-xs" style={{ color: "var(--text-soft)" }}>
            暂无字卡，去新增或批量导入吧
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-2">
            {paginatedList.map((c) => (
              <CardItem
                key={c.id}
                card={c}
                selected={selected.has(c.id)}
                onToggle={() => toggleSelect(c.id)}
                onDelete={() => activeCardLibContactId && deleteCard(activeCardLibContactId, activeModule, c.id)}
                onEdit={() => {
                  setEditingCard(c);
                  setEditName(c.name);
                  setEditContent(c.content || "");
                  setEditGroup(c.group || "日常");
                }}
                isChat={isChat}
              />
            ))}
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-1 py-2">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="rounded px-2 py-1 text-xs transition hover:bg-black/5 disabled:opacity-40"
            style={{ color: "var(--text)" }}
          >
            上一页
          </button>
          <span className="text-xs" style={{ color: "var(--text-soft)" }}>
            {currentPage} / {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="rounded px-2 py-1 text-xs transition hover:bg-black/5 disabled:opacity-40"
            style={{ color: "var(--text)" }}
          >
            下一页
          </button>
        </div>
      )}
        </>
      )}

      {/* 导入导出按钮（移到最下面） */}
      <div className="flex items-center justify-center gap-3 pt-2">
        <button
          onClick={doExport}
          disabled={!activeCardLibContactId}
          className="flex items-center gap-1 rounded-lg border px-4 py-2 text-[12px] transition hover:bg-black/5 disabled:opacity-40"
          style={{ borderColor: "var(--card-border)", color: "var(--text)" }}
        >
          <Download className="h-4 w-4" />
          导出字卡库
        </button>
        <button
          onClick={() => importFileRef.current?.click()}
          disabled={!activeCardLibContactId}
          className="flex items-center gap-1 rounded-lg border px-4 py-2 text-[12px] transition hover:bg-black/5 disabled:opacity-40"
          style={{ borderColor: "var(--card-border)", color: "var(--text)" }}
        >
          <Upload className="h-4 w-4" />
          导入字卡库
        </button>
        <input
          ref={importFileRef}
          type="file"
          accept="application/json"
          className="hidden"
          onChange={doImportFile}
        />
      </div>

      {/* 编辑字卡弹窗 */}
      {editingCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div
            className="w-[85%] max-w-sm rounded-2xl border p-4"
            style={{
              borderColor: "var(--card-border)",
              background: "var(--card)",
            }}
          >
            <div className="mb-4 font-serif text-lg font-bold" style={{ color: "var(--text)" }}>
              编辑字卡
            </div>
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-xs" style={{ color: "var(--text-soft)" }}>
                  卡片名
                </label>
                <input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full rounded-xl border px-3 py-2 text-sm focus:outline-none"
                  style={{
                    borderColor: "var(--card-border)",
                    background: "var(--bg)",
                    color: "var(--text)",
                  }}
                />
              </div>
              {isChat && (
                <div>
                  <label className="mb-1 block text-xs" style={{ color: "var(--text-soft)" }}>
                    分组
                  </label>
                  <select
                    value={editGroup}
                    onChange={(e) => setEditGroup(e.target.value)}
                    className="w-full rounded-xl border px-3 py-2 text-sm focus:outline-none"
                    style={{
                      borderColor: "var(--card-border)",
                      background: "var(--bg)",
                      color: "var(--text)",
                    }}
                  >
                    {cardGroups.map((g) => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>
              )}
              <div>
                <label className="mb-1 block text-xs" style={{ color: "var(--text-soft)" }}>
                  正文内容
                </label>
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  rows={4}
                  className="w-full rounded-xl border px-3 py-2 text-sm focus:outline-none"
                  style={{
                    borderColor: "var(--card-border)",
                    background: "var(--bg)",
                    color: "var(--text)",
                  }}
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setEditingCard(null)}
                  className="flex-1 rounded-xl py-2 text-sm transition hover:bg-black/5"
                  style={{ background: "var(--bg)", color: "var(--text)" }}
                >
                  取消
                </button>
                <button
                  onClick={() => {
                    if (!activeCardLibContactId || !editingCard || !editName.trim()) return;
                    updateCard(activeCardLibContactId, activeModule, editingCard.id, {
                      name: editName.trim(),
                      content: editContent.trim(),
                      ...(isChat ? { group: editGroup } : {}),
                    });
                    setEditingCard(null);
                  }}
                  disabled={!editName.trim()}
                  className="flex-1 rounded-xl py-2 text-sm font-medium transition disabled:opacity-40"
                  style={{
                    background: "var(--accent)",
                    color: "var(--card)",
                  }}
                >
                  保存
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showSearch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div
            className="w-[90%] max-w-md rounded-2xl border p-4"
            style={{
              borderColor: "var(--card-border)",
              background: "var(--card)",
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="font-serif text-lg font-bold" style={{ color: "var(--text)" }}>
                搜索字卡
              </div>
              <button
                onClick={() => {
                  setShowSearch(false);
                  setSearchModalText("");
                }}
                className="flex h-6 w-6 items-center justify-center rounded-full transition hover:bg-black/10"
                style={{ color: "var(--text-soft)" }}
                aria-label="关闭"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 pointer-events-none" style={{ color: "var(--text-soft)" }} />
              <input
                autoFocus
                value={searchModalText}
                onChange={(e) => setSearchModalText(e.target.value)}
                placeholder="输入字卡名称或内容..."
                className="w-full rounded-xl border pl-10 pr-4 py-2.5 text-sm outline-none focus:border-[var(--accent)]"
                style={{
                  borderColor: "var(--card-border)",
                  background: "var(--bg)",
                  color: "var(--text)",
                }}
              />
            </div>
            <div className="max-h-[400px] overflow-y-auto">
              {list.length === 0 ? (
                <div className="py-8 text-center text-sm" style={{ color: "var(--text-soft)" }}>
                  {searchModalText.trim() ? "未找到匹配的字卡" : "输入关键词搜索字卡"}
                </div>
              ) : (
                <div className="space-y-2">
                  {list.slice(0, 50).map((c) => (
                    <div
                      key={c.id}
                      className="rounded-xl border p-3 transition hover:bg-black/5 cursor-pointer"
                      style={{
                        borderColor: "var(--card-border)",
                        background: "var(--bg)",
                      }}
                      onClick={() => {
                        setShowSearch(false);
                        setSearchModalText("");
                        setEditingCard(c);
                        setEditName(c.name);
                        setEditContent(c.content || "");
                        setEditGroup(c.group || "日常");
                      }}
                    >
                      <div className="font-medium text-sm" style={{ color: "var(--text)" }}>
                        {c.name}
                      </div>
                      {c.content && (
                        <div className="mt-1 text-xs" style={{ color: "var(--text-soft)" }}>
                          {c.content}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StickerSection() {
  const stickers = useAppStore((s) => s.stickers);
  const addStickers = useAppStore((s) => s.addStickers);
  const deleteStickers = useAppStore((s) => s.deleteStickers);

  const fileRef = useRef<HTMLInputElement>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [importing, setImporting] = useState(false);

  const compressImage = (file: File, maxSize = 300): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let w = img.width;
        let h = img.height;
        if (w > h) {
          if (w > maxSize) { h = (h * maxSize) / w; w = maxSize; }
        } else {
          if (h > maxSize) { w = (w * maxSize) / h; h = maxSize; }
        }
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL("image/jpeg", 0.7));
      };
      img.onerror = reject;
      const reader = new FileReader();
      reader.onload = () => { img.src = reader.result as string; };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).filter((f) =>
      f.type.startsWith("image/"),
    );
    if (files.length === 0) {
      e.target.value = "";
      return;
    }
    // 限制单次最多导入 50 张
    const toProcess = files.slice(0, 50);
    setImporting(true);
    try {
      const images: string[] = [];
      // 顺序处理，避免同时加载大量图片导致卡死
      for (const f of toProcess) {
        try {
          const dataUrl = await compressImage(f);
          images.push(dataUrl);
        } catch (err) {
          // 跳过失败的图片
          console.warn("图片压缩失败，跳过:", f.name, err);
        }
      }
      if (images.length > 0) {
        addStickers(images);
      }
    } finally {
      setImporting(false);
      e.target.value = "";
    }
  };

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else if (next.size < 100) next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    if (selected.size >= 100 || selected.size === stickers.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(stickers.slice(0, 100).map((s) => s.id)));
    }
  };

  const handleDelete = () => {
    if (selected.size === 0) return;
    if (!confirm(`确定删除选中的 ${selected.size} 张表情包？`)) return;
    deleteStickers(Array.from(selected));
    setSelected(new Set());
  };

  return (
    <div className="flex flex-col gap-3">
      {/* 操作栏 */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => fileRef.current?.click()}
          disabled={importing}
          className="flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-[11px] transition hover:bg-black/5 disabled:opacity-40"
          style={{ borderColor: "var(--card-border)", color: "var(--text)" }}
        >
          <Upload className="h-3.5 w-3.5" />
          {importing ? "导入中..." : "导入"}
        </button>
        <button
          onClick={selectAll}
          disabled={stickers.length === 0}
          className="rounded-lg border px-2.5 py-1.5 text-[11px] transition hover:bg-black/5 disabled:opacity-40"
          style={{ borderColor: "var(--card-border)", color: "var(--text)" }}
        >
          {selected.size > 0 ? `已选 ${selected.size}` : "全选"}
        </button>
        <button
          onClick={handleDelete}
          disabled={selected.size === 0}
          className="flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-[11px] transition hover:bg-red-50 disabled:opacity-40"
          style={{ borderColor: "var(--card-border)", color: "var(--accent)" }}
        >
          <Trash2 className="h-3.5 w-3.5" />
          删除选中
        </button>
        <span
          className="ml-auto text-[11px]"
          style={{ color: "var(--text-soft)" }}
        >
          共 {stickers.length} 张
        </span>
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handleFiles}
      />

      {/* 表情包网格 */}
      <div className="fancy-scroll max-h-[400px] overflow-y-auto pr-1">
        {stickers.length === 0 ? (
          <div className="py-8 text-center text-xs" style={{ color: "var(--text-soft)" }}>
            暂无表情包，点击「导入」上传图片
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-2">
            {stickers.map((st) => {
              const isSelected = selected.has(st.id);
              return (
                <button
                  key={st.id}
                  onClick={() => toggleSelect(st.id)}
                  className="group relative aspect-square overflow-hidden rounded-xl transition active:scale-95"
                  style={{
                    background: "var(--card)",
                    border: isSelected
                      ? "2px solid var(--accent)"
                      : "1px solid var(--card-border)",
                  }}
                >
                  <img
                    src={st.image}
                    alt="sticker"
                    className="h-full w-full object-contain"
                    draggable={false}
                  />
                  {isSelected && (
                    <div
                      className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full"
                      style={{ background: "var(--accent)" }}
                    >
                      <Check className="h-2.5 w-2.5" style={{ color: "var(--card)" }} />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function CardItem({
  card,
  selected,
  onToggle,
  onDelete,
  onEdit,
  isChat,
}: {
  card: Card;
  selected: boolean;
  onToggle: () => void;
  onDelete: () => void;
  onEdit: () => void;
  isChat?: boolean;
}) {
  return (
    <div
      className="card-face relative flex items-center gap-2 px-3 py-2 rounded-lg transition"
      style={{
        cursor: "pointer",
        background: selected ? "color-mix(in srgb, var(--accent) 8%, transparent)" : "transparent",
      }}
      onClick={onToggle}
    >
      <div
        className="flex h-5 w-5 shrink-0 items-center justify-center rounded border transition"
        style={{
          background: selected ? "var(--accent)" : "transparent",
          borderColor: selected ? "var(--accent)" : "var(--card-border)",
          color: "var(--card)",
        }}
      >
        {selected && <Check className="h-3 w-3" />}
      </div>
      <div className="flex-1 min-w-0">
        <div
          className="rounded-2xl px-3.5 py-2 text-[14px] leading-relaxed"
          style={{
            background: "var(--card)",
            color: "var(--text)",
            boxShadow: "0 1px 4px -2px rgba(0,0,0,0.1)",
          }}
        >
          {card.content || card.name}
        </div>
        {isChat && card.group && (
          <div className="mt-1 text-[9px]" style={{ color: "var(--text-soft)" }}>
            {card.group}
          </div>
        )}
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onEdit();
        }}
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition hover:bg-black/5"
        style={{ color: "var(--text-soft)" }}
        aria-label="编辑"
      >
        <Edit2 className="h-3.5 w-3.5" />
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          if (confirm("删除这张字卡？")) onDelete();
        }}
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full transition hover:bg-red-100/50"
        style={{ color: "var(--text-soft)" }}
        aria-label="删除"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
