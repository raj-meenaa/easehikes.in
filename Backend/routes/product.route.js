import { protectRoute } from "../middleware/protectRoute.js";
import express from "express";
import { registerProduct, getAllProduct, deleteProduct, getProductByCategory, getRecommendedProducts, getProductByStore, getProductById, updateProduct } from "../controllers/product.controller.js";
import multer from 'multer';
const upload = multer({ storage: multer.memoryStorage() });
const router=express.Router();
router.post("/add", protectRoute, upload.single('image'), registerProduct)
router.get("/allproduct", protectRoute, getAllProduct);
router.delete("/:id", protectRoute, deleteProduct);
router.get('/:category', getProductByCategory);
router.get('/shop/:store', getProductByStore);
router.get("/re/recommendations", getRecommendedProducts);
router.get("/item/:id", protectRoute, getProductById);
router.put('/:productId', protectRoute, upload.single('image'), updateProduct);

export default router;