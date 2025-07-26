import { Request, Response } from 'express';
import * as productService from '../services/product.service';
import { Product } from '../model/product.model';

// Get all products
export const getAllProducts = async (req: Request, res: Response) => {
    try {
        const products = productService.getAllProducts();
        res.status(200).json(products);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching products', error: error instanceof Error ? error.message : 'Unknown error' });
    }
};

// Get single product
export const getProduct = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({ message: 'Invalid product ID' });
        }
        
        const product = productService.getProductById(id);
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
        const { name, description, price, currency,stock, image } = req.body;
        
        // Basic validation
        if (!name || !description || price === undefined || !currency) {
            return res.status(400).json({ message: 'Missing required fields' });
        }
        
        const newProduct = productService.createProduct({
            name,
            description,
            price: parseFloat(price),
            currency,
            stock: stock,
            image: image || ''
        });
        
        res.status(201).json(newProduct);
    } catch (error) {
        res.status(500).json({ message: 'Error creating product', error: error instanceof Error ? error.message : 'Unknown error' });
    }
};

// Update product
export const updateProduct = async (req: Request, res: Response) => {
    try {
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({ message: 'Invalid product ID' });
        }
        
        const updateData = req.body;
        const updatedProduct = productService.updateProduct(id, updateData);
        
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
        const id = parseInt(req.params.id);
        if (isNaN(id)) {
            return res.status(400).json({ message: 'Invalid product ID' });
        }
        
        const isDeleted = productService.deleteProduct(id);
        
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
        
        const results = productService.searchProducts(q);
        res.status(200).json(results);
    } catch (error) {
        res.status(500).json({ message: 'Error searching products', error: error instanceof Error ? error.message : 'Unknown error' });
    }
};