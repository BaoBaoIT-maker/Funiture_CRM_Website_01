import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();
console.log('✅ Loading imports...');

import authRoutes from './routes/authRoutes.js';
console.log('✅ authRoutes loaded');
import productRoutes from './routes/productRoutes.js';
console.log('✅ productRoutes loaded');
import customerRoutes from './routes/customerRoutes.js';
console.log('✅ customerRoutes loaded');
import uploadRoutes from './routes/uploadRoutes.js';
console.log('✅ uploadRoutes loaded');
const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.get("/", (req, res) => {
    res.send("Server OK");
});
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/uploads', express.static(path.resolve(process.cwd(), 'uploads')));

app.get('/api/test', (req, res) => {
    res.json({ message: "🚀 Server Node.js (3-Tier Architecture) đang chạy mượt mà!" });
});

app.use((err, req, res, next) => {
    if (err?.type === 'entity.too.large') {
        return res.status(413).json({
            success: false,
            message: 'Kích thước dữ liệu quá lớn. Vui lòng chọn ảnh nhỏ hơn.',
        });
    }

    if (err?.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json({
            success: false,
            message: 'Ảnh vượt quá 5MB. Vui lòng chọn ảnh nhỏ hơn.',
        });
    }

    if (err?.message === 'Chỉ hỗ trợ file ảnh') {
        return res.status(400).json({
            success: false,
            message: err.message,
        });
    }

    return next(err);
});

const PORT = process.env.PORT || 8080;
const server = app.listen(PORT, () => {
    console.log(`🚀 Server đang chạy tại http://localhost:${PORT}`);
});

// Log khi server close
server.on('close', () => {
    console.log('✅ Server closed gracefully');
});

server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`❌ Port ${PORT} đang được sử dụng. Thử port khác hoặc kill process cũ`);
        process.exit(1);
    } else {
        console.error('❌ Server error:', err);
    }
});

// Bắt lỗi không được xử lý
process.on('uncaughtException', (err) => {
    console.error('❌ Uncaught Exception:', err);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled Rejection:', reason);
    process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('⚠️ SIGTERM received, shutting down gracefully');
    server.close();
});