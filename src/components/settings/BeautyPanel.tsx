import { useRef } from "react";
import { useAppStore } from "@/store/app";
import { FLAVOR_THEMES, SIMPLE_THEMES, RICH_THEMES, DARK_THEMES, LIGHT_EXTRA_THEMES } from "@/theme/themes";
import { BUBBLE_STYLES, FONTS, WALLPAPERS } from "@/types/settings";
import { RotateCcw, Upload, X } from "lucide-react";

export default function BeautyPanel() {
  const beauty = useAppStore((s) => s.beauty);
  const setBeauty = useAppStore((s) => s.setBeauty);
  const resetBeauty = useAppStore((s) => s.resetBeauty);
  const wallpaperRef = useRef<HTMLInputElement>(null);

  return (
    <div className="flex flex-col gap-6">
      {/* 主题 */}
      <Section title="主题">
        <div className="mb-3 text-[11px]" style={{ color: "var(--text-soft)" }}>
          风味主题
        </div>
        <div className="grid grid-cols-3 gap-2">
          {FLAVOR_THEMES.map((t) => (
            <ThemeButton
              key={t.id}
              theme={t}
              active={beauty.themeId === t.id}
              onClick={() => setBeauty({ themeId: t.id })}
            />
          ))}
        </div>
        <div className="mb-3 mt-4 text-[11px]" style={{ color: "var(--text-soft)" }}>
          简约单色
        </div>
        <div className="grid grid-cols-7 gap-2">
          {SIMPLE_THEMES.map((t) => (
            <button
              key={t.id}
              onClick={() => setBeauty({ themeId: t.id })}
              className="group flex flex-col items-center gap-1 rounded-lg p-1 transition hover:scale-105"
              title={t.name}
            >
              <div
                className={`h-8 w-8 rounded-full border-2 shadow ${
                  beauty.themeId === t.id ? "ring-2 ring-offset-2" : "border-white/60"
                }`}
                style={{
                  background: t.accent,
                  "--tw-ring-color": t.accent,
                } as React.CSSProperties}
              />
              <span className="text-[9px]" style={{ color: "var(--text-soft)" }}>
                {t.name.split("·")[1]}
              </span>
            </button>
          ))}
        </div>
        <div className="mb-3 mt-4 text-[11px]" style={{ color: "var(--text-soft)" }}>
          八色调和
        </div>
        <div className="grid grid-cols-4 gap-2">
          {RICH_THEMES.map((t) => (
            <ThemeButton
              key={t.id}
              theme={t}
              active={beauty.themeId === t.id}
              onClick={() => setBeauty({ themeId: t.id })}
            />
          ))}
        </div>
        <div className="mb-3 mt-4 text-[11px]" style={{ color: "var(--text-soft)" }}>
          浅色精选
        </div>
        <div className="grid grid-cols-3 gap-2">
          {LIGHT_EXTRA_THEMES.map((t) => (
            <ThemeButton
              key={t.id}
              theme={t}
              active={beauty.themeId === t.id}
              onClick={() => setBeauty({ themeId: t.id })}
            />
          ))}
        </div>
        <div className="mb-3 mt-4 text-[11px]" style={{ color: "var(--text-soft)" }}>
          深色主题
        </div>
        <div className="grid grid-cols-3 gap-2">
          {DARK_THEMES.map((t) => (
            <ThemeButton
              key={t.id}
              theme={t}
              active={beauty.themeId === t.id}
              onClick={() => setBeauty({ themeId: t.id })}
            />
          ))}
        </div>
      </Section>

      {/* 气泡样式 */}
      <Section title="聊天气泡">
        <div className="grid grid-cols-3 gap-2">
          {BUBBLE_STYLES.map((b) => (
            <button
              key={b.id}
              onClick={() => setBeauty({ bubbleStyle: b.id as typeof beauty.bubbleStyle })}
              className={`rounded-xl border p-3 text-left text-xs transition ${
                beauty.bubbleStyle === b.id
                  ? "shadow-md"
                  : "opacity-70 hover:opacity-100"
              }`}
              style={{
                background: "var(--card)",
                borderColor:
                  beauty.bubbleStyle === b.id ? "var(--accent)" : "var(--card-border)",
                color: "var(--text)",
              }}
            >
              <div className="font-medium">{b.name}</div>
              <div className="mt-2 flex gap-1">
                <span
                  className="rounded-full px-2 py-1 text-[10px]"
                  style={{ background: "var(--my-bubble)", color: "var(--text)" }}
                >
                  我
                </span>
                <span
                  className="rounded-md border px-2 py-1 text-[10px]"
                  style={{ background: "var(--card)", borderColor: "var(--card-border)", color: "var(--text)" }}
                >
                  他
                </span>
              </div>
            </button>
          ))}
        </div>
      </Section>

      {/* 字体 */}
      <Section title="字体">
        <div className="grid grid-cols-4 gap-2">
          {FONTS.map((f) => (
            <button
              key={f.id}
              onClick={() => setBeauty({ fontId: f.id as typeof beauty.fontId })}
              className={`rounded-xl border px-3 py-2.5 text-left transition ${
                beauty.fontId === f.id ? "shadow-md" : "opacity-75 hover:opacity-100"
              }`}
              style={{
                background: "var(--card)",
                borderColor:
                  beauty.fontId === f.id ? "var(--accent)" : "var(--card-border)",
                fontFamily: f.fontFamily,
                color: "var(--text)",
              }}
            >
              <div className="text-sm">{f.name}</div>
              <div className="text-[11px]" style={{ color: "var(--text-soft)" }}>
                你好，Hello 123
              </div>
            </button>
          ))}
        </div>
      </Section>

      {/* 壁纸 */}
      <Section title="聊天壁纸">
        <div className="grid grid-cols-6 gap-2">
          {WALLPAPERS.map((w) => (
            <button
              key={w.id}
              onClick={() => setBeauty({ wallpaper: w.id as typeof beauty.wallpaper })}
              className={`flex flex-col items-center gap-1 rounded-lg p-1 text-[10px] transition ${
                beauty.wallpaper === w.id
                  ? "ring-2"
                  : "opacity-70 hover:opacity-100"
              }`}
              style={{
                color: "var(--text)",
                "--tw-ring-color": "var(--accent)",
              } as React.CSSProperties}
            >
              {w.id === "custom" && beauty.wallpaperImage ? (
                <div
                  className="h-6 w-full rounded-md border overflow-hidden"
                  style={{
                    borderColor: "var(--card-border)",
                    backgroundImage: `url(${beauty.wallpaperImage})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                />
              ) : (
                <WallpaperPreview id={w.id} />
              )}
              {w.name}
            </button>
          ))}
        </div>
        {/* 自定义壁纸上传 */}
        {beauty.wallpaper === "custom" && (
          <div
            className="mt-3 flex items-center gap-3 rounded-lg border p-2.5"
            style={{ borderColor: "var(--card-border)", background: "var(--card)" }}
          >
            <div
              className="h-12 w-16 shrink-0 overflow-hidden rounded-md border"
              style={{
                borderColor: "var(--card-border)",
                background: "var(--bg)",
              }}
            >
              {beauty.wallpaperImage ? (
                <img
                  src={beauty.wallpaperImage}
                  alt="壁纸预览"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-[9px]" style={{ color: "var(--text-soft)" }}>
                  未导入
                </div>
              )}
            </div>
            <div className="flex-1">
              <div className="mb-1 text-[11px]" style={{ color: "var(--text-soft)" }}>
                导入图片作为聊天壁纸，超出尺寸自动裁剪
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => wallpaperRef.current?.click()}
                  className="flex items-center gap-1 rounded-lg border px-2.5 py-1 text-[10px] transition hover:bg-black/5"
                  style={{ borderColor: "var(--card-border)", color: "var(--accent)" }}
                >
                  <Upload className="h-3 w-3" />
                  导入图片
                </button>
                {beauty.wallpaperImage && (
                  <button
                    onClick={() => setBeauty({ wallpaperImage: "" })}
                    className="flex items-center gap-1 rounded-lg border px-2.5 py-1 text-[10px] transition hover:bg-black/5"
                    style={{ borderColor: "var(--card-border)", color: "var(--text-soft)" }}
                  >
                    <X className="h-3 w-3" />
                    移除
                  </button>
                )}
              </div>
              <input
                ref={wallpaperRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f && f.type.startsWith("image/")) {
                    const reader = new FileReader();
                    reader.onload = () => {
                      setBeauty({ wallpaperImage: reader.result as string });
                    };
                    reader.readAsDataURL(f);
                  }
                  e.target.value = "";
                }}
              />
            </div>
          </div>
        )}
      </Section>

      {/* 名字 */}
      <Section title="名字">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <div className="mb-1 text-[11px]" style={{ color: "var(--text-soft)" }}>
              我的名字
            </div>
            <input
              value={beauty.myName}
              onChange={(e) => setBeauty({ myName: e.target.value })}
              maxLength={10}
              className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-[var(--accent)]"
              style={{
                background: "var(--card)",
                borderColor: "var(--card-border)",
                color: "var(--text)",
              }}
            />
          </div>
          <div>
            <div className="mb-1 text-[11px]" style={{ color: "var(--text-soft)" }}>
              对方名字
            </div>
            <input
              value={beauty.herName}
              onChange={(e) => setBeauty({ herName: e.target.value })}
              maxLength={10}
              className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-[var(--accent)]"
              style={{
                background: "var(--card)",
                borderColor: "var(--card-border)",
                color: "var(--text)",
              }}
            />
          </div>
        </div>
      </Section>

      {/* 头像 */}
      <Section title="头像">
        <div className="grid grid-cols-2 gap-3">
          <AvatarEditor
            label="我的头像"
            text={beauty.myAvatar}
            image={beauty.myAvatarImage}
            onChangeText={(v) => setBeauty({ myAvatar: v })}
            onChangeImage={(v) => setBeauty({ myAvatarImage: v })}
          />
          <AvatarEditor
            label="对方头像"
            text={beauty.herAvatar}
            image={beauty.herAvatarImage}
            onChangeText={(v) => setBeauty({ herAvatar: v })}
            onChangeImage={(v) => setBeauty({ herAvatarImage: v })}
          />
        </div>
      </Section>

      {/* 会话头像 */}
      <Section title="会话头像（独立设置）">
        <ConversationAvatarEditor />
      </Section>

      {/* 宠物设置 */}
      <Section title="🐾 桌面宠物">
        <label className="flex items-center justify-between rounded-lg border p-3" style={{ borderColor: "var(--card-border)", background: "var(--card)" }}>
          <div>
            <div className="text-[13px]" style={{ color: "var(--text)" }}>开启桌面宠物</div>
            <div className="text-[11px]" style={{ color: "var(--text-soft)" }}>关闭后宠物将不再显示</div>
          </div>
          <input
            type="checkbox"
            checked={beauty.petEnabled}
            onChange={(e) => setBeauty({ petEnabled: e.target.checked })}
            className="h-5 w-5"
            style={{ accentColor: "var(--accent)" }}
          />
        </label>
      </Section>

      {/* 重置 */}
      <button
        onClick={resetBeauty}
        className="flex items-center justify-center gap-2 rounded-lg border py-2 text-xs transition hover:bg-black/5"
        style={{ borderColor: "var(--card-border)", color: "var(--text-soft)" }}
      >
        <RotateCcw className="h-3.5 w-3.5" />
        恢复默认美化
      </button>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="mb-2 font-serif text-sm font-bold" style={{ color: "var(--text)" }}>
        {title}
      </h3>
      {children}
    </div>
  );
}

function ThemeButton({
  theme,
  active,
  onClick,
}: {
  theme: { id: string; name: string; accent: string; bg: string; card: string; myBubble: string };
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`group flex flex-col items-center gap-1 rounded-lg p-1.5 text-left transition ${
        active ? "shadow-md" : "opacity-80 hover:opacity-100"
      }`}
      style={{
        background: theme.bg,
        border: active ? `2px solid ${theme.accent}` : `1px solid ${theme.card}`,
      }}
    >
      <div
        className="h-10 w-full rounded-md"
        style={{
          background: `linear-gradient(135deg, ${theme.bg} 0%, ${theme.card} 60%, ${theme.myBubble} 100%)`,
        }}
      />
      <span
        className="text-[10px] font-medium"
        style={{ color: active ? theme.accent : "inherit" }}
      >
        {theme.name}
      </span>
    </button>
  );
}

function WallpaperPreview({ id }: { id: string }) {
  const styles: Record<string, React.CSSProperties> = {
    paper: {
      background: "var(--bg)",
      backgroundImage:
        "radial-gradient(circle at 30% 30%, color-mix(in srgb, var(--accent) 20%, transparent) 0%, transparent 50%)",
    },
    dots: {
      background: "var(--bg)",
      backgroundImage:
        "radial-gradient(color-mix(in srgb, var(--text-soft) 50%, transparent) 1.5px, transparent 1.5px)",
      backgroundSize: "8px 8px",
    },
    lines: {
      background: "var(--bg)",
      backgroundImage:
        "linear-gradient(to bottom, color-mix(in srgb, var(--text-soft) 30%, transparent) 1px, transparent 1px)",
      backgroundSize: "100% 6px",
    },
    gradient: {
      background:
        "linear-gradient(135deg, var(--bg) 0%, color-mix(in srgb, var(--accent) 30%, var(--bg)) 100%)",
    },
    plain: { background: "var(--bg)" },
  };
  return (
    <div
      className="h-6 w-full rounded-md border"
      style={{ borderColor: "var(--card-border)", ...styles[id] }}
    />
  );
}

function AvatarEditor({
  label,
  text,
  image,
  onChangeText,
  onChangeImage,
}: {
  label: string;
  text: string;
  image: string;
  onChangeText: (v: string) => void;
  onChangeImage: (v: string) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);

  const compressImage = (file: File, maxSize = 200): Promise<string> => {
    return new Promise((resolve) => {
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
      const reader = new FileReader();
      reader.onload = () => { img.src = reader.result as string; };
      reader.readAsDataURL(file);
    });
  };

  const handleFile = async (file: File) => {
    if (!file.type.startsWith("image/")) return;
    const compressed = await compressImage(file);
    onChangeImage(compressed);
  };

  return (
    <div>
      <div className="mb-1 text-[11px]" style={{ color: "var(--text-soft)" }}>
        {label}
      </div>
      <div className="flex items-center gap-2">
        {/* 预览 */}
        <div className="relative shrink-0">
          {image ? (
            <div className="relative h-12 w-12 overflow-hidden rounded-full" style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.15)" }}>
              <img src={image} alt="avatar" className="h-full w-full object-cover" />
              <button
                onClick={() => onChangeImage("")}
                className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full shadow"
                style={{ background: "var(--accent)", color: "var(--card)" }}
              >
                <X className="h-2.5 w-2.5" />
              </button>
            </div>
          ) : (
            <div
              className="flex h-12 w-12 items-center justify-center rounded-full font-stamp text-[13px]"
              style={{ background: "var(--accent)", color: "var(--card)", boxShadow: "0 1px 3px rgba(0,0,0,0.15)" }}
            >
              {text}
            </div>
          )}
        </div>
        {/* 文字输入 */}
        <input
          value={text}
          onChange={(e) => onChangeText(e.target.value)}
          maxLength={4}
          className="w-full rounded-lg border px-2 py-2 text-xs outline-none focus:border-[var(--accent)]"
          style={{
            background: "var(--card)",
            borderColor: "var(--card-border)",
            color: "var(--text)",
          }}
        />
      </div>
      {/* 上传按钮 */}
      <button
        onClick={() => fileRef.current?.click()}
        className="mt-1.5 flex items-center gap-1 rounded-lg border px-2 py-1 text-[10px] transition hover:bg-black/5"
        style={{ borderColor: "var(--card-border)", color: "var(--text-soft)" }}
      >
        <Upload className="h-3 w-3" />
        导入图片
      </button>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
          e.target.value = "";
        }}
      />
    </div>
  );
}

function ConversationAvatarEditor() {
  const conversations = useAppStore((s) => s.conversations);
  const setConversationAvatar = useAppStore((s) => s.setConversationAvatar);
  const beauty = useAppStore((s) => s.beauty);

  const privateConv = conversations.filter((c) => c.type === "private");

  if (privateConv.length === 0) {
    return (
      <div className="text-[11px]" style={{ color: "var(--text-soft)" }}>
        暂无私聊会话
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {privateConv.map((conv) => (
        <div key={conv.id} className="rounded-lg border p-3" style={{ background: "var(--card)", borderColor: "var(--card-border)" }}>
          <div className="mb-2 text-[11px] font-medium" style={{ color: "var(--text)" }}>
            {conv.name || "会话"}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <ConversationAvatarItem
              label="我的头像"
              text={conv.myAvatarText || beauty.myAvatar}
              image={conv.myAvatarImage || ""}
              onChangeText={(v) => setConversationAvatar(conv.id, "my", v, conv.myAvatarImage)}
              onChangeImage={(v) => setConversationAvatar(conv.id, "my", conv.myAvatarText, v)}
            />
            <ConversationAvatarItem
              label="对方头像"
              text={conv.herAvatarText || beauty.herAvatar}
              image={conv.herAvatarImage || ""}
              onChangeText={(v) => setConversationAvatar(conv.id, "her", v, conv.herAvatarImage)}
              onChangeImage={(v) => setConversationAvatar(conv.id, "her", conv.herAvatarText, v)}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function ConversationAvatarItem({
  label,
  text,
  image,
  onChangeText,
  onChangeImage,
}: {
  label: string;
  text: string;
  image: string;
  onChangeText: (v: string) => void;
  onChangeImage: (v: string) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);

  const compressImage = (file: File, maxSize = 200): Promise<string> => {
    return new Promise((resolve) => {
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
      const reader = new FileReader();
      reader.onload = () => { img.src = reader.result as string; };
      reader.readAsDataURL(file);
    });
  };

  const handleFile = async (file: File) => {
    if (!file.type.startsWith("image/")) return;
    const compressed = await compressImage(file);
    onChangeImage(compressed);
  };

  return (
    <div>
      <div className="mb-1 text-[10px]" style={{ color: "var(--text-soft)" }}>
        {label}
      </div>
      <div className="flex items-center gap-2">
        <div className="relative shrink-0">
          {image ? (
            <div className="relative h-[34px] w-[34px] overflow-hidden rounded-sm" style={{ boxShadow: "0 1px 2px rgba(0,0,0,0.15)" }}>
              <img src={image} alt="avatar" className="h-full w-full object-cover" />
              <button
                onClick={() => onChangeImage("")}
                className="absolute -right-0.5 -top-0.5 flex h-3 w-3 items-center justify-center rounded-full shadow"
                style={{ background: "var(--accent)", color: "var(--card)" }}
              >
                <X className="h-2 w-2" />
              </button>
            </div>
          ) : (
            <div
              className="flex h-[34px] w-[34px] items-center justify-center rounded-sm font-stamp text-[12px]"
              style={{ background: "var(--accent)", color: "var(--card)", boxShadow: "0 1px 2px rgba(0,0,0,0.15)" }}
            >
              {text}
            </div>
          )}
        </div>
        <input
          value={text}
          onChange={(e) => onChangeText(e.target.value)}
          maxLength={4}
          className="w-full rounded-lg border px-2 py-1 text-[11px] outline-none focus:border-[var(--accent)]"
          style={{
            background: "var(--card)",
            borderColor: "var(--card-border)",
            color: "var(--text)",
          }}
        />
      </div>
      <button
        onClick={() => fileRef.current?.click()}
        className="mt-1 flex items-center gap-1 rounded-lg border px-2 py-0.5 text-[9px] transition hover:bg-black/5"
        style={{ borderColor: "var(--card-border)", color: "var(--text-soft)" }}
      >
        <Upload className="h-2.5 w-2.5" />
        导入图片
      </button>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
          e.target.value = "";
        }}
      />
    </div>
  );
}
