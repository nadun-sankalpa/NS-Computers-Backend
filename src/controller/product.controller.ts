import { Request, Response } from 'express';
import { productService } from '../services/product.service';
import { IProduct } from '../models/product.model';

// Get all products
export const getAllProducts = async (req: Request, res: Response) => {
    try {
        const products = await productService.getAllProducts();
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching products', error: error instanceof Error ? error.message : 'Unknown error' });
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
        
        res.status(200).json(product);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching product', error: error instanceof Error ? error.message : 'Unknown error' });
    }
};

// Create new product
export const saveProduct = async (req: Request, res: Response) => {
    try {
        const { name, description, price, stock, category, imageUrl } = req.body;
        
        // Basic validation
        if (!name || !description || price === undefined || !category) {
            return res.status(400).json({ 
                message: 'Missing required fields',
                required: ['name', 'description', 'price', 'category']
            });
        }
        
        // Create a plain object that matches the expected type
        const productData = {
            name: String(name),
            description: String(description),
            price: parseFloat(String(price)),
            stock: stock ? parseInt(String(stock), 10) : 0,
            category: String(category),
            imageUrl: imageUrl ? String(imageUrl) : ''
        };
        
        const newProduct = await productService.createProduct(productData);
        
        res.status(201).json(newProduct);
    } catch (error) {
        res.status(500).json({ message: 'Error creating product', error: error instanceof Error ? error.message : 'Unknown error' });
    }
};

// Update product
export const updateProduct = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ message: 'Product ID is required' });
        }
        
        const { name, description, price, stock, category, imageUrl } = req.body;
        
        // Create a plain object with only the provided fields
        const updateData: Partial<{
            name: string;
            description: string;
            price: number;
            stock: number;
            category: string;
            imageUrl: string;
        }> = {};
        
        if (name !== undefined) updateData.name = String(name);
        if (description !== undefined) updateData.description = String(description);
        if (price !== undefined) updateData.price = parseFloat(String(price));
        if (stock !== undefined) updateData.stock = parseInt(String(stock), 10);
        if (category !== undefined) updateData.category = String(category);
        if (imageUrl !== undefined) updateData.imageUrl = String(imageUrl);
        
        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({ message: 'No valid fields to update' });
        }
        
        const updatedProduct = await productService.updateProduct(id, updateData);
        
        if (!updatedProduct) {
            return res.status(404).json({ message: 'Product not found' });
        }
        
        res.status(200).json(updatedProduct);
    } catch (error) {
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
        res.status(500).json({ message: 'Error searching products', error: error instanceof Error ? error.message : 'Unknown error' });
    }
};
