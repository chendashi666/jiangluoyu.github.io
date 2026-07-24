// 字卡模块
export interface Card {
  id: string;
  name: string;       // 卡片名
  content: string;    // 卡片正文
  stamp?: string;     // 印章文字（已移除）
  mood?: string;      // 关联情绪（已移除）
  group?: string;     // 分组（仅聊天模块）
}

// 字卡库模块分类
export type CardModule =
  | "chat"       // 聊天模块（用于对话回复）
  | "mood"       // 心情模块
  | "body"        // 身体状态
  | "workContent" // 工作内容
  | "workStatus"  // 工作状态
  | "workLocation" // 工作地点
  | "travel"      // 出行
  | "breakfast"   // 早饭
  | "lunch"       // 午饭
  | "dinner";     // 晚饭

export const MODULE_LABELS: Record<CardModule, string> = {
  chat: "聊天",
  mood: "心情",
  body: "身体",
  workContent: "工作内容",
  workStatus: "工作状态",
  workLocation: "工作地点",
  travel: "出行",
  breakfast: "早饭",
  lunch: "午饭",
  dinner: "晚饭",
};

// 分组显示顺序
export const MODULE_GROUPS: { label: string; modules: CardModule[] }[] = [
  { label: "对话", modules: ["chat", "mood"] },
  { label: "生活", modules: ["body", "travel"] },
  { label: "工作", modules: ["workStatus", "workContent", "workLocation"] },
  { label: "吃饭", modules: ["breakfast", "lunch", "dinner"] },
];
