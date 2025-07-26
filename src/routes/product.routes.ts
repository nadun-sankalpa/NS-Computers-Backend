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


productRouter.get("/get-all-products", getAllProducts);
productRouter.get("/search", searchProducts);
productRouter.get("/:id", getProduct);
productRouter.post("/save-product", saveProduct);
productRouter.put("/:id", updateProduct);
productRouter.delete("/:id", deleteProduct);

export default productRouter;