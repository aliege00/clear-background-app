import { useState } from "react";
import { motion } from "framer-motion";
import {
  ChevronDown,
  Share2,
  Scissors,
  Shield,
  Zap,
  Smartphone,
  Globe,
  Image,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const faqs = [
  {
    icon: Scissors,
    question: "How does background removal work?",
    answer:
      "The app uses an AI model (TensorFlow.js BodyPix) that runs entirely in your browser. It identifies the person in your photo and separates them from the background. Everything happens on your device — no images are sent to any server.",
  },
  {
    icon: Zap,
    question: "Why is it fast?",
    answer:
      "The AI model is optimized for browser performance using WebGL acceleration. Images are resized to an optimal resolution before processing, ensuring smooth operation even on lower-end devices.",
  },
  {
    icon: Shield,
    question: "Is my data private?",
    answer:
      "Absolutely. All processing happens locally in your browser. Your photos never leave your device and no data is stored or transmitted to any server. The app works completely offline once loaded.",
  },
  {
    icon: Globe,
    question: "Do I need an internet connection?",
    answer:
      "No. The AI model is loaded into your browser when you first use the app. After that, everything works offline. You can use the app without any internet connection.",
  },
  {
    icon: Image,
    question: "What image formats are supported?",
    answer:
      "The app supports PNG, JPG/JPEG, and WebP images. The output is always a transparent PNG, which is ideal for use in design projects, social media, or anywhere you need a clean cutout.",
  },
  {
    icon: Smartphone,
    question: "What are the best results?",
    answer:
      "The model works best with clear photos of people where the subject is well-lit and distinguishable from the background. High contrast between subject and background improves accuracy.",
  },
];

export function HelpCenterTab() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const shareData = {
      title: "Arka Plan — Background Remover",
      text: "Check out this free background removal tool — works offline, no limits, no account needed!",
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareData.url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      // User cancelled or clipboard failed
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-lg font-semibold tracking-tight">Help Center</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Everything you need to know about using Arka Plan
        </p>
      </div>

      {/* Quick Start Card */}
      <div className="rounded-2xl border border-border/50 bg-muted/30 p-5 space-y-3">
        <h2 className="text-sm font-semibold">Quick Start</h2>
        <div className="space-y-3">
          {[
            {
              step: "1",
              text: "Go to the Eraser tab and upload a photo",
            },
            { step: "2", text: "Tap \"Remove Background\" to process" },
            { step: "3", text: "Save or share your result" },
          ].map((s) => (
            <div key={s.step} className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-foreground text-background text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                {s.step}
              </div>
              <p className="text-sm text-muted-foreground">{s.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ Section */}
      <div>
        <h2 className="text-sm font-semibold mb-3">Frequently Asked Questions</h2>
        <div className="space-y-1.5">
          {faqs.map((faq, i) => (
            <motion.div
              key={i}
              initial={false}
              className="rounded-xl border border-border/40 overflow-hidden"
            >
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex items-center gap-3 p-3.5 text-left hover:bg-muted/40 transition-colors cursor-pointer"
              >
                <faq.icon className="w-4 h-4 text-muted-foreground shrink-0" />
                <span className="text-sm font-medium text-foreground flex-1">
                  {faq.question}
                </span>
                <ChevronDown
                  className={cn(
                    "w-4 h-4 text-muted-foreground transition-transform duration-200",
                    openFaq === i && "rotate-180",
                  )}
                />
              </button>
              {openFaq === i && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="px-3.5 pb-3.5 pl-12">
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Share Card */}
      <div className="rounded-2xl border border-border/50 p-5 text-center space-y-3">
        <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center mx-auto">
          <Share2 className="w-5 h-5 text-muted-foreground" />
        </div>
        <div>
          <p className="text-sm font-medium">Share with friends</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Help others discover this free tool
          </p>
        </div>
        <Button
          onClick={handleShare}
          variant="outline"
          size="sm"
          className="rounded-full gap-2"
        >
          {copied ? (
            <>
              <span className="text-green-500">✓</span> Link copied!
            </>
          ) : (
            <>
              <Share2 className="w-3.5 h-3.5" />
              Share Arka Plan
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
