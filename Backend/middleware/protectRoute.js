import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
export const protectRoute=async (req, res, next)=>{
    try {
        const token=req.cookies.jwt || req.headers.authorization?.replace('Bearer ', '');;
        if(!token){
            return res.status(401).json({error: "Unauthorized: No token provided."});
        }
        // const JWT_SECRET=process.env.JWT_SECRET || "secret123"
        const decoded=jwt.verify(token, process.env.JWT_SECRET || "secret123");
        if(!decoded){
            return res.status(401).json({error:"Unauthorized: Invalid token."});
        }

        const user=await User.findById(decoded.userId).select("-password");
        if(!user){
            return res.status(400).json({error:"User not found."});
        }

        req.user=user;
        next();
    } catch (error) {
        console.log("error in  Middleware", error.message);
        return res.status(500).json({error:"Internal server error."});
    }
}

export const adminRoute = (req, res, next) => {
	if (req.user && req.user.role === "admin") {
		next();
	} else {
		return res.status(403).json({ message: "Access denied - Admin only" });
	}
};

export const sellerRoute = (req, res, next) => {
	if (req.user && req.user.role === "seller") {
		next();
	} else {
		return res.status(403).json({ message: "Access denied - Seller only" });
	}
};