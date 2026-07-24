import { useEffect, useRef } from "react";

interface WeatherAnimationProps {
  weatherCode: number;
  size?: number;
}

export default function WeatherAnimation({ weatherCode, size = 120 }: WeatherAnimationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = size;
    canvas.height = size;

    const type = getWeatherType(weatherCode);
    let particles: Array<{ x: number; y: number; vx: number; vy: number; size: number; alpha?: number; rot?: number; vr?: number }> = [];
    let clouds: Array<{ x: number; y: number; r: number; speed: number }> = [];
    let sunAngle = 0;
    let flashAlpha = 0;
    let time = 0;

    const initParticles = () => {
      particles = [];
      clouds = [];

      if (["sunny", "partlyCloudy"].includes(type)) {
        sunAngle = 0;
      }

      if (["cloudy", "overcast", "partlyCloudy", "fog", "haze", "dust"].includes(type)) {
        const count = type === "overcast" ? 8 : type === "fog" || type === "haze" ? 6 : 5;
        for (let i = 0; i < count; i++) {
          clouds.push({
            x: Math.random() * size,
            y: size * 0.2 + Math.random() * size * 0.3,
            r: size * (0.12 + Math.random() * 0.1),
            speed: (Math.random() - 0.5) * 0.3,
          });
        }
      }

      if (["drizzle", "lightRain", "moderateRain", "heavyRain", "storm", "thunderstorm", "severeThunder", "showers", "freezingRain"].includes(type)) {
        const count =
          type === "storm" || type === "severeThunder" ? 150 :
          type === "heavyRain" ? 100 :
          type === "moderateRain" || type === "thunderstorm" ? 70 :
          type === "showers" ? 50 :
          type === "drizzle" ? 30 : 40;
        for (let i = 0; i < count; i++) {
          particles.push({
            x: Math.random() * size,
            y: Math.random() * size,
            vx: type === "storm" || type === "severeThunder" ? -1 - Math.random() * 1.5 : -0.3 - Math.random() * 0.5,
            vy: type === "storm" || type === "severeThunder" ? 8 + Math.random() * 6 :
                type === "heavyRain" ? 5 + Math.random() * 4 :
                type === "moderateRain" || type === "thunderstorm" ? 4 + Math.random() * 3 :
                type === "drizzle" ? 2 + Math.random() * 1.5 : 3 + Math.random() * 2,
            size: type === "drizzle" ? 1 : type === "heavyRain" || type === "storm" ? 2.5 : 1.8,
            alpha: type === "drizzle" ? 0.5 : 0.8,
          });
        }
      }

      if (["lightSnow", "moderateSnow", "heavySnow", "blizzard", "snowShowers", "sleet", "snowGrains"].includes(type)) {
        const count =
          type === "blizzard" ? 200 :
          type === "heavySnow" ? 120 :
          type === "moderateSnow" ? 80 :
          type === "snowShowers" ? 60 :
          type === "sleet" ? 50 : 40;
        for (let i = 0; i < count; i++) {
          particles.push({
            x: Math.random() * size,
            y: Math.random() * size,
            vx: type === "blizzard" ? (Math.random() - 0.5) * 4 : (Math.random() - 0.5) * 1,
            vy: type === "blizzard" ? 3 + Math.random() * 3 :
                type === "heavySnow" ? 1.5 + Math.random() * 2 :
                type === "sleet" ? 3 + Math.random() * 2 :
                1 + Math.random() * 1.5,
            size: type === "snowGrains" ? 1.5 : type === "sleet" ? 2 : 2 + Math.random() * 2.5,
            alpha: 0.9,
            rot: Math.random() * Math.PI * 2,
            vr: (Math.random() - 0.5) * 0.05,
          });
        }
      }

      if (["sandstorm", "duststorm"].includes(type)) {
        for (let i = 0; i < 80; i++) {
          particles.push({
            x: Math.random() * size,
            y: Math.random() * size,
            vx: 3 + Math.random() * 4,
            vy: (Math.random() - 0.5) * 1,
            size: 1 + Math.random() * 3,
            alpha: 0.4 + Math.random() * 0.4,
          });
        }
      }

      if (type === "hail" || type === "thunderHail") {
        for (let i = 0; i < 40; i++) {
          particles.push({
            x: Math.random() * size,
            y: Math.random() * size,
            vx: -0.5 - Math.random() * 1,
            vy: 6 + Math.random() * 5,
            size: 3 + Math.random() * 4,
            alpha: 0.9,
          });
        }
      }

      if (type === "typhoon" || type === "tornado") {
        for (let i = 0; i < 100; i++) {
          const angle = Math.random() * Math.PI * 2;
          const radius = Math.random() * size * 0.4 + size * 0.1;
          particles.push({
            x: size / 2 + Math.cos(angle) * radius,
            y: size / 2 + Math.sin(angle) * radius,
            vx: 0,
            vy: 0,
            size: 2 + Math.random() * 3,
            alpha: 0.7,
            rot: angle,
            vr: 0.02 + Math.random() * 0.02,
          });
        }
      }

      if (type === "heatWave") {
        for (let i = 0; i < 20; i++) {
          particles.push({
            x: Math.random() * size,
            y: size * 0.5 + Math.random() * size * 0.4,
            vx: (Math.random() - 0.5) * 0.5,
            vy: -0.5 - Math.random() * 1,
            size: 3 + Math.random() * 5,
            alpha: 0.3 + Math.random() * 0.3,
          });
        }
      }
    };

    const drawSun = (cx: number, cy: number, r: number, color = "#FFD93D") => {
      const gradient = ctx.createRadialGradient(cx, cy, r * 0.3, cx, cy, r * 1.8);
      gradient.addColorStop(0, color);
      gradient.addColorStop(0.5, color + "80");
      gradient.addColorStop(1, "transparent");
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(cx, cy, r * 1.8, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();
    };

    const drawCloud = (cx: number, cy: number, r: number, color = "white") => {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(cx - r * 0.6, cy, r * 0.6, 0, Math.PI * 2);
      ctx.arc(cx, cy - r * 0.3, r * 0.7, 0, Math.PI * 2);
      ctx.arc(cx + r * 0.5, cy, r * 0.55, 0, Math.PI * 2);
      ctx.arc(cx + r * 0.2, cy + r * 0.2, r * 0.5, 0, Math.PI * 2);
      ctx.arc(cx - r * 0.3, cy + r * 0.15, r * 0.45, 0, Math.PI * 2);
      ctx.fill();
    };

    const drawSnowflake = (x: number, y: number, size: number, rot: number) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rot);
      ctx.strokeStyle = "white";
      ctx.lineWidth = 1;
      ctx.lineCap = "round";
      for (let i = 0; i < 6; i++) {
        ctx.rotate(Math.PI / 3);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, size);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, size * 0.5);
        ctx.lineTo(size * 0.3, size * 0.7);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, size * 0.5);
        ctx.lineTo(-size * 0.3, size * 0.7);
        ctx.stroke();
      }
      ctx.restore();
    };

    const drawLightning = () => {
      if (flashAlpha <= 0) return;
      ctx.fillStyle = `rgba(255, 255, 200, ${flashAlpha * 0.3})`;
      ctx.fillRect(0, 0, size, size);

      ctx.strokeStyle = `rgba(255, 255, 150, ${flashAlpha})`;
      ctx.lineWidth = 2;
      ctx.lineCap = "round";
      ctx.beginPath();
      let x = size * 0.5 + Math.sin(time * 0.01) * 10;
      let y = size * 0.1;
      ctx.moveTo(x, y);
      while (y < size * 0.75) {
        x += (Math.random() - 0.5) * 20;
        y += 15 + Math.random() * 20;
        ctx.lineTo(x, y);
      }
      ctx.stroke();

      ctx.strokeStyle = `rgba(255, 255, 255, ${flashAlpha * 0.8})`;
      ctx.lineWidth = 1;
      ctx.stroke();
    };

    const drawBackground = () => {
      const gradient = ctx.createLinearGradient(0, 0, 0, size);
      switch (type) {
        case "sunny":
          gradient.addColorStop(0, "#87CEEB");
          gradient.addColorStop(1, "#E0F6FF");
          break;
        case "partlyCloudy":
          gradient.addColorStop(0, "#7EC8E3");
          gradient.addColorStop(1, "#D4F0F9");
          break;
        case "cloudy":
          gradient.addColorStop(0, "#9CA3AF");
          gradient.addColorStop(1, "#D1D5DB");
          break;
        case "overcast":
          gradient.addColorStop(0, "#6B7280");
          gradient.addColorStop(1, "#9CA3AF");
          break;
        case "drizzle":
        case "lightRain":
        case "showers":
          gradient.addColorStop(0, "#7C8798");
          gradient.addColorStop(1, "#A8B5C4");
          break;
        case "moderateRain":
        case "freezingRain":
          gradient.addColorStop(0, "#64748B");
          gradient.addColorStop(1, "#94A3B8");
          break;
        case "heavyRain":
        case "storm":
        case "thunderstorm":
        case "severeThunder":
        case "thunderHail":
          gradient.addColorStop(0, "#475569");
          gradient.addColorStop(1, "#64748B");
          break;
        case "lightSnow":
        case "snowShowers":
        case "snowGrains":
          gradient.addColorStop(0, "#B8C5D6");
          gradient.addColorStop(1, "#E2E8F0");
          break;
        case "moderateSnow":
        case "sleet":
          gradient.addColorStop(0, "#94A3B8");
          gradient.addColorStop(1, "#CBD5E1");
          break;
        case "heavySnow":
        case "blizzard":
          gradient.addColorStop(0, "#64748B");
          gradient.addColorStop(1, "#94A3B8");
          break;
        case "fog":
        case "rime":
          gradient.addColorStop(0, "#A0AEC0");
          gradient.addColorStop(1, "#CBD5E0");
          break;
        case "haze":
        case "dust":
          gradient.addColorStop(0, "#C4A77D");
          gradient.addColorStop(1, "#E8D5B7");
          break;
        case "sandstorm":
        case "duststorm":
          gradient.addColorStop(0, "#8B6914");
          gradient.addColorStop(1, "#C9A227");
          break;
        case "heatWave":
          gradient.addColorStop(0, "#FF6B35");
          gradient.addColorStop(1, "#FFD93D");
          break;
        case "coldWave":
          gradient.addColorStop(0, "#4A90A4");
          gradient.addColorStop(1, "#A8D5E5");
          break;
        case "typhoon":
        case "tornado":
          gradient.addColorStop(0, "#374151");
          gradient.addColorStop(1, "#6B7280");
          break;
        case "hail":
          gradient.addColorStop(0, "#4B5563");
          gradient.addColorStop(1, "#6B7280");
          break;
        default:
          gradient.addColorStop(0, "#87CEEB");
          gradient.addColorStop(1, "#E0F6FF");
      }
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, size, size);
    };

    const animate = () => {
      time++;
      drawBackground();

      if (type === "sunny") {
        sunAngle += 0.005;
        const pulse = Math.sin(sunAngle * 2) * 0.05 + 1;
        drawSun(size * 0.5, size * 0.45, size * 0.22 * pulse, "#FFD93D");

        const rays = 12;
        ctx.strokeStyle = "#FFD93D60";
        ctx.lineWidth = 2;
        ctx.lineCap = "round";
        for (let i = 0; i < rays; i++) {
          const angle = (i / rays) * Math.PI * 2 + sunAngle;
          const innerR = size * 0.28;
          const outerR = size * 0.35 + Math.sin(sunAngle * 3 + i) * 5;
          ctx.beginPath();
          ctx.moveTo(
            size * 0.5 + Math.cos(angle) * innerR,
            size * 0.45 + Math.sin(angle) * innerR
          );
          ctx.lineTo(
            size * 0.5 + Math.cos(angle) * outerR,
            size * 0.45 + Math.sin(angle) * outerR
          );
          ctx.stroke();
        }
      }

      if (type === "partlyCloudy") {
        sunAngle += 0.005;
        drawSun(size * 0.3, size * 0.3, size * 0.18, "#FFD93D");
      }

      if (["cloudy", "overcast", "partlyCloudy"].includes(type)) {
        const cloudColor = type === "overcast" ? "#9CA3AF" : type === "cloudy" ? "#E5E7EB" : "#F3F4F6";
        clouds.forEach((c) => {
          c.x += c.speed;
          if (c.x > size + c.r) c.x = -c.r;
          if (c.x < -c.r) c.x = size + c.r;
          drawCloud(c.x, c.y, c.r, cloudColor);
        });
      }

      if (type === "fog" || type === "rime" || type === "haze") {
        ctx.fillStyle = type === "haze" ? "rgba(200, 180, 140, 0.4)" : "rgba(200, 200, 210, 0.5)";
        for (let i = 0; i < 5; i++) {
          const y = size * 0.2 + i * size * 0.15 + Math.sin(time * 0.01 + i) * 5;
          ctx.beginPath();
          ctx.ellipse(size / 2 + Math.sin(time * 0.005 + i) * 10, y, size * 0.6, size * 0.08, 0, 0, Math.PI * 2);
          ctx.fill();
        }
        if (type === "rime") {
          ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
          for (let i = 0; i < 30; i++) {
            const x = Math.sin(i * 1.5 + time * 0.002) * size * 0.45 + size * 0.5;
            const y = size * 0.1 + (i / 30) * size * 0.8;
            ctx.beginPath();
            ctx.arc(x, y, 1.5, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }

      if (["drizzle", "lightRain", "moderateRain", "heavyRain", "storm", "thunderstorm", "severeThunder", "showers", "freezingRain"].includes(type)) {
        particles.forEach((p) => {
          p.x += p.vx;
          p.y += p.vy;
          if (p.y > size) {
            p.y = -10;
            p.x = Math.random() * size;
          }
          if (p.x < -10) p.x = size + 10;

          ctx.strokeStyle = type === "freezingRain"
            ? `rgba(180, 220, 255, ${p.alpha})`
            : `rgba(150, 180, 220, ${p.alpha})`;
          ctx.lineWidth = p.size * 0.6;
          ctx.lineCap = "round";
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x + p.vx * 0.5, p.y + p.vy * 0.4);
          ctx.stroke();

          if (type === "freezingRain") {
            ctx.fillStyle = `rgba(200, 230, 255, ${p.alpha})`;
            ctx.beginPath();
            ctx.arc(p.x, p.y + p.vy * 0.4, p.size * 0.8, 0, Math.PI * 2);
            ctx.fill();
          }
        });
      }

      if (["thunderstorm", "severeThunder", "thunderHail"].includes(type)) {
        if (Math.random() < 0.01 && flashAlpha <= 0) {
          flashAlpha = 1;
        }
        if (flashAlpha > 0) {
          drawLightning();
          flashAlpha -= 0.03;
        }
      }

      if (["lightSnow", "moderateSnow", "heavySnow", "blizzard", "snowShowers", "sleet", "snowGrains"].includes(type)) {
        particles.forEach((p) => {
          p.x += p.vx;
          p.y += p.vy;
          if (p.rot !== undefined && p.vr !== undefined) p.rot += p.vr;
          if (p.y > size + 10) {
            p.y = -10;
            p.x = Math.random() * size;
          }
          if (p.x > size + 10) p.x = -10;
          if (p.x < -10) p.x = size + 10;

          if (type === "snowGrains" || type === "sleet") {
            ctx.fillStyle = type === "sleet" ? "rgba(200, 220, 255, 0.9)" : "rgba(255, 255, 255, 0.9)";
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size * 0.5, 0, Math.PI * 2);
            ctx.fill();
          } else {
            drawSnowflake(p.x, p.y, p.size, p.rot || 0);
          }
        });
      }

      if (["sandstorm", "duststorm", "dust"].includes(type)) {
        particles.forEach((p) => {
          p.x += p.vx;
          p.y += p.vy + Math.sin(time * 0.05 + p.x * 0.1) * 0.5;
          if (p.x > size + 10) {
            p.x = -10;
            p.y = Math.random() * size;
          }
          ctx.fillStyle = type === "duststorm" || type === "sandstorm"
            ? `rgba(180, 140, 60, ${p.alpha})`
            : `rgba(200, 180, 140, ${p.alpha})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        });
      }

      if (type === "hail" || type === "thunderHail") {
        particles.forEach((p) => {
          p.x += p.vx;
          p.y += p.vy;
          if (p.y > size) {
            p.y = -10;
            p.x = Math.random() * size;
          }
          if (p.x < -10) p.x = size + 10;

          const grad = ctx.createRadialGradient(
            p.x - p.size * 0.3, p.y - p.size * 0.3, 0,
            p.x, p.y, p.size
          );
          grad.addColorStop(0, "white");
          grad.addColorStop(0.5, "#E0E8F0");
          grad.addColorStop(1, "#B0C4D8");
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        });

        if (type === "thunderHail") {
          if (Math.random() < 0.008 && flashAlpha <= 0) flashAlpha = 1;
          if (flashAlpha > 0) {
            drawLightning();
            flashAlpha -= 0.03;
          }
        }
      }

      if (type === "typhoon" || type === "tornado") {
        const cx = size / 2;
        const cy = size / 2;
        particles.forEach((p, i) => {
          if (p.rot !== undefined && p.vr !== undefined) {
            p.rot += p.vr;
            const radius = 20 + (i / particles.length) * size * 0.35 + Math.sin(time * 0.02 + i) * 5;
            p.x = cx + Math.cos(p.rot) * radius;
            p.y = cy + Math.sin(p.rot) * radius * (type === "tornado" ? 1.5 : 1);
          }
          ctx.fillStyle = type === "tornado"
            ? `rgba(120, 120, 130, ${p.alpha})`
            : `rgba(100, 150, 200, ${p.alpha})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        });

        if (type === "typhoon") {
          const eyeGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, size * 0.12);
          eyeGrad.addColorStop(0, "rgba(200, 220, 255, 0.8)");
          eyeGrad.addColorStop(1, "transparent");
          ctx.fillStyle = eyeGrad;
          ctx.beginPath();
          ctx.arc(cx, cy, size * 0.12, 0, Math.PI * 2);
          ctx.fill();
        } else {
          ctx.strokeStyle = "rgba(100, 100, 110, 0.6)";
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(cx, size * 0.1);
          for (let y = size * 0.1; y < size * 0.9; y += 10) {
            const wiggle = Math.sin(y * 0.05 + time * 0.05) * 20;
            ctx.lineTo(cx + wiggle, y);
          }
          ctx.stroke();
        }
      }

      if (type === "heatWave") {
        drawSun(size * 0.5, size * 0.3, size * 0.2, "#FF6B35");
        particles.forEach((p) => {
          p.y += p.vy;
          p.x += p.vx + Math.sin(time * 0.03 + p.y * 0.1) * 0.3;
          p.size += 0.02;
          p.alpha = (p.alpha || 0.3) - 0.003;
          if (p.y < size * 0.3 || (p.alpha || 0) <= 0) {
            p.y = size * 0.8 + Math.random() * size * 0.15;
            p.x = Math.random() * size;
            p.size = 3 + Math.random() * 5;
            p.alpha = 0.3 + Math.random() * 0.3;
          }
          ctx.fillStyle = `rgba(255, 180, 80, ${p.alpha})`;
          ctx.beginPath();
          ctx.ellipse(p.x, p.y, p.size, p.size * 1.5, 0, 0, Math.PI * 2);
          ctx.fill();
        });
      }

      if (type === "coldWave") {
        for (let i = 0; i < 6; i++) {
          const y = size * 0.1 + i * size * 0.15 + Math.sin(time * 0.01 + i * 0.5) * 8;
          const grad = ctx.createLinearGradient(0, y - size * 0.05, 0, y + size * 0.05);
          grad.addColorStop(0, "transparent");
          grad.addColorStop(0.5, "rgba(150, 200, 255, 0.3)");
          grad.addColorStop(1, "transparent");
          ctx.fillStyle = grad;
          ctx.fillRect(0, y - size * 0.05, size, size * 0.1);
        }
        for (let i = 0; i < 15; i++) {
          const x = (i / 15) * size + Math.sin(time * 0.02 + i) * 5;
          const y = size * 0.2 + ((i * 7) % 10) / 10 * size * 0.6;
          drawSnowflake(x, y, 4 + (i % 3) * 2, time * 0.01 + i);
        }
      }

      animRef.current = requestAnimationFrame(animate);
    };

    initParticles();
    animate();

    return () => {
      cancelAnimationFrame(animRef.current);
    };
  }, [weatherCode, size]);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: size, height: size, borderRadius: "16px" }}
    />
  );
}

function getWeatherType(code: number): string {
  if (code === 0) return "sunny";
  if (code === 1) return "partlyCloudy";
  if (code === 2) return "cloudy";
  if (code === 3) return "overcast";
  if (code === 45) return "fog";
  if (code === 48) return "rime";
  if (code === 51) return "drizzle";
  if (code === 53) return "lightRain";
  if (code === 55) return "moderateRain";
  if (code === 56 || code === 57) return "freezingRain";
  if (code === 61) return "lightRain";
  if (code === 63) return "moderateRain";
  if (code === 65) return "heavyRain";
  if (code === 66 || code === 67) return "freezingRain";
  if (code === 71) return "lightSnow";
  if (code === 73) return "moderateSnow";
  if (code === 75) return "heavySnow";
  if (code === 77) return "snowGrains";
  if (code === 80) return "showers";
  if (code === 81) return "thunderstorm";
  if (code === 82) return "storm";
  if (code === 85 || code === 86) return "snowShowers";
  if (code === 95) return "thunderstorm";
  if (code === 96) return "thunderHail";
  if (code === 99) return "severeThunder";
  return "sunny";
}

export const WEATHER_TYPES = [
  { code: 0, name: "晴天", type: "sunny" },
  { code: 1, name: "晴转多云", type: "partlyCloudy" },
  { code: 2, name: "多云", type: "cloudy" },
  { code: 3, name: "阴天", type: "overcast" },
  { code: 45, name: "雾", type: "fog" },
  { code: 48, name: "雾凇", type: "rime" },
  { code: 51, name: "毛毛雨", type: "drizzle" },
  { code: 53, name: "小雨", type: "lightRain" },
  { code: 55, name: "中雨", type: "moderateRain" },
  { code: 61, name: "小雨", type: "lightRain" },
  { code: 63, name: "中雨", type: "moderateRain" },
  { code: 65, name: "大雨", type: "heavyRain" },
  { code: 56, name: "冻雨", type: "freezingRain" },
  { code: 71, name: "小雪", type: "lightSnow" },
  { code: 73, name: "中雪", type: "moderateSnow" },
  { code: 75, name: "大雪", type: "heavySnow" },
  { code: 77, name: "雪粒", type: "snowGrains" },
  { code: 80, name: "阵雨", type: "showers" },
  { code: 81, name: "雷阵雨", type: "thunderstorm" },
  { code: 82, name: "暴雨", type: "storm" },
  { code: 85, name: "阵雪", type: "snowShowers" },
  { code: 95, name: "雷阵雨", type: "thunderstorm" },
  { code: 96, name: "雷雨冰雹", type: "thunderHail" },
  { code: 99, name: "强雷雨", type: "severeThunder" },
  { code: -1, name: "雾霾", type: "haze" },
  { code: -2, name: "浮尘", type: "dust" },
  { code: -3, name: "沙尘暴", type: "sandstorm" },
  { code: -4, name: "冰雹", type: "hail" },
  { code: -5, name: "高温", type: "heatWave" },
  { code: -6, name: "寒潮", type: "coldWave" },
  { code: -7, name: "台风", type: "typhoon" },
  { code: -8, name: "龙卷风", type: "tornado" },
  { code: -9, name: "暴雪", type: "blizzard" },
  { code: -10, name: "雨夹雪", type: "sleet" },
];
