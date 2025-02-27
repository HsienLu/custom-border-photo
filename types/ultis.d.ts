export interface ImageExifData {
    shotDate: string | undefined;
    Make: string | undefined;
    Model: string | undefined;
    ExposureTime: number | undefined;
    ISO: number | undefined;
    FocalLength: number | undefined;
    DateTimeOriginal: number | undefined;
    LensModel: string | undefined;
    imageSizrHeight:number | undefined;
    imageSizeWidth:number | undefined;
    image: Buffer;
}