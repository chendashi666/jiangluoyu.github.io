// 每个会话独立的圆球宠物配置
export interface BallPetConfig {
  topColor: string;
  bottomColor: string;
  gradientMid: number;
  gradientWidth: number;
  highlight: number;
  flatness: number;
  faceSize: number;
  emoji: string;
  kaomoji: string;
  blushColor: string;
  blushOpacity: number;
  blushSize: number;
  headwear: string;
  headwearColor: string;
  accessory: string;
  accessoryColor: string;
  breathe: boolean;
  wobble: boolean;
  blink: boolean;
  bounce: boolean;
  randomEmoji: boolean;
}

export const DEFAULT_PET_CONFIG: BallPetConfig = {
  topColor: "#FFB7C5",
  bottomColor: "#FFF0F3",
  gradientMid: 50,
  gradientWidth: 40,
  highlight: 60,
  flatness: 82,
  faceSize: 180,
  emoji: "😊",
  kaomoji: "◕‿◕",
  blushColor: "#FF9EB3",
  blushOpacity: 70,
  blushSize: 100,
  headwear: "none",
  headwearColor: "#FF9EB3",
  accessory: "none",
  accessoryColor: "#FFE08A",
  breathe: true,
  wobble: true,
  blink: true,
  bounce: false,
  randomEmoji: true,
};

// 会话ID -> 宠物配置
export type PetConfigMap = Record<string, BallPetConfig>;
