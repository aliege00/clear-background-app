import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Eraser, HelpCircle, Settings } from "lucide-react";
import { BackgroundRemovalTab } from "@/components/tabs/BackgroundRemovalTab";
import { HelpCenterTab } from "@/components/tabs/HelpCenterTab";
import { SettingsTab } from "@/components/tabs/SettingsTab";
import { cn } from "@/lib/utils";

const tabs = [
  { id: "remove", label: "Eraser", icon: Eraser },
  { id: "help", label: "Help", icon: HelpCircle },
  { id: "settings", label: "Settings", icon: Settings },
] as const;

export type TabId = (typeof tabs)[number]["id"];

export default function AppPage() {
  const [activeTab, setActiveTab] = useState<TabId>("remove");

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="max-w-2xl mx-auto px-4">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-foreground flex items-center justify-center">
                <Eraser className="w-4 h-4 text-background" />
              </div>
              <span className="font-semibold text-sm tracking-tight">
                Arka Plan
              </span>
            </div>

            {/* Tab Switcher */}
            <nav className="flex items-center bg-muted rounded-xl p-0.5 gap-0.5">
              {tabs.map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      "relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer",
                      isActive
                        ? "text-foreground"
                        : "text-muted-foreground hover:text-foreground/70",
                    )}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="active-tab"
                        className="absolute inset-0 bg-background rounded-lg shadow-sm"
                        transition={{
                          type: "spring",
                          bounce: 0.15,
                          duration: 0.5,
                        }}
                      />
                    )}
                    <span className="relative z-10 flex items-center gap-1.5">
                      <tab.icon className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">{tab.label}</span>
                    </span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
      </header>

      {/* Tab Content */}
      <main className="flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === "remove" && <BackgroundRemovalTab />}
            {activeTab === "help" && <HelpCenterTab />}
            {activeTab === "settings" && <SettingsTab />}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
