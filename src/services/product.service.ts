import { Product, IProduct } from '../models/product.model';
import { FilterQuery, UpdateQuery } from 'mongoose';

class ProductService {
    /**
     * Get all products with optional filtering
     */
    async getAllProducts(filter: FilterQuery<IProduct> = {}): Promise<IProduct[]> {
        try {
            return await Product.find(filter).sort({ createdAt: -1 });
        } catch (error) {
            throw new Error('Error fetching products');
        }
    }

    /**
     * Get a single product by ID
     */
    async getProductById(id: string): Promise<IProduct | null> {
        try {
            return await Product.findById(id);
        } catch (error) {
            throw new Error('Product not found');
        }
    }

    /**
     * Create a new product
     */
    async createProduct(productData: {
        name: string;
        description: string;
        price: number;
        stock: number;
        category: string;
        imageUrl?: string;
    }): Promise<IProduct> {
        try {
            const product = new Product(productData);
            return await product.save();
        } catch (error) {
            throw new Error('Error creating product');
        }
    }

    /**
     * Update an existing product
     */
    async updateProduct(
        id: string, 
        updateData: UpdateQuery<IProduct>
    ): Promise<IProduct | null> {
        try {
            return await Product.findByIdAndUpdate(
                id, 
                updateData, 
                { new: true, runValidators: true }
            );
        } catch (error) {
            throw new Error('Error updating product');
        }
    }

    /**
     * Delete a product
     */
    async deleteProduct(id: string): Promise<boolean> {
        try {
            const result = await Product.findByIdAndDelete(id);
            return result !== null;
        } catch (error) {
            throw new Error('Error deleting product');
        }
    }

    /**
     * Search products by name or description
     */
    async searchProducts(query: string): Promise<IProduct[]> {
        try {
            return await Product.find({
                $or: [
                    { name: { $regex: query, $options: 'i' } },
                    { description: { $regex: query, $options: 'i' } }
                ]
            });
        } catch (error) {
            throw new Error('Error searching products');
        }
    }
}

// Export a singleton instance
export const productService = new ProductService();