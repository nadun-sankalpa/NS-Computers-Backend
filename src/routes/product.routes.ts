import { Router } from "express";
import {
    deleteProduct,
    getAllProducts,
    getProduct,
    saveProduct,
    updateProduct,
    searchProducts
} from "../controller/product.controller";

const productRouter: Router = Router();

// Get all products
productRouter.get("/get-all-products", getAllProducts);

// Search products
productRouter.get("/search", searchProducts);

// Get single product by ID
productRouter.get("/:id", getProduct);

// Create new product
productRouter.post("/save-product", saveProduct);

// Update product
productRouter.put("/:id", updateProduct);

// Delete product
productRouter.delete("/:id", deleteProduct);

export default productRouter;