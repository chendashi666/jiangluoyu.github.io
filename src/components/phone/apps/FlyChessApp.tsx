import { useNavigate } from "react-router-dom";

export default function FlyChessApp({ onBack }: { onBack: () => void }) {
  const navigate = useNavigate();

  const startGame = () => {
    // 设置入口标记，FlightChessPage 据此判断是否为合法进入
    sessionStorage.setItem("flight-chess-entered", "1");
    navigate("/flight-chess");
  };

  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 p-6">
      <div className="text-4xl">✈️</div>
      <div className="text-base font-bold" style={{ color: "var(--text)" }}>飞行棋</div>
      <div className="text-xs text-gray-400 text-center">全屏模式体验更佳</div>
      <button
        onClick={startGame}
        className="px-6 py-2 rounded-full text-white text-sm font-bold"
        style={{ background: "linear-gradient(135deg, #a855f7, #ec4899)" }}
      >
        开始游戏
      </button>
      <button
        onClick={onBack}
        className="text-xs text-gray-400 hover:text-gray-600"
      >
        返回
      </button>
    </div>
  );
}
