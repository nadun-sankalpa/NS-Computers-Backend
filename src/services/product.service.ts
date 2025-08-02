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
    async getProductById(id: string | number): Promise<IProduct | null> {
        try {
            // Convert string ID to number if needed
            const productId = typeof id === 'string' ? parseInt(id, 10) : id;
            return await Product.findById(productId);
        } catch (error) {
            console.error('Error in getProductById:', error);
            throw new Error('Error finding product');
        }
    }

    /**
     * Create a new product
     */
    async createProduct(productData: Partial<IProduct>): Promise<IProduct> { // Changed type to Partial<IProduct>
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
        id: string | number,
        updateData: UpdateQuery<IProduct>
    ): Promise<IProduct | null> {
        try {
            // Convert string ID to number if needed
            const productId = typeof id === 'string' ? parseInt(id, 10) : id;
            return await Product.findByIdAndUpdate(
                productId,
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
    async deleteProduct(id: string | number): Promise<boolean> {
        try {
            // Convert string ID to number if needed
            const productId = typeof id === 'string' ? parseInt(id, 10) : id;
            const result = await Product.findByIdAndDelete(productId);
            return !!result;
        } catch (error) {
            console.error('Error in deleteProduct:', error);
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
