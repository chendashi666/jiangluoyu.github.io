import { useEffect, useRef, useState, useCallback } from "react";
import { AppHeader } from "./HomeScreen";
import { useAppStore } from "@/store/app";
import { DEFAULT_PET_CONFIG, type BallPetConfig } from "@/types/pet";

const COLOR_THEMES = [
  { name: "草莓牛奶", top: "#FFB7C5", bottom: "#FFF0F3" },
  { name: "蜜桃乌龙", top: "#FF9F7A", bottom: "#FFE5D9" },
  { name: "抹茶拿铁", top: "#A8D8B9", bottom: "#E8F5EC" },
  { name: "蓝莓冰沙", top: "#A0C4FF", bottom: "#E0ECFF" },
  { name: "薰衣草", top: "#C9B6E4", bottom: "#F0E8FA" },
  { name: "芝士蛋糕", top: "#FFE08A", bottom: "#FFF4D0" },
  { name: "薄荷巧克力", top: "#7AC4B3", bottom: "#C8A582" },
  { name: "橘子汽水", top: "#FFB347", bottom: "#FFDCA8" },
];

const COLOR_PALETTE = [
  "#FFFFFF","#FFF5EE","#FFE4D6","#FFD4C4","#FFB7C5","#FF9EB3","#FF7A9C","#E85A7E",
  "#FFE0C0","#FFD0A0","#FFB080","#FF9060","#FF7040","#E85020","#C03808","#8A2000",
  "#FFEFA0","#FFE060","#FFC830","#FFA000","#FF8000","#E06000","#B04000","#702000",
  "#E8F5EC","#A8D8B9","#7AC4A3","#4DA880","#2D8C5C","#156B40","#084828","#022A14",
  "#E0ECFF","#A0C4FF","#60A8FF","#3080FF","#0058E0","#0038B0","#001F80","#000A40",
  "#F0E8FA","#C9B6E4","#A28BD0","#7A60C0","#5840A0","#382080","#1C0860","#000240",
  "#000000","#2D2030","#5D4060","#7A5C6B","#A08090","#C0A0B0","#D8C0CC","#E8D8E0",
];

const EMOJI_FACES = ["","😀","😁","😂","🤣","😃","😄","😅","😆","😉","😊","😋","😎","😍","😘","🥰","😗","😙","😚","🙂","🤗","🤩","🤔","🤨","😐","😑","😶","😏","😒","🙄","😬","😯","😦","😧","😮","😲","🥱","😴","😪","🤤","😵","🤯","🥳","🤓","🧐","😢","😭","😠","😡","🤬","😤","😰","😥","😓","🤒","🤕","🤢","🤮","🤧","😷","🥵","🥶","💤","💖"];

const KAOMOJI = ["◕‿◕","●´ω｀●","≧▽≦","｡♥‿♥｡","◕ᴗ◕✿","✿◡‿◡","⊙_⊙","´･ω･`","◠‿◠","◍•ᴗ•◍","✯◡✯","❛‿❛","✧ω✧","●´∀`●","•ᴥ•","=^･ω･^=","♡´･ᴗ･`♡","o^▽^o","˘ᵕ˘","^ω^","◉ω◉","≧◡≦","•̀.̫•́✧","⺣◡⺣","ฅ^•ﻌ•^ฅ","ʚɞ","꒰◍ᐡᐤᐡ◍꒱","´◡`","˘ω˘","˙꒳˙","˃ᗜ˂","◡‿◡","´-ω-`","・ε・`","｡>﹏<｡","¬‿¬","╥﹏╥","｡•̀ᴗ-)✧","￣ω￣","・_・"];

const HEADWEAR_LIST = [
  { id: "none", name: "无" },{ id: "catEars", name: "猫耳" },{ id: "bunnyEars", name: "兔耳" },
  { id: "dogEars", name: "狗耳" },{ id: "bearEars", name: "熊耳" },{ id: "foxEars", name: "狐狸耳" },
  { id: "deerEars", name: "鹿耳" },{ id: "pandaEars", name: "熊猫耳" },
  { id: "bow", name: "蝴蝶结" },{ id: "crown", name: "皇冠" },{ id: "flower", name: "头花" },
  { id: "antenna", name: "触角" },{ id: "devil", name: "恶魔角" },{ id: "halo", name: "光环" },
  { id: "ribbon", name: "丝带" },{ id: "starPin", name: "星星夹" },{ id: "heartPin", name: "爱心夹" },
  { id: "witchHat", name: "巫师帽" },{ id: "partyHat", name: "派对帽" },{ id: "beret", name: "贝雷帽" },{ id: "topknot", name: "丸子头" },
];

const ACCESSORY_LIST = [
  { id: "none", name: "无" },{ id: "stars", name: "小星星" },{ id: "hearts", name: "小爱心" },
  { id: "bubbles", name: "泡泡" },{ id: "sparkles", name: "闪光" },{ id: "petals", name: "花瓣" },
  { id: "notes", name: "音符" },{ id: "rainbow", name: "彩虹" },
];

const EYE_CHARS: Record<string, string> = {
  "◕": "‿","◑": "‿","◐": "‿","●": "‿","◉": "‿","⊙": "－","◔": "－","◠": "－",
  "•": "·","･": "·","・": "·","❛": "‿","ˋ": "ˊ","ω": "◡","ᴗ": "◡","◡": "‿",
  "＠": "－","Ｏ": "－","☉": "－","◍": "◡",
};

function hexToRgba(hex: string, alpha: number) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

function shadeColor(hex: string, percent: number) {
  const r = Math.max(0, Math.min(255, parseInt(hex.slice(1, 3), 16) + percent * 2.55));
  const g = Math.max(0, Math.min(255, parseInt(hex.slice(3, 5), 16) + percent * 2.55));
  const b = Math.max(0, Math.min(255, parseInt(hex.slice(5, 7), 16) + percent * 2.55));
  return `#${Math.round(r).toString(16).padStart(2,"0")}${Math.round(g).toString(16).padStart(2,"0")}${Math.round(b).toString(16).padStart(2,"0")}`;
}

function blinkText(text: string) {
  let r = text;
  for (const [e, c] of Object.entries(EYE_CHARS)) r = r.split(e).join(c);
  return r;
}

// ============ 单个宠物的 Canvas 渲染（用于展示模式） ============

export function PetCanvas({ config, size = 120, patSignal }: { config: BallPetConfig; size?: number; patSignal?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const timeRef = useRef(0);
  const blinkRef = useRef({ timer: 0, isBlinking: false });
  const patRef = useRef({ t0: -10, hearts: [] as { x: number; y: number; vy: number; life: number }[] });
  const lastPatRef = useRef(patSignal ?? 0);

  // 摸摸触发：squash 动画 + 飞心
  useEffect(() => {
    if (patSignal === undefined) return;
    if (patSignal === lastPatRef.current) return;
    lastPatRef.current = patSignal;
    patRef.current.t0 = timeRef.current;
    const hearts = patRef.current.hearts;
    for (let i = 0; i < 5; i++) {
      hearts.push({
        x: size / 2 + (Math.random() - 0.5) * size * 0.4,
        y: size * 0.42,
        vy: -size * 0.02 - Math.random() * size * 0.015,
        life: 1,
      });
    }
  }, [patSignal, size]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    let raf = 0;
    const draw = () => {
      timeRef.current += 0.016;
      const t = timeRef.current;
      if (config.blink) {
        blinkRef.current.timer += 0.016;
        if (!blinkRef.current.isBlinking && blinkRef.current.timer > 2.5 + Math.random() * 2.5) {
          blinkRef.current.isBlinking = true;
          blinkRef.current.timer = 0;
          setTimeout(() => { blinkRef.current.isBlinking = false; }, 150);
        }
      }
      // 摸摸 squash 强度（0~1，0.6s 衰减）
      const patDt = t - patRef.current.t0;
      const patAmt = patDt < 0.6 ? Math.sin((patDt / 0.6) * Math.PI) : 0;

      ctx.clearRect(0, 0, size, size);
      drawPet(ctx, config, size, t, blinkRef.current.isBlinking, patAmt);

      // 飞心
      const hearts = patRef.current.hearts;
      for (let i = hearts.length - 1; i >= 0; i--) {
        const h = hearts[i];
        h.y += h.vy;
        h.life -= 0.016;
        if (h.life <= 0) { hearts.splice(i, 1); continue; }
        ctx.save();
        ctx.globalAlpha = Math.max(0, h.life);
        ctx.font = `${size * 0.1}px serif`;
        ctx.textAlign = "center";
        ctx.fillText("💕", h.x, h.y);
        ctx.restore();
      }
      raf = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(raf);
  }, [config, size]);

  return <canvas ref={canvasRef} />;
}

// 通用绘制函数（DIY和展示都用它）
export function drawPet(ctx: CanvasRenderingContext2D, c: BallPetConfig, size: number, t: number, isBlinking: boolean, patAmt = 0) {
  const W = size, H = size;
  const cx = W / 2;
  const cy = H / 2 + size * 0.04;

  const breathe = c.breathe ? Math.sin(t * 1.8) * 0.025 : 0;
  const wobble = c.wobble ? Math.sin(t * 1.2) * 4 : 0;
  const bounceY = c.bounce ? -Math.abs(Math.sin(t * 3)) * 14 : 0;

  const baseRX = size * 0.3;
  // 摸摸 squash：被压扁变宽
  const patSquash = patAmt * 0.18;
  const rx = baseRX * (1 + breathe + patSquash);
  const ry = baseRX * (c.flatness / 100) * (1 + breathe - patSquash);

  // 阴影
  ctx.save();
  const shAlpha = bounceY < 0 ? 0.12 + Math.abs(bounceY) * 0.003 : 0.18;
  const shGrad = ctx.createRadialGradient(cx + wobble, cy + ry + 12, 0, cx + wobble, cy + ry + 12, rx * 0.85);
  shGrad.addColorStop(0, `rgba(0,0,0,${shAlpha})`);
  shGrad.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = shGrad;
  ctx.beginPath();
  ctx.ellipse(cx + wobble, cy + ry + 12 + bounceY * 0.3, rx * 0.85, rx * 0.21, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // 球体
  const mid = c.gradientMid / 100;
  const hw = c.gradientWidth / 200;
  const grad = ctx.createLinearGradient(0, cy - ry + bounceY, 0, cy + ry + bounceY);
  grad.addColorStop(0, c.topColor);
  grad.addColorStop(Math.max(0, mid - hw), c.topColor);
  grad.addColorStop(Math.min(1, mid + hw), c.bottomColor);
  grad.addColorStop(1, c.bottomColor);
  ctx.beginPath();
  ctx.ellipse(cx + wobble, cy + bounceY, rx, ry, 0, 0, Math.PI * 2);
  ctx.fillStyle = grad;
  ctx.fill();

  // 高光
  if (c.highlight > 0) {
    const hl = c.highlight / 100;
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(cx + wobble, cy + bounceY, rx, ry, 0, 0, Math.PI * 2);
    ctx.clip();
    const hg = ctx.createRadialGradient(cx - rx * 0.35 + wobble, cy - ry * 0.45 + bounceY, 0, cx - rx * 0.35 + wobble, cy - ry * 0.45 + bounceY, rx * 1.1);
    hg.addColorStop(0, `rgba(255,255,255,${0.7 * hl})`);
    hg.addColorStop(0.3, `rgba(255,255,255,${0.28 * hl})`);
    hg.addColorStop(0.6, "rgba(255,255,255,0)");
    ctx.fillStyle = hg;
    ctx.fillRect(cx - rx + wobble, cy - ry + bounceY, rx * 2, ry * 2);
    const sg = ctx.createRadialGradient(cx + rx * 0.25 + wobble, cy + ry * 0.65 + bounceY, 0, cx + rx * 0.25 + wobble, cy + ry * 0.65 + bounceY, rx * 1.2);
    sg.addColorStop(0, `rgba(0,0,0,${0.18 * hl})`);
    sg.addColorStop(0.6, "rgba(0,0,0,0)");
    ctx.fillStyle = sg;
    ctx.fillRect(cx - rx + wobble, cy - ry + bounceY, rx * 2, ry * 2);
    ctx.restore();
  }

  // 描边
  ctx.beginPath();
  ctx.ellipse(cx + wobble, cy + bounceY, rx, ry, 0, 0, Math.PI * 2);
  ctx.strokeStyle = "rgba(0,0,0,0.1)";
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // 腮红
  if (c.blushOpacity > 0) {
    const alpha = c.blushOpacity / 100;
    const bs = (c.blushSize / 100) * rx * 0.22;
    ["left", "right"].forEach(side => {
      const x = cx + wobble + (side === "left" ? -rx * 0.5 : rx * 0.5);
      const y = cy + bounceY + ry * 0.35;
      const bg = ctx.createRadialGradient(x, y, 0, x, y, bs);
      bg.addColorStop(0, hexToRgba(c.blushColor, alpha * 0.75));
      bg.addColorStop(0.6, hexToRgba(c.blushColor, alpha * 0.3));
      bg.addColorStop(1, hexToRgba(c.blushColor, 0));
      ctx.fillStyle = bg;
      ctx.beginPath();
      ctx.ellipse(x, y, bs, bs * 0.65, 0, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  // 颜文字
  let text = c.kaomoji;
  if (isBlinking && c.blink) text = blinkText(text);
  ctx.save();
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const fsize = (size * 0.085) * (c.faceSize / 100);
  ctx.font = `700 ${fsize}px "PingFang SC","Microsoft YaHei",sans-serif`;
  ctx.fillStyle = "#3D2B3D";
  ctx.fillText(text, cx + wobble, cy + bounceY + 4);
  ctx.restore();

  // 头饰
  drawHeadwear(ctx, cx + wobble, cy + bounceY - ry, rx, c, t);

  // 身边飘浮
  drawAccessory(ctx, cx + wobble, cy + bounceY, rx, ry, c, t);

  // emoji（右侧）
  if (c.emoji) {
    ctx.save();
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    const bob = Math.sin(t * 2.5) * 3;
    ctx.font = `${size * 0.11}px serif`;
    ctx.fillText(c.emoji, cx + wobble + rx * 1.12, cy + bounceY - ry * 0.8 + bob);
    ctx.restore();
  }
}

// === 头饰 ===
function drawHeadwear(ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number, c: BallPetConfig, t: number) {
  if (c.headwear === "none") return;
  const color = c.headwearColor;
  ctx.save();
  switch (c.headwear) {
    case "catEars": {
      const eW = size * 0.26, eH = size * 0.38;
      [{ x: cx - size * 0.48, rot: -0.28 }, { x: cx + size * 0.48, rot: 0.28 }].forEach(p => {
        ctx.save();
        ctx.translate(p.x, cy + eH * 0.1);
        ctx.rotate(p.rot);
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(-eW, eH * 0.4);
        ctx.quadraticCurveTo(0, -eH, eW, eH * 0.4);
        ctx.quadraticCurveTo(0, eH * 0.2, -eW, eH * 0.4);
        ctx.fill();
        ctx.strokeStyle = "rgba(0,0,0,0.15)";
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.fillStyle = hexToRgba("#FFB7C5", 0.7);
        ctx.beginPath();
        ctx.moveTo(-eW * 0.5, eH * 0.3);
        ctx.quadraticCurveTo(0, -eH * 0.55, eW * 0.5, eH * 0.3);
        ctx.quadraticCurveTo(0, eH * 0.05, -eW * 0.5, eH * 0.3);
        ctx.fill();
        ctx.restore();
      });
      break;
    }
    case "bunnyEars": {
      const eW = size * 0.16, eH = size * 0.7;
      [{ x: cx - size * 0.32, rot: -0.12 }, { x: cx + size * 0.32, rot: 0.12 }].forEach(p => {
        ctx.save();
        ctx.translate(p.x, cy - eH * 0.5);
        ctx.rotate(p.rot + Math.sin(t * 2) * 0.03);
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.ellipse(0, 0, eW, eH * 0.5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "rgba(0,0,0,0.15)";
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.fillStyle = hexToRgba("#FFB7C5", 0.6);
        ctx.beginPath();
        ctx.ellipse(0, 0, eW * 0.55, eH * 0.4, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });
      break;
    }
    case "dogEars": {
      const eW = size * 0.22, eH = size * 0.5;
      [{ x: cx - size * 0.42, rot: -0.2 }, { x: cx + size * 0.42, rot: 0.2 }].forEach(p => {
        ctx.save();
        ctx.translate(p.x, cy + eH * 0.15);
        ctx.rotate(p.rot);
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(-eW, eH * 0.3);
        ctx.quadraticCurveTo(-eW * 0.8, -eH * 0.7, 0, -eH);
        ctx.quadraticCurveTo(eW * 0.8, -eH * 0.7, eW, eH * 0.3);
        ctx.quadraticCurveTo(0, eH * 0.15, -eW, eH * 0.3);
        ctx.fill();
        ctx.strokeStyle = "rgba(0,0,0,0.15)";
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.fillStyle = hexToRgba("#FFB7C5", 0.5);
        ctx.beginPath();
        ctx.moveTo(-eW * 0.4, eH * 0.2);
        ctx.quadraticCurveTo(-eW * 0.3, -eH * 0.4, 0, -eH * 0.65);
        ctx.quadraticCurveTo(eW * 0.3, -eH * 0.4, eW * 0.4, eH * 0.2);
        ctx.quadraticCurveTo(0, eH * 0.08, -eW * 0.4, eH * 0.2);
        ctx.fill();
        ctx.restore();
      });
      break;
    }
    case "bearEars": {
      const r = size * 0.22;
      [{ x: cx - size * 0.42, y: cy - size * 0.1 }, { x: cx + size * 0.42, y: cy - size * 0.1 }].forEach(p => {
        ctx.save();
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "rgba(0,0,0,0.15)";
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.fillStyle = shadeColor(color, -15);
        ctx.beginPath();
        ctx.arc(p.x, p.y + r * 0.1, r * 0.55, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });
      break;
    }
    case "foxEars": {
      const eW = size * 0.24, eH = size * 0.55;
      [{ x: cx - size * 0.45, rot: -0.15 }, { x: cx + size * 0.45, rot: 0.15 }].forEach(p => {
        ctx.save();
        ctx.translate(p.x, cy + eH * 0.1);
        ctx.rotate(p.rot);
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(-eW, eH * 0.35);
        ctx.lineTo(0, -eH);
        ctx.lineTo(eW, eH * 0.35);
        ctx.quadraticCurveTo(0, eH * 0.15, -eW, eH * 0.35);
        ctx.fill();
        ctx.strokeStyle = "rgba(0,0,0,0.15)";
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.fillStyle = "#FFF0F3";
        ctx.beginPath();
        ctx.moveTo(-eW * 0.35, eH * 0.25);
        ctx.lineTo(0, -eH * 0.6);
        ctx.lineTo(eW * 0.35, eH * 0.25);
        ctx.quadraticCurveTo(0, eH * 0.08, -eW * 0.35, eH * 0.25);
        ctx.fill();
        ctx.restore();
      });
      break;
    }
    case "deerEars": {
      const eW = size * 0.18, eH = size * 0.45;
      [{ x: cx - size * 0.4, rot: -0.25 }, { x: cx + size * 0.4, rot: 0.25 }].forEach(p => {
        ctx.save();
        ctx.translate(p.x, cy + eH * 0.05);
        ctx.rotate(p.rot);
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.ellipse(0, -eH * 0.1, eW, eH * 0.5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "rgba(0,0,0,0.15)";
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.fillStyle = hexToRgba("#FFB7C5", 0.5);
        ctx.beginPath();
        ctx.ellipse(0, -eH * 0.1, eW * 0.55, eH * 0.38, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });
      break;
    }
    case "pandaEars": {
      const r = size * 0.2;
      [{ x: cx - size * 0.42, y: cy - size * 0.08 }, { x: cx + size * 0.42, y: cy - size * 0.08 }].forEach(p => {
        ctx.save();
        ctx.fillStyle = "#2D2030";
        ctx.beginPath();
        ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "rgba(0,0,0,0.2)";
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.fillStyle = shadeColor("#2D2030", 20);
        ctx.beginPath();
        ctx.arc(p.x, p.y + r * 0.1, r * 0.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });
      break;
    }
    case "bow": {
      const w = size * 0.35, h = size * 0.25;
      ctx.translate(cx, cy - h * 0.4);
      ctx.fillStyle = color;
      [[-1], [1]].forEach(([d]) => {
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.quadraticCurveTo(d * w, -h, d * w, 0);
        ctx.quadraticCurveTo(d * w, h, 0, 0);
        ctx.fill();
      });
      ctx.strokeStyle = "rgba(0,0,0,0.2)";
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.fillStyle = shadeColor(color, -15);
      ctx.beginPath();
      ctx.ellipse(0, 0, w * 0.18, h * 0.5, 0, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case "crown": {
      const w = size * 0.7, h = size * 0.3;
      ctx.translate(cx, cy - h * 0.3);
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(-w/2, h/2);
      ctx.lineTo(-w/2, -h/4);
      ctx.lineTo(-w/3, h/8);
      ctx.lineTo(-w/6, -h/2);
      ctx.lineTo(0, h/8);
      ctx.lineTo(w/6, -h/2);
      ctx.lineTo(w/3, h/8);
      ctx.lineTo(w/2, -h/4);
      ctx.lineTo(w/2, h/2);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "rgba(0,0,0,0.2)";
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.fillStyle = "#FF6B9D";
      [[-w/6, -h/3], [0, -h/8], [w/6, -h/3]].forEach(p => {
        ctx.beginPath();
        ctx.arc(p[0], p[1], h * 0.13, 0, Math.PI * 2);
        ctx.fill();
      });
      break;
    }
    case "flower": {
      const r = size * 0.18;
      ctx.translate(cx - size * 0.4, cy - r * 0.8);
      ctx.rotate(t * 0.3);
      for (let i = 0; i < 5; i++) {
        ctx.save();
        ctx.rotate((Math.PI * 2 / 5) * i);
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.ellipse(0, -r, r * 0.6, r, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
      ctx.fillStyle = "#FFE08A";
      ctx.beginPath();
      ctx.arc(0, 0, r * 0.55, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case "antenna": {
      const len = size * 0.55, ballR = size * 0.1, bob = Math.sin(t * 3) * 4;
      [{ x: cx - size * 0.25, phase: 0 }, { x: cx + size * 0.25, phase: Math.PI }].forEach(p => {
        const wave = Math.sin(t * 4 + p.phase) * 6;
        ctx.strokeStyle = shadeColor(color, -20);
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(p.x, cy);
        ctx.quadraticCurveTo(p.x + wave, cy - len * 0.5, p.x + wave * 1.5, cy - len + bob);
        ctx.stroke();
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(p.x + wave * 1.5, cy - len + bob, ballR, 0, Math.PI * 2);
        ctx.fill();
      });
      break;
    }
    case "devil": {
      const w = size * 0.15, h = size * 0.32;
      [{ x: cx - size * 0.3, rot: -0.2 }, { x: cx + size * 0.3, rot: 0.2 }].forEach(p => {
        ctx.save();
        ctx.translate(p.x, cy);
        ctx.rotate(p.rot);
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(-w, h * 0.2);
        ctx.quadraticCurveTo(-w * 0.5, -h * 1.2, w * 0.3, -h * 0.5);
        ctx.quadraticCurveTo(w, 0, -w, h * 0.2);
        ctx.fill();
        ctx.restore();
      });
      break;
    }
    case "halo": {
      const r = size * 0.55, bob = Math.sin(t * 2) * 3;
      ctx.translate(cx, cy - r * 0.7 + bob);
      const g = ctx.createRadialGradient(0, 0, r * 0.4, 0, 0, r * 1.4);
      g.addColorStop(0, hexToRgba(color, 0));
      g.addColorStop(0.7, hexToRgba(color, 0.3));
      g.addColorStop(1, hexToRgba(color, 0));
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.ellipse(0, 0, r * 1.4, r * 0.5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = color;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.ellipse(0, 0, r, r * 0.35, 0, 0, Math.PI * 2);
      ctx.stroke();
      break;
    }
    case "ribbon": {
      const w = size * 0.7, h = size * 0.12, wave = Math.sin(t * 2) * 4;
      ctx.translate(cx, cy - h);
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(-w/2, -h/2);
      ctx.quadraticCurveTo(0, -h/2 + wave, w/2, -h/2);
      ctx.lineTo(w/2, h/2);
      ctx.quadraticCurveTo(0, h/2 + wave, -w/2, h/2);
      ctx.closePath();
      ctx.fill();
      break;
    }
    case "starPin": {
      const r = size * 0.16;
      ctx.translate(cx + size * 0.5, cy - r * 0.5);
      ctx.rotate(Math.sin(t * 2) * 0.1);
      drawStarShape(ctx, 0, 0, r, color);
      break;
    }
    case "heartPin": {
      const r = size * 0.14;
      ctx.translate(cx - size * 0.5, cy - r * 0.5);
      ctx.scale(1 + Math.sin(t * 3) * 0.08, 1 + Math.sin(t * 3) * 0.08);
      drawHeartShape(ctx, 0, 0, r, color);
      break;
    }
    case "witchHat": {
      const w = size * 0.55, h = size * 0.55;
      ctx.translate(cx, cy);
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(-w/2, 0);
      ctx.lineTo(w/2, 0);
      ctx.lineTo(w * 0.1, -h);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = shadeColor(color, -15);
      ctx.beginPath();
      ctx.ellipse(0, 0, w * 0.7, h * 0.08, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#FFE08A";
      ctx.fillRect(-w/2, -h * 0.15, w, h * 0.08);
      break;
    }
    case "partyHat": {
      const w = size * 0.4, h = size * 0.5;
      ctx.translate(cx, cy);
      ctx.rotate(Math.sin(t * 2) * 0.05);
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(-w/2, 0);
      ctx.lineTo(w/2, 0);
      ctx.lineTo(0, -h);
      ctx.closePath();
      ctx.fill();
      ["#FF6B9D","#FFE08A","#7AC4A3","#A0C4FF"].forEach((cc, i) => {
        ctx.fillStyle = cc;
        ctx.beginPath();
        ctx.arc(-w * 0.2 + i * w * 0.2, -h * (0.2 + i * 0.2), h * 0.05, 0, Math.PI * 2);
        ctx.fill();
      });
      break;
    }
    case "beret": {
      const w = size * 0.6, h = size * 0.18;
      ctx.translate(cx, cy);
      ctx.rotate(-0.15);
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.ellipse(0, 0, w/2, h, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = shadeColor(color, -20);
      ctx.beginPath();
      ctx.arc(w * 0.3, -h * 0.5, h * 0.25, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
    case "topknot": {
      const r = size * 0.18;
      ctx.translate(cx, cy - r * 0.5);
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,0.4)";
      ctx.beginPath();
      ctx.arc(-r * 0.3, -r * 0.3, r * 0.3, 0, Math.PI * 2);
      ctx.fill();
      break;
    }
  }
  ctx.restore();
}

function drawStarShape(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, color: string) {
  ctx.fillStyle = color;
  ctx.beginPath();
  for (let i = 0; i < 5; i++) {
    const a = -Math.PI / 2 + (Math.PI * 2 / 5) * i;
    const a2 = a + Math.PI / 5;
    ctx.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r);
    ctx.lineTo(cx + Math.cos(a2) * r * 0.4, cy + Math.sin(a2) * r * 0.4);
  }
  ctx.closePath();
  ctx.fill();
}

function drawHeartShape(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, color: string) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(cx, cy + r * 0.6);
  ctx.bezierCurveTo(cx - r * 1.2, cy - r * 0.3, cx - r * 0.5, cy - r * 1.1, cx, cy - r * 0.3);
  ctx.bezierCurveTo(cx + r * 0.5, cy - r * 1.1, cx + r * 1.2, cy - r * 0.3, cx, cy + r * 0.6);
  ctx.fill();
}

// === 身边飘浮 ===
function drawAccessory(ctx: CanvasRenderingContext2D, cx: number, cy: number, rx: number, ry: number, c: BallPetConfig, t: number) {
  if (c.accessory === "none") return;
  const color = c.accessoryColor;
  const positions = [
    { x: cx - rx * 1.3, y: cy - ry * 0.3, phase: 0 },
    { x: cx + rx * 1.3, y: cy - ry * 0.5, phase: 1.5 },
    { x: cx - rx * 1.1, y: cy + ry * 0.4, phase: 3 },
    { x: cx + rx * 1.2, y: cy + ry * 0.3, phase: 4.5 },
  ];
  positions.forEach((p, i) => {
    const fy = Math.sin(t * 1.5 + p.phase) * 6;
    const fx = Math.cos(t * 1.2 + p.phase) * 3;
    const px = p.x + fx, py = p.y + fy;
    switch (c.accessory) {
      case "stars": drawStarShape(ctx, px, py, rx * 0.1, color); break;
      case "hearts": drawHeartShape(ctx, px, py, rx * 0.1, color); break;
      case "bubbles":
        ctx.fillStyle = hexToRgba(color, 0.4);
        ctx.beginPath();
        ctx.arc(px, py, rx * 0.08, 0, Math.PI * 2);
        ctx.fill();
        break;
      case "sparkles":
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(px, py - rx * 0.12);
        ctx.quadraticCurveTo(px, py, px + rx * 0.12, py);
        ctx.quadraticCurveTo(px, py, px, py + rx * 0.12);
        ctx.quadraticCurveTo(px, py, px - rx * 0.12, py);
        ctx.quadraticCurveTo(px, py, px, py - rx * 0.12);
        ctx.fill();
        break;
      case "petals":
        ctx.save();
        ctx.translate(px, py);
        ctx.rotate(t + p.phase);
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.ellipse(0, 0, rx * 0.05, rx * 0.1, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
        break;
      case "notes":
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.ellipse(px - rx * 0.03, py + rx * 0.04, rx * 0.04, rx * 0.03, -0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = color;
        ctx.lineWidth = rx * 0.015;
        ctx.beginPath();
        ctx.moveTo(px + rx * 0.01, py + rx * 0.04);
        ctx.lineTo(px + rx * 0.01, py - rx * 0.06);
        ctx.stroke();
        break;
      case "rainbow":
        if (i < 1) {
          ["#FF6B6B","#FFB347","#FFE08A","#7AC4A3","#A0C4FF","#C9B6E4"].forEach((cc, j) => {
            ctx.strokeStyle = cc;
            ctx.lineWidth = rx * 0.8 * 0.04;
            ctx.beginPath();
            ctx.arc(cx, cy - ry * 1.3, rx * 0.8 * (0.5 - j * 0.04), Math.PI, 0);
            ctx.stroke();
          });
        }
        break;
    }
  });
}

// ============ 主组件 ============

interface PetAppProps {
  onBack: () => void;
}

export default function PetApp({ onBack }: PetAppProps) {
  const conversations = useAppStore((s) => s.conversations);
  const activeConversationId = useAppStore((s) => s.activeConversationId);
  const conv = conversations.find((c) => c.id === activeConversationId);

  // 本会话的宠物配置（持久化到 localStorage，按会话ID独立）
  const storageKey = `muxu-pet-${activeConversationId}`;
  const [config, setConfig] = useState<BallPetConfig>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) return { ...DEFAULT_PET_CONFIG, ...JSON.parse(saved) };
    } catch {}
    return { ...DEFAULT_PET_CONFIG };
  });

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) setConfig({ ...DEFAULT_PET_CONFIG, ...JSON.parse(saved) });
      else setConfig({ ...DEFAULT_PET_CONFIG });
    } catch {}
  }, [storageKey]);

  const update = useCallback((patch: Partial<BallPetConfig>) => {
    setConfig(prev => {
      const next = { ...prev, ...patch };
      try { localStorage.setItem(storageKey, JSON.stringify(next)); } catch {}
      window.dispatchEvent(new CustomEvent("pet-config-updated", { detail: { key: storageKey, config: next } }));
      return next;
    });
  }, [storageKey]);

  const reset = useCallback(() => {
    setConfig({ ...DEFAULT_PET_CONFIG });
    try { localStorage.removeItem(storageKey); } catch {}
    window.dispatchEvent(new CustomEvent("pet-config-updated", { detail: { key: storageKey, config: DEFAULT_PET_CONFIG } }));
  }, [storageKey]);

  if (!conv) return null;

  return (
    <div className="flex h-full flex-col">
      <AppHeader title={`○ 宠物（${conv.name}）`} onBack={onBack} />
      <div className="fancy-scroll flex-1 overflow-y-auto px-3 py-3">
        {/* 预览画布（sticky 实时预览，滚动装饰时始终可见） */}
        <div
          className="sticky top-0 z-10 mb-3 flex items-center justify-center rounded-2xl py-2 backdrop-blur-sm"
          style={{ background: "color-mix(in srgb, var(--accent) 12%, transparent)" }}
        >
          <PetCanvas config={config} size={120} />
        </div>

        {/* 主题快选 */}
        <Section title="🌈 主题">
          <div className="grid grid-cols-4 gap-1.5">
            {COLOR_THEMES.map(t => (
              <button
                key={t.name}
                onClick={() => update({ topColor: t.top, bottomColor: t.bottom })}
                className="h-8 rounded-lg border"
                style={{
                  background: `linear-gradient(180deg, ${t.top} 0%, ${t.top} 45%, ${t.bottom} 55%, ${t.bottom} 100%)`,
                  borderColor: "var(--card-border)",
                }}
                title={t.name}
              />
            ))}
          </div>
        </Section>

        {/* 上半部分颜色 */}
        <Section title="🔝 上半部分">
          <ColorPalette current={config.topColor} onPick={(c) => update({ topColor: c })} />
        </Section>

        {/* 下半部分颜色 */}
        <Section title="🔽 下半部分">
          <ColorPalette current={config.bottomColor} onPick={(c) => update({ bottomColor: c })} />
        </Section>

        {/* 渐变 */}
        <Section title="💧 渐变">
          <Slider label="过渡位置" value={config.gradientMid} min={20} max={80} onChange={(v) => update({ gradientMid: v })} suffix="%" />
          <Slider label="过渡宽度" value={config.gradientWidth} min={10} max={80} onChange={(v) => update({ gradientWidth: v })} suffix="%" />
          <Slider label="高光强度" value={config.highlight} min={0} max={100} onChange={(v) => update({ highlight: v })} suffix="%" />
          <Slider label="扁圆程度" value={config.flatness} min={50} max={100} onChange={(v) => update({ flatness: v })} suffix="%" />
        </Section>

        {/* 表情 */}
        <Section title="ʕ•ᴥ•ʔ 颜文字">
          <div className="grid grid-cols-4 gap-1">
            {KAOMOJI.map(k => (
              <button
                key={k}
                onClick={() => update({ kaomoji: k })}
                className="rounded-md border px-1 py-1.5 text-[10px]"
                style={{
                  background: config.kaomoji === k ? "var(--accent)" : "var(--card)",
                  color: config.kaomoji === k ? "var(--card)" : "var(--text)",
                  borderColor: "var(--card-border)",
                }}
              >
                {k}
              </button>
            ))}
          </div>
          <input
            type="text"
            value={config.kaomoji}
            onChange={(e) => update({ kaomoji: e.target.value })}
            className="mt-2 w-full rounded-md border px-2 py-1.5 text-xs"
            style={{ background: "var(--card)", borderColor: "var(--card-border)", color: "var(--text)" }}
            placeholder="自定义颜文字"
          />
          <Slider label="表情大小" value={config.faceSize} min={60} max={260} onChange={(v) => update({ faceSize: v })} suffix="%" />
        </Section>

        {/* 黄脸 */}
        <Section title="😀 黄脸">
          <div className="grid grid-cols-8 gap-1">
            {EMOJI_FACES.map((e, i) => (
              <button
                key={i}
                onClick={() => update({ emoji: e })}
                className="flex aspect-square items-center justify-center rounded-md border text-base"
                style={{
                  background: config.emoji === e ? "var(--accent)" : "var(--card)",
                  borderColor: "var(--card-border)",
                }}
              >
                {e || "·"}
              </button>
            ))}
          </div>
          <label className="mt-2 flex items-center gap-2 text-[11px]" style={{ color: "var(--text-soft)" }}>
            <input
              type="checkbox"
              checked={config.randomEmoji}
              onChange={(e) => update({ randomEmoji: e.target.checked })}
            />
            每10分钟随机切换
          </label>
        </Section>

        {/* 腮红 */}
        <Section title="🌺 腮红">
          <ColorPalette current={config.blushColor} onPick={(c) => update({ blushColor: c })} />
          <Slider label="浓度" value={config.blushOpacity} min={0} max={100} onChange={(v) => update({ blushOpacity: v })} suffix="%" />
          <Slider label="大小" value={config.blushSize} min={50} max={180} onChange={(v) => update({ blushSize: v })} suffix="%" />
        </Section>

        {/* 头饰 */}
        <Section title="🎀 头饰">
          <DecoGrid list={HEADWEAR_LIST} current={config.headwear} onPick={(id) => update({ headwear: id })} />
          <ColorRow value={config.headwearColor} onPick={(c) => update({ headwearColor: c })} />
        </Section>

        {/* 身边飘浮 */}
        <Section title="✨ 身边飘浮">
          <DecoGrid list={ACCESSORY_LIST} current={config.accessory} onPick={(id) => update({ accessory: id })} />
          <ColorRow value={config.accessoryColor} onPick={(c) => update({ accessoryColor: c })} />
        </Section>

        {/* 动效 */}
        <Section title="✨ 动效">
          <ToggleRow label="呼吸起伏" checked={config.breathe} onChange={(v) => update({ breathe: v })} />
          <ToggleRow label="左右晃动" checked={config.wobble} onChange={(v) => update({ wobble: v })} />
          <ToggleRow label="自动眨眼" checked={config.blink} onChange={(v) => update({ blink: v })} />
          <ToggleRow label="跳跳模式" checked={config.bounce} onChange={(v) => update({ bounce: v })} />
        </Section>

        {/* 重置 */}
        <button
          onClick={reset}
          className="mt-3 w-full rounded-lg border py-2 text-xs"
          style={{ background: "var(--card)", borderColor: "var(--card-border)", color: "var(--text-soft)" }}
        >
          🔄 恢复默认
        </button>
      </div>
    </div>
  );
}

// ============ 小组件 ============

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-3">
      <div className="mb-1.5 text-[11px] font-bold" style={{ color: "var(--text)" }}>{title}</div>
      {children}
    </div>
  );
}

function ColorPalette({ current, onPick }: { current: string; onPick: (c: string) => void }) {
  return (
    <div className="grid grid-cols-8 gap-1">
      {COLOR_PALETTE.map(c => (
        <button
          key={c}
          onClick={() => onPick(c)}
          className="aspect-square rounded-md border"
          style={{
            background: c,
            borderColor: current.toUpperCase() === c.toUpperCase() ? "var(--accent)" : "var(--card-border)",
            boxShadow: current.toUpperCase() === c.toUpperCase() ? "0 0 0 2px var(--accent)" : "none",
          }}
        />
      ))}
    </div>
  );
}

function Slider({ label, value, min, max, onChange, suffix }: {
  label: string; value: number; min: number; max: number; onChange: (v: number) => void; suffix?: string;
}) {
  return (
    <div className="mb-1.5 flex items-center gap-2">
      <span className="w-14 shrink-0 text-[10px]" style={{ color: "var(--text-soft)" }}>{label}</span>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="flex-1"
        style={{ accentColor: "var(--accent)" }}
      />
      <span className="w-8 shrink-0 text-right text-[10px]" style={{ color: "var(--text-soft)" }}>{value}{suffix}</span>
    </div>
  );
}

function DecoGrid({ list, current, onPick }: {
  list: { id: string; name: string }[]; current: string; onPick: (id: string) => void;
}) {
  return (
    <div className="grid grid-cols-4 gap-1">
      {list.map(item => (
        <button
          key={item.id}
          onClick={() => onPick(item.id)}
          className="rounded-md border py-1.5 text-[10px]"
          style={{
            background: current === item.id ? "var(--accent)" : "var(--card)",
            color: current === item.id ? "var(--card)" : "var(--text)",
            borderColor: "var(--card-border)",
          }}
        >
          {item.name}
        </button>
      ))}
    </div>
  );
}

function ColorRow({ value, onPick }: { value: string; onPick: (c: string) => void }) {
  return (
    <div className="mt-1.5 flex items-center gap-2">
      <input
        type="color"
        value={value}
        onChange={(e) => onPick(e.target.value)}
        className="h-7 w-9 rounded border"
        style={{ borderColor: "var(--card-border)" }}
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onPick(e.target.value)}
        className="flex-1 rounded-md border px-2 py-1 font-mono text-[10px]"
        style={{ background: "var(--card)", borderColor: "var(--card-border)", color: "var(--text)" }}
      />
    </div>
  );
}

function ToggleRow({ label, checked, onChange }: {
  label: string; checked: boolean; onChange: (v: boolean) => void;
}) {
  return (
    <label className="mb-1.5 flex items-center gap-2 text-[11px]" style={{ color: "var(--text)" }}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        style={{ accentColor: "var(--accent)" }}
      />
      {label}
    </label>
  );
}
