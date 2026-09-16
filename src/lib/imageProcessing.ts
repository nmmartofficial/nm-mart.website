const MAX_IMAGE_DIMENSION = 1600;
const BACKGROUND_DISTANCE_THRESHOLD = 32;
const MIN_FOREGROUND_RATIO = 0.02;
const CROP_PADDING_RATIO = 0.04;

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

type Rgba = { r: number; g: number; b: number };

const readPixel = (pixels: Uint8ClampedArray, index: number): Rgba => ({
  r: pixels[index],
  g: pixels[index + 1],
  b: pixels[index + 2],
});

const colorDistance = (a: Rgba, b: Rgba) => Math.sqrt(
  ((a.r - b.r) ** 2) + ((a.g - b.g) ** 2) + ((a.b - b.b) ** 2),
);

const loadImage = async (file: File): Promise<{ source: CanvasImageSource; width: number; height: number }> => {
  if (typeof createImageBitmap === "function") {
    const bitmap = await createImageBitmap(file);
    return { source: bitmap, width: bitmap.width, height: bitmap.height };
  }

  const objectUrl = URL.createObjectURL(file);
  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const element = new Image();
      element.onload = () => resolve(element);
      element.onerror = () => reject(new Error("Unable to read the selected image."));
      element.src = objectUrl;
    });
    return { source: image, width: image.naturalWidth, height: image.naturalHeight };
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
};

const getCropBounds = (pixels: Uint8ClampedArray, width: number, height: number) => {
  const samplePoints = [
    [0, 0],
    [width - 1, 0],
    [0, height - 1],
    [width - 1, height - 1],
  ];
  const background = samplePoints.reduce(
    (sum, [x, y]) => {
      const pixel = readPixel(pixels, (y * width + x) * 4);
      return { r: sum.r + pixel.r / 4, g: sum.g + pixel.g / 4, b: sum.b + pixel.b / 4 };
    },
    { r: 0, g: 0, b: 0 },
  );

  const isBackground = (x: number, y: number) => {
    const index = (y * width + x) * 4;
    const alpha = pixels[index + 3] / 255;
    if (alpha < 0.04) return true;
    return colorDistance(readPixel(pixels, index), background) <= BACKGROUND_DISTANCE_THRESHOLD;
  };

  let minX = width;
  let minY = height;
  let maxX = -1;
  let maxY = -1;
  let foregroundCount = 0;

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      if (isBackground(x, y)) continue;
      foregroundCount += 1;
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
    }
  }

  if (foregroundCount / (width * height) < MIN_FOREGROUND_RATIO || maxX < minX || maxY < minY) {
    return { x: 0, y: 0, width, height };
  }

  const padding = Math.max(2, Math.round(Math.max(maxX - minX + 1, maxY - minY + 1) * CROP_PADDING_RATIO));
  const x = clamp(minX - padding, 0, width - 1);
  const y = clamp(minY - padding, 0, height - 1);
  const right = clamp(maxX + padding + 1, x + 1, width);
  const bottom = clamp(maxY + padding + 1, y + 1, height);

  return { x, y, width: right - x, height: bottom - y };
};

export async function normalizeProductImage(file: File): Promise<File> {
  if (!file.type.startsWith("image/")) throw new Error("Please choose an image file.");

  const { source, width, height } = await loadImage(file);
  const sourceCanvas = document.createElement("canvas");
  sourceCanvas.width = width;
  sourceCanvas.height = height;
  const sourceContext = sourceCanvas.getContext("2d", { willReadFrequently: true });
  if (!sourceContext) throw new Error("Image processing is not available in this browser.");

  sourceContext.drawImage(source, 0, 0, width, height);
  const pixels = sourceContext.getImageData(0, 0, width, height).data;
  const crop = getCropBounds(pixels, width, height);
  const scale = Math.min(1, MAX_IMAGE_DIMENSION / Math.max(crop.width, crop.height));
  const outputWidth = Math.max(1, Math.round(crop.width * scale));
  const outputHeight = Math.max(1, Math.round(crop.height * scale));
  const outputCanvas = document.createElement("canvas");
  outputCanvas.width = outputWidth;
  outputCanvas.height = outputHeight;
  const outputContext = outputCanvas.getContext("2d");
  if (!outputContext) throw new Error("Image processing is not available in this browser.");

  outputContext.fillStyle = "#FFFFFF";
  outputContext.fillRect(0, 0, outputWidth, outputHeight);
  outputContext.drawImage(
    sourceCanvas,
    crop.x,
    crop.y,
    crop.width,
    crop.height,
    0,
    0,
    outputWidth,
    outputHeight,
  );

  const outputType = file.type === "image/png" ? "image/png" : "image/jpeg";
  const blob = await new Promise<Blob>((resolve, reject) => {
    outputCanvas.toBlob(
      (result) => result ? resolve(result) : reject(new Error("Unable to prepare the selected image.")),
      outputType,
      outputType === "image/jpeg" ? 0.92 : undefined,
    );
  });

  if (typeof ImageBitmap !== "undefined" && "close" in source) {
    (source as ImageBitmap).close();
  }

  const extension = outputType === "image/png" ? "png" : "jpg";
  return new File([blob], `product-normalized.${extension}`, { type: outputType, lastModified: Date.now() });
}
