import type { CardModule } from "./card";

export type Sender = "me" | string;
export type ViewSide = "me" | "her";

export interface Message {
  id: string;
  sender: Sender;
  type: "text" | "card" | "note" | "sticker" | "system" | "rps" | "poll" | "music" | "image";
  text?: string;
  card?: import("./card").Card;
  noteMood?: string;
  moodNote?: string;
  sticker?: string;
  image?: string;
  timestamp: number;
  showMoodLabel?: boolean;
  mentionTarget?: string;
  moodTag?: string;
  music?: { title: string; url: string };
  rps?: {
    challenger: string;
    target: string;
    challengerChoice?: "rock" | "paper" | "scissors";
    targetChoice?: "rock" | "paper" | "scissors";
    result?: "win" | "lose" | "draw";
    resolved: boolean;
  };
  poll?: {
    question: string;
    options: [string, string];
    votes: Record<string, number>;
    voters: Record<string, number>;
    resolved: boolean;
  };
  systemText?: string;
  quoteId?: string;
  quoteText?: string;
  quoteSender?: string;
  recalled?: boolean;
  isAutoInitiated?: boolean;
}

export interface MealRecord {
  date: string;
  meal: "breakfast" | "lunch" | "dinner";
  name: string;
  content: string;
  time: string;
}

export interface CallRecord {
  id: string;
  contactId: string;
  contactName: string;
  direction: "outgoing" | "incoming";
  status: "missed" | "connected" | "rejected";
  duration: number;
  timestamp: number;
}

export interface Memo {
  id: string;
  contactId: string;
  text: string;
  from: "me" | string;
  timestamp: number;
}

export interface DriftBottle {
  id: string;
  contactId: string;
  text: string;
  from: "me" | string;
  timestamp: number;
  isRead: boolean;
}

export interface HerStatus {
  body: {
    temp: number;
    heartRate: number;
    sleepHours: number;
    fatigue: number;
    heartRateHistory: number[];
    lastUpdateAt: number;
  };
  mood: {
    current: string;
    keyword: string;
    curve: number[];
    emoji: string;
    level: number;
    isAngry: boolean;
  };
  work: {
    status: "working" | "resting" | "off";
    content: string;
    location: string;
    tasks: { id: string; title: string; done: boolean }[];
    overtime: boolean;
    progress: number;
    lastStatusChange: number;
  };
  travel: {
    location: string;
    weather: string;
    temperature: number;
    schedule: { time: string; place: string; note?: string }[];
  };
  meals: MealRecord[];
  notes: { id: string; text: string; timestamp: number }[];
  battery: number;
  lastBatteryUpdate: number;
}

export interface Contact {
  id: string;
  name: string;
  avatar: string;
  avatarImage: string;
  cards: Record<CardModule, import("./card").Card[]>;
  status: HerStatus;
  riceFullness: number;
  myNickname: string;
}

export type ConversationType = "private" | "group";

export interface TomatoThrow {
  id: string;
  throwerId: string;
  targetId: string;
  targetMsgId: string;
  timestamp: number;
  conversationId: string;
  auto?: boolean;
}

export interface TomatoDailyStat {
  date: string;
  thrownByMe: number;
  thrownAtMe: number;
}

export interface Conversation {
  id: string;
  type: ConversationType;
  name: string;
  messages: Message[];
  isFlipping: boolean;
  view: ViewSide;
  memberIds: string[];
  myAvatarText?: string;
  myAvatarImage?: string;
  herAvatarText?: string;
  herAvatarImage?: string;
  petHidden?: {
    messageId: string;
    side: "left" | "right";
    part: "ear" | "top" | "accessory";
    hiddenAt: number;
  } | null;
}
