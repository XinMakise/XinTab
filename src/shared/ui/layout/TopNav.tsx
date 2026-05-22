import { Bookmark, Home, Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";

import { Button } from "@/shared/ui/primitives/button";
import {
  getCurrentAppearance,
  setCurrentAppearance,
  subscribeAppearance,
} from "@/features/appearance";
import { cn } from "@/shared/lib/cn";

const items = [
  { to: "/", label: "主页", icon: Home },
  { to: "/bookmarks", label: "收藏", icon: Bookmark },
];

export function TopNav() {
  const location = useLocation();
  const [mode, setMode] = useState(() => getCurrentAppearance().themeMode);

  useEffect(() => {
    return subscribeAppearance((next) => setMode(next.themeMode));
  }, []);

  const toggleMode = () => {
    const cur = getCurrentAppearance();
    const nextMode = cur.themeMode === "dark" ? "light" : "dark";
    void setCurrentAppearance({ ...cur, themeMode: nextMode }, { persist: true });
  };

  return (
    <div className="sticky top-0 z-10 w-full border-b bg-topnav">
      <div className="relative mx-auto flex h-14 w-full max-w-6xl items-center justify-center px-4">
        <nav className="flex items-center gap-2">
          {items.map((it) => {
            const active = location.pathname === it.to;
            const Icon = it.icon;
            return (
              <Button
                key={it.to}
                asChild
                variant={active ? "default" : "secondary"}
                className={cn("gap-2", active && "shadow-sm")}
              >
                <Link to={it.to} aria-current={active ? "page" : undefined}>
                  <Icon className="h-4 w-4" />
                  <span>{it.label}</span>
                </Link>
              </Button>
            );
          })}
        </nav>

        <Button
          variant="ghost"
          size="icon"
          className="absolute right-2 top-1/2 -translate-y-1/2"
          aria-label={mode === "dark" ? "切换到日间模式" : "切换到夜间模式"}
          onClick={toggleMode}
        >
          {mode === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
}


