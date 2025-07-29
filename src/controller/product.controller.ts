// src/controller/product.controller.ts
import { Request, Response } from 'express';
import { productService } from '../services/product.service';
import { IProduct } from '../models/product.model';
// Assuming ProductData interface is available in a shared location or redefined here
// For simplicity, I'll define a minimal ProductData type here for transformation
interface ProductDataForFrontend {
    id: string;
    name: string;
    image: string;
    rating: number;
    specs: string[];
    price: number;
    originalPrice?: number;
    currency: string;
    isOnSale: boolean;
    description?: string; // Added description
    stock?: number; // Added stock
    category?: string; // Added category
}

// Get all products
export const getAllProducts = async (req: Request, res: Response) => {
    try {
        const products = await productService.getAllProducts();

        // Transform IProduct documents to ProductData format for the frontend
        const transformedProducts: ProductDataForFrontend[] = products.map(p => ({
            id: p._id.toString(), // Convert MongoDB ObjectId to string for frontend
            name: p.name,
            image: p.imageUrl || 'default-product.png', // Use imageUrl from DB, or a default placeholder
            rating: p.rating !== undefined ? p.rating : 0, // Default to 0 if not set in DB
            specs: p.specs || [], // Default to empty array if not set in DB
            price: p.price,
            originalPrice: p.originalPrice, // Will be undefined if not set or not on sale
            currency: p.currency || "LKR", // Default currency
            isOnSale: p.isOnSale !== undefined ? p.isOnSale : false, // Default to false if not set
            description: p.description, // Include description
            stock: p.stock, // Include stock
            category: p.category, // Include category
        }));

        res.status(200).json(transformedProducts);
    } catch (error) {
        console.error('Error fetching products:', error);
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

        // Transform single product for frontend
        const transformedProduct: ProductDataForFrontend = {
            id: product._id.toString(),
            name: product.name,
            image: product.imageUrl || 'default-product.png',
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
        const { name, description, price, stock, category, imageUrl, rating, specs, currency, isOnSale, originalPrice } = req.body;

        // Basic validation
        if (!name || !description || price === undefined || !category) {
            return res.status(400).json({
                message: 'Missing required fields',
                required: ['name', 'description', 'price', 'category']
            });
        }

        // Create a plain object that matches the expected type for ProductService
        const productData: Partial<IProduct> = { // Use Partial<IProduct> to allow for optional fields
            name: String(name),
            description: String(description),
            price: parseFloat(String(price)),
            stock: stock ? parseInt(String(stock), 10) : 0,
            category: String(category),
            imageUrl: imageUrl ? String(imageUrl) : undefined, // imageUrl can be optional
            rating: rating !== undefined ? parseFloat(String(rating)) : undefined,
            specs: specs && Array.isArray(specs) ? specs.map(String) : undefined,
            currency: currency ? String(currency) : undefined,
            isOnSale: isOnSale !== undefined ? Boolean(isOnSale) : undefined,
            originalPrice: originalPrice !== undefined ? parseFloat(String(originalPrice)) : undefined,
        };

        const newProduct = await productService.createProduct(productData as any); // Cast to any due to Partial<IProduct>

        res.status(201).json(newProduct);
    } catch (error) {
        console.error('Error creating product:', error);
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

        const { name, description, price, stock, category, imageUrl, rating, specs, currency, isOnSale, originalPrice } = req.body;

        // Create a plain object with only the provided fields
        const updateData: Partial<IProduct> = {};

        if (name !== undefined) updateData.name = String(name);
        if (description !== undefined) updateData.description = String(description);
        if (price !== undefined) updateData.price = parseFloat(String(price));
        if (stock !== undefined) updateData.stock = parseInt(String(stock), 10);
        if (category !== undefined) updateData.category = String(category);
        if (imageUrl !== undefined) updateData.imageUrl = String(imageUrl);
        if (rating !== undefined) updateData.rating = parseFloat(String(rating));
        if (specs !== undefined && Array.isArray(specs)) updateData.specs = specs.map(String);
        if (currency !== undefined) updateData.currency = String(currency);
        if (isOnSale !== undefined) updateData.isOnSale = Boolean(isOnSale);
        if (originalPrice !== undefined) updateData.originalPrice = parseFloat(String(originalPrice));

        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({ message: 'No valid fields to update' });
        }

        const updatedProduct = await productService.updateProduct(id, updateData);

        if (!updatedProduct) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.status(200).json(updatedProduct);
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
