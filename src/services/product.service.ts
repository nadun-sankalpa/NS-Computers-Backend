import { Product } from "../model/product.model";
import { productList } from "../db/db";

// Generate a new product ID
const generateId = (): number => {
    if (productList.length === 0) return 1;
    const maxId = Math.max(...productList.map(p => p.id));
    return maxId + 1;
};

// Get all products
const getAllProducts = (): Product[] => {
    return productList;
};

// Get a single product by ID
const getProductById = (id: number): Product | undefined => {
    return productList.find(product => product.id === id);
};

// Create a new product
const createProduct = (productData: Omit<Product, 'id'>): Product => {
    const newProduct: Product = {
        id: generateId(),
        ...productData,
        createdAt: new Date(),
        updatedAt: new Date()
    };
    productList.push(newProduct);
    return newProduct;
};

// Update an existing product
const updateProduct = (id: number, productData: Partial<Omit<Product, 'id'>>): Product | null => {
    const productIndex = productList.findIndex(p => p.id === id);
    
    if (productIndex === -1) return null;
    
    const updatedProduct = {
        ...productList[productIndex],
        ...productData,
        id, // Ensure ID remains unchanged
        updatedAt: new Date()
    };
    
    productList[productIndex] = updatedProduct;
    return updatedProduct;
};

// Delete a product
const deleteProduct = (id: number): boolean => {
    const initialLength = productList.length;
    const filteredProducts = productList.filter(product => product.id !== id);
    
    if (filteredProducts.length < initialLength) {
        // Clear the array and push the filtered products
        productList.length = 0;
        productList.push(...filteredProducts);
        return true;
    }
    
    return false;
};

// Search products by name or description
const searchProducts = (query: string): Product[] => {
    const searchTerm = query.toLowerCase();
    return productList.filter(
        product => 
            product.name.toLowerCase().includes(searchTerm) ||
            (product.description && product.description.toLowerCase().includes(searchTerm))
    );
};

// Export all functions as named exports
export {
    getAllProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
    searchProducts
};