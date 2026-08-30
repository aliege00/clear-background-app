import { useCallback, useRef, useState } from "react";

export interface SegmentationResult {
  originalUrl: string;
  resultUrl: string;
  originalSize: number;
  resultSize: number;
}

type Status = "idle" | "loading-model" | "processing" | "done" | "error";

/**
 * Custom hook for client-side background removal using TensorFlow.js BodyPix.
 * All processing happens offline on the device.
 */
export function useBackgroundRemoval() {
  const [status, setStatus] = useState<Status>("idle");
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<SegmentationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef(false);

  const reset = useCallback(() => {
    setStatus("idle");
    setProgress(0);
    setResult(null);
    setError(null);
    abortRef.current = false;
  }, []);

  const removeBackground = useCallback(async (file: File) => {
    abortRef.current = false;
    setStatus("loading-model");
    setProgress(0);
    setResult(null);
    setError(null);

    try {
      // Dynamically import TensorFlow.js and BodyPix
      const [tf, bodyPix] = await Promise.all([
        import("@tensorflow/tfjs"),
        import("@tensorflow-models/body-segmentation"),
      ]);

      if (abortRef.current) return;

      // Set up TF.js backend
      await tf.setBackend("webgl");
      await tf.ready();

      if (abortRef.current) return;

      // Load model
      setProgress(0.1);
      const segmenter = await bodyPix.createSegmenter(
        bodyPix.SupportedModels.BodyPix,
        {
          runtime: "tfjs",
          architecture: "MobileNetV1",
          outputStride: 16,
          multiplier: 0.75,
          quantBytes: 2,
        },
      );

      if (abortRef.current) return;

      // Load and resize image
      setProgress(0.25);
      const img = await loadImage(file);

      if (abortRef.current) return;

      const maxDim = 1024;
      const { canvas: resizedCanvas, width, height } = resizeImage(img, maxDim);

      // Run segmentation
      setProgress(0.4);
      const segmentation = await segmenter.segmentPeople(resizedCanvas, {
        flipHorizontal: false,
        multiSegmentation: false,
        segmentBodyParts: false,
        internalResolution: "medium",
        segmentationThreshold: 0.7,
      });

      if (abortRef.current) return;

      // Create background removal mask
      setProgress(0.6);

      // Create a new canvas for the result at original resolution
      const resultCanvas = document.createElement("canvas");
      resultCanvas.width = width;
      resultCanvas.height = height;
      const resultCtx = resultCanvas.getContext("2d")!;

      // Draw the original image
      resultCtx.drawImage(resizedCanvas, 0, 0);

      if (segmentation.length > 0 && segmentation[0].mask) {
        const maskData = await segmentation[0].mask.toImageData();

        // Create mask canvas
        const maskCanvas = document.createElement("canvas");
        maskCanvas.width = width;
        maskCanvas.height = height;
        const maskCtx = maskCanvas.getContext("2d")!;
        const maskImage = maskCtx.createImageData(width, height);

        // Copy mask data (person = foreground)
        for (let i = 0; i < maskData.data.length; i += 4) {
          // BodyPix mask: >128 is person, <=128 is background
          const isPerson = maskData.data[i] > 128;
          maskImage.data[i] = 255;     // R
          maskImage.data[i + 1] = 255; // G
          maskImage.data[i + 2] = 255; // B
          maskImage.data[i + 3] = isPerson ? 255 : 0; // A: transparent for background
        }
        maskCtx.putImageData(maskImage, 0, 0);

        // Composite: draw original, then apply mask
        const tempCanvas = document.createElement("canvas");
        tempCanvas.width = width;
        tempCanvas.height = height;
        const tempCtx = tempCanvas.getContext("2d")!;
        tempCtx.drawImage(resizedCanvas, 0, 0);
        tempCtx.globalCompositeOperation = "destination-in";
        tempCtx.drawImage(maskCanvas, 0, 0);

        // Draw the result
        resultCtx.clearRect(0, 0, width, height);
        resultCtx.drawImage(tempCanvas, 0, 0);
      }

      if (abortRef.current) return;

      setProgress(0.85);

      // Convert to blob
      const blob = await canvasToBlob(resultCanvas, "image/png");

      if (abortRef.current) return;

      const resultUrl = URL.createObjectURL(blob);
      const originalUrl = URL.createObjectURL(file);

      setProgress(1);
      setResult({
        originalUrl,
        resultUrl,
        originalSize: file.size,
        resultSize: blob.size,
      });
      setStatus("done");

      // Cleanup
      segmenter.dispose();
      tf.disposeVariables();
    } catch (err) {
      if (abortRef.current) return;
      console.error("Background removal failed:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to process image. Please try again.",
      );
      setStatus("error");
    }
  }, []);

  const cancel = useCallback(() => {
    abortRef.current = true;
    setStatus("idle");
    setProgress(0);
  }, []);

  return {
    status,
    progress,
    result,
    error,
    removeBackground,
    reset,
    cancel,
  };
}

// Utility functions

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = URL.createObjectURL(file);
  });
}

function resizeImage(
  img: HTMLImageElement,
  maxDim: number,
): { canvas: HTMLCanvasElement; width: number; height: number } {
  let { width, height } = img;
  if (width > maxDim || height > maxDim) {
    const ratio = Math.min(maxDim / width, maxDim / height);
    width = Math.round(width * ratio);
    height = Math.round(height * ratio);
  }

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, 0, 0, width, height);
  return { canvas, width, height };
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: string,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Failed to create blob"));
      },
      type,
      1.0,
    );
  });
}
