import { useState, useCallback, useRef } from 'react';
import { TFLiteModel, ExecutionPlan } from 'react-native-fast-tflite';
import { Image } from 'react-native';

const MODEL_INPUT_SIZE = 512;
const MAX_PROCESS_DIM = 1024;

/**
 * react-native-fast-tflite ile cihaz üzerinde arka plan kaldırma.
 * Model main thread'de çalışır (FFI), görsel encode/decode mümkünse
 * ayrı task'ta (setTimeout) yapılır.
 */
export function useSegmentation() {
  const modelRef = useRef<TFLiteModel | null>(null);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadModel = useCallback(async () => {
    try {
      // Model asset'ten yüklenir
      // assets/models/ u2net_lite.tflite olarak paketlenmelidir
      const model = await TFLiteModel.load(
        require('../../assets/models/u2net_lite.tflite'),
      );
      modelRef.current = model;
      setIsModelLoaded(true);
    } catch (e: any) {
      console.warn('[Segmentation] Model yükleme hatası:', e);
      setError('Model yüklenemedi');
    }
  }, []);

  const removeBackground = useCallback(
    async (imageUri: string): Promise<{ uri: string; width: number; height: number } | null> => {
      if (!modelRef.current) {
        setError('Model yüklenmedi');
        return null;
      }

      setIsProcessing(true);
      setError(null);

      try {
        // 1. Görüntüyü base64 veya tensor'a dönüştür
        //    (Basitleştirilmiş — gerçek implementasyonda image-manipulator kullanılır)
        const inputTensor = await prepareInput(imageUri);

        // 2. TFLite inference
        const output = modelRef.current.runSync([inputTensor]);

        // 3. Mask'ı uygula ve PNG olarak kaydet
        const result = await applyMaskAndSave(imageUri, output, inputTensor.width, inputTensor.height);

        setIsProcessing(false);
        return result;
      } catch (e: any) {
        console.error('[Segmentation] Hata:', e);
        setError('İşleme başarısız');
        setIsProcessing(false);
        return null;
      }
    },
    [],
  );

  const reset = useCallback(() => {
    setError(null);
    setIsProcessing(false);
  }, []);

  // Model kapatma (bellek temizliği)
  const dispose = useCallback(() => {
    modelRef.current?.delete();
    modelRef.current = null;
    setIsModelLoaded(false);
  }, []);

  return {
    isModelLoaded,
    isProcessing,
    error,
    modelName: 'U2Net-Lite (TFLite)',
    modelInputSize: `${MODEL_INPUT_SIZE}×${MODEL_INPUT_SIZE}`,
    modelQuantization: 'Float32',
    loadModel,
    removeBackground,
    reset,
    dispose,
  };
}

/**
 * Görüntüyü TFLite input formatına hazırlar.
 * Temporarily basit — gerçekten çalışması için react-native-image-manipulator gerekir.
 */
async function prepareInput(imageUri: string) {
  // TODO: react-native-image-manipulator ile:
  // 1. maxDim=1024'e resize et
  // 2. MODEL_INPUT_SIZE x MODEL_INPUT_SIZE'a resize et
  // 3. Float32Array'e çevir [1, 512, 512, 3] normalize [0,1]
  //
  // Geçici olarak boş tensor döndür — gerçek model eklendiğinde doldurulacak
  const size = MODEL_INPUT_SIZE;
  return {
    data: new Float32Array(size * size * 3),
    width: size,
    height: size,
    shape: [1, size, size, 3],
  };
}

/**
 * Model çıktısını (maske) orijinal görsele uygular.
 */
async function applyMaskAndSave(
  originalUri: string,
  maskOutput: any,
  maskWidth: number,
  maskHeight: number,
) {
  // TODO: Gerçek implementasyon:
  // 1. Orijinal görüntüyü decode et (canvas/pixel processing)
  // 2. Mask'ı orijinal çözünürlüğe yeniden boyutlandır
  // 3. alpha kanalını maskeye göre ayarla
  // 4. PNG olarak kaydet
  // 5. URI döndür

  return {
    uri: originalUri, // Geçici — gerçek uygulamada işlenmiş URI
    width: maskWidth,
    height: maskHeight,
  };
}
