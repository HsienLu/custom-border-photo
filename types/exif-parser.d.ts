declare module 'exif-parser' {
    interface ExifData {
        tags: { [key: string]: any };
        imageSize: { width: number; height: number };
        thumbnailOffset: number;
        thumbnailLength: number;
        thumbnailType: number;
        app1Offset: number;
        exifOffset: number;
    }

    interface ExifParser {
        parse(): ExifData;
    }

    function create(buffer: Buffer): ExifParser;
}