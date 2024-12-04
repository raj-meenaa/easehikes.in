import express from "express";
import { protectRoute, adminRoute} from "../middleware/protectRoute.js";
import { login, logout, createCategory, getCategories, deleteCategory, getAllSeller, getAllShop, getAllUsers, getAllProducts, getAdminBookings, getAdminAnalytics, getAdminProfile, getAllBookings, updateCategory, getStores} from "../controllers/admin.controller.js";
import multer from 'multer';
const upload = multer({ storage: multer.memoryStorage() });
const router=express.Router();

router.post("/login", login);
router.post("/logout", logout);
router.post("/addcategory", protectRoute, adminRoute, upload.single('image'), createCategory);
router.get("/categories", getCategories);
router.get("/store", getStores);
router.put ("/updatecategory/:id", protectRoute, adminRoute, upload.single('image'), updateCategory);
router.delete("/deletecategory/:id", protectRoute, adminRoute, deleteCategory);
router.get("/sellers", protectRoute, adminRoute, getAllSeller);
router.get("/shops", protectRoute, adminRoute, getAllShop);
router.get("/users", protectRoute, adminRoute, getAllUsers);
router.get("/products", protectRoute, adminRoute, getAllProducts);
router.get("/orders", protectRoute, adminRoute, getAllBookings)
router.get("/bookings", protectRoute, adminRoute, getAdminBookings)
router.get('/analytics', protectRoute, adminRoute, getAdminAnalytics);
router.get('/profile', protectRoute, adminRoute, getAdminProfile);

export default router