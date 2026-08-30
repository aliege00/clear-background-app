# Segmentation Model

Place your ONNX segmentation model file at this location:

```
assets/models/segmentation.onnx
```

## Recommended Models

For **general object/product segmentation** (not just people):

### Option 1: RMBG-1.4 (BriaAI)
- Download: https://huggingface.co/briaai/RMBG-1.4
- Size: ~170MB
- Quality: Excellent for all object types

### Option 2: U2Net (General)
- Download: https://github.com/danielgatis/rembg
- Size: ~4.7MB (U2Net-tiny)
- Quality: Good, works on people + objects

### Option 3: IS-Net
- Download: https://github.com/xuebinqin/DIS
- Size: ~25MB
- Quality: Very good for general segmentation

## Converting to ONNX

If your model is in PyTorch (.pth) format:

```python
import torch
model = YourModel.load_from_checkpoint("model.pth")
dummy = torch.randn(1, 3, 512, 512)
torch.onnx.export(model, dummy, "segmentation.onnx", opset_version=11)
```

## Model Requirements

- Input: `[1, 3, 512, 512]` float32 tensor (normalized 0-1)
- Output: `[1, 1, 512, 512]` float32 mask (0=background, 1=foreground)
- The app resizes input to 512×512 and maps the mask back to original resolution
