import multer from 'multer';

const fileFilter = (req, file, cb) => {
    if (file.mimetype?.startsWith('image/')) {
        cb(null, true);
        return;
    }

    cb(new Error('Chỉ hỗ trợ file ảnh'), false);
};

// Sử dụng memory storage để upload lên Cloudinary
const storage = multer.memoryStorage();

export const uploadImage = multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 },
});
