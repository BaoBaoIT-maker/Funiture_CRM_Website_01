import * as productService from '../services/productService.js';

export const getAllProducts = async (req, res) => {
    try {
        console.log('📦 Fetching all products...');
        const products = await productService.fetchAllProducts();
        console.log('✅ Products fetched:', products.length);
        res.status(200).json({ success: true, data: products });
    } catch (error) {
        console.error('❌ Fetch products error:', error);
        res.status(500).json({ success: false, message: "Lỗi Server", error: error.message });
    }
};

export const createProduct = async (req, res) => {
    try {
        const newProduct = await productService.createNewProduct(req.body);
        res.status(201).json({ success: true, data: newProduct });
    } catch (error) {
        res.status(500).json({ success: false, message: "Lỗi Server" });
    }
};

export const updateProduct = async (req, res) => {
    try {
        console.log('Updating product:', req.params.id, req.body);
        const updatedProduct = await productService.updateProductById(req.params.id, req.body);
        res.status(200).json({ success: true, data: updatedProduct });
    } catch (error) {
        console.error('Update error:', error);
        res.status(500).json({ success: false, message: "Lỗi Server", error: error.message });
    }
};

export const deleteProduct = async (req, res) => {
    try {
        await productService.removeProduct(req.params.id);
        res.status(200).json({ success: true, message: "Xóa thành công!" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Lỗi Server" });
    }
};