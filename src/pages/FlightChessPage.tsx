import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, RotateCcw } from "lucide-react";
import { useAppStore } from "@/store/app";
import type { Contact } from "@/types";

type PlayerColor = "red" | "yellow" | "green" | "blue";

const PLAYER_ORDER: PlayerColor[] = ["red", "yellow", "green", "blue"];
const COLORS: Record<PlayerColor, { bg: string; border: string; text: string; light: string; dark: string }> = {
  red: { bg: "#ef4444", border: "#dc2626", text: "#fff", light: "#fecaca", dark: "#991b1b" },
  yellow: { bg: "#eab308", border: "#ca8a04", text: "#333", light: "#fef08a", dark: "#854d0e" },
  green: { bg: "#22c55e", border: "#16a34a", text: "#fff", light: "#bbf7d0", dark: "#166534" },
  blue: { bg: "#3b82f6", border: "#2563eb", text: "#fff", light: "#bfdbfe", dark: "#1e40af" },
};

const BOARD_SIZE = 15;
const TOTAL_TRACK = 52;
const FINISH_LENGTH = 6;

const TRACK_POSITIONS: { x: number; y: number }[] = (() => {
  const p: { x: number; y: number }[] = [];
  for (let i = 0; i < 13; i++) p.push({ x: 1 + i, y: 0 });
  for (let i = 0; i < 13; i++) p.push({ x: 14, y: 1 + i });
  for (let i = 0; i < 13; i++) p.push({ x: 13 - i, y: 14 });
  for (let i = 0; i < 13; i++) p.push({ x: 0, y: 13 - i });
  return p;
})();

const TRACK_COLORS: PlayerColor[] = (() => {
  const pattern: PlayerColor[] = ["red", "yellow", "green", "blue"];
  const colors: PlayerColor[] = [];
  for (let i = 0; i < TOTAL_TRACK; i++) {
    colors.push(pattern[i % 4]);
  }
  return colors;
})();

const START_POS_IDX: Record<PlayerColor, number> = {
  red: 7,
  yellow: 20,
  green: 33,
  blue: 46,
};

const LAST_TRACK_BEFORE_FINISH: Record<PlayerColor, number> = {
  red: 6,
  yellow: 19,
  green: 32,
  blue: 45,
};

const BASE_POSITIONS: Record<PlayerColor, { x: number; y: number }[]> = {
  red: [
    { x: 1.5, y: 1.5 },
    { x: 3.5, y: 1.5 },
    { x: 1.5, y: 3.5 },
    { x: 3.5, y: 3.5 },
  ],
  yellow: [
    { x: 10.5, y: 1.5 },
    { x: 12.5, y: 1.5 },
    { x: 10.5, y: 3.5 },
    { x: 12.5, y: 3.5 },
  ],
  green: [
    { x: 10.5, y: 10.5 },
    { x: 12.5, y: 10.5 },
    { x: 10.5, y: 12.5 },
    { x: 12.5, y: 12.5 },
  ],
  blue: [
    { x: 1.5, y: 10.5 },
    { x: 3.5, y: 10.5 },
    { x: 1.5, y: 12.5 },
    { x: 3.5, y: 12.5 },
  ],
};

const FINISH_POSITIONS: Record<PlayerColor, { x: number; y: number }[]> = {
  red: [
    { x: 7, y: 6 },
    { x: 7, y: 5 },
    { x: 7, y: 4 },
    { x: 7, y: 3 },
    { x: 7, y: 2 },
    { x: 7, y: 1 },
  ],
  yellow: [
    { x: 8, y: 7 },
    { x: 9, y: 7 },
    { x: 10, y: 7 },
    { x: 11, y: 7 },
    { x: 12, y: 7 },
    { x: 13, y: 7 },
  ],
  green: [
    { x: 7, y: 8 },
    { x: 7, y: 9 },
    { x: 7, y: 10 },
    { x: 7, y: 11 },
    { x: 7, y: 12 },
    { x: 7, y: 13 },
  ],
  blue: [
    { x: 6, y: 7 },
    { x: 5, y: 7 },
    { x: 4, y: 7 },
    { x: 3, y: 7 },
    { x: 2, y: 7 },
    { x: 1, y: 7 },
  ],
};

const JUMP_COLORS: Record<number, PlayerColor> = {
  2: "red", 6: "yellow", 10: "green",
  15: "blue", 19: "red", 23: "yellow",
  28: "green", 32: "blue", 36: "red",
  41: "yellow", 45: "green", 49: "blue",
};

const getNextJumpPos = (pos: number, color: PlayerColor): number | null => {
  let next = (pos + 1) % TOTAL_TRACK;
  let count = 0;
  while (count < TOTAL_TRACK) {
    if (JUMP_COLORS[next] === color) return next;
    next = (next + 1) % TOTAL_TRACK;
    count++;
  }
  return null;
};

const FLY_PAIRS: [number, number][] = [
  [2, 28],
  [15, 41],
];

const getFlyTarget = (pos: number): number | null => {
  for (const [a, b] of FLY_PAIRS) {
    if (a === pos) return b;
    if (b === pos) return a;
  }
  return null;
};

interface Plane {
  id: string;
  color: PlayerColor;
  position: number;
  inBase: boolean;
  finished: boolean;
}

interface ChatMessage {
  id: string;
  color: PlayerColor;
  text: string;
  timestamp: number;
}

interface Tomato {
  id: string;
  fromColor: PlayerColor;
  toColor: PlayerColor;
  timestamp: number;
}

const TOMATO_IMG = "https://i.postimg.cc/ZKVRS4kH/retouch-2026071501420750.png";

type RpsChoice = "rock" | "paper" | "scissors";

interface RpsState {
  phase: "choose" | "result";
  myChoice: RpsChoice | null;
  opponentChoices: Record<PlayerColor, RpsChoice | null>;
  remainingPlayers: PlayerColor[];
  winner: PlayerColor | null;
  message: string;
}

interface GameState {
  planes: Plane[];
  currentPlayer: PlayerColor;
  dice: number | null;
  isRolling: boolean;
  message: string;
  turnCount: number;
  winner: PlayerColor | null;
  players: PlayerColor[];
  phase: "idle" | "rolling" | "choosing" | "moving";
}

const DiceFace = ({ value, color }: { value: number | null; color: PlayerColor }) => {
  const dots: Record<number, [number, number][]> = {
    1: [[50, 50]],
    2: [[25, 25], [75, 75]],
    3: [[25, 25], [50, 50], [75, 75]],
    4: [[25, 25], [75, 25], [25, 75], [75, 75]],
    5: [[25, 25], [75, 25], [50, 50], [25, 75], [75, 75]],
    6: [[25, 20], [75, 20], [25, 50], [75, 50], [25, 80], [75, 80]],
  };

  return (
    <div
      className="w-14 h-14 rounded-xl flex items-center justify-center relative shadow-lg border-2"
      style={{
        backgroundColor: "#fff",
        borderColor: COLORS[color].border,
      }}
    >
      {value ? (
        <svg viewBox="0 0 100 100" className="w-full h-full p-1.5">
          {dots[value]?.map(([cx, cy], i) => (
            <circle key={i} cx={cx} cy={cy} r="8" fill={COLORS[color].bg} />
          ))}
        </svg>
      ) : (
        <span className="text-3xl text-gray-300">?</span>
      )}
    </div>
  );
};

const TomatoFlyAnimation = ({ tomato }: { tomato: Tomato }) => {
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const animRef = useRef<number | null>(null);
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    const startAnim = () => {
      const fromEl = document.querySelector(`[data-avatar-color="${tomato.fromColor}"]`) as HTMLElement | null;
      const toEl = document.querySelector(`[data-avatar-color="${tomato.toColor}"]`) as HTMLElement | null;
      const container = document.querySelector("[data-tomato-container]") as HTMLElement | null;

      if (!fromEl || !toEl || !container) {
        setPos(null);
        return;
      }

      const containerRect = container.getBoundingClientRect();
      const fromRect = fromEl.getBoundingClientRect();
      const toRect = toEl.getBoundingClientRect();

      const startX = fromRect.left - containerRect.left + fromRect.width / 2;
      const startY = fromRect.top - containerRect.top;
      const endX = toRect.left - containerRect.left + toRect.width / 2;
      const endY = toRect.top - containerRect.top + toRect.height * 0.25;

      setPos({ x: startX, y: startY });

      const duration = 600;
      const startTime = performance.now();
      const arcHeight = Math.max(60, Math.abs(endY - startY) * 0.8 + 40);

      const animate = (now: number) => {
        const elapsed = now - startTime;
        const t = Math.min(elapsed / duration, 1);

        const x = startX + (endX - startX) * t;
        const y = startY + (endY - startY) * t - arcHeight * 4 * t * (1 - t);

        setPos({ x, y });

        if (t < 1) {
          animRef.current = requestAnimationFrame(animate);
        } else {
          setPos(null);
        }
      };

      animRef.current = requestAnimationFrame(animate);
    };

    const raf = requestAnimationFrame(startAnim);

    return () => {
      cancelAnimationFrame(raf);
      if (animRef.current) {
        cancelAnimationFrame(animRef.current);
      }
    };
  }, [tomato.id]);

  if (!pos) return null;

  return (
    <img
      src={TOMATO_IMG}
      alt="tomato"
      className="pointer-events-none absolute object-contain"
      style={{
        left: `${pos.x - 8}px`,
        top: `${pos.y - 16}px`,
        width: "16px",
        height: "16px",
        filter: "drop-shadow(0 1px 3px rgba(0,0,0,0.25))",
        zIndex: 100,
      }}
    />
  );
};

export default function FlightChessPage() {
  const navigate = useNavigate();
  const contacts = useAppStore((s) => s.contacts);
  const conversations = useAppStore((s) => s.conversations);
  const myAvatar = useAppStore((s) => s.beauty.myAvatar);
  const myAvatarImage = useAppStore((s) => s.beauty.myAvatarImage);
  const herAvatarImage = useAppStore((s) => s.beauty.herAvatarImage);
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [playerCount, setPlayerCount] = useState<2 | 3 | 4>(4);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [rpsState, setRpsState] = useState<RpsState | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [tomatoes, setTomatoes] = useState<Tomato[]>([]);
  const [tomatoCounts, setTomatoCounts] = useState<Record<string, number>>({});
  const [tomatoCooldown, setTomatoCooldown] = useState(false);
  const boardRef = useRef<HTMLDivElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const aiTimerRef = useRef<number | null>(null);
  const redirectingRef = useRef(false);

  const goHome = useCallback(() => {
    if (redirectingRef.current) return;
    redirectingRef.current = true;
    if (gameState && !gameState.winner) {
      sessionStorage.setItem("flight-chess-state", JSON.stringify(gameState));
      sessionStorage.setItem("flight-chess-contacts", JSON.stringify(selectedContacts));
      sessionStorage.setItem("flight-chess-messages", JSON.stringify(chatMessages));
    }
    sessionStorage.removeItem("flight-chess-entered");
    if (aiTimerRef.current) {
      clearTimeout(aiTimerRef.current);
      aiTimerRef.current = null;
    }
    navigate("/");
  }, [navigate, gameState, selectedContacts, chatMessages]);

  useEffect(() => {
    if (redirectingRef.current) return;
    const entered = sessionStorage.getItem("flight-chess-entered");
    if (!entered) {
      redirectingRef.current = true;
      navigate("/", { replace: true });
      return;
    }
    const savedState = sessionStorage.getItem("flight-chess-state");
    const savedContacts = sessionStorage.getItem("flight-chess-contacts");
    const savedMessages = sessionStorage.getItem("flight-chess-messages");
    if (savedState && savedContacts) {
      try {
        setGameState(JSON.parse(savedState));
        setSelectedContacts(JSON.parse(savedContacts));
        if (savedMessages) setChatMessages(JSON.parse(savedMessages));
      } catch {
        /* ignore */
      }
    }
    return () => {
      if (aiTimerRef.current) {
        clearTimeout(aiTimerRef.current);
      }
    };
  }, [navigate]);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages.length]);

  useEffect(() => {
    if (gameState?.winner) {
      sessionStorage.removeItem("flight-chess-state");
      sessionStorage.removeItem("flight-chess-contacts");
      sessionStorage.removeItem("flight-chess-messages");
    }
  }, [gameState?.winner]);

  const getPlayerInfo = useCallback((color: PlayerColor): { name: string; avatarImage: string; avatarText: string; contactId?: string } => {
    const idx = PLAYER_ORDER.indexOf(color);
    if (idx === 0) {
      return { name: myAvatar, avatarImage: myAvatarImage, avatarText: myAvatar };
    }
    const contactIdx = idx - 1;
    if (selectedContacts[contactIdx]) {
      const c = contacts.find((x) => x.id === selectedContacts[contactIdx]);
      if (c) {
        const conv = conversations.find((cv) => cv.type === "private" && cv.memberIds.includes(c.id));
        const avatarImage = conv?.herAvatarImage || c.avatarImage || herAvatarImage || "";
        const avatarText = conv?.herAvatarText || c.avatar || c.name.charAt(0);
        return { name: c.name, avatarImage, avatarText, contactId: c.id };
      }
    }
    const names = ["宝宝", "宝", "受气包"];
    const name = names[contactIdx] || `玩家${idx}`;
    return { name, avatarImage: herAvatarImage || "", avatarText: name.charAt(0) };
  }, [contacts, conversations, myAvatar, myAvatarImage, herAvatarImage, selectedContacts]);

  const getChatCardsForPlayer = useCallback((color: PlayerColor) => {
    const info = getPlayerInfo(color);
    const contactId = info.contactId || selectedContacts[0];
    if (contactId) {
      const c = contacts.find((x) => x.id === contactId);
      if (c && c.cards?.chat) {
        return c.cards.chat;
      }
    }
    return [];
  }, [contacts, getPlayerInfo, selectedContacts]);

  const addChatMessage = useCallback((color: PlayerColor, text: string) => {
    setChatMessages((prev) => [
      ...prev,
      { id: `${Date.now()}-${Math.random()}`, color, text, timestamp: Date.now() },
    ]);
  }, []);

  const tryRandomSpeak = useCallback((color: PlayerColor) => {
    if (Math.random() > 0.20) return;
    const cards = getChatCardsForPlayer(color);
    if (cards.length === 0) return;
    const card = cards[Math.floor(Math.random() * cards.length)];
    addChatMessage(color, card.content);
  }, [getChatCardsForPlayer, addChatMessage]);

  const throwTomato = useCallback((fromColor: PlayerColor, toColor: PlayerColor) => {
    const tomato: Tomato = {
      id: `${Date.now()}-${Math.random()}`,
      fromColor,
      toColor,
      timestamp: Date.now(),
    };
    setTomatoes((prev) => [...prev, tomato]);
    const fromInfo = getPlayerInfo(fromColor);
    const toInfo = getPlayerInfo(toColor);
    addChatMessage(fromColor, `🍅 砸了${toInfo.name}一个番茄！`);
    setTomatoCounts((prev) => ({ ...prev, [toColor]: (prev[toColor] || 0) + 1 }));
    setTimeout(() => {
      setTomatoes((prev) => prev.filter((t) => t.id !== tomato.id));
    }, 700);
    setTimeout(() => {
      setTomatoCounts((prev) => {
        const newCounts = { ...prev };
        newCounts[toColor] = Math.max(0, (newCounts[toColor] || 0) - 1);
        return newCounts;
      });
    }, 60000);
  }, [getPlayerInfo, addChatMessage]);

  const handleAvatarDoubleClick = useCallback((color: PlayerColor) => {
    if (!gameState || gameState.winner) return;
    if (color === "red") return;
    if (tomatoCooldown) return;
    setTomatoCooldown(true);
    throwTomato("red", color);
    setTimeout(() => setTomatoCooldown(false), 2000);
  }, [gameState, tomatoCooldown, throwTomato]);

  const tryRandomTomato = useCallback((fromColor: PlayerColor, players: PlayerColor[]) => {
    if (Math.random() > 0.08) return;
    if (fromColor === "red") return;
    const others = players.filter((p) => p !== fromColor);
    if (others.length === 0) return;
    const target = others[Math.floor(Math.random() * others.length)];
    throwTomato(fromColor, target);
  }, [throwTomato]);

  const getActivePlayers = useCallback((): PlayerColor[] => {
    const players: PlayerColor[] = ["red"];
    for (let i = 0; i < selectedContacts.length; i++) {
      players.push(PLAYER_ORDER[i + 1]);
    }
    return players;
  }, [selectedContacts]);

  const startRps = useCallback(() => {
    const players = getActivePlayers();
    const opponentChoices: Record<PlayerColor, RpsChoice | null> = {
      red: null, yellow: null, green: null, blue: null,
    };
    setRpsState({
      phase: "choose",
      myChoice: null,
      opponentChoices,
      remainingPlayers: [...players],
      winner: null,
      message: "石头剪刀布！请选择你的出招",
    });
    setChatMessages([]);
  }, [getActivePlayers]);

  const getRpsWinner = (a: RpsChoice, b: RpsChoice): 0 | 1 | 2 => {
    if (a === b) return 0;
    if (
      (a === "rock" && b === "scissors") ||
      (a === "scissors" && b === "paper") ||
      (a === "paper" && b === "rock")
    ) return 1;
    return 2;
  };

  const rpsEmoji: Record<RpsChoice, string> = {
    rock: "✊", paper: "✋", scissors: "✌️",
  };

  const playRpsRound = useCallback((myChoice: RpsChoice) => {
    if (!rpsState || rpsState.phase !== "choose") return;

    const players = rpsState.remainingPlayers;
    const choices: Record<PlayerColor, RpsChoice> = {} as Record<PlayerColor, RpsChoice>;
    const allChoices: RpsChoice[] = ["rock", "paper", "scissors"];

    players.forEach((p) => {
      if (p === "red") {
        choices[p] = myChoice;
      } else {
        choices[p] = allChoices[Math.floor(Math.random() * 3)];
      }
    });

    setRpsState((prev) => {
      if (!prev) return prev;
      const newOpponentChoices = { ...prev.opponentChoices };
      players.forEach((p) => {
        newOpponentChoices[p] = choices[p];
      });
      return {
        ...prev,
        myChoice,
        opponentChoices: newOpponentChoices,
        phase: "result",
        message: "石头剪刀布...",
      };
    });

    setTimeout(() => {
      setRpsState((prev) => {
        if (!prev) return prev;

        const winners: PlayerColor[] = [];

        for (let i = 0; i < players.length; i++) {
          const p1 = players[i];
          let isWinner = true;
          for (let j = 0; j < players.length; j++) {
            if (i === j) continue;
            const p2 = players[j];
            const result = getRpsWinner(choices[p1], choices[p2]);
            if (result === 2) {
              isWinner = false;
              break;
            }
          }
          if (isWinner) winners.push(p1);
        }

        if (winners.length === 1) {
          const winner = winners[0];
          const winnerInfo = getPlayerInfo(winner);
          return {
            ...prev,
            winner,
            remainingPlayers: [winner],
            message: `🎉 ${winnerInfo.name} 获胜！先投骰子`,
          };
        } else if (winners.length > 1) {
          const winnerNames = winners.map((w) => getPlayerInfo(w).name).join("、");
          return {
            ...prev,
            myChoice: null,
            remainingPlayers: winners,
            phase: "choose",
            message: `${winnerNames} 平局，继续猜拳！`,
          };
        } else {
          return {
            ...prev,
            myChoice: null,
            phase: "choose",
            message: "平局，再来一次！",
          };
        }
      });
    }, 2000);
  }, [rpsState, getPlayerInfo]);

  const startGameWithFirstPlayer = useCallback((firstPlayer: PlayerColor) => {
    const players = getActivePlayers();
    const planes: Plane[] = [];
    players.forEach((color) => {
      for (let i = 0; i < 4; i++) {
        planes.push({ id: `${color}-${i}`, color, position: -1, inBase: true, finished: false });
      }
    });
    const firstInfo = getPlayerInfo(firstPlayer);
    setGameState({
      planes,
      currentPlayer: firstPlayer,
      dice: null,
      isRolling: false,
      message: `游戏开始！${firstInfo.name} 先投骰子`,
      turnCount: 0,
      winner: null,
      players,
      phase: "idle",
    });
    setRpsState(null);
  }, [getActivePlayers, getPlayerInfo]);

  const initGame = useCallback(() => {
    sessionStorage.removeItem("flight-chess-state");
    sessionStorage.removeItem("flight-chess-contacts");
    sessionStorage.removeItem("flight-chess-messages");
    setTomatoCooldown(false);
    setChatMessages([]);
    setTomatoes([]);
    setTomatoCounts({});
    startRps();
  }, [startRps]);

  const isMyTurn = gameState?.currentPlayer === "red";

  const getMovablePlaneIds = useCallback((forColor: PlayerColor, dice: number, planes: Plane[]): string[] => {
    const movable: string[] = [];
    const startIdx = START_POS_IDX[forColor];

    planes.forEach((plane) => {
      if (plane.color !== forColor || plane.finished) return;

      if (plane.inBase) {
        if (dice === 6) movable.push(plane.id);
        return;
      }

      if (plane.position >= TOTAL_TRACK) {
        const finishIdx = plane.position - TOTAL_TRACK;
        const newFinishIdx = finishIdx + dice;
        if (newFinishIdx < FINISH_LENGTH) {
          movable.push(plane.id);
        } else if (newFinishIdx > FINISH_LENGTH - 1) {
          const backSteps = newFinishIdx - (FINISH_LENGTH - 1);
          const realFinishIdx = (FINISH_LENGTH - 1) - backSteps;
          if (realFinishIdx >= 0) {
            movable.push(plane.id);
          }
        }
        return;
      }

      const startIdxVal = START_POS_IDX[forColor];
      const relPos = ((plane.position - startIdxVal + TOTAL_TRACK) % TOTAL_TRACK);
      const newRelPos = relPos + dice;

      if (newRelPos < TOTAL_TRACK) {
        movable.push(plane.id);
      } else {
        const finishIdx = newRelPos - TOTAL_TRACK;
        if (finishIdx < FINISH_LENGTH) {
          movable.push(plane.id);
        } else {
          const backSteps = finishIdx - (FINISH_LENGTH - 1);
          const realFinishIdx = (FINISH_LENGTH - 1) - backSteps;
          if (realFinishIdx >= 0) {
            movable.push(plane.id);
          }
        }
      }
    });

    return movable;
  }, []);

  const applyMove = (planes: Plane[], planeId: string, dice: number): { planes: Plane[]; messages: string[] } => {
    let resultPlanes = [...planes];
    const messages: string[] = [];
    const plane = resultPlanes.find((p) => p.id === planeId);
    if (!plane) return { planes: resultPlanes, messages };

    const color = plane.color;
    const startIdx = START_POS_IDX[color];

    let currentPos = plane.position;
    let inBase = plane.inBase;
    let finished = plane.finished;

    if (inBase) {
      currentPos = startIdx;
      inBase = false;
      messages.push("起飞！");
    } else if (currentPos >= TOTAL_TRACK) {
      const finishIdx = currentPos - TOTAL_TRACK;
      const newFinishIdx = finishIdx + dice;
      if (newFinishIdx <= FINISH_LENGTH - 1) {
        currentPos = TOTAL_TRACK + newFinishIdx;
        if (newFinishIdx === FINISH_LENGTH - 1) {
          finished = true;
          messages.push("到达终点！");
        }
      } else {
        const backSteps = newFinishIdx - (FINISH_LENGTH - 1);
        const realFinishIdx = (FINISH_LENGTH - 1) - backSteps;
        currentPos = TOTAL_TRACK + Math.max(0, realFinishIdx);
        messages.push(`点数多了，退${backSteps}步`);
      }
    } else {
      const relPos = ((currentPos - startIdx + TOTAL_TRACK) % TOTAL_TRACK);
      const newRelPos = relPos + dice;

      if (newRelPos < TOTAL_TRACK) {
        currentPos = (startIdx + newRelPos) % TOTAL_TRACK;
      } else {
        const finishIdx = newRelPos - TOTAL_TRACK;
        if (finishIdx <= FINISH_LENGTH - 1) {
          currentPos = TOTAL_TRACK + finishIdx;
          if (finishIdx === FINISH_LENGTH - 1) {
            finished = true;
            messages.push("到达终点！");
          } else {
            messages.push("进入终点跑道");
          }
        } else {
          const backSteps = finishIdx - (FINISH_LENGTH - 1);
          const realFinishIdx = (FINISH_LENGTH - 1) - backSteps;
          currentPos = TOTAL_TRACK + Math.max(0, realFinishIdx);
          messages.push(`点数多了，退${backSteps}步`);
        }
      }
    }

    resultPlanes = resultPlanes.map((p) =>
      p.id === planeId ? { ...p, position: currentPos, inBase, finished } : p
    );

    if (!finished && currentPos < TOTAL_TRACK) {
      const jumpColor = JUMP_COLORS[currentPos];
      if (jumpColor === color) {
        const jumpTarget = getNextJumpPos(currentPos, color);
        if (jumpTarget !== null) {
          currentPos = jumpTarget;
          messages.push("跳跃！");
          resultPlanes = resultPlanes.map((p) =>
            p.id === planeId ? { ...p, position: currentPos } : p
          );
        }
      }
    }

    if (!finished && currentPos < TOTAL_TRACK) {
      const flyTarget = getFlyTarget(currentPos);
      if (flyTarget !== null) {
        currentPos = flyTarget;
        messages.push("飞行！");
        resultPlanes = resultPlanes.map((p) =>
          p.id === planeId ? { ...p, position: currentPos } : p
        );

        const jumpColor = JUMP_COLORS[currentPos];
        if (jumpColor === color) {
          const jumpAfter = getNextJumpPos(currentPos, color);
          if (jumpAfter !== null) {
            currentPos = jumpAfter;
            messages.push("再跳跃！");
            resultPlanes = resultPlanes.map((p) =>
              p.id === planeId ? { ...p, position: currentPos } : p
            );
          }
        }
      }
    }

    if (!finished && currentPos < TOTAL_TRACK) {
      const hitPlanes = resultPlanes.filter(
        (p) => p.id !== planeId && p.color !== color && !p.inBase && !p.finished && p.position === currentPos
      );
      if (hitPlanes.length > 0) {
        messages.push(`撞机！撞回${hitPlanes.length}架飞机`);
        resultPlanes = resultPlanes.map((p) => {
          if (hitPlanes.some((hp) => hp.id === p.id)) {
            return { ...p, position: -1, inBase: true };
          }
          return p;
        });
      }
    }

    return { planes: resultPlanes, messages };
  };

  const getNextPlayer = (current: PlayerColor, players: PlayerColor[]): PlayerColor => {
    const idx = players.indexOf(current);
    return players[(idx + 1) % players.length];
  };

  const performAiTurn = useCallback(() => {
    if (!gameState || gameState.winner) return;
    if (gameState.currentPlayer === "red") return;
    if (gameState.isRolling || gameState.phase === "rolling" || gameState.phase === "moving") return;

    const color = gameState.currentPlayer;
    const playerInfo = getPlayerInfo(color);

    setGameState((prev) => {
      if (!prev) return prev;
      return { ...prev, isRolling: true, phase: "rolling", message: `${playerInfo.name} 投骰子中...` };
    });

    aiTimerRef.current = window.setTimeout(() => {
      setGameState((prev) => {
        if (!prev || prev.winner) return prev;

        const finalDice = Math.floor(Math.random() * 6) + 1;
        const info = getPlayerInfo(prev.currentPlayer);
        const movable = getMovablePlaneIds(prev.currentPlayer, finalDice, prev.planes);
        const message = `${info.name} 投出了 ${finalDice} 点`;

        tryRandomSpeak(prev.currentPlayer);
        tryRandomTomato(prev.currentPlayer, prev.players);

        if (movable.length === 0) {
          const nextColor = getNextPlayer(prev.currentPlayer, prev.players);
          const nextInfo = getPlayerInfo(nextColor);
          return {
            ...prev,
            dice: null,
            isRolling: false,
            phase: "idle",
            currentPlayer: nextColor,
            message: `${message}，无法移动，轮到 ${nextInfo.name}`,
            turnCount: prev.turnCount + 1,
          };
        }

        const randomPlane = movable[Math.floor(Math.random() * movable.length)];

        aiTimerRef.current = window.setTimeout(() => {
          setGameState((p) => {
            if (!p || p.winner) return p;

            const { planes: newPlanes, messages } = applyMove(p.planes, randomPlane, finalDice);
            const winner = p.players.find((c) => newPlanes.filter((pp) => pp.color === c && pp.finished).length === 4);

            const msgParts = [message, ...messages];
            const moveMsg = msgParts.join("，");

            if (winner) {
              return {
                ...p,
                planes: newPlanes,
                dice: finalDice,
                isRolling: false,
                phase: "idle",
                winner,
                message: `🎉 ${getPlayerInfo(winner).name} 获胜！`,
              };
            }

            if (finalDice === 6) {
              return {
                ...p,
                planes: newPlanes,
                dice: null,
                isRolling: false,
                phase: "idle",
                message: `${moveMsg}，投到6，再投一次！`,
              };
            }

            const nextColor = getNextPlayer(p.currentPlayer, p.players);
            const nextInfo = getPlayerInfo(nextColor);

            return {
              ...p,
              planes: newPlanes,
              dice: null,
              isRolling: false,
              phase: "idle",
              currentPlayer: nextColor,
              message: `${moveMsg}，轮到 ${nextInfo.name}`,
              turnCount: p.turnCount + 1,
            };
          });
        }, 3000);

        return {
          ...prev,
          dice: finalDice,
          isRolling: false,
          phase: "moving",
          message,
          turnCount: prev.turnCount + 1,
        };
      });
    }, 3000);
  }, [gameState, getPlayerInfo, getMovablePlaneIds, tryRandomSpeak]);

  useEffect(() => {
    if (!gameState || gameState.winner) return;
    if (gameState.currentPlayer === "red") return;
    if (gameState.phase !== "idle") return;

    const timer = setTimeout(() => {
      performAiTurn();
    }, 3000);

    return () => clearTimeout(timer);
  }, [gameState?.currentPlayer, gameState?.phase, gameState?.winner, performAiTurn]);

  const rollDice = useCallback(() => {
    if (!gameState || !isMyTurn || gameState.isRolling || gameState.phase !== "idle" || gameState.winner) return;

    const playerInfo = getPlayerInfo(gameState.currentPlayer);

    setGameState((prev) => {
      if (!prev) return prev;
      return { ...prev, isRolling: true, phase: "rolling", message: `${playerInfo.name} 投骰子中...` };
    });

    setTimeout(() => {
      setGameState((prev) => {
        if (!prev) return prev;

        const finalDice = Math.floor(Math.random() * 6) + 1;
        const info = getPlayerInfo(prev.currentPlayer);
        const movable = getMovablePlaneIds(prev.currentPlayer, finalDice, prev.planes);
        const message = `${info.name} 投出了 ${finalDice} 点`;

        tryRandomSpeak(prev.currentPlayer);

        if (movable.length > 0) {
          return {
            ...prev,
            dice: finalDice,
            isRolling: false,
            phase: "choosing",
            message: `${message}，选择要移动的棋子`,
            turnCount: prev.turnCount + 1,
          };
        }

        const nextColor = getNextPlayer(prev.currentPlayer, prev.players);
        const nextInfo = getPlayerInfo(nextColor);

        return {
          ...prev,
          dice: null,
          isRolling: false,
          phase: "idle",
          currentPlayer: nextColor,
          message: `${message}，无法移动，轮到 ${nextInfo.name}`,
          turnCount: prev.turnCount + 1,
        };
      });
    }, 1000);
  }, [gameState, isMyTurn, getPlayerInfo, getMovablePlaneIds, tryRandomSpeak]);

  const movePlane = useCallback((planeId: string) => {
    if (!gameState || !gameState.dice || !isMyTurn || gameState.phase !== "choosing" || gameState.winner) return;

    setGameState((prev) => {
      if (!prev || !prev.dice) return prev;

      const { planes: newPlanes, messages } = applyMove(prev.planes, planeId, prev.dice);
      const winner = prev.players.find((c) => newPlanes.filter((p) => p.color === c && p.finished).length === 4);

      const msgParts = [`投出了 ${prev.dice} 点`, ...messages];
      const moveMsg = msgParts.join("，");

      if (winner) {
        return {
          ...prev,
          planes: newPlanes,
          dice: null,
          phase: "idle",
          winner,
          message: `🎉 ${getPlayerInfo(winner).name} 获胜！`,
        };
      }

      if (prev.dice === 6) {
        return {
          ...prev,
          planes: newPlanes,
          dice: null,
          phase: "idle",
          message: `${moveMsg}，投到6！再投一次`,
        };
      }

      const nextColor = getNextPlayer(prev.currentPlayer, prev.players);
      const nextInfo = getPlayerInfo(nextColor);

      return {
        ...prev,
        planes: newPlanes,
        dice: null,
        phase: "idle",
        currentPlayer: nextColor,
        message: `${moveMsg}，轮到 ${nextInfo.name}`,
      };
    });
  }, [gameState, isMyTurn, getPlayerInfo]);

  const getPlanePosition = (plane: Plane): { x: number; y: number } => {
    if (plane.inBase) {
      const idx = parseInt(plane.id.split("-")[1]);
      return BASE_POSITIONS[plane.color][idx];
    }
    if (plane.finished || plane.position >= TOTAL_TRACK) {
      const idx = plane.position - TOTAL_TRACK;
      return FINISH_POSITIONS[plane.color][Math.min(Math.max(idx, 0), FINISH_LENGTH - 1)];
    }
    if (plane.position < 0 || plane.position >= TRACK_POSITIONS.length) {
      return { x: BOARD_SIZE / 2, y: BOARD_SIZE / 2 };
    }
    const tp = TRACK_POSITIONS[plane.position];
    return { x: tp.x + 0.5, y: tp.y + 0.5 };
  };

  const renderBoard = () => {
    if (!gameState) return null;

    const movablePlaneIds = isMyTurn && gameState.dice && gameState.phase === "choosing" && !gameState.winner
      ? getMovablePlaneIds(gameState.currentPlayer, gameState.dice, gameState.planes)
      : [];

    const getFlyLine = () => {
      const lines: JSX.Element[] = [];
      FLY_PAIRS.forEach(([a, b], i) => {
        const pa = TRACK_POSITIONS[a];
        const pb = TRACK_POSITIONS[b];
        lines.push(
          <line
            key={`fly-${i}`}
            x1={pa.x + 0.5}
            y1={pa.y + 0.5}
            x2={pb.x + 0.5}
            y2={pb.y + 0.5}
            stroke="#6b7280"
            strokeWidth="0.1"
            strokeDasharray="0.3 0.2"
            opacity="0.6"
          />
        );
      });
      return lines;
    };

    const getDiamondPoints = (cx: number, cy: number, size: number) => {
      return `${cx},${cy - size} ${cx + size},${cy} ${cx},${cy + size} ${cx - size},${cy}`;
    };

    return (
      <div ref={boardRef} className="relative mx-auto" style={{ width: "100%", maxWidth: "380px", aspectRatio: "1" }}>
        <svg viewBox={`0 0 ${BOARD_SIZE} ${BOARD_SIZE}`} className="w-full h-full" preserveAspectRatio="xMidYMid meet">
          <rect x="0" y="0" width={BOARD_SIZE} height={BOARD_SIZE} fill="#fef3c7" rx="0.3" />

          <polygon
            points={`7.5,0 15,7.5 7.5,15 0,7.5`}
            fill="none"
            stroke="#92400e"
            strokeWidth="0.1"
            opacity="0.2"
          />

          <rect x="0" y="0" width="6" height="6" fill={COLORS.red.light} stroke={COLORS.red.border} strokeWidth="0.15" rx="0.5" />
          <rect x="0.5" y="0.5" width="5" height="5" fill="none" stroke={COLORS.red.border} strokeWidth="0.08" strokeDasharray="0.2 0.15" rx="0.3" />

          <rect x="9" y="0" width="6" height="6" fill={COLORS.yellow.light} stroke={COLORS.yellow.border} strokeWidth="0.15" rx="0.5" />
          <rect x="9.5" y="0.5" width="5" height="5" fill="none" stroke={COLORS.yellow.border} strokeWidth="0.08" strokeDasharray="0.2 0.15" rx="0.3" />

          <rect x="9" y="9" width="6" height="6" fill={COLORS.green.light} stroke={COLORS.green.border} strokeWidth="0.15" rx="0.5" />
          <rect x="9.5" y="9.5" width="5" height="5" fill="none" stroke={COLORS.green.border} strokeWidth="0.08" strokeDasharray="0.2 0.15" rx="0.3" />

          <rect x="0" y="9" width="6" height="6" fill={COLORS.blue.light} stroke={COLORS.blue.border} strokeWidth="0.15" rx="0.5" />
          <rect x="0.5" y="9.5" width="5" height="5" fill="none" stroke={COLORS.blue.border} strokeWidth="0.08" strokeDasharray="0.2 0.15" rx="0.3" />

          <polygon points="6,0 7.5,1.5 9,0" fill={COLORS.red.bg} opacity="0.8" />
          <polygon points="15,6 13.5,7.5 15,9" fill={COLORS.yellow.bg} opacity="0.8" />
          <polygon points="9,15 7.5,13.5 6,15" fill={COLORS.green.bg} opacity="0.8" />
          <polygon points="0,9 1.5,7.5 0,6" fill={COLORS.blue.bg} opacity="0.8" />

          {getFlyLine()}

          {TRACK_POSITIONS.map((coord, i) => {
            const isStart = PLAYER_ORDER.some((c) => START_POS_IDX[c] === i);
            const startColor = PLAYER_ORDER.find((c) => START_POS_IDX[c] === i);
            const isLastBeforeFinish = PLAYER_ORDER.some((c) => LAST_TRACK_BEFORE_FINISH[c] === i);
            const jumpColor = JUMP_COLORS[i];
            const isFly = FLY_PAIRS.some(([a, b]) => a === i || b === i);
            const trackColor = TRACK_COLORS[i];
            const x = coord.x;
            const y = coord.y;
            const cx = x + 0.5;
            const cy = y + 0.5;

            let bgColor = "#ffffff";
            let borderColor = "#d1d5db";

            if (jumpColor) {
              bgColor = COLORS[jumpColor].bg;
              borderColor = COLORS[jumpColor].border;
            }
            if (isStart && startColor) {
              bgColor = COLORS[startColor].bg;
              borderColor = COLORS[startColor].border;
            }

            return (
              <g key={i}>
                <rect
                  x={x + 0.03}
                  y={y + 0.03}
                  width="0.94"
                  height="0.94"
                  fill={bgColor}
                  stroke={borderColor}
                  strokeWidth="0.05"
                  rx="0.15"
                />
                <circle cx={cx} cy={cy} r="0.25" fill="#ffffff" opacity={isStart || jumpColor ? 0.6 : 0.3} />
                {isStart && startColor && (
                  <polygon
                    points={`${cx},${cy - 0.3} ${cx + 0.25},${cy + 0.15} ${cx - 0.25},${cy + 0.15}`}
                    fill="#ffffff"
                    opacity="0.9"
                  />
                )}
                {isFly && !isStart && !jumpColor && (
                  <circle cx={cx} cy={cy} r="0.15" fill="#6b7280" opacity="0.5" />
                )}
                {jumpColor && !isStart && (
                  <circle cx={cx} cy={cy} r="0.12" fill="#fff" opacity="0.8" />
                )}
              </g>
            );
          })}

          {gameState.players.map((color) => (
            <g key={`finish-${color}`}>
              {FINISH_POSITIONS[color].map((pos, fi) => {
                const cx = pos.x + 0.5;
                const cy = pos.y + 0.5;
                return (
                  <g key={fi}>
                    <rect
                      x={pos.x + 0.05}
                      y={pos.y + 0.05}
                      width="0.9"
                      height="0.9"
                      fill={COLORS[color].bg}
                      opacity={0.3 + fi * 0.12}
                      stroke={COLORS[color].border}
                      strokeWidth="0.04"
                      rx="0.15"
                    />
                    <circle cx={cx} cy={cy} r="0.2" fill="#fff" opacity="0.5" />
                  </g>
                );
              })}
            </g>
          ))}

          <polygon
            points="7.5,5.5 9.5,7.5 7.5,9.5 5.5,7.5"
            fill="#fbbf24"
            stroke="#d97706"
            strokeWidth="0.1"
          />
          <text x="7.5" y="8" fontSize="1.2" textAnchor="middle">🏆</text>
        </svg>

        {gameState.planes.filter((p) => !p.finished).map((plane) => {
          const pos = getPlanePosition(plane);
          const isMovable = movablePlaneIds.includes(plane.id);
          const planeInfo = getPlayerInfo(plane.color);

          const samePosPlanes = gameState.planes.filter(
            (p) => p.id !== plane.id && !p.inBase && !p.finished &&
              Math.abs(getPlanePosition(p).x - pos.x) < 0.1 &&
              Math.abs(getPlanePosition(p).y - pos.y) < 0.1
          );
          const allAtPos = [plane, ...samePosPlanes].sort((a, b) => a.id.localeCompare(b.id));
          const stackIdx = allAtPos.findIndex((p) => p.id === plane.id);

          return (
            <div
              key={plane.id}
              className={`absolute rounded-full transition-all duration-300 flex items-center justify-center overflow-hidden ${isMovable ? "cursor-pointer z-10" : ""}`}
              style={{
                left: `${(pos.x / BOARD_SIZE) * 100}%`,
                top: `${(pos.y / BOARD_SIZE) * 100}%`,
                width: "5.5%",
                height: "5.5%",
                transform: `translate(-50%, -50%) ${isMovable ? "scale(1.25)" : "scale(1)"} translateY(${stackIdx * -3}px)`,
                backgroundColor: COLORS[plane.color].bg,
                boxShadow: isMovable
                  ? `0 0 0 2px #fff, 0 0 0 4px ${COLORS[plane.color].bg}, 0 2px 10px rgba(0,0,0,0.3)`
                  : "0 1px 4px rgba(0,0,0,0.3), inset 0 1px 2px rgba(255,255,255,0.5)",
                border: `2px solid ${COLORS[plane.color].border}`,
                zIndex: isMovable ? 20 : (plane.finished ? 5 : 10),
              }}
              onClick={() => {
                if (isMovable) {
                  movePlane(plane.id);
                }
              }}
            >
              {planeInfo.avatarImage ? (
                <img src={planeInfo.avatarImage} alt="" className="w-full h-full object-cover" />
              ) : (
                <span style={{ color: COLORS[plane.color].text, fontSize: "10px", fontWeight: "bold" }}>
                  {planeInfo.avatarText}
                </span>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  if (rpsState) {
    const activePlayers = rpsState.remainingPlayers;
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 flex items-center justify-center p-4">
        <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-6 shadow-2xl max-w-md w-full">
          <h1 className="text-2xl font-bold text-center mb-2 flex items-center justify-center gap-2">
            ✊✋✌️ 石头剪刀布
          </h1>
          <p className="text-center text-gray-500 text-sm mb-6">{rpsState.message}</p>

          <div className="space-y-3 mb-6">
            {activePlayers.map((color) => {
              const info = getPlayerInfo(color);
              const choice = rpsState.opponentChoices[color];
              const isMe = color === "red";

              return (
                <div
                  key={color}
                  className={`flex items-center gap-3 p-3 rounded-xl ${
                    rpsState.winner === color ? "bg-yellow-50 border-2 border-yellow-400" : "bg-gray-50"
                  }`}
                >
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold overflow-hidden border-2"
                    style={{
                      backgroundColor: COLORS[color].bg,
                      borderColor: COLORS[color].border,
                    }}
                  >
                    {info.avatarImage ? (
                      <img src={info.avatarImage} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span style={{ color: COLORS[color].text }}>{info.avatarText}</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-sm">
                      {info.name}
                      {isMe && <span className="text-purple-500 ml-1">(你)</span>}
                    </p>
                  </div>
                  <div className="text-4xl">
                    {rpsState.phase === "result" || choice ? (
                      rpsEmoji[choice as RpsChoice] || "❓"
                    ) : (
                      "❓"
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {rpsState.winner ? (
            <button
              onClick={() => startGameWithFirstPlayer(rpsState.winner!)}
              className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-xl hover:opacity-90 transition-opacity"
            >
              开始游戏
            </button>
          ) : rpsState.phase === "choose" ? (
            <div className="space-y-2">
              <p className="text-center text-sm text-gray-500 mb-2">选择你的出招：</p>
              <div className="grid grid-cols-3 gap-3">
                {(["rock", "paper", "scissors"] as RpsChoice[]).map((choice) => (
                  <button
                    key={choice}
                    onClick={() => playRpsRound(choice)}
                    className="py-4 bg-gray-50 hover:bg-purple-50 rounded-xl text-4xl transition-colors border-2 border-transparent hover:border-purple-300"
                  >
                    {rpsEmoji[choice]}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          <button
            onClick={() => goHome()}
            className="w-full py-3 mt-3 text-gray-500 font-medium rounded-xl hover:bg-gray-100 transition-colors"
          >
            返回
          </button>
        </div>
      </div>
    );
  }

  if (!gameState) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 flex items-center justify-center p-4">
        <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-6 shadow-2xl max-w-md w-full">
          <h1 className="text-2xl font-bold text-center mb-6 flex items-center justify-center gap-2">
            ✈️ 飞行棋
          </h1>

          <div className="mb-6">
            <h2 className="text-sm font-medium text-gray-500 mb-3">选择人数与对手</h2>
            
            <div className="flex gap-2 mb-4">
              {([2, 3, 4] as const).map((n) => {
                const isActive = playerCount === n;
                return (
                  <button
                    key={n}
                    onClick={() => {
                      setPlayerCount(n);
                      const maxContacts = n - 1;
                      if (selectedContacts.length > maxContacts) {
                        setSelectedContacts(selectedContacts.slice(0, maxContacts));
                      }
                    }}
                    className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all ${
                      isActive
                        ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md"
                        : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                    }`}
                  >
                    {n}人局
                  </button>
                );
              })}
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto">
              {contacts.map((contact) => {
                const conv = conversations.find((cv) => cv.type === "private" && cv.memberIds.includes(contact.id));
                const avatarImg = conv?.herAvatarImage || contact.avatarImage || herAvatarImage || "";
                const avatarTxt = conv?.herAvatarText || contact.avatar || contact.name.charAt(0);
                const isSelected = selectedContacts.includes(contact.id);
                const maxContacts = playerCount - 1;
                const isDisabled = !isSelected && selectedContacts.length >= maxContacts;
                return (
                  <label
                    key={contact.id}
                    className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                      isSelected
                        ? "bg-purple-100 border-2 border-purple-500 cursor-pointer"
                        : isDisabled
                          ? "bg-gray-50 border-2 border-transparent opacity-50 cursor-not-allowed"
                          : "bg-gray-50 border-2 border-transparent hover:bg-gray-100 cursor-pointer"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      disabled={isDisabled}
                      onChange={(e) => {
                        if (e.target.checked) {
                          if (selectedContacts.length < 3) {
                            setSelectedContacts([...selectedContacts, contact.id]);
                          }
                        } else {
                          setSelectedContacts(selectedContacts.filter((id) => id !== contact.id));
                        }
                      }}
                      className="w-5 h-5 rounded accent-purple-500"
                    />
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold overflow-hidden"
                      style={{
                        backgroundColor: avatarImg ? "transparent" : "#e5e7eb",
                      }}
                    >
                      {avatarImg ? (
                        <img src={avatarImg} alt="" className="w-full h-full rounded-full object-cover" />
                      ) : (
                        avatarTxt
                      )}
                    </div>
                    <span className="font-medium">{contact.name}</span>
                  </label>
                );
              })}
            </div>

            {contacts.length === 0 && (
              <p className="text-center text-gray-500 text-sm py-4">
                请先在聊天中添加联系人
              </p>
            )}
          </div>

          <button
            onClick={initGame}
            className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={selectedContacts.length === 0}
          >
            石头剪刀布决定先手！
          </button>

          <button
            onClick={() => goHome()}
            className="w-full py-3 mt-3 text-gray-500 font-medium rounded-xl hover:bg-gray-100 transition-colors"
          >
            返回
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 flex flex-col items-center p-2">
      <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-2 shadow-2xl w-full max-w-md flex flex-col" style={{ maxHeight: "96vh" }}>
        <div className="flex items-center justify-between mb-1 flex-shrink-0 px-1">
          <button
            onClick={() => goHome()}
            className="flex items-center gap-1 text-gray-600 hover:text-gray-800 transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>返回</span>
          </button>
          <h1 className="text-base font-bold flex items-center gap-1">
            ✈️ 飞行棋
          </h1>
          <button
            onClick={initGame}
            className="flex items-center gap-1 text-gray-600 hover:text-gray-800 transition-colors"
            title="重新开始"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        <div data-tomato-container className="flex items-center justify-around mb-1 flex-shrink-0 relative">
          {gameState.players.map((color) => {
            const info = getPlayerInfo(color);
            const isCurrent = gameState.currentPlayer === color;
            const finishedCount = gameState.planes.filter((p) => p.color === color && p.finished).length;
            const tomatoCount = Math.min(tomatoCounts[color] || 0, 10);

            return (
              <div
                key={color}
                className={`flex flex-col items-center gap-0.5 p-1 rounded-lg transition-all ${isCurrent ? "scale-110" : "opacity-60"}`}
              >
                <div className="relative flex items-center justify-center" style={{ height: "32px", width: "32px" }}>
                  <div
                    data-avatar-color={color}
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold overflow-hidden border-2 ${color !== "red" && !gameState.winner ? "cursor-pointer" : ""}`}
                    style={{
                      borderColor: isCurrent ? COLORS[color].border : "transparent",
                      boxShadow: isCurrent ? `0 0 8px ${COLORS[color].bg}` : "none",
                      backgroundColor: COLORS[color].bg,
                    }}
                    onDoubleClick={() => handleAvatarDoubleClick(color)}
                    title={color !== "red" && !gameState.winner ? "双击砸番茄" : ""}
                  >
                    {info.avatarImage ? (
                      <img src={info.avatarImage} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span style={{ color: COLORS[color].text, fontSize: "11px" }}>{info.avatarText}</span>
                    )}
                  </div>
                  {Array.from({ length: tomatoCount }).map((_, i) => (
                    <img
                      key={i}
                      src={TOMATO_IMG}
                      alt="tomato"
                      className="absolute h-3 w-3 object-contain"
                      style={{
                        bottom: `${24 + i * 6}px`,
                        left: `calc(50% + ${i === 0 ? 0 : (i % 3 - 1) * 0.8}px)`,
                        transform: `translateX(-50%) rotate(${i === 0 ? 0 : (i % 3 - 1) * 1.5}deg)`,
                        filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.25))",
                        zIndex: i,
                      }}
                    />
                  ))}
                </div>
                <span className="text-[10px] font-medium">{finishedCount}/4</span>
              </div>
            );
          })}
          {tomatoes.map((t) => (
            <TomatoFlyAnimation key={t.id} tomato={t} />
          ))}
        </div>

        <div className="text-center mb-1 flex-shrink-0 px-2">
          <p className="text-xs font-medium text-gray-700 truncate">{gameState.message}</p>
        </div>

        <div className="flex-shrink-0">
          {renderBoard()}
        </div>

        <div className="flex-1 min-h-0 mt-2 flex flex-col bg-gray-50 rounded-xl overflow-hidden">
          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {chatMessages.length === 0 && (
              <p className="text-center text-xs text-gray-400 py-4">游戏过程中玩家会随机说话~</p>
            )}
            {chatMessages.map((msg) => {
              const info = getPlayerInfo(msg.color);
              const isMe = msg.color === "red";

              return (
                <div key={msg.id} className={`flex gap-2 ${isMe ? "flex-row-reverse" : ""}`}>
                  <div
                    className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold overflow-hidden border-2"
                    style={{
                      backgroundColor: COLORS[msg.color].bg,
                      borderColor: COLORS[msg.color].border,
                    }}
                  >
                    {info.avatarImage ? (
                      <img src={info.avatarImage} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span style={{ color: COLORS[msg.color].text, fontSize: "10px" }}>{info.avatarText}</span>
                    )}
                  </div>
                  <div
                    className={`max-w-[70%] px-2.5 py-1.5 rounded-2xl text-xs ${isMe ? "bg-purple-500 text-white" : "bg-white text-gray-800"}`}
                    style={!isMe ? { backgroundColor: COLORS[msg.color].light } : {}}
                  >
                    {msg.text}
                  </div>
                </div>
              );
            })}
            <div ref={chatEndRef} />
          </div>

          <div className="flex items-center gap-3 p-3 border-t border-gray-200 bg-white">
            <div className="flex items-center gap-3">
              <span className="text-xs text-gray-500 whitespace-nowrap">骰子</span>
              <div className={gameState.isRolling ? "animate-bounce" : ""}>
                <DiceFace value={gameState.dice} color={gameState.currentPlayer} />
              </div>
            </div>
            <div className="flex-1" />
            <button
              onClick={rollDice}
              disabled={!isMyTurn || gameState.isRolling || gameState.phase !== "idle" || !!gameState.winner}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-white text-sm transition-all ${
                isMyTurn && !gameState.isRolling && gameState.phase === "idle" && !gameState.winner
                  ? "bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90 shadow-lg active:scale-95"
                  : "bg-gray-300 cursor-not-allowed"
              }`}
            >
              <span className="text-lg">🎲</span>
              {gameState.winner ? "结束" : gameState.isRolling ? "..." : isMyTurn ? (gameState.phase === "choosing" ? "选棋子" : "投骰子") : "等待中"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
