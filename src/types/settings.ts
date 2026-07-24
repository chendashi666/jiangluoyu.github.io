// 美化设置
export interface BeautySettings {
  themeId: string;
  bubbleStyle: "round" | "paper" | "card" | "cloud" | "tail" | "minimal" | "soft" | "line" | "stamp" | "glass" | "sketch" | "neon" | "bubble";
  fontId: "sans" | "serif" | "stamp" | "mono" | "rounded" | "cute" | "elegant" | "hand" | "ink" | "neo" | "pop" | "art" | "script" | "gothic" | "display" | "pen";
  wallpaper: "paper" | "dots" | "lines" | "gradient" | "plain" | "custom";
  wallpaperImage: string;
  herAvatar: string;
  myAvatar: string;
  herAvatarImage: string;
  myAvatarImage: string;
  myName: string;
  herName: string;
  petEnabled: boolean;
}

// 聊天设置
export interface ChatSettings {
  replySpeedMin: number;
  replySpeedMax: number;
  autoMessage: boolean;
  autoIntervalMin: number;
  autoIntervalMax: number;
  showMoodLabel: boolean;
  moodCardEnabled: boolean;
  waterReminder: boolean;
  pushNotification: boolean;
}

export const DEFAULT_BEAUTY: BeautySettings = {
  themeId: "rice-pudding",
  bubbleStyle: "paper",
  fontId: "sans",
  wallpaper: "paper",
  wallpaperImage: "",
  herAvatar: "他",
  myAvatar: "我",
  herAvatarImage: "",
  myAvatarImage: "",
  myName: "我",
  herName: "宝宝",
  petEnabled: true,
};

export const DEFAULT_CHAT_SETTINGS: ChatSettings = {
  replySpeedMin: 3,
  replySpeedMax: 8,
  autoMessage: false,
  autoIntervalMin: 5,
  autoIntervalMax: 15,
  showMoodLabel: true,
  moodCardEnabled: true,
  waterReminder: true,
  pushNotification: true,
};

export const BUBBLE_STYLES = [
  { id: "round", name: "圆润气泡" },
  { id: "paper", name: "便签纸" },
  { id: "card", name: "字卡风" },
  { id: "cloud", name: "云朵形" },
  { id: "tail", name: "小尾巴" },
  { id: "minimal", name: "极简" },
  { id: "soft", name: "柔光" },
  { id: "line", name: "简约线条" },
  { id: "stamp", name: "印章气泡" },
  { id: "glass", name: "玻璃拟态" },
  { id: "sketch", name: "手绘风" },
  { id: "neon", name: "霓虹灯牌" },
  { id: "bubble", name: "3D立体" },
] as const;

export const FONTS = [
  { id: "sans", name: "现代黑体", fontFamily: '"Noto Sans SC", sans-serif' },
  { id: "serif", name: "衬线宋体", fontFamily: '"Noto Serif SC", serif' },
  { id: "stamp", name: "印章手写", fontFamily: '"ZCOOL XiaoWei", serif' },
  { id: "mono", name: "等宽字体", fontFamily: '"JetBrains Mono", "Courier New", monospace' },
  { id: "rounded", name: "圆润体", fontFamily: '"M PLUS Rounded 1c", "Noto Sans SC", sans-serif' },
  { id: "cute", name: "可爱体", fontFamily: '"ZCOOL KuaiLe", "Noto Sans SC", sans-serif' },
  { id: "elegant", name: "优雅体", fontFamily: '"LXGW WenKai", "Noto Serif SC", serif' },
  { id: "hand", name: "手写体", fontFamily: '"Ma Shan Zheng", "Noto Sans SC", sans-serif' },
  { id: "ink", name: "毛笔书法", fontFamily: '"ZCOOL QingKe HuangYou", "Noto Serif SC", serif' },
  { id: "neo", name: "新宋体", fontFamily: '"Noto Serif SC", "SimSun", serif' },
  { id: "pop", name: "波普风", fontFamily: '"Press Start 2P", "Noto Sans SC", monospace' },
  { id: "art", name: "艺术字", fontFamily: '"Playfair Display", "Noto Serif SC", serif' },
  { id: "script", name: "英文手写", fontFamily: '"Caveat", "Noto Sans SC", cursive' },
  { id: "gothic", name: "哥特体", fontFamily: '"UnifrakturCook", "Noto Serif SC", serif' },
  { id: "display", name: "艺术展示", fontFamily: '"Bungee Shade", "Noto Sans SC", sans-serif' },
  { id: "pen", name: "钢笔字", fontFamily: '"Nanum Pen Script", "Noto Sans SC", cursive' },
] as const;

export const WALLPAPERS = [
  { id: "paper", name: "纸张纹理" },
  { id: "dots", name: "波点" },
  { id: "lines", name: "横线" },
  { id: "gradient", name: "渐变" },
  { id: "plain", name: "纯色" },
  { id: "custom", name: "自定义" },
] as const;
