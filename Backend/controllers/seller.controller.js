import User from "../models/user.model.js";
import Seller from "../models/seller.model.js";
import bcrypt from "bcrypt";
import Booking from "../models/booking.model.js";
import Product from "../models/product.model.js";
import cloudinary from "../lib/utils/cloudinary.js";
import { generateTokenAndSetCookie } from "../lib/utils/generateToken.js";


export const registerSeller = async (req, res) => {
  const sellerDetail = req.body;
  const user = await User.findById(req.user.id);
  
  if (!user) return res.status(400).json({ error: "User not found." });
  if (user.sellerId) {
    return res.status(400).json({ error: "You are already seller" });
  }

  if (!req.file) {
    return res.status(400).json({ error: "Logo is required." });
  }

  const file = req.file.buffer;
  const cloudinaryResponse = await new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "stores" },
      (error, result) => {
        if (error) {
          return reject(error);
        }
        resolve(result);
      }
    );
    stream.end(file);
  });

  if (!sellerDetail.shop_name)
    return res.status(400).json({ error: "Shop Name is Required" });
  if (!sellerDetail.shop_number)
    return res.status(400).json({ error: "Shop number is Required" });

  if (!sellerDetail.about)
    return res.status(400).json({ error: "Shop About is Required" });

  if (!sellerDetail.GSTIN)
    return res.status(400).json({ error: "GSTIN is Required" });

  if (!sellerDetail.owner_name)
    return res.status(400).json({ error: "Owner Name is Required" });

  if (!sellerDetail.owner_number)
    return res.status(400).json({ error: "Owner Number is Required" });

  if (!sellerDetail.shop_address)
    return res.status(400).json({ error: "Shop Address is Required" });

  if (!sellerDetail.shop_city)
    return res.status(400).json({ error: "shop City is Required" });

  if (!sellerDetail.opening)
    return res.status(400).json({ error: "Opening Time is Required" });

  if (!sellerDetail.closing)
    return res.status(400).json({ error: "Closing Time is Required" });

  if (sellerDetail.workingDays < 1)
    return res.status(400).json({ error: "Working Days is Required" });

  // if (!sellerDetail.domains)
  //   return res.status(400).json({error: "Domains is Required"})

  if (sellerDetail.shop_number.toString().length !== 10)
    return res.status(400).json({ error: "Invalid Shop Number" });

  if (sellerDetail.owner_number.toString().length !== 10)
    return res.status(400).json({ error: "Invalid Owner Number" });

  // let workingDays = JSON.parse(sellerDetail.workingDays)

  const newSeller = await Seller.create({
    shop_name: sellerDetail.shop_name,
    shop_number: sellerDetail.shop_number,
    about: sellerDetail.about,
    GSTIN: sellerDetail.GSTIN,
    owner_name: sellerDetail.owner_name,
    owner_number: sellerDetail.owner_number,
    shop_address: sellerDetail.shop_address,
    shop_city: sellerDetail.shop_city,
    domains: sellerDetail.domains,
    workingDays: sellerDetail.workingDays,
    workingTime: {
      opening: sellerDetail.opening,
      closing: sellerDetail.closing,
    },
    logo: cloudinaryResponse?.secure_url,
  });

  // await user.address.push(newAddress._id)
  user.sellerId = newSeller._id;
  user.role = "seller";
  await user.save();

  res.status(201).json({
    success: true,
    // newSeller,
    message: "Request has been send",
  });
};

export const getSellerBookings = async (req, res) => {
  try {
    const user = req.user;
    const products = await Product.find({ seller: user.sellerId });
    if (!products || products.length === 0) {
      return res
        .status(404)
        .json({ error: "No products found for this seller" });
    }

    const productIds = products.map((product) => product._id);

    // Fetch bookings for the seller's products
    const bookings = await Booking.find({ product: { $in: productIds } })
      .populate({ path: 'product user', select: '-password -cart' })
      .sort({ startDate: 1 }); // Sort by nearest booking date

    res.status(200).json({ success: true, bookings });
  } catch (error) {
    console.log("Error in getSellerBookings:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "Seller not found" });
    }
    if (user.role != "seller") {
      return res.status(400).json({ error: "Invalid credential." });
    }
    const isPasswordCorrect = await bcrypt.compare(
      password,
      user?.password || ""
    );
    if (!user || !isPasswordCorrect) {
      return res.status(400).json({ error: "Incorrect email and Password." });
    }
    const token=generateTokenAndSetCookie(user._id, res);
    return res.status(201).json({
      _id: user._id,
      fullname: user.fullName,
      email: user.email,
      number: user.number,
      avatar: user.avatar,
      cart: user.cart,
      role: user.role,
      token,
    });
  } catch (error) {
    console.log("Error in admin login controller :", error.message);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const logout = async (req, res) => {
  try {
    res.cookie("jwt", "", { maxAge: 0 });
    res.status(200).json({ message: "Logged out successfully." });
  } catch (error) {
    console.log("error in logout controller", error.message);
    return res.status(500).json({ error: "Internal server error." });
  }
};

