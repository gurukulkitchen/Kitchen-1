import { NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import sharp from 'sharp';
import { PDFDocument } from 'pdf-lib';

export async function POST(req) {
    try {
        const formData = await req.formData();
        const file = formData.get('file');
        const folder = formData.get('folder') || 'bills'; // Default to bills if not specified, allows 'items'

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        let buffer = Buffer.from(await file.arrayBuffer());
        const originalSize = buffer.length;
        let isCompressed = false;

        const fileType = file.type;
        const fileName = file.name.toLowerCase();

        // Image Compression
        if (fileType.startsWith('image/') || /\.(jpg|jpeg|png|webp)$/.test(fileName)) {
            try {
                let sharpInstance = sharp(buffer);
                const metadata = await sharpInstance.metadata();

                // Resize if too large (e.g., max width 2000px)
                if (metadata.width > 2000) {
                    sharpInstance = sharpInstance.resize(2000, null, { withoutEnlargement: true });
                }

                if (fileType === 'image/jpeg' || fileName.endsWith('.jpg') || fileName.endsWith('.jpeg')) {
                    buffer = await sharpInstance.jpeg({ quality: 80, mozjpeg: true }).toBuffer();
                } else if (fileType === 'image/png' || fileName.endsWith('.png')) {
                    buffer = await sharpInstance.png({ quality: 80, compressionLevel: 9 }).toBuffer();
                } else if (fileType === 'image/webp' || fileName.endsWith('.webp')) {
                    buffer = await sharpInstance.webp({ quality: 80 }).toBuffer();
                } else {
                    // Fallback compression for other image types
                    buffer = await sharpInstance.toBuffer();
                }
                isCompressed = true;
            } catch (err) {
                console.error("Image compression failed, saving original:", err);
            }
        }
        // PDF Compression
        else if (fileType === 'application/pdf' || fileName.endsWith('.pdf')) {
            try {
                const pdfDoc = await PDFDocument.load(buffer);
                // Structural optimization
                buffer = Buffer.from(await pdfDoc.save({
                    useObjectStreams: true,
                    addDefaultFont: false
                }));
                isCompressed = true;
            } catch (err) {
                console.error("PDF compression failed, saving original:", err);
            }
        }

        if (isCompressed) {
            const compressedSize = buffer.length;
            const reduction = ((originalSize - compressedSize) / originalSize * 100).toFixed(2);
            console.log(`Compression applied to ${file.name}: ${originalSize} -> ${compressedSize} (${reduction}% reduction)`);
        }

        // Ensure directory exists
        const uploadDir = join(process.cwd(), `public/uploads/${folder}`);
        if (!existsSync(uploadDir)) {
            mkdirSync(uploadDir, { recursive: true });
        }

        // Generate unique filename
        const filename = `${Date.now()}-${file.name.replace(/\s/g, '_')}`;
        const filepath = join(uploadDir, filename);

        await writeFile(filepath, buffer);

        // Return relative path for public access
        const publicPath = `/uploads/${folder}/${filename}`;
        console.log("File uploaded successfully. Path:", publicPath);

        // LOG ACTIVITY
        try {
            const { getDataFromToken } = await import('../../../helpers/getDataFromToken');
            const user = getDataFromToken(req);
            if (user) {
                const { activityMiddleware } = await import('../../../lib/activityMiddleware');
                await activityMiddleware(req, user, 'FILE_UPLOAD', {
                    filename: file.name,
                    folder,
                    size: file.size
                });
            }
        } catch (logError) {
            console.error("Failed to log upload activity:", logError);
            // Don't modify response, just log error
        }

        return NextResponse.json({ path: publicPath });

    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
    }
}
