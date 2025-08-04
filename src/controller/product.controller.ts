// src/controller/product.controller.ts
import { Request, Response } from 'express';
import { productService } from '../services/product.service';
import { IProduct } from '../models/product.model';

interface ProductDataForFrontend {
    id: string;
    name: string;
    imageUrl: string;
    rating: number;
    specs: string[];
    price: number;
    originalPrice?: number;
    currency: string;
    isOnSale: boolean;
    description?: string;
    stock?: number;
    category?: string;
}

// Get all products
export const getAllProducts = async (req: Request, res: Response) => {
    try {
        const products = await productService.getAllProducts();
        if (!Array.isArray(products)) {
            console.error('Expected products to be an array, got:', typeof products);
            return res.status(500).json({
                success: false,
                message: 'Invalid products data received from service'
            });
        }
        const transformedProducts: ProductDataForFrontend[] = products
            .filter(p => p && p._id != null)
            .map(p => ({
                id: p._id?.toString() || 'unknown',
                name: p.name || 'Unnamed Product',
                imageUrl: p.imageUrl || 'default-product.png',
                rating: p.rating ?? 0,
                specs: Array.isArray(p.specs) ? p.specs : [],
                price: p.price ?? 0,
                originalPrice: p.originalPrice,
                currency: p.currency || 'LKR',
                isOnSale: Boolean(p.isOnSale),
                description: p.description ?? '',
                stock: p.stock ?? 0,
                category: p.category || 'Uncategorized'
            }));
        res.json({
            success: true,
            count: transformedProducts.length,
            data: transformedProducts
        });
    } catch (error) {
        console.error('Error in getAllProducts controller:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching products',
            error: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
        });
    }
};

// Get single product
export const getProduct = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ message: 'Product ID is required' });
        }
        const product = await productService.getProductById(id);
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        // Transform single product for frontend
        const transformedProduct: ProductDataForFrontend = {
            id: product._id.toString(),
            name: product.name,
            imageUrl: product.imageUrl || 'default-product.png',
            rating: product.rating !== undefined ? product.rating : 0,
            specs: product.specs || [],
            price: product.price,
            originalPrice: product.originalPrice,
            currency: product.currency || "LKR",
            isOnSale: product.isOnSale !== undefined ? product.isOnSale : false,
            description: product.description,
            stock: product.stock,
            category: product.category,
        };
        res.status(200).json(transformedProduct);
    } catch (error) {
        console.error('Error fetching product:', error);
        res.status(500).json({ message: 'Error fetching product', error: error instanceof Error ? error.message : 'Unknown error' });
    }
};

// Create new product
export const saveProduct = async (req: Request, res: Response) => {
    try {
        const productData = req.body;
        const newProduct = await productService.createProduct(productData);
        // Transform the created product for a consistent frontend response
        const transformedProduct: ProductDataForFrontend = {
            id: newProduct._id.toString(),
            name: newProduct.name,
            imageUrl: newProduct.imageUrl || 'default-product.png',
            rating: newProduct.rating ?? 0,
            specs: newProduct.specs || [],
            price: newProduct.price,
            originalPrice: newProduct.originalPrice,
            currency: newProduct.currency || "LKR",
            isOnSale: newProduct.isOnSale ?? false,
            description: newProduct.description,
            stock: newProduct.stock,
            category: newProduct.category,
        };
        res.status(201).json(transformedProduct);
    } catch (error) {
        console.error('Error saving product:', error);
        res.status(500).json({ message: 'Error saving product', error: error instanceof Error ? error.message : 'Unknown error' });
    }
};

// Update an existing product
export const updateProduct = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        const updatedProduct = await productService.updateProduct(id, updateData);
        if (!updatedProduct) {
            return res.status(404).json({ message: 'Product not found' });
        }
        // Transform the updated product for a consistent frontend response
        const transformedProduct: ProductDataForFrontend = {
            id: updatedProduct._id.toString(),
            name: updatedProduct.name,
            imageUrl: updatedProduct.imageUrl || 'default-product.png',
            rating: updatedProduct.rating ?? 0,
            specs: updatedProduct.specs || [],
            price: updatedProduct.price,
            originalPrice: updatedProduct.originalPrice,
            currency: updatedProduct.currency || "LKR",
            isOnSale: updatedProduct.isOnSale ?? false,
            description: updatedProduct.description,
            stock: updatedProduct.stock,
            category: updatedProduct.category,
        };
        res.status(200).json(transformedProduct);
    } catch (error) {
        console.error('Error updating product:', error);
        res.status(500).json({ message: 'Error updating product', error: error instanceof Error ? error.message : 'Unknown error' });
    }
};

// Delete product
export const deleteProduct = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ message: 'Product ID is required' });
        }
        const isDeleted = await productService.deleteProduct(id);
        if (!isDeleted) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.status(200).json({ message: 'Product deleted successfully' });
    } catch (error) {
        console.error('Error deleting product:', error);
        res.status(500).json({ message: 'Error deleting product', error: error instanceof Error ? error.message : 'Unknown error' });
    }
};

// Search products
export const searchProducts = async (req: Request, res: Response) => {
    try {
        const { q } = req.query;
        if (!q || typeof q !== 'string') {
            return res.status(400).json({ message: 'Search query is required' });
        }
        const results = await productService.searchProducts(q);
        res.status(200).json(results);
    } catch (error) {
        console.error('Error searching products:', error);
        res.status(500).json({ message: 'Error searching products', error: error instanceof Error ? error.message : 'Unknown error' });
    }
};
