import { Battery, Wifi, Signal } from "lucide-react";

interface Props {
  children: React.ReactNode;
  time?: string;
}

export default function PhoneShell({ children, time = "9:41" }: Props) {
  return (
    <div className="relative mx-auto w-full max-w-[320px]">
      <div
        className="relative rounded-[2.5rem] p-2 shadow-phone"
        style={{ background: "var(--phone-shell)" }}
      >
        <div className="absolute -left-0.5 top-24 h-12 w-1 rounded-l bg-black/50" />
        <div className="absolute -left-0.5 top-40 h-16 w-1 rounded-l bg-black/50" />
        <div className="absolute -right-0.5 top-32 h-20 w-1 rounded-r bg-black/50" />

        <div className="phone-screen-bg relative h-[520px] overflow-hidden rounded-[2rem]">
          {/* 刘海 */}
          <div
            className="absolute left-1/2 top-0 z-30 h-6 w-28 -translate-x-1/2 rounded-b-2xl"
            style={{ background: "var(--phone-shell)" }}
          />

          {/* 状态栏 */}
          <div
            className="relative z-20 flex items-center justify-between px-6 pt-2 text-[11px] font-medium"
            style={{ color: "var(--text)" }}
          >
            <span>{time}</span>
            <div className="flex items-center gap-1.5">
              <Signal className="h-3 w-3" />
              <Wifi className="h-3 w-3" />
              <Battery className="h-4 w-4" />
            </div>
          </div>

          {children}
        </div>
      </div>
    </div>
  );
}
