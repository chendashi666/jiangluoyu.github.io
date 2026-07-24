import { useAppStore } from "@/store/app";
import { getTheme } from "@/theme/themes";
import { FONTS, WALLPAPERS } from "@/types/settings";
import { useEffect, useMemo } from "react";

// 全局主题/美化应用器：挂载在 App 层，通过 CSS 变量生效
export default function ThemeApplier() {
  const beauty = useAppStore((s) => s.beauty);
  const theme = useMemo(() => getTheme(beauty.themeId), [beauty.themeId]);
  const font = FONTS.find((f) => f.id === beauty.fontId) ?? FONTS[0];

  useEffect(() => {
    const root = document.documentElement;
    // 颜色变量
    root.style.setProperty("--bg", theme.bg);
    root.style.setProperty("--bg-deep", theme.bgDeep);
    root.style.setProperty("--text", theme.text);
    root.style.setProperty("--text-soft", theme.textSoft);
    root.style.setProperty("--accent", theme.accent);
    root.style.setProperty("--accent-2", (theme as any).accent2 || theme.accent);
    root.style.setProperty("--card", theme.card);
    root.style.setProperty("--card-border", theme.cardBorder);
    root.style.setProperty("--my-bubble", theme.myBubble);
    root.style.setProperty("--my-bubble-text", (theme as any).myBubbleText || theme.text);
    root.style.setProperty("--her-card", theme.herCard);
    root.style.setProperty("--phone-shell", theme.phoneShell);
    root.style.setProperty("--phone-screen", theme.phoneScreen);
    // 字体
    root.style.setProperty("--font-family", font.fontFamily);
    document.body.style.fontFamily = font.fontFamily;

    // 背景
    document.body.style.backgroundColor = theme.bg;
    document.body.style.color = theme.text;

    // 壁纸效果通过 data-wallpaper 属性
    root.setAttribute("data-wallpaper", beauty.wallpaper);
    root.setAttribute("data-bubble", beauty.bubbleStyle);
    root.setAttribute("data-theme", beauty.themeId);

    // 自定义壁纸图片
    const chatBg = document.querySelector(".chat-bg") as HTMLElement | null;
    if (chatBg) {
      if (beauty.wallpaper === "custom" && beauty.wallpaperImage) {
        chatBg.style.backgroundImage = `url(${beauty.wallpaperImage})`;
      } else {
        chatBg.style.backgroundImage = "";
      }
    }
  }, [beauty, theme, font]);

  return null;
}
