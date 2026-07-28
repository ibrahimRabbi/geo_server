// import { v2 as cloudinary } from 'cloudinary';
// import fs from 'fs';
// import path from 'path';
// import sharp from 'sharp';

// cloudinary.config({
//     cloud_name: 'dymnrefpr',
//     api_key: '214554444282119',
//     api_secret: 'nt7kZ5Bxs4juDmI9iIpgAMUG820'
// });

// const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

// const compressImage = async (imagePath: string): Promise<string> => {
//     const fileSize = fs.statSync(imagePath).size;

//     if (fileSize <= MAX_FILE_SIZE) {
//         return imagePath;
//     }

//     const dir = path.dirname(imagePath);
//     const baseName = path.basename(imagePath);
//     const compressedPath = path.join(dir, `compressed_${baseName}.jpg`);

//     console.log(`Original size: ${(fileSize / 1024 / 1024).toFixed(2)}MB`);

//     let quality = 85;
//     let buffer: Buffer;

//     do {
//         buffer = await sharp(imagePath)
//             .jpeg({ quality, mozjpeg: true })
//             .toBuffer();

//         console.log(`Quality ${quality}% → ${(buffer.length / 1024 / 1024).toFixed(2)}MB`);

//         quality -= 5;

//         if (quality < 10) break;
//     } while (buffer.length > MAX_FILE_SIZE);

//     fs.writeFileSync(compressedPath, buffer);

//     console.log(`Final size: ${(fs.statSync(compressedPath).size / 1024 / 1024).toFixed(2)}MB`);
//     return compressedPath;
// };

// const deleteFile = (filePath: string) => {
//     fs.unlink(filePath, (err) => {
//         if (err) console.error(`Error deleting file ${filePath}:`, err);
//         else console.log(`Deleted: ${filePath}`);
//     });
// };

// export const uploadImage = async (imagePath: string, imageName: string) => {
//     let compressedPath: string | null = null;

//     try {
//         compressedPath = await compressImage(imagePath);

//         const result = await cloudinary.uploader.upload(compressedPath, {
//             public_id: imageName,
//             overwrite: true
//         });

//         if (!result) throw new Error('Failed to host image');

//         return result;

//     } catch (error: any) {
//         throw new Error(error.message || 'Error uploading image');

//     } finally {
//         deleteFile(imagePath);
//         if (compressedPath && compressedPath !== imagePath) {
//             deleteFile(compressedPath);
//         }
//     }
// };



import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs'

cloudinary.config({
    cloud_name: 'dymnrefpr',
    api_key: '214554444282119',
    api_secret: 'nt7kZ5Bxs4juDmI9iIpgAMUG820'
});

export const uploadImage = async (imagePath: string, imageName: string) => {
    try {
        const declarImageDetail = {
            public_id: imageName,
            overwrite: true
        };

        const result = await cloudinary.uploader.upload(imagePath, declarImageDetail);

        fs.unlink(imagePath, (err) => {
            if (err) {
                console.error('Error deleting file:', err);
            } else {
                console.log('File deleted successfully');
            }
        });

        if (!result) {
            throw new Error('Failed to host image');
        }
        return result;

    } catch (error: any) {
        throw new Error(error.message || 'Error uploading image');
    }
};



