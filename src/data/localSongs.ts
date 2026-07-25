/**
 * 预置本地歌曲清单
 * 把音频文件放入 public/music/ 目录，然后在这里添加条目即可。
 * 支持 .mp3 / .flac 格式。
 * URL 使用 import.meta.env.BASE_URL 确保与 vite.config.ts 的 base 配置一致。
 */
export interface LocalSong {
  title: string;
  url: string;
}

const BASE = import.meta.env.BASE_URL; // 例: "/jiangluoyu.github.io/"

export const LOCAL_SONGS: LocalSong[] = [
  {
    title: "Beyond - 海阔天空",
    url: `${BASE}music/Beyond - 海阔天空.flac`,
  },
  {
    title: "静音恋人 (两颗缠绕的心) - 礼越",
    url: `${BASE}music/静音恋人 (两颗缠绕的心) - 礼越.mp3`,
  },
  {
    title: "樱花草 - Sweety",
    url: `${BASE}music/樱花草 - Sweety.mp3`,
  },
  {
    title: "浴室 - deca joins",
    url: `${BASE}music/浴室 - deca joins.mp3`,
  },
  {
    title: "ANGEL - 윤미래&Tiger JK&비지",
    url: `${BASE}music/ANGEL - 윤미래&Tiger JK&비지.mp3`,
  },
];
