/**
 * musicParser.ts — 酷狗 / 网易云音乐分享链接解析器
 *
 * 双环境适配：
 *   本地 dev (localhost) → Vite proxy (/api/kg, /api/ne)
 *   生产环境 (GitHub Pages) → cors.eu.org CORS 代理
 *
 * 流程：
 *   酷狗: 抓分享页 HTML → 提取 hash → 调移动端 API 换 url+歌名
 *   网易云: 正则提取 id → 调 detail API → 拼接外链 URL
 */

export type MusicPlatform = "kugou" | "netease" | "unknown";

export interface ParseResult {
  title: string;
  audioUrl: string;
}

// ==================== 环境感知请求 ====================

const isDev = typeof window !== "undefined" && window.location.hostname === "localhost";

// 生产环境 CORS 代理（已验证可用：cors.eu.org）
const CORS_PROXY = "https://cors.eu.org/";

function kgFetch(path: string, options?: RequestInit): Promise<Response> {
  if (isDev) {
    return fetch(`/api/kg${path}`, options);
  }
  return fetch(`${CORS_PROXY}https://m.kugou.com${path}`, options);
}

function neFetch(path: string, options?: RequestInit): Promise<Response> {
  if (isDev) {
    return fetch(`/api/ne${path}`, options);
  }
  return fetch(`${CORS_PROXY}https://music.163.com${path}`, options);
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
  const chainMatch = url.match(/chain=([^&\s#]+)/);
  if (!chainMatch) return null;
  const chain = chainMatch[1];

  // 抓分享页 HTML，提取 hash + 歌名
  let hash = "";
  let title = "";
  try {
    const resp = await kgFetch(
      `/share/song.html?chain=${encodeURIComponent(chain)}`,
      { headers: { Accept: "text/html" } }
    );
    if (!resp.ok) return null;
    const html = await resp.text();

    const m1 = html.match(/"hash"\s*:\s*"([A-Fa-f0-9]{32})"/);
    const m2 = html.match(/hash["']?\s*[:=]\s*["']([A-Fa-f0-9]{32})["']/i);
    const m3 = html.match(/data-hash\s*=\s*["']([A-Fa-f0-9]{32})["']/i);
    hash = m1?.[1] || m2?.[1] || m3?.[1] || "";

    const t = html.match(/<title>([^<]+)<\/title>/i);
    if (t) title = t[1].replace(/_歌曲.*|_在线.*|_酷狗.*|_高音质.*|_无损.*/gi, "").trim();
  } catch {
    return null;
  }

  if (!hash) return title ? { title, audioUrl: url } : null;

  // 移动端 API 获取直链 + 准确歌名
  let audioUrl = "";
  try {
    const playResp = await kgFetch(
      `/app/i/getSongInfo.php?cmd=playInfo&hash=${hash}`,
      { headers: { Accept: "application/json" } }
    );
    if (playResp.ok) {
      const data = await playResp.json();
      audioUrl = data?.url || "";
      if (data?.songName) {
        const author = data?.authors?.[0]?.author_name;
        title = author ? `${author} - ${data.songName}` : data.songName;
      }
    }
  } catch { /* API 失败 */ }

  if (!title) title = "酷狗歌曲";
  return { title, audioUrl: audioUrl || url };
}

// ==================== 网易云解析 ====================

async function parseNetease(url: string): Promise<ParseResult | null> {
  const idMatch = url.match(/[?&]id=(\d+)/);
  if (!idMatch) return null;
  const id = idMatch[1];

  let title = "";
  try {
    const detailResp = await neFetch(
      `/api/song/detail?ids=%5B${id}%5D`,
      { headers: { Accept: "application/json" } }
    );
    if (detailResp.ok) {
      const song = (await detailResp.json())?.songs?.[0];
      if (song) {
        const artists = (song.ar || []).map((a: { name: string }) => a.name).join("/");
        title = artists ? `${artists} - ${song.name}` : song.name || "";
      }
    }
  } catch { /* API 失败 */ }

  if (!title) title = "网易云歌曲";
  return { title, audioUrl: `https://music.163.com/song/media/outer/url?id=${id}.mp3` };
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
