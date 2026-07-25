import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, RotateCcw, Dices } from "lucide-react";
import { useAppStore } from "@/store/app";
import type { Contact } from "@/types";

type PlayerColor = "red" | "yellow" | "green" | "blue";

const PLAYER_ORDER: PlayerColor[] = ["red", "yellow", "green", "blue"];
const COLORS: Record<PlayerColor, { bg: string; border: string; text: string }> = {
  red: { bg: "#ff6b6b", border: "#ee5a5a", text: "#fff" },
  yellow: { bg: "#ffd93d", border: "#f5c800", text: "#333" },
  green: { bg: "#6bcb77", border: "#5ab665", text: "#fff" },
  blue: { bg: "#4d96ff", border: "#3d85ee", text: "#fff" },
};

const TOTAL_TRACK = 52;

const BOARD_SIZE = 15;

const TRACK_POSITIONS: { x: number; y: number }[] = (() => {
  const p: { x: number; y: number }[] = [];
  for (let i = 0; i < 13; i++) p.push({ x: i + 1, y: 0 });
  for (let i = 0; i < 13; i++) p.push({ x: 14, y: i + 1 });
  for (let i = 0; i < 13; i++) p.push({ x: 14 - i, y: 14 });
  for (let i = 0; i < 13; i++) p.push({ x: 0, y: 14 - i });
  return p;
})();

const BASE_POSITIONS: Record<PlayerColor, { x: number; y: number }[]> = {
  red: [{ x: 1, y: 1 }, { x: 3, y: 1 }, { x: 1, y: 3 }, { x: 3, y: 3 }],
  yellow: [{ x: 11, y: 1 }, { x: 13, y: 1 }, { x: 11, y: 3 }, { x: 13, y: 3 }],
  green: [{ x: 11, y: 11 }, { x: 13, y: 11 }, { x: 11, y: 13 }, { x: 13, y: 13 }],
  blue: [{ x: 1, y: 11 }, { x: 3, y: 11 }, { x: 1, y: 13 }, { x: 3, y: 13 }],
};

const FINISH_POSITIONS: Record<PlayerColor, { x: number; y: number }[]> = {
  red: [{ x: 7, y: 1 }, { x: 7, y: 2 }, { x: 7, y: 3 }, { x: 7, y: 4 }, { x: 7, y: 5 }],
  yellow: [{ x: 13, y: 7 }, { x: 12, y: 7 }, { x: 11, y: 7 }, { x: 10, y: 7 }, { x: 9, y: 7 }],
  green: [{ x: 7, y: 13 }, { x: 7, y: 12 }, { x: 7, y: 11 }, { x: 7, y: 10 }, { x: 7, y: 9 }],
  blue: [{ x: 1, y: 7 }, { x: 2, y: 7 }, { x: 3, y: 7 }, { x: 4, y: 7 }, { x: 5, y: 7 }],
};

const START_POS_IDX: Record<PlayerColor, number> = {
  red: 0,
  yellow: 13,
  green: 26,
  blue: 39,
};

interface Plane {
  id: string;
  color: PlayerColor;
  position: number;
  inBase: boolean;
  finished: boolean;
}

interface GameState {
  planes: Plane[];
  currentPlayer: PlayerColor;
  dice: number | null;
  isRolling: boolean;
  selectedPlaneId: string | null;
  message: string;
  lastCard: string | null;
  showCard: boolean;
  turnCount: number;
}

export default function FlightChessPage() {
  const navigate = useNavigate();
  const contacts = useAppStore((s) => s.contacts);
  const conversations = useAppStore((s) => s.conversations);
  const myAvatar = useAppStore((s) => s.beauty.myAvatar);
  const myAvatarImage = useAppStore((s) => s.beauty.myAvatarImage);
  const herAvatarImage = useAppStore((s) => s.beauty.herAvatarImage);
  const pickRandomCard = useAppStore((s) => s.pickRandomCard);
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const boardRef = useRef<HTMLDivElement>(null);

  const goHome = useCallback(() => {
    sessionStorage.removeItem("flight-chess-entered");
    try {
      navigate("/");
    } catch {
      /* ignore */
    }
    // 双重保险：确保 hash 一定回到主页
    window.location.hash = "#/";
    setTimeout(() => {
      if (window.location.hash !== "#/" && window.location.hash !== "") {
        window.location.href = window.location.origin + window.location.pathname + window.location.search + "#/";
      }
    }, 80);
  }, [navigate]);

  // 入口守卫：只有从手机端“开始游戏”按钮进入才允许停留，否则直接回主页
  // 解决浏览器记住 #/flight-chess 导致一进来就是飞行棋的问题
  useEffect(() => {
    const entered = sessionStorage.getItem("flight-chess-entered");
    if (!entered) {
      window.location.hash = "#/";
    }
  }, []);

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
    if (info.contactId) {
      const c = contacts.find((x) => x.id === info.contactId);
      if (c && c.cards?.chat) {
        return c.cards.chat;
      }
    }
    return [];
  }, [contacts, getPlayerInfo]);

  const initGame = useCallback(() => {
    const planes: Plane[] = [];
    PLAYER_ORDER.forEach((color) => {
      for (let i = 0; i < 4; i++) {
        planes.push({ id: `${color}-${i}`, color, position: -1, inBase: true, finished: false });
      }
    });
    setGameState({
      planes,
      currentPlayer: "red",
      dice: null,
      isRolling: false,
      selectedPlaneId: null,
      message: "游戏开始！",
      lastCard: null,
      showCard: false,
      turnCount: 0,
    });
  }, []);

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
      
      const stepsToFinish = TOTAL_TRACK - ((plane.position - startIdx + TOTAL_TRACK) % TOTAL_TRACK) + 4;
      if (dice <= stepsToFinish) {
        movable.push(plane.id);
      }
    });
    
    return movable;
  }, []);

  const movePlaneInternal = (planes: Plane[], planeId: string, dice: number): Plane[] => {
    const plane = planes.find((p) => p.id === planeId);
    if (!plane) return planes;
    
    const color = plane.color;
    const startIdx = START_POS_IDX[color];
    
    return planes.map((p) => {
      if (p.id !== planeId) return p;
      
      if (p.inBase) {
        return { ...p, inBase: false, position: startIdx };
      }
      
      const relPos = ((p.position - startIdx + TOTAL_TRACK) % TOTAL_TRACK);
      const newRelPos = relPos + dice;
      
      if (newRelPos >= TOTAL_TRACK) {
        const finishIdx = newRelPos - TOTAL_TRACK;
        if (finishIdx > 4) return p;
        return { ...p, position: TOTAL_TRACK + finishIdx, finished: finishIdx === 4 };
      }
      
      const targetPos = (startIdx + newRelPos) % TOTAL_TRACK;
      
      const hitPlane = planes.find(
        (op) => op.id !== planeId && op.color !== color && !op.finished && !op.inBase && op.position === targetPos
      );
      
      return { ...p, position: targetPos };
    }).map((p) => {
      if (p.id === planeId) return p;
      const planeObj = planes.find((x) => x.id === planeId);
      if (!planeObj || planeObj.inBase) return p;
      const startIdx2 = START_POS_IDX[color];
      const relPos = ((planeObj.position - startIdx2 + TOTAL_TRACK) % TOTAL_TRACK);
      const newRelPos = relPos + dice;
      if (newRelPos >= TOTAL_TRACK) return p;
      const targetPos = (startIdx2 + newRelPos) % TOTAL_TRACK;
      if (p.position === targetPos && p.color !== color && !p.finished && !p.inBase) {
        return { ...p, position: -1, inBase: true };
      }
      return p;
    });
  };

  const rollDice = useCallback(() => {
    if (!gameState || !isMyTurn || gameState.isRolling || gameState.dice !== null) return;
    
    setGameState((prev) => {
      if (!prev) return prev;
      return { ...prev, isRolling: true };
    });
    
    setTimeout(() => {
      setGameState((prev) => {
        if (!prev) return prev;
        
        const finalDice = Math.floor(Math.random() * 6) + 1;
        const playerInfo = getPlayerInfo(prev.currentPlayer);
        const movable = getMovablePlaneIds(prev.currentPlayer, finalDice, prev.planes);
        
        let cardText: string | null = null;
        if ((finalDice === 6 || finalDice === 1) && movable.length > 0) {
          const cards = getChatCardsForPlayer(prev.currentPlayer);
          if (cards.length > 0) {
            cardText = cards[Math.floor(Math.random() * cards.length)].content;
          }
        }
        
        const message = cardText 
          ? `${playerInfo.name}: ${cardText}` 
          : `${playerInfo.name} 投出了 ${finalDice} 点`;
        
        if (movable.length > 0) {
          return {
            ...prev,
            dice: finalDice,
            isRolling: false,
            message,
            lastCard: cardText,
            showCard: !!cardText,
            turnCount: prev.turnCount + 1,
          };
        }
        
        const nextIdx = (PLAYER_ORDER.indexOf(prev.currentPlayer) + 1) % 4;
        const nextColor = PLAYER_ORDER[nextIdx];
        
        setTimeout(() => {
          if (nextColor !== "red") {
            aiRoll(nextColor);
          }
        }, 800);
        
        return {
          ...prev,
          dice: null,
          isRolling: false,
          currentPlayer: nextColor,
          message: `${getPlayerInfo(nextColor).name} 的回合`,
          lastCard: cardText,
          showCard: !!cardText,
          turnCount: prev.turnCount + 1,
        };
      });
      
      setTimeout(() => {
        setGameState((prev) => {
          if (!prev) return prev;
          return { ...prev, showCard: false };
        });
      }, 3000);
    }, 600);
  }, [gameState, isMyTurn, getPlayerInfo, getChatCardsForPlayer, getMovablePlaneIds]);

  const aiRoll = useCallback((color: PlayerColor) => {
    setGameState((prev) => {
      if (!prev) return prev;
      return { ...prev, isRolling: true, currentPlayer: color };
    });
    
    setTimeout(() => {
      setGameState((prev) => {
        if (!prev) return prev;
        
        const finalDice = Math.floor(Math.random() * 6) + 1;
        const playerInfo = getPlayerInfo(prev.currentPlayer);
        const movable = getMovablePlaneIds(prev.currentPlayer, finalDice, prev.planes);
        
        let cardText: string | null = null;
        if ((finalDice === 6 || finalDice === 1) && movable.length > 0) {
          const cards = getChatCardsForPlayer(prev.currentPlayer);
          if (cards.length > 0) {
            cardText = cards[Math.floor(Math.random() * cards.length)].content;
          }
        }
        
        const message = cardText 
          ? `${playerInfo.name}: ${cardText}` 
          : `${playerInfo.name} 投出了 ${finalDice} 点`;
        
        if (movable.length > 0) {
          const randomPlane = movable[Math.floor(Math.random() * movable.length)];
          
          setTimeout(() => {
            setGameState((p) => {
              if (!p) return p;
              const newPlanes = movePlaneInternal(p.planes, randomPlane, finalDice);
              const winner = PLAYER_ORDER.find((c) => newPlanes.filter((pp) => pp.color === c && pp.finished).length === 4);
              
              if (winner) {
                return { ...p, planes: newPlanes, dice: null, message: `${getPlayerInfo(winner).name} 获胜！` };
              }
              
              if (finalDice === 6) {
                setTimeout(() => aiRoll(p.currentPlayer), 800);
                return { ...p, planes: newPlanes, dice: null, message: `${getPlayerInfo(p.currentPlayer).name} 再投一次！` };
              }
              
              const nextIdx = (PLAYER_ORDER.indexOf(p.currentPlayer) + 1) % 4;
              const nextColor = PLAYER_ORDER[nextIdx];
              
              if (nextColor !== "red") {
                setTimeout(() => aiRoll(nextColor), 800);
              }
              
              return {
                ...p,
                planes: newPlanes,
                dice: null,
                currentPlayer: nextColor,
                message: `${getPlayerInfo(nextColor).name} 的回合`,
              };
            });
          }, 700);
          
          return {
            ...prev,
            dice: finalDice,
            isRolling: false,
            message,
            lastCard: cardText,
            showCard: !!cardText,
            turnCount: prev.turnCount + 1,
          };
        }
        
        const nextIdx = (PLAYER_ORDER.indexOf(prev.currentPlayer) + 1) % 4;
        const nextColor = PLAYER_ORDER[nextIdx];
        
        if (nextColor !== "red") {
          setTimeout(() => aiRoll(nextColor), 800);
        }
        
        return {
          ...prev,
          dice: null,
          isRolling: false,
          currentPlayer: nextColor,
          message: `${getPlayerInfo(nextColor).name} 的回合`,
          lastCard: cardText,
          showCard: !!cardText,
          turnCount: prev.turnCount + 1,
        };
      });
      
      setTimeout(() => {
        setGameState((prev) => {
          if (!prev) return prev;
          return { ...prev, showCard: false };
        });
      }, 3000);
    }, 600);
  }, [getPlayerInfo, getChatCardsForPlayer, getMovablePlaneIds]);

  const movePlane = useCallback((planeId: string) => {
    if (!gameState || !gameState.dice || !isMyTurn) return;
    
    setGameState((prev) => {
      if (!prev || !prev.dice) return prev;
      
      const newPlanes = movePlaneInternal(prev.planes, planeId, prev.dice);
      const winner = PLAYER_ORDER.find((c) => newPlanes.filter((p) => p.color === c && p.finished).length === 4);
      
      if (winner) {
        return {
          ...prev,
          planes: newPlanes,
          dice: null,
          selectedPlaneId: null,
          message: `${getPlayerInfo(winner).name} 获胜！`,
        };
      }
      
      if (prev.dice === 6) {
        return {
          ...prev,
          planes: newPlanes,
          dice: null,
          selectedPlaneId: null,
          message: `${getPlayerInfo(prev.currentPlayer).name} 再投一次！`,
        };
      }
      
      const nextIdx = (PLAYER_ORDER.indexOf(prev.currentPlayer) + 1) % 4;
      const nextColor = PLAYER_ORDER[nextIdx];
      
      setTimeout(() => {
        if (nextColor !== "red") {
          aiRoll(nextColor);
        }
      }, 600);
      
      return {
        ...prev,
        planes: newPlanes,
        dice: null,
        currentPlayer: nextColor,
        selectedPlaneId: null,
        message: `${getPlayerInfo(nextColor).name} 的回合`,
      };
    });
  }, [gameState, isMyTurn, getPlayerInfo, aiRoll]);

  const getPlanePosition = (plane: Plane): { x: number; y: number } => {
    if (plane.inBase) {
      const idx = parseInt(plane.id.split("-")[1]);
      return BASE_POSITIONS[plane.color][idx];
    }
    if (plane.finished) {
      const idx = plane.position - TOTAL_TRACK;
      return FINISH_POSITIONS[plane.color][Math.min(idx, 4)];
    }
    if (plane.position < 0 || plane.position >= TRACK_POSITIONS.length) {
      return { x: BOARD_SIZE / 2, y: BOARD_SIZE / 2 };
    }
    return TRACK_POSITIONS[plane.position];
  };

  const renderBoard = () => {
    if (!gameState) return null;
    
    const movablePlaneIds = isMyTurn && gameState.dice
      ? getMovablePlaneIds(gameState.currentPlayer, gameState.dice, gameState.planes)
      : [];
    
    return (
      <div ref={boardRef} className="relative flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl p-3 shadow-xl overflow-hidden" style={{ width: "100%", aspectRatio: "1" }}>
        <svg viewBox={`0 0 ${BOARD_SIZE} ${BOARD_SIZE}`} className="w-full h-full" preserveAspectRatio="xMidYMid meet">
          <defs>
            <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0.15" stdDeviation="0.15" floodOpacity="0.15" />
            </filter>
          </defs>
          
          <rect x="0" y="0" width={BOARD_SIZE} height={BOARD_SIZE} fill="#f0f4ff" rx="0.5" />
          
          <rect x="0" y="0" width="5" height="5" fill="#ffe0e0" />
          <rect x="0" y="0" width="5" height="5" fill="none" stroke="#ff6b6b" strokeWidth="0.15" />
          
          <rect x="10" y="0" width="5" height="5" fill="#fff6d0" />
          <rect x="10" y="0" width="5" height="5" fill="none" stroke="#ffd93d" strokeWidth="0.15" />
          
          <rect x="10" y="10" width="5" height="5" fill="#e0f5e3" />
          <rect x="10" y="10" width="5" height="5" fill="none" stroke="#6bcb77" strokeWidth="0.15" />
          
          <rect x="0" y="10" width="5" height="5" fill="#e0ecff" />
          <rect x="0" y="10" width="5" height="5" fill="none" stroke="#4d96ff" strokeWidth="0.15" />
          
          {TRACK_POSITIONS.map((coord, i) => {
            const { x, y } = coord;
            const colorIdx = Math.floor(i / 13);
            const color = PLAYER_ORDER[colorIdx];
            const isStart = i % 13 === 0;
            return (
              <g key={i}>
                <rect
                  x={x}
                  y={y}
                  width="1"
                  height="1"
                  fill={COLORS[color].bg}
                  opacity={isStart ? 0.5 : 0.25}
                />
                {isStart && (
                  <text x={x + 0.5} y={y + 0.65} fontSize="0.5" textAnchor="middle">🚀</text>
                )}
              </g>
            );
          })}
          
          {PLAYER_ORDER.map((color) => (
            <g key={`finish-${color}`}>
              {FINISH_POSITIONS[color].map((pos, fi) => (
                <rect
                  key={fi}
                  x={pos.x}
                  y={pos.y}
                  width="1"
                  height="1"
                  fill={COLORS[color].bg}
                  opacity={0.4}
                />
              ))}
            </g>
          ))}
          
          <rect x="5" y="5" width="5" height="5" fill="#fff" opacity="0.8" />
          <text x="7.5" y="7.8" fontSize="1" textAnchor="middle">🏠</text>
        </svg>
        
        {gameState.planes.map((plane) => {
          const pos = getPlanePosition(plane);
          const isMovable = movablePlaneIds.includes(plane.id);
          const isSelected = gameState.selectedPlaneId === plane.id;
          const info = getPlayerInfo(plane.color);
          
          return (
            <div
              key={plane.id}
              className={`absolute flex items-center justify-center rounded-full cursor-pointer transition-all duration-300 ${isMovable ? "hover:scale-110" : ""}`}
              style={{
                left: `${((pos.x + 0.5) / BOARD_SIZE) * 100}%`,
                top: `${((pos.y + 0.5) / BOARD_SIZE) * 100}%`,
                width: "7%",
                height: "7%",
                transform: `translate(-50%, -50%) ${isMovable ? "scale(1.15)" : "scale(1)"}`,
                backgroundColor: COLORS[plane.color].bg,
                boxShadow: `0 2px 6px rgba(0,0,0,0.2), inset 0 1px 2px rgba(255,255,255,0.3)`,
                border: `2px solid ${COLORS[plane.color].border}`,
                zIndex: isSelected ? 10 : 1,
              }}
              onClick={() => {
                if (isMovable) {
                  movePlane(plane.id);
                }
              }}
            >
              {info.avatarImage ? (
                <img src={info.avatarImage} alt="" className="w-full h-full rounded-full object-cover" />
              ) : (
                <span className="text-xs font-bold" style={{ color: COLORS[plane.color].text }}>
                  {info.avatarText}
                </span>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  if (!gameState) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 flex flex-col items-center justify-center p-4">
        <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-6 shadow-2xl max-w-md w-full">
          <h1 className="text-2xl font-bold text-center mb-6 flex items-center justify-center gap-2">
            ✈️ 飞行棋
          </h1>
          
          <div className="mb-6">
            <h2 className="text-sm font-medium text-gray-500 mb-3">选择对手</h2>
            <div className="space-y-2">
              {contacts.slice(0, 3).map((contact) => {
                const conv = conversations.find((cv) => cv.type === "private" && cv.memberIds.includes(contact.id));
                const avatarImg = conv?.herAvatarImage || contact.avatarImage || herAvatarImage || "";
                const avatarTxt = conv?.herAvatarText || contact.avatar || contact.name.charAt(0);
                return (
                <label
                  key={contact.id}
                  className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${
                    selectedContacts.includes(contact.id)
                      ? "bg-purple-100 border-2 border-purple-500"
                      : "bg-gray-50 border-2 border-transparent hover:bg-gray-100"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedContacts.includes(contact.id)}
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
          </div>
          
          <button
            onClick={initGame}
            className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold rounded-xl hover:opacity-90 transition-opacity"
            disabled={selectedContacts.length === 0}
          >
            开始游戏
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
    <div className="fixed inset-0 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 flex items-center justify-center p-2 overflow-hidden">
      <div className="bg-white/95 backdrop-blur-sm rounded-3xl p-3 shadow-2xl w-full h-full flex gap-3" style={{ maxWidth: "900px", maxHeight: "95vh" }}>
        <div className="flex-1 flex flex-col justify-center min-w-0">
          <div className="flex items-center justify-between mb-2">
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
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
          
          <div className="mb-2">
            {gameState.showCard && gameState.lastCard && (
              <div className="bg-gradient-to-r from-yellow-100 to-orange-100 border border-yellow-300 rounded-xl p-2 mb-1 animate-pulse">
                <p className="text-center font-medium text-gray-700 text-xs">{gameState.lastCard}</p>
              </div>
            )}
            <p className="text-center text-gray-600 text-xs">{gameState.message}</p>
          </div>
          
          {renderBoard()}
        </div>
        
        <div className="w-28 flex flex-col justify-between gap-2 flex-shrink-0">
          <div className="flex flex-col gap-2">
            {PLAYER_ORDER.map((color) => {
              const info = getPlayerInfo(color);
              const isCurrent = gameState.currentPlayer === color;
              const finishedCount = gameState.planes.filter((p) => p.color === color && p.finished).length;
              
              return (
                <div
                  key={color}
                  className={`flex items-center gap-2 p-2 rounded-lg transition-all ${
                    isCurrent ? "ring-2 ring-offset-1" : ""
                  }`}
                  style={{
                    backgroundColor: isCurrent ? COLORS[color].bg : "#f3f4f6",
                    color: isCurrent ? COLORS[color].text : "#374151",
                    "--tw-ring-color": COLORS[color].bg,
                  } as React.CSSProperties}
                >
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 overflow-hidden"
                    style={{ backgroundColor: COLORS[color].bg }}
                  >
                    {info.avatarImage ? (
                      <img src={info.avatarImage} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span style={{ color: COLORS[color].text }}>{info.avatarText}</span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">{info.name}</p>
                    <p className="text-[10px] opacity-70">{finishedCount}/4</p>
                  </div>
                  {isCurrent && <span className="text-xs">👑</span>}
                </div>
              );
            })}
          </div>
          
          <div className="flex flex-col items-center gap-2 mt-auto">
            {gameState.dice !== null && (
              <div className="flex items-center gap-1 text-sm font-bold">
                <Dices className="w-4 h-4" />
                <span>{gameState.dice}</span>
              </div>
            )}
            
            <button
              onClick={rollDice}
              disabled={!isMyTurn || gameState.isRolling || gameState.dice !== null}
              className={`w-full flex items-center justify-center gap-1 px-3 py-2 rounded-xl font-bold text-white text-sm transition-all ${
                isMyTurn && !gameState.isRolling && gameState.dice === null
                  ? "bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90 shadow-md"
                  : "bg-gray-300 cursor-not-allowed"
              }`}
            >
              <Dices className={`w-4 h-4 ${gameState.isRolling ? "animate-spin" : ""}`} />
              {gameState.isRolling ? "..." : isMyTurn ? "投骰" : "等待"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}