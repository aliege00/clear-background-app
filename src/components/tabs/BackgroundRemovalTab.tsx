import { useCallback, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  Camera,
  Download,
  RotateCcw,
  X,
  Check,
  Loader2,
  ImageIcon,
  Eye,
  ArrowLeftRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useBackgroundRemoval } from "@/hooks/use-background-removal";
import { cn } from "@/lib/utils";

export function BackgroundRemovalTab() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const {
    status,
    progress,
    result,
    error,
    removeBackground,
    reset,
    cancel,
  } = useBackgroundRemoval();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [showComparison, setShowComparison] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith("image/")) return;
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      reset();
      setShowComparison(false);
    },
    [reset],
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile],
  );

  const handleProcess = useCallback(() => {
    if (selectedFile) removeBackground(selectedFile);
  }, [selectedFile, removeBackground]);

  const handleDownload = useCallback(() => {
    if (!result) return;
    const a = document.createElement("a");
    a.href = result.resultUrl;
    a.download = "background-removed.png";
    a.click();
  }, [result]);

  const handleShare = useCallback(async () => {
    if (!result) return;
    try {
      const res = await fetch(result.resultUrl);
      const blob = await res.blob();
      const file = new File([blob], "background-removed.png", {
        type: "image/png",
      });
      if (navigator.share) {
        await navigator.share({ files: [file], title: "Background Removed" });
      } else {
        handleDownload();
      }
    } catch {
      handleDownload();
    }
  }, [result, handleDownload]);

  const handleReset = useCallback(() => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    if (result) {
      URL.revokeObjectURL(result.originalUrl);
      URL.revokeObjectURL(result.resultUrl);
    }
    setSelectedFile(null);
    setPreviewUrl(null);
    setShowComparison(false);
    reset();
  }, [previewUrl, result, reset]);

  const statusLabel = (() => {
    switch (status) {
      case "loading-model":
        return "Loading AI model...";
      case "processing":
        return "Removing background...";
      default:
        return "";
    }
  })();

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <AnimatePresence mode="wait">
        {/* Empty State: Upload Area */}
        {!selectedFile && status === "idle" && (
          <motion.div
            key="upload"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
          >
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragOver(true);
              }}
              onDragLeave={() => setIsDragOver(false)}
              onDrop={handleDrop}
              className={cn(
                "relative rounded-2xl border-2 border-dashed transition-all duration-300 cursor-pointer overflow-hidden",
                isDragOver
                  ? "border-foreground bg-foreground/5 scale-[1.01]"
                  : "border-border hover:border-foreground/30 hover:bg-muted/30",
              )}
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="flex flex-col items-center justify-center py-20 px-6 gap-5">
                <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center">
                  <Upload className="w-7 h-7 text-muted-foreground" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-foreground">
                    Drop your image here
                  </p>
                  <p className="text-xs text-muted-foreground mt-1.5">
                    or click to browse · PNG, JPG, WebP
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-full gap-1.5"
                    onClick={(e) => {
                      e.stopPropagation();
                      fileInputRef.current?.click();
                    }}
                  >
                    <ImageIcon className="w-3.5 h-3.5" />
                    Browse
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-full gap-1.5"
                    onClick={(e) => {
                      e.stopPropagation();
                      fileInputRef.current?.click();
                    }}
                  >
                    <Camera className="w-3.5 h-3.5" />
                    Camera
                  </Button>
                </div>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileInput}
              />
            </div>

            {/* Feature Highlights */}
            <div className="mt-8 grid grid-cols-3 gap-3">
              {[
                { icon: "🔒", title: "Fully Offline", desc: "No internet needed" },
                { icon: "⚡", title: "Instant", desc: "Processed on-device" },
                { icon: "♾️", title: "Unlimited", desc: "No caps or limits" },
              ].map((f) => (
                <div
                  key={f.title}
                  className="text-center p-3 rounded-xl bg-muted/40"
                >
                  <div className="text-xl mb-1.5">{f.icon}</div>
                  <p className="text-xs font-medium text-foreground">{f.title}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    {f.desc}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Processing / Result State */}
        {(selectedFile || status !== "idle") && (
          <motion.div
            key="preview"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="space-y-4"
          >
            {/* Image Preview */}
            <div className="relative rounded-2xl overflow-hidden bg-muted/50 border border-border/50">
              {status === "done" && result ? (
                <div className="relative">
                  {showComparison ? (
                    /* Before / After Comparison */
                    <div className="relative aspect-[4/3]">
                      <img
                        src={result.originalUrl}
                        alt="Original"
                        className="absolute inset-0 w-full h-full object-contain"
                      />
                      <img
                        src={result.resultUrl}
                        alt="Background removed"
                        className="absolute inset-0 w-full h-full object-contain"
                        style={{ clipPath: "inset(0 50% 0 0)" }}
                      />
                      {/* Comparison divider */}
                      <div className="absolute inset-y-0 left-1/2 -translate-x-0.5 w-px bg-white/80 shadow-lg" />
                      <div className="absolute top-3 left-3 bg-black/60 text-white text-[10px] font-medium px-2 py-1 rounded-full">
                        Original
                      </div>
                      <div className="absolute top-3 right-3 bg-black/60 text-white text-[10px] font-medium px-2 py-1 rounded-full">
                        Result
                      </div>
                    </div>
                  ) : (
                    /* Transparent Checkerboard Result */
                    <div
                      className="aspect-[4/3]"
                      style={{
                        backgroundImage: `linear-gradient(45deg, #e5e7eb 25%, transparent 25%), linear-gradient(-45deg, #e5e7eb 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e5e7eb 75%), linear-gradient(-45deg, transparent 75%, #e5e7eb 75%)`,
                        backgroundSize: "16px 16px",
                        backgroundPosition:
                          "0 0, 0 8px, 8px -8px, -8px 0px",
                      }}
                    >
                      <img
                        src={result.resultUrl}
                        alt="Background removed"
                        className="w-full h-full object-contain"
                      />
                    </div>
                  )}

                  {/* Close button */}
                  <button
                    onClick={handleReset}
                    className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                /* Original preview with overlay */
                <div className="relative aspect-[4/3]">
                  {previewUrl && (
                    <img
                      src={previewUrl}
                      alt="Selected"
                      className="w-full h-full object-contain"
                    />
                  )}

                  {/* Processing overlay */}
                  {(status === "loading-model" || status === "processing") && (
                    <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center gap-4">
                      <Loader2 className="w-8 h-8 text-foreground animate-spin" />
                      <div className="w-48 space-y-2">
                        <p className="text-xs text-center text-muted-foreground">
                          {statusLabel}
                        </p>
                        <Progress value={progress * 100} className="h-1.5" />
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={cancel}
                        className="text-xs"
                      >
                        Cancel
                      </Button>
                    </div>
                  )}

                  {/* Error overlay */}
                  {status === "error" && (
                    <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex flex-col items-center justify-center gap-3 p-6">
                      <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
                        <X className="w-5 h-5 text-destructive" />
                      </div>
                      <p className="text-sm text-center text-muted-foreground max-w-xs">
                        {error || "Failed to process image"}
                      </p>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleProcess}
                          className="rounded-full"
                        >
                          Try Again
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleReset}
                          className="rounded-full"
                        >
                          Start Over
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Close button */}
                  <button
                    onClick={handleReset}
                    className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 hover:bg-black/70 text-white flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            {status === "idle" && selectedFile && (
              <div className="flex gap-2">
                <Button
                  onClick={handleProcess}
                  className="flex-1 rounded-xl h-11 font-medium"
                >
                  Remove Background
                </Button>
                <Button
                  variant="outline"
                  onClick={handleReset}
                  className="rounded-xl h-11 gap-1.5"
                >
                  <RotateCcw className="w-4 h-4" />
                </Button>
              </div>
            )}

            {status === "done" && result && (
              <div className="space-y-2">
                {/* Compare toggle */}
                <Button
                  variant="outline"
                  onClick={() => setShowComparison(!showComparison)}
                  className="w-full rounded-xl h-10 gap-2 text-xs"
                >
                  {showComparison ? (
                    <>
                      <Eye className="w-3.5 h-3.5" />
                      View Result
                    </>
                  ) : (
                    <>
                      <ArrowLeftRight className="w-3.5 h-3.5" />
                      Compare Before / After
                    </>
                  )}
                </Button>

                <div className="flex gap-2">
                  <Button
                    onClick={handleDownload}
                    className="flex-1 rounded-xl h-11 font-medium gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Save as PNG
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleShare}
                    className="rounded-xl h-11 font-medium gap-2"
                  >
                    Share
                  </Button>
                </div>

                <Button
                  variant="ghost"
                  onClick={handleReset}
                  className="w-full rounded-xl h-10 text-xs"
                >
                  Process another image
                </Button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
