import express from 'express';
import { verifyToken } from '../middlewares/authMiddleware.js';
import { uploadImage } from '../middlewares/uploadMiddleware.js';
import cloudinary from '../config/cloudinary.js';

const router = express.Router();

router.post('/image', verifyToken, uploadImage.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'Không có file ảnh được tải lên' });
        }

        console.log('📤 Uploading to Cloudinary...', req.file.originalname);

        // Upload lên Cloudinary từ buffer
        const result = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder: 'furniture_crm',
                    resource_type: 'auto',
                },
                (error, result) => {
                    if (error) {
                        console.error('❌ Cloudinary error:', error);
                        reject(error);
                    } else {
                        console.log('✅ Cloudinary upload success:', result.secure_url);
                        resolve(result);
                    }
                }
            );

            uploadStream.end(req.file.buffer);
        });

        return res.status(201).json({
            success: true,
            data: {
                path: result.secure_url,
                publicId: result.public_id,
                filename: req.file.originalname,
            },
        });
    } catch (error) {
        console.error('❌ Upload error:', error);
        return res.status(500).json({
            success: false,
            message: 'Lỗi khi tải ảnh lên',
            error: error.message,
        });
    }
});

export default router;
