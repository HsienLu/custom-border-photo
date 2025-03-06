import { readFile, writeFile } from "fs/promises";
import { join } from "path";
import * as ExifParser from "exif-parser";
import { createCanvas, loadImage } from "canvas";
import { ImageExifData } from "../types/ultis";
// Configurable file paths
const INPUT_PATH = "./src/public/DSC08101.jpg";
const OUTPUT_PATH = "./src/public/output/DSC08101.jpg";


/**
 * 將 EXIF 的 Unix 時間戳轉換為可讀日期字串
 */
function formatExifDate(timestamp: number): string | undefined {
  if (!timestamp) {
    console.warn("DateTimeOriginal tag not found");
    return undefined;
  }
  const exifDate = new Date(timestamp * 1000);
  const formattedDate = exifDate.toLocaleDateString("en", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const formattedTime = exifDate.toLocaleTimeString("en", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
  return `${formattedDate} ${formattedTime}`;
}

/**
 * 讀取檔案並回傳 Buffer
 */
async function loadImageBuffer(filePath: string): Promise<Buffer> {
  const absolutePath = join(filePath);
  return await readFile(absolutePath);
}

/**
 * 從圖片 Buffer 中解析 EXIF 資料
 */
function parseExifData(imageBuffer: Buffer): ImageExifData | null {
  try {
    const parser = ExifParser.create(imageBuffer);
    const result = parser.parse();
    const { tags, imageSize } = result;
    const shotDate = formatExifDate(tags.DateTimeOriginal);
    const exposureTime =
      tags.ExposureTime != null
        ? tags.ExposureTime < 1
          ? `1/${Math.round(1 / tags.ExposureTime)}`
          : tags.ExposureTime.toString()
        : undefined;

    return {
      shotDate,
      Make: tags.Make,
      Model: tags.Model,
      ExposureTime: exposureTime,
      ISO: tags.ISO,
      FocalLength: tags.FocalLength,
      DateTimeOriginal: tags.DateTimeOriginal,
      LensModel: tags.LensModel,
      imageSizeHeight: imageSize.height,
      imageSizeWidth: imageSize.width,
      image: imageBuffer,
    };
  } catch (error) {
    console.error("Error parsing EXIF data:", error);
    return null;
  }
}

/**
 * 使用 Canvas 產生帶有邊框與文字資訊的圖片
 * @param exifData - 從圖片中解析出的 EXIF 資料
 * @param config - 可調整邊框大小、底部填充等參數
 */
async function createImageWithBorder(
  exifData: ImageExifData,
  config?: { borderSize?: number; bottomPadding?: number; textPadding?: number }
): Promise<Buffer> {
  // 預設參數
  const borderSize = config?.borderSize ?? 200;
  const bottomPadding = config?.bottomPadding ?? 300;
  const textAreaHeightFromBottom = config?.textPadding ?? 400;

  const imageWidth = exifData.imageSizeWidth ?? 800;
  const imageHeight = exifData.imageSizeHeight ?? 600;
  const canvasWidth = imageWidth + borderSize * 2;
  const canvasHeight = imageHeight + borderSize * 2 + bottomPadding;

  // 載入圖片並建立畫布
  const image = await loadImage(exifData.image);
  const canvas = createCanvas(canvasWidth, canvasHeight);
  const ctx = canvas.getContext("2d");

  // 畫白色背景
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  // 繪製原始圖片
  ctx.drawImage(image, borderSize, borderSize);

  // 繪製文字資訊
  const fontSizeTitle = 96;
  const fontSizeInfo = 72;
  const paddingTop = 54; // 文字區域的上方 padding
  let currentY = canvasHeight - textAreaHeightFromBottom + paddingTop;
  const lineHeight = fontSizeInfo * 1.8;

  // 標題：相機品牌與型號
  ctx.font = `${fontSizeTitle}px Arial`;
  ctx.fillStyle = "black";
  ctx.textAlign = "center";
  const titleText = `${exifData.Make} ${exifData.Model}`;
  ctx.fillText(titleText, canvasWidth / 2, currentY);

  // 次要資訊：ISO、曝光、焦距與鏡頭型號
  currentY += lineHeight;
  ctx.font = `${fontSizeInfo}px Arial`;
  ctx.fillStyle = "#CCC";
  const infoText = `ISO ${exifData.ISO} ${exifData.ExposureTime} ${exifData.FocalLength}mm   ${exifData.LensModel}`;
  ctx.fillText(infoText, canvasWidth / 2, currentY);

  // 額外資訊（這裡再示範一行，可根據需要修改或刪除）
  currentY += lineHeight;
  ctx.fillText(`${exifData.LensModel}`, canvasWidth / 2, currentY);

  return canvas.toBuffer("image/jpeg");
}

/**
 * 將 Buffer 寫入指定檔案
 */
async function saveImageBuffer(filePath: string, buffer: Buffer): Promise<void> {
  await writeFile(filePath, buffer);
}

/**
 * 主流程：讀取圖片、解析 EXIF、生成新圖片、並儲存結果
 */
async function main() {
  try {
    const imageBuffer = await loadImageBuffer(INPUT_PATH);
    const exifData = parseExifData(imageBuffer);
    if (!exifData) {
      throw new Error("Failed to extract EXIF data.");
    }
    const outputBuffer = await createImageWithBorder(exifData);
    await saveImageBuffer(OUTPUT_PATH, outputBuffer);
    console.log("Image processing completed successfully.");
  } catch (error) {
    console.error("Error in image processing pipeline:", error);
  }
}

main();
