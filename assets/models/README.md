# Segmentasyon Modeli

Uygulama TFLite formatında genel amaçlı segmentasyon modeli kullanır.

Dosyayı şu konuma yerleştirin:

```
assets/models/u2net_lite.tflite
```

## Önerilen Modeller (TFLite Format)

### U2Net-Lite (Tavsiye edilen)
- Model: U2Net genel segmentasyon — insan, hayvan, ürün, nesne
- Boyut: ~4.7 MB (quantized/int8)
- Çıktı: 1×512×512×1 (alfa maskesi)
- Dönüştürme: `u2net → TFLite converter`

### MODNet-Lite (Alternatif)
- Model: Portrait matting — özellikle insan/giyim
- Boyut: ~3.4 MB
- Çıktı: 1×512×512×1

## TFLite Dönüştürme (Örnek)

```python
import tensorflow as tf

converter = tf.lite.TFLiteConverter.from_saved_model("u2net_savedmodel")
converter.optimizations = [tf.lite.Optimize.DEFAULT]  # quantize
tflite_model = converter.convert()

with open("u2net_lite.tflite", "wb") as f:
    f.write(tflite_model)
```

## Model Gereksinimleri

- Girdi: `[1, 512, 512, 3]` Float32 tensör (0–1 normalize)
- Çıktı: `[1, 512, 512, 1]` Float32 maske (0=arka plan, 1=ön plan)
- Uygulama girdiyi 1024px'ye küçültüp modele verir,
  maskeyi orijinal çözünürlüğe geri haritalandırır.
