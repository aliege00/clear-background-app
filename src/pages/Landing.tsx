import { motion } from "framer-motion";
import {
  Eraser,
  Shield,
  Zap,
  Infinity,
  ArrowRight,
  Sparkles,
  Upload,
  Download,
  Smartphone,
  Monitor,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router";

const features = [
  {
    icon: Shield,
    title: "100% Private",
    description:
      "Everything happens on your device. No images are ever sent to any server.",
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    description:
      "AI-powered segmentation runs directly in your browser with WebGL acceleration.",
  },
  {
    icon: Infinity,
    title: "Truly Unlimited",
    description:
      "No quotas, no watermarks, no premium tiers. Use it as much as you want.",
  },
];

const steps = [
  {
    step: "01",
    title: "Upload",
    description: "Select or drag a photo from your device",
    icon: Upload,
  },
  {
    step: "02",
    title: "Process",
    description: "AI removes the background instantly",
    icon: Eraser,
  },
  {
    step: "03",
    title: "Download",
    description: "Get a clean transparent PNG",
    icon: Download,
  },
];

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
};

const stagger = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
};

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/40">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-foreground flex items-center justify-center">
              <Eraser className="w-4 h-4 text-background" />
            </div>
            <span className="font-semibold text-sm tracking-tight">
              Arka Plan
            </span>
          </div>
          <Button
            onClick={() => navigate("/auth")}
            size="sm"
            className="rounded-full px-4 text-xs font-medium"
          >
            Get Started
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Button>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted text-xs font-medium text-muted-foreground mb-6 border border-border/50">
              <Sparkles className="w-3 h-3" />
              Powered by TensorFlow.js — runs entirely in your browser
            </div>

            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.08]">
              Remove backgrounds
              <br />
              <span className="text-muted-foreground">instantly, offline</span>
            </h1>

            <p className="mt-6 text-base sm:text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed">
              Free, unlimited, and completely private. Process photos on your
              device with AI — no uploads, no accounts, no limits.
            </p>

            <div className="mt-8 flex items-center justify-center gap-3">
              <Button
                onClick={() => navigate("/auth")}
                size="lg"
                className="rounded-full px-6 h-12 font-medium gap-2"
              >
                Start Removing
                <ArrowRight className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={() =>
                  document
                    .getElementById("features")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
                className="rounded-full px-6 h-12 font-medium"
              >
                Learn More
              </Button>
            </div>
          </motion.div>

          {/* Hero visual - device mockup */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="mt-16 relative"
          >
            <div className="mx-auto max-w-2xl">
              <div className="relative rounded-2xl border border-border/60 bg-card p-3 shadow-2xl shadow-black/5">
                {/* Mock app interface */}
                <div className="rounded-xl bg-background border border-border/30 overflow-hidden">
                  {/* Mock toolbar */}
                  <div className="flex items-center gap-2 px-4 py-2.5 border-b border-border/30">
                    <div className="w-6 h-6 rounded-lg bg-foreground flex items-center justify-center">
                      <Eraser className="w-3 h-3 text-background" />
                    </div>
                    <span className="text-[10px] font-medium text-muted-foreground">
                      Arka Plan
                    </span>
                    <div className="flex-1" />
                    <div className="flex gap-1">
                      {["Eraser", "Help", "Settings"].map((t) => (
                        <div
                          key={t}
                          className="px-2 py-0.5 rounded-md text-[9px] text-muted-foreground bg-muted/60"
                        >
                          {t}
                        </div>
                      ))}
                    </div>
                  </div>
                  {/* Mock content */}
                  <div className="p-6 flex flex-col items-center gap-4 min-h-[200px] justify-center">
                    <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center">
                      <Upload className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <div className="text-center">
                      <p className="text-xs font-medium text-foreground">
                        Drop your image here
                      </p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        or click to browse · PNG, JPG, WebP
                      </p>
                    </div>
                    <div className="flex gap-1.5">
                      <div className="px-2.5 py-1 rounded-full border border-border text-[9px] text-muted-foreground">
                        Browse
                      </div>
                      <div className="px-2.5 py-1 rounded-full border border-border text-[9px] text-muted-foreground">
                        Camera
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* Subtle glow */}
              <div className="absolute -inset-10 bg-gradient-to-b from-primary/5 to-transparent rounded-full blur-3xl -z-10" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Platform badges */}
      <section className="py-10 border-y border-border/40">
        <div className="max-w-5xl mx-auto px-4 flex items-center justify-center gap-8 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Smartphone className="w-3.5 h-3.5" />
            <span>Mobile Browser</span>
          </div>
          <div className="w-1 h-1 rounded-full bg-border" />
          <div className="flex items-center gap-1.5">
            <Monitor className="w-3.5 h-3.5" />
            <span>Desktop Browser</span>
          </div>
          <div className="w-1 h-1 rounded-full bg-border" />
          <span>Works Everywhere</span>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <motion.div {...fadeUp} transition={{ duration: 0.5 }} className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Why Arka Plan?
            </h2>
            <p className="mt-3 text-sm text-muted-foreground max-w-md mx-auto">
              A modern background removal tool built with privacy and performance
              at its core.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-3 gap-4">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                {...stagger}
                transition={{ delay: i * 0.1, duration: 0.4 }}
                className="group p-6 rounded-2xl border border-border/50 bg-card hover:border-foreground/20 transition-all duration-300"
              >
                <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center mb-4 group-hover:bg-foreground group-hover:text-background transition-colors duration-300">
                  <f.icon className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-semibold">{f.title}</h3>
                <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                  {f.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="max-w-5xl mx-auto">
          <motion.div {...fadeUp} transition={{ duration: 0.5 }} className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              How it works
            </h2>
            <p className="mt-3 text-sm text-muted-foreground">
              Three simple steps. No complexity.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-3 gap-6">
            {steps.map((s, i) => (
              <motion.div
                key={s.step}
                {...stagger}
                transition={{ delay: i * 0.15, duration: 0.5 }}
                className="text-center"
              >
                <div className="relative inline-flex mb-4">
                  <div className="w-14 h-14 rounded-2xl bg-background border border-border/50 flex items-center justify-center shadow-sm">
                    <s.icon className="w-6 h-6 text-foreground" />
                  </div>
                  <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-foreground text-background text-[10px] font-bold flex items-center justify-center">
                    {s.step}
                  </span>
                </div>
                <h3 className="text-sm font-semibold">{s.title}</h3>
                <p className="text-xs text-muted-foreground mt-1.5 max-w-[200px] mx-auto">
                  {s.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-24 px-4">
        <motion.div
          {...fadeUp}
          transition={{ duration: 0.5 }}
          className="max-w-2xl mx-auto text-center"
        >
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Ready to start?
          </h2>
          <p className="mt-4 text-sm text-muted-foreground max-w-md mx-auto">
            Upload your first photo and see the magic. No sign-up required for
            the free experience.
          </p>
          <div className="mt-8">
            <Button
              onClick={() => navigate("/auth")}
              size="lg"
              className="rounded-full px-8 h-13 font-medium gap-2 text-sm"
            >
              Launch Arka Plan
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 py-8 px-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-foreground flex items-center justify-center">
              <Eraser className="w-3 h-3 text-background" />
            </div>
            <span className="text-xs font-medium">Arka Plan</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Free · Offline · Private
          </p>
        </div>
      </footer>
    </div>
  );
}
