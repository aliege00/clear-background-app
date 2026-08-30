import { Tensor } from 'react-native-fast-tflite';
import { Image } from 'react-native';
import * as FileSystem from 'expo-file-system';

const MODEL_INPUT_SIZE = 512;

export interface SegmentationResult {
  originalUri: string;
  resultUri: string;
}

/**
 * Görsel arka plan kaldırma pipeline:
 * 1) Görseli ~1024px'e küçült
 * 2) 512×512 float32 tensor üret
 * 3) TFLite model inference → alpha maskesi
 * 4) Maskeyi orijinal çözünürlüğe uygula → PNG
 */
export async function processImage(
  imageUri: string,
  model: any,
): Promise<SegmentationResult> {
  const inputTensor = await imageToTensor(imageUri, MODEL_INPUT_SIZE);
  const output = model.runSync([inputTensor]);
  const mask = output[0];
  const resultUri = await applyMask(imageUri, mask, MODEL_INPUT_SIZE);

  return { originalUri: imageUri, resultUri };
}

async function imageToTensor(uri: string, size: number): Promise<Tensor> {
  const data = new Float32Array(1 * size * size * 3);
  // Gerçek kullanımda: ImageManipulator → base64 → Float32Array
  return { data, shape: [1, size, size, 3], dataType: 'float32' };
}

async function applyMask(originalUri: string, mask: Tensor, inputSize: number): Promise<string> {
  const outputPath = `${FileSystem.cacheDirectory}result_${Date.now()}.png`;
  // Gerçek kullanımda: orijinal pikseller × mask alpha → RGBA buffer → PNG encode
  await FileSystem.copyAsync({ from: originalUri, to: outputPath });
  return outputPath;
}
