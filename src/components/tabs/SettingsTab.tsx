import { useCallback, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sun,
  Moon,
  Monitor,
  Info,
  Trash2,
  Code,
  Smartphone,
  Globe,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { useTheme } from "@/components/ThemeProvider";
import { cn } from "@/lib/utils";

const themeOptions = [
  { id: "light" as const, label: "Light", icon: Sun },
  { id: "dark" as const, label: "Dark", icon: Moon },
  { id: "system" as const, label: "System", icon: Monitor },
];

export function SettingsTab() {
  const { theme, setTheme } = useTheme();
  const [devMenuOpen, setDevMenuOpen] = useState(false);
  const [tapCount, setTapCount] = useState(0);
  const [adsEnabled, setAdsEnabled] = useState(false);
  const [cacheCleared, setCacheCleared] = useState(false);

  const handleVersionTap = useCallback(() => {
    const next = tapCount + 1;
    setTapCount(next);
    if (next >= 7) {
      setDevMenuOpen((prev) => !prev);
      setTapCount(0);
    }
  }, [tapCount]);

  const handleClearCache = useCallback(() => {
    try {
      localStorage.clear();
      sessionStorage.clear();
      setCacheCleared(true);
      setTimeout(() => setCacheCleared(false), 2000);
    } catch {
      // Ignore errors
    }
  }, []);

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-lg font-semibold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Customize your experience
        </p>
      </div>

      {/* Theme Section */}
      <div>
        <h2 className="text-sm font-semibold mb-3">Appearance</h2>
        <div className="rounded-2xl border border-border/50 overflow-hidden">
          {themeOptions.map((opt) => (
            <button
              key={opt.id}
              onClick={() => setTheme(opt.id)}
              className={cn(
                "w-full flex items-center gap-3 p-4 text-left transition-colors cursor-pointer",
                theme === opt.id ? "bg-muted/50" : "hover:bg-muted/30",
                "border-b border-border/30 last:border-0",
              )}
            >
              <opt.icon className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm flex-1">{opt.label}</span>
              {theme === opt.id && (
                <motion.div
                  layoutId="theme-check"
                  className="w-5 h-5 rounded-full bg-foreground flex items-center justify-center"
                >
                  <svg
                    className="w-3 h-3 text-background"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={3}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </motion.div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* About Section */}
      <div>
        <h2 className="text-sm font-semibold mb-3">About</h2>
        <div className="rounded-2xl border border-border/50 overflow-hidden">
          <div className="flex items-center gap-3 p-4 border-b border-border/30">
            <Info className="w-4 h-4 text-muted-foreground" />
            <div className="flex-1">
              <p className="text-sm">Version</p>
            </div>
            <button
              onClick={handleVersionTap}
              className="text-xs text-muted-foreground font-mono cursor-pointer select-none"
            >
              1.0.0
            </button>
          </div>
          <div className="flex items-center gap-3 p-4 border-b border-border/30">
            <Globe className="w-4 h-4 text-muted-foreground" />
            <div className="flex-1">
              <p className="text-sm">Processing</p>
            </div>
            <span className="text-xs text-muted-foreground">
              100% On-Device
            </span>
          </div>
          <div className="flex items-center gap-3 p-4">
            <Smartphone className="w-4 h-4 text-muted-foreground" />
            <div className="flex-1">
              <p className="text-sm">AI Model</p>
            </div>
            <span className="text-xs text-muted-foreground">
              TensorFlow.js BodyPix
            </span>
          </div>
        </div>
      </div>

      {/* Developer Menu (Hidden) */}
      <AnimatePresence>
        {devMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Code className="w-4 h-4 text-amber-500" />
                <h2 className="text-sm font-semibold text-amber-500">
                  Developer Menu
                </h2>
              </div>
              <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 overflow-hidden">
                <div className="flex items-center gap-3 p-4 border-b border-border/30">
                  <div className="flex-1">
                    <p className="text-sm">Enable Test Ads</p>
                    <p className="text-xs text-muted-foreground">
                      Show ads on settings changes (test mode)
                    </p>
                  </div>
                  <Switch
                    checked={adsEnabled}
                    onCheckedChange={setAdsEnabled}
                  />
                </div>
                <button
                  onClick={handleClearCache}
                  className="w-full flex items-center gap-3 p-4 text-left hover:bg-muted/30 transition-colors cursor-pointer border-b border-border/30"
                >
                  <Trash2 className="w-4 h-4 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="text-sm">
                      {cacheCleared ? "Cache Cleared!" : "Clear Cache"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Remove all locally stored data
                    </p>
                  </div>
                </button>
                <div className="flex items-center gap-3 p-4">
                  <Info className="w-4 h-4 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="text-sm">Debug Info</p>
                  </div>
                  <span className="text-xs text-muted-foreground font-mono">
                    TF.js {typeof window !== "undefined" ? "4.x" : "N/A"} ·
                    WebGL
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
