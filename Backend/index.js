import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from 'cors';
// import {v2 as cloudinary}  from "cloudinary"
import authRoutes from "./routes/auth.route.js"
import adminRoute from "./routes/admin.route.js"
import sellerRoute from "./routes/seller.route.js"
import userRoute from "./routes/user.route.js"
import productRoute from "./routes/product.route.js"
import bookingRoute from "./routes/booking.route.js"
import cartRoute from "./routes/cart.route.js"
import couponRoute from "./routes/coupon.route.js"
import paymentRoute from "./routes/payment.route.js"
import connectMongoDB from "./db/connectMongoDB.js";
dotenv.config();
// cloudinary.config({
//     cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//     api_key: process.env.CLOUDINARY_API_KEY,
//     api_secret: process.env.CLOUDINARY_API_SECRET
// });
const app=express();
const PORT=process.env.PORT
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cookieParser());
app.use(cors({
    origin:['http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:5175',
    ],
    credentials: true, // If you are dealing with cookies
  }));


app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoute);
app.use("/api/seller", sellerRoute);
app.use("/api/product", productRoute);
app.use("/api/user", bookingRoute);
app.use("/api/cart", cartRoute);
app.use("/api/coupons", couponRoute);
app.use("/api/payments", paymentRoute);
app.use("/api/order", userRoute);

app.listen(PORT, ()=>{
    console.log(`Your app is running on port: ${PORT}`);
    connectMongoDB();
})

