/**
 * musicParser.ts — 酷狗 / 网易云音乐分享链接解析器
 *
 * 流程：
 *   酷狗: 抓分享页 HTML → 提取 hash → 调移动端 API (m.kugou.com) 换 url+歌名
 *   网易云: 正则提取 id → 调 detail API 拿歌名 → 拼接标准外链 URL
 *
 * 所有请求通过 Vite proxy 转发，绕过 CORS。
 * 酷狗 CDN (sharefs.kugou.com) 不校验 Referer，可直接播放。
 */

export type MusicPlatform = "kugou" | "netease" | "unknown";

export interface ParseResult {
  title: string;
  audioUrl: string;
}

// ==================== 平台检测 ====================

export function detectPlatform(url: string): MusicPlatform {
  const lower = url.toLowerCase();
  if (lower.includes("kugou.com")) return "kugou";
  if (lower.includes("music.163.com") || lower.includes("163cn.tv")) return "netease";
  return "unknown";
}

// ==================== 酷狗解析 ====================

async function parseKugou(url: string): Promise<ParseResult | null> {
  // 1. 提取 chain 参数
  const chainMatch = url.match(/chain=([^&\s#]+)/);
  if (!chainMatch) return null;
  const chain = chainMatch[1];

  // 2. 抓分享页 HTML，提取 hash
  let hash = "";
  let title = "";
  try {
    const resp = await fetch(
      `/api/kg/share/song.html?chain=${encodeURIComponent(chain)}`,
      { headers: { Accept: "text/html" } }
    );
    if (!resp.ok) return null;
    const html = await resp.text();

    // 提取 hash（3 种正则覆盖不同页面结构）
    const m1 = html.match(/"hash"\s*:\s*"([A-Fa-f0-9]{32})"/);
    const m2 = html.match(/hash["']?\s*[:=]\s*["']([A-Fa-f0-9]{32})["']/i);
    const m3 = html.match(/data-hash\s*=\s*["']([A-Fa-f0-9]{32})["']/i);
    hash = m1?.[1] || m2?.[1] || m3?.[1] || "";

    // 提取歌名作为 fallback
    const t = html.match(/<title>([^<]+)<\/title>/i);
    if (t) {
      title = t[1].replace(/_歌曲.*|_在线.*|_酷狗.*|_高音质.*|_无损.*/gi, "").trim();
    }
  } catch {
    return null;
  }

  if (!hash) {
    return title ? { title, audioUrl: url } : null;
  }

  // 3. 用移动端 API 获取 CDN 直链 + 歌名（比 wwwapi 稳定，不会被 Access Deny）
  let audioUrl = "";
  try {
    const playResp = await fetch(
      `/api/kg/app/i/getSongInfo.php?cmd=playInfo&hash=${hash}`,
      { headers: { Accept: "application/json" } }
    );
    if (playResp.ok) {
      const data = await playResp.json();
      audioUrl = data?.url || "";

      // API 返回的歌名 > HTML title（更准确）
      if (data?.songName) {
        const author = data?.authors?.[0]?.author_name;
        title = author ? `${author} - ${data.songName}` : data.songName;
      }
    }
  } catch {
    // play API 失败
  }

  if (!title) title = "酷狗歌曲";

  // CDN 直链可直接播放（sharefs.kugou.com 不校验 Referer）
  return { title, audioUrl: audioUrl || url };
}

// ==================== 网易云解析 ====================

async function parseNetease(url: string): Promise<ParseResult | null> {
  const idMatch = url.match(/[?&]id=(\d+)/);
  if (!idMatch) return null;
  const id = idMatch[1];

  let title = "";
  try {
    const detailResp = await fetch(
      `/api/ne/api/song/detail?ids=%5B${id}%5D`,
      { headers: { Accept: "application/json" } }
    );
    if (detailResp.ok) {
      const detailData = await detailResp.json();
      const song = detailData?.songs?.[0];
      if (song) {
        const artists = (song.ar || []).map((a: { name: string }) => a.name).join("/");
        title = artists ? `${artists} - ${song.name}` : song.name || "";
      }
    }
  } catch { /* API 失败，继续 */ }

  if (!title) title = "网易云歌曲";

  const audioUrl = `https://music.163.com/song/media/outer/url?id=${id}.mp3`;
  return { title, audioUrl };
}

// ==================== 统一入口 ====================

export async function parseMusicShareUrl(url: string): Promise<ParseResult | null> {
  const platform = detectPlatform(url);
  switch (platform) {
    case "kugou": return parseKugou(url);
    case "netease": return parseNetease(url);
    default: return null;
  }
}
