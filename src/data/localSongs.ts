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
  // 添加更多：把文件放进 public/music/，在这里加条目
];
