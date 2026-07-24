import { useState, useEffect } from "react";
import { useAppStore } from "@/store/app";
import WeatherAnimation, { WEATHER_TYPES } from "./WeatherAnimation";
import {
  Droplets,
  Wind,
  Eye,
  Gauge,
  Sun,
  MapPin,
  RefreshCw,
  Compass,
  ChevronLeft,
} from "lucide-react";

export default function WeatherApp({ onBack }: { onBack: () => void }) {
  const contacts = useAppStore((s) => s.contacts);
  const conversations = useAppStore((s) => s.conversations);
  const activeConversationId = useAppStore((s) => s.activeConversationId);

  const activeConv = conversations.find((c) => c.id === activeConversationId);
  const contactId = activeConv?.type === "private" ? activeConv.memberIds[0] : contacts[0]?.id;
  const contact = contacts.find((c) => c.id === contactId);

  // 随机选择一个天气
  const [weatherIndex, setWeatherIndex] = useState(() => 
    Math.floor(Math.random() * WEATHER_TYPES.length)
  );
  const [refreshing, setRefreshing] = useState(false);

  const currentWeather = WEATHER_TYPES[weatherIndex];
  const location = contact?.status?.travel?.location || "未知位置";
  
  // 根据天气类型生成随机温度
  const getRandomTemp = (weatherType: string) => {
    if (weatherType.includes("snow") || weatherType.includes("blizzard") || weatherType === "coldWave") {
      return Math.floor(Math.random() * 10) - 10; // -10 到 0
    } else if (weatherType.includes("Rain") || weatherType === "thunderstorm" || weatherType === "storm") {
      return Math.floor(Math.random() * 15) + 10; // 10 到 25
    } else if (weatherType === "heatWave" || weatherType === "sunny") {
      return Math.floor(Math.random() * 10) + 28; // 28 到 38
    } else {
      return Math.floor(Math.random() * 20) + 10; // 10 到 30
    }
  };

  const temp = getRandomTemp(currentWeather.type);
  const feelsLike = temp + Math.floor(Math.random() * 6) - 3;
  const humidity = Math.floor(Math.random() * 60) + 30;
  const windSpeed = Math.floor(Math.random() * 30) + 5;
  const windDirection = Math.floor(Math.random() * 360);
  const visibility = Math.floor(Math.random() * 20) + 5;
  const uvIndex = currentWeather.type === "sunny" ? Math.floor(Math.random() * 4) + 6 : Math.floor(Math.random() * 5) + 1;
  const pressure = Math.floor(Math.random() * 30) + 1000;

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setWeatherIndex(Math.floor(Math.random() * WEATHER_TYPES.length));
      setRefreshing(false);
    }, 500);
  };

  const getWindDirection = (deg: number) => {
    const dirs = ["北", "东北", "东", "东南", "南", "西南", "西", "西北"];
    const idx = Math.round(deg / 45) % 8;
    return dirs[idx];
  };

  const getTips = (weatherName: string) => {
    if (weatherName.includes("雨") || weatherName.includes("雷")) {
      return "今天有雨，出门记得带伞哦～";
    }
    if (weatherName.includes("雪") || weatherName === "寒潮") {
      return "天气寒冷，注意保暖别感冒啦～";
    }
    if (weatherName === "高温") {
      return "今天好热，多喝冰水小心中暑！";
    }
    if (weatherName === "晴天" || weatherName === "晴转多云") {
      return "天气真好，适合出去玩哦～";
    }
    if (weatherName.includes("雾") || weatherName === "雾霾") {
      return "有雾，出门注意安全～";
    }
    if (weatherName === "沙尘暴" || weatherName === "浮尘") {
      return "空气不好，记得戴口罩哦～";
    }
    return "今天也要开心呀～";
  };

  // 生成7天预报
  const generateDaily = () => {
    const days = ["今天", "明天", "后天", "周四", "周五", "周六", "周日"];
    return days.map((day, i) => {
      const w = WEATHER_TYPES[Math.floor(Math.random() * WEATHER_TYPES.length)];
      const baseTemp = temp + Math.floor(Math.random() * 10) - 5;
      return {
        day,
        tempMax: baseTemp + Math.floor(Math.random() * 5) + 2,
        tempMin: baseTemp - Math.floor(Math.random() * 5) - 2,
        weatherCode: w.code,
        weather: w.name,
      };
    });
  };

  // 生成24小时预报
  const generateHourly = () => {
    const now = new Date().getHours();
    return Array.from({ length: 24 }, (_, i) => {
      const hour = (now + i) % 24;
      const w = WEATHER_TYPES[Math.floor(Math.random() * WEATHER_TYPES.length)];
      const baseTemp = temp + Math.floor(Math.random() * 8) - 4;
      return {
        time: `${hour.toString().padStart(2, "0")}:00`,
        temp: baseTemp,
        weatherCode: w.code,
        weather: w.name,
      };
    });
  };

  const daily = generateDaily();
  const hourly = generateHourly();

  return (
    <div className="fancy-scroll h-full overflow-y-auto">
      <div
        className="relative min-h-[480px]"
        style={{
          background:
            "linear-gradient(180deg, color-mix(in srgb, var(--accent) 15%, transparent) 0%, var(--bg) 60%)",
        }}
      >
        <div
          className="flex items-center gap-2 border-b px-4 py-2.5"
          style={{ borderColor: "var(--card-border)" }}
        >
          <button
            onClick={onBack}
            className="flex h-7 w-7 items-center justify-center rounded-full transition hover:bg-black/5"
            style={{ color: "var(--text-soft)" }}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <div className="flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5" style={{ color: "var(--accent)" }} />
            <span
              className="font-serif text-sm font-bold"
              style={{ color: "var(--text)" }}
            >
              {location}
            </span>
          </div>
        </div>

        <div className="px-4 pb-4 pt-3">
          {/* 当前天气动画 */}
          <div className="flex flex-col items-center">
            <WeatherAnimation weatherCode={currentWeather.code} size={140} />
            <div
              className="mt-1 font-serif text-4xl font-bold"
              style={{ color: "var(--text)" }}
            >
              {temp}°
            </div>
            <div className="text-sm" style={{ color: "var(--text-soft)" }}>
              {currentWeather.name}
            </div>
            <div className="mt-1 text-[11px]" style={{ color: "var(--text-soft)" }}>
              体感 {feelsLike}°
            </div>
          </div>

          {/* 温馨提示 */}
          <div
            className="mt-3 rounded-2xl p-3"
            style={{
              background:
                "linear-gradient(135deg, color-mix(in srgb, var(--accent) 12%, transparent), transparent)",
              border: "1px solid var(--card-border)",
            }}
          >
            <div className="text-[11px]" style={{ color: "var(--text-soft)" }}>
              💡 温馨提示
            </div>
            <div className="mt-1 text-[12px]" style={{ color: "var(--text)" }}>
              {getTips(currentWeather.name)}
            </div>
          </div>

          {/* 24小时预报 */}
          <div
            className="mt-3 rounded-2xl p-3"
            style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}
          >
            <div className="mb-2 text-[11px] font-bold" style={{ color: "var(--text-soft)" }}>
              24小时预报
            </div>
            <div className="fancy-scroll -mx-1 flex gap-3 overflow-x-auto px-1 pb-1">
              {hourly.map((h, i) => (
                <div
                  key={i}
                  className="flex min-w-[44px] flex-col items-center gap-1"
                >
                  <span className="text-[10px]" style={{ color: "var(--text-soft)" }}>
                    {h.time}
                  </span>
                  <div className="h-8 w-8">
                    <WeatherAnimation weatherCode={h.weatherCode} size={32} />
                  </div>
                  <span className="text-[11px] font-medium" style={{ color: "var(--text)" }}>
                    {h.temp}°
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* 7天预报 */}
          <div
            className="mt-3 rounded-2xl p-3"
            style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}
          >
            <div className="mb-2 text-[11px] font-bold" style={{ color: "var(--text-soft)" }}>
              7天预报
            </div>
            <div className="flex flex-col gap-2">
              {daily.map((d, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3"
                  style={{
                    paddingBottom: i < daily.length - 1 ? "8px" : 0,
                    borderBottom:
                      i < daily.length - 1 ? "1px solid var(--card-border)" : "none",
                  }}
                >
                  <span
                    className="w-10 text-[11px] font-medium"
                    style={{ color: "var(--text)" }}
                  >
                    {d.day}
                  </span>
                  <div className="h-7 w-7 shrink-0">
                    <WeatherAnimation weatherCode={d.weatherCode} size={28} />
                  </div>
                  <span className="flex-1 text-[11px]" style={{ color: "var(--text-soft)" }}>
                    {d.weather}
                  </span>
                  <span className="text-[11px]" style={{ color: "var(--text-soft)" }}>
                    {d.tempMin}°
                  </span>
                  <div className="h-1 w-12 rounded-full" style={{ background: "var(--bg-deep)" }}>
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${Math.max(20, ((d.tempMax - d.tempMin) / 20) * 100)}%`,
                        marginLeft: `${((d.tempMin - 0) / 40) * 100}%`,
                        background:
                          "linear-gradient(90deg, #60A5FA, #FBBF24, #F87171)",
                      }}
                    />
                  </div>
                  <span
                    className="w-7 text-right text-[11px] font-medium"
                    style={{ color: "var(--text)" }}
                  >
                    {d.tempMax}°
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* 生活指数 */}
          <div
            className="mt-3 rounded-2xl p-3"
            style={{ background: "var(--card)", border: "1px solid var(--card-border)" }}
          >
            <div className="mb-2 text-[11px] font-bold" style={{ color: "var(--text-soft)" }}>
              生活指数
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-xl p-2.5" style={{ background: "var(--bg-deep)" }}>
                <div className="flex items-center gap-1.5">
                  <Droplets className="h-4 w-4" style={{ color: "#60A5FA" }} />
                  <span className="text-[10px]" style={{ color: "var(--text-soft)" }}>
                    湿度
                  </span>
                </div>
                <div className="mt-1 text-sm font-bold" style={{ color: "var(--text)" }}>
                  {humidity}%
                </div>
              </div>
              <div className="rounded-xl p-2.5" style={{ background: "var(--bg-deep)" }}>
                <div className="flex items-center gap-1.5">
                  <Wind className="h-4 w-4" style={{ color: "#34D399" }} />
                  <span className="text-[10px]" style={{ color: "var(--text-soft)" }}>
                    风速
                  </span>
                </div>
                <div className="mt-1 text-sm font-bold" style={{ color: "var(--text)" }}>
                  {windSpeed} km/h
                </div>
              </div>
              <div className="rounded-xl p-2.5" style={{ background: "var(--bg-deep)" }}>
                <div className="flex items-center gap-1.5">
                  <Compass className="h-4 w-4" style={{ color: "#A78BFA" }} />
                  <span className="text-[10px]" style={{ color: "var(--text-soft)" }}>
                    风向
                  </span>
                </div>
                <div className="mt-1 text-sm font-bold" style={{ color: "var(--text)" }}>
                  {getWindDirection(windDirection)}风
                </div>
              </div>
              <div className="rounded-xl p-2.5" style={{ background: "var(--bg-deep)" }}>
                <div className="flex items-center gap-1.5">
                  <Eye className="h-4 w-4" style={{ color: "#FBBF24" }} />
                  <span className="text-[10px]" style={{ color: "var(--text-soft)" }}>
                    能见度
                  </span>
                </div>
                <div className="mt-1 text-sm font-bold" style={{ color: "var(--text)" }}>
                  {visibility} km
                </div>
              </div>
              <div className="rounded-xl p-2.5" style={{ background: "var(--bg-deep)" }}>
                <div className="flex items-center gap-1.5">
                  <Gauge className="h-4 w-4" style={{ color: "#F472B6" }} />
                  <span className="text-[10px]" style={{ color: "var(--text-soft)" }}>
                    气压
                  </span>
                </div>
                <div className="mt-1 text-sm font-bold" style={{ color: "var(--text)" }}>
                  {pressure} hPa
                </div>
              </div>
              <div className="rounded-xl p-2.5" style={{ background: "var(--bg-deep)" }}>
                <div className="flex items-center gap-1.5">
                  <Sun className="h-4 w-4" style={{ color: "#F59E0B" }} />
                  <span className="text-[10px]" style={{ color: "var(--text-soft)" }}>
                    紫外线
                  </span>
                </div>
                <div className="mt-1 text-sm font-bold" style={{ color: "var(--text)" }}>
                  {uvIndex} 级
                </div>
              </div>
            </div>
          </div>

          {/* 刷新按钮 */}
          <div className="mt-3 flex justify-center">
            <button
              onClick={handleRefresh}
              className="flex items-center gap-1.5 rounded-full px-4 py-2 text-[11px] transition active:scale-95"
              style={{
                background: "var(--card)",
                border: "1px solid var(--card-border)",
                color: "var(--text-soft)",
              }}
            >
              <RefreshCw
                className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`}
              />
              {refreshing ? "切换中..." : "点击切换天气"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}