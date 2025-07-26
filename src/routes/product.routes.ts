import {Router} from "express";
import {deleteProduct, getAllProducts, getProduct, saveProduct, updateProduct} from "../controller/product.controller";

const productRouter: Router = Router();

productRouter.get("/all", getAllProducts);
productRouter.post("/save", saveProduct);
productRouter.get("/:id", getProduct);
productRouter.put("/update/:id", updateProduct);
productRouter.delete("/delete/:id", deleteProduct);

export default productRouter;