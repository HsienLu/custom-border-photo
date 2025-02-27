import { readFile, writeFile } from "fs/promises";
import { join } from "path";
import * as ExifParser from 'exif-parser';
import { ImageExifData } from "../types/ultis";
import { createCanvas, loadImage } from "canvas";
import * as fs from 'fs';


async function readImageExif(readFilePath: string) {
    try {
        const filePath = join(readFilePath);
     
        const image = await readFile(filePath);


        // 解析 EXIF 資訊
        const parser = ExifParser.create(image);
        const result = parser.parse();
        console.log('exif:',result)
        const tags = result.tags;
        // 提取日期
        function getExifDate(DateTimeOriginal:number) {
            
            if (DateTimeOriginal) {
                const exifDate = new Date(DateTimeOriginal * 1000); // EXIF 日期通常是 Unix 時間戳，需乘以 1000 轉換為毫秒
                const formattedDate =exifDate.toLocaleDateString('en',{
                    year: 'numeric',
                    month:'2-digit',
                    day:'2-digit',
                })
                const formattedTime = exifDate.toLocaleTimeString('en',{
                    hour:'2-digit',
                    minute:'2-digit',
                    second:'2-digit',
                    hour12:false,
                })
    
                return `${formattedDate} ${formattedTime}`
                
            } else {
                console.log('DateTimeOriginal tag not found');
            }
        }

        const shotDate=getExifDate(tags.DateTimeOriginal)
        const Make=tags.Make
        const Model=tags.Model
        const ExposureTime = tags.ExposureTime
        ? tags.ExposureTime < 1
          ? `1/${Math.round(1 / tags.ExposureTime)}`
          : tags.ExposureTime.toString()
        : undefined;
        const ISO=tags.ISO
        const FocalLength=tags.FocalLength
        const DateTimeOriginal=tags.DateTimeOriginal
        const LensModel=tags.LensModel
        const imageSizrHeight=result.imageSize.height
        const imageSizeWidth=result.imageSize.width
        await writeFile('./src/public/output/DSC08101.jpg', image);
        const data={
            shotDate,
            Make,
            Model,
            ExposureTime,
            ISO,
            FocalLength,
            DateTimeOriginal,
            LensModel,
            imageSizrHeight,
            imageSizeWidth,
            image
        }
        return data
    } catch (e) {
        console.error('Error reading image:', e);
    }
}
async function drawImageWithBorder(imgData: ImageExifData) {
    console.log(imgData);
    
    const borderSize = 200;
    const bottomPadding = 300; 
    const fromBottomPadding = 400;
    const width = (imgData.imageSizeWidth ?? 800)+ borderSize * 2;
    const height = (imgData.imageSizrHeight?? 600 )+ borderSize * 2+ bottomPadding;
    const image = await loadImage(Buffer.from(imgData.image)) 
    const canvas=createCanvas(width,height)
    const ctx=canvas.getContext('2d')
    ctx.fillStyle='white'
    ctx.fillRect(0, 0, width, height);    
    ctx.drawImage(image, borderSize, borderSize);
    const fontSize=72;
    ctx.font = `${fontSize}px Arial`;
    ctx.fillStyle='black';
    ctx.textAlign='center';
    const text=`${imgData.Make} ${imgData.Model}`;
    const text2=`ISO ${imgData.ISO} ${imgData.ExposureTime} ${imgData.FocalLength}mm`;
    const text3=`${imgData.LensModel}`;
    const lineHeight = fontSize*1.5; // 每行文字的高度
    let currentY = height - fromBottomPadding; // 初始Y座標
    ctx.fillText(text, width / 2, currentY);
    currentY += lineHeight; // 增加Y座標
    ctx.fillText(text2, width / 2, currentY);
    currentY += lineHeight; // 增加Y座標
    ctx.fillText(text3, width / 2, currentY);
    const buffer =canvas.toBuffer('image/jpeg')
    fs.writeFileSync('./src/public/output/DSC08101.jpg',buffer)
}
async function main() {
    const data = await readImageExif('./src/public/DSC08101.jpg'); // 讀取圖像的 EXIF 資料
    
    if (data) {
        drawImageWithBorder(data); // 如果成功讀取到資料，則繪製圖像和邊框
    } else {
        console.error('Failed to read image EXIF data.'); // 如果讀取失敗，則輸出錯誤訊息
    }
}



main();