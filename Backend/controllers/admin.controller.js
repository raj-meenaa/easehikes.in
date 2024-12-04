import User from "../models/user.model.js";
import ProductCategory from "../models/productCategory.model.js";
import Seller from "../models/seller.model.js";
import Product from "../models/product.model.js";
import bcrypt from "bcrypt";
import Booking from "../models/booking.model.js";
import cloudinary from "../lib/utils/cloudinary.js";
import { generateTokenAndSetCookie } from "../lib/utils/generateToken.js";


// Here goes authentication part.
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    if(user.role!="admin"){
        return res.status(400).json({error: "Invalid credential."});
    }
    const isPasswordCorrect = await bcrypt.compare(password, user?.password || "");
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


// Here goes category part 
export const createCategory = async (req, res) => {
  try {
    const user=await User.findById(req.user.id);
    if(!user){
      return res.status(404).json({error:"User not found"});
    }
    if(user.role !== 'admin'){
      return res.status(400).json({error: "Invalid action"});
    }
    const { name, description} = req.body;
    if (!req.file) {
      return res.status(400).json({ error: "Image is required." });
    }
    let cloudinaryResponse = null;
		const file = req.file.buffer;
    cloudinaryResponse = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream({ folder: "category" }, (error, result) => {
        if (error) {
          return reject(error);
        }
        resolve(result);
      });
      stream.end(file);
    });
    const category = new ProductCategory({ name, description, image:cloudinaryResponse?.secure_url});
    await category.save();
    res.status(201).json({ success: true, category });
  } catch (error) {
    console.log("Error in createCategory controller :", error.message);
    res.status(500).json({ error: "Internal Server error." });
  }
};



export const getCategories = async (req, res) => {
  try {
    const categories = await ProductCategory.find();
    const categoriesWithCounts = categories.map(category => ({
      _id: category._id,
      name: category.name,
      description: category.description,
      image: category.image,
      productCount: category.products.length // Count of products in the array
    }));
    res.status(200).json({ success: true, categories:categoriesWithCounts });
  } catch (error) {
    console.log("Error in getCategories controller ", error.message);
    res.status(500).json({ error: "Internal Server error." });
  }
};


export const updateCategory = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    if (user.role !== "admin") {
      return res.status(400).json({ error: "Invalid action" });
    }

    const { name, description } = req.body;
    const categoryId = req.params.id;

    // Find the category by ID
    const category = await ProductCategory.findById(categoryId);
    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }

    // Update name and description if provided
    if (name) {
      category.name = name;
    }
    if (description) {
      category.description = description;
    }

    // Check if an image is provided in the request
    if (req.file) {
      const file = req.file.buffer;

      // Optional: delete the old image from Cloudinary before uploading the new one
      const publicId = category.image.split("/").pop().split(".")[0];
      await cloudinary.uploader.destroy(`category/${publicId}`);

      // Upload the new image to Cloudinary
      let cloudinaryResponse = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "category" },
          (error, result) => {
            if (error) {
              return reject(error);
            }
            resolve(result);
          }
        );
        stream.end(file);
      });

      // Update the image URL in the category
      category.image = cloudinaryResponse?.secure_url;
    }

    // Save the updated category
    await category.save();

    res.status(200).json({ success: true, category });
  } catch (error) {
    console.log("Error in updateCategory controller:", error.message);
    res.status(500).json({ error: "Internal Server error." });
  }
};


export const deleteCategory=async(req, res)=>{
  try {
    const category=await ProductCategory.findById(req.params.id);
    if(!category){
      return res.status(404).json({error: "Category not found."});
    }
    const user=await User.findById(req.user.id);
    if(!user){
      return res.status(404).json({error:"User not found."})
    }
    if(user.role !== 'admin'){
      return res.status(401).json({error: "Invalid action."});
    }
    if (category.image) {
			const publicId = category.image.split("/").pop().split(".")[0];
			try {
				await cloudinary.uploader.destroy(`category/${publicId}`);
			} catch (error) {
				console.log("error deleting image from cloduinary", error);
			}
		}
    await ProductCategory.findByIdAndDelete(req.params.id);
    return res.status(200).json({message: "Category deleted successfully."})
    
  } catch (error) {
    console.log("Error in deleteCategory controller: ", error.message);
    return res.status(500).json({error: "Internal server error."})
  }
 }

// Here goes Homepage handling part but not decided yet

export const getAllSeller = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: "Unauthorized User" });
    }
    if (user.role !== 'admin') {
      return res.status(400).json({ error: "Invalid action" });
    }

    const sellers = await User.find({ role: 'seller' });
    const sellerCount = sellers.length;

    res.status(200).json({
      success: true,
      sellerCount,
      sellers,
    });
  } catch (error) {
    console.log("Error in getAllSeller controller ", error.message);
    return res.status(500).json({ error: "Internal server error." });
  }
};



export const getAllShop = async (req, res) => {
  try {
    const user=await User.findById(req.user.id);
    if(!user){
      return res.status(404).json({error:"Unauthorized"});
    }
    if(user.role !== 'admin'){
      return res.status(400).json({error: "Invalid action"});
    }
    const shop=await Seller.find();
    const shopCount=shop.length;
    res.status(200).json({
      success: true,
      shopCount,
      shop,
    });
  } catch (error) {
    console.log("Error in getAllShop controller ", error.message);
    return res.status(500).json({error: "Intenal server error."})
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: "Unauthorized User" });
    }
    if (user.role !== 'admin') {
      return res.status(400).json({ error: "Invalid action" });
    }
    const users = await User.find();
    const userCount = users.length;
    res.status(200).json({
      success: true,
      userCount,
      users,
    });
  } catch (error) {
    console.log("Error in getAllUsers controller ", error.message);
    return res.status(500).json({error: "Internal server error."});
  }
};

//get all products controller made in products also that work very seamlessly for both seller and other user
export const getAllProducts = async (req, res) => {
  try {
    const products=await Product.find().populate('category');
    const productCount=products.length; 
    res.status(200).json({
      success: true,
      productCount,
      products,
    });
  } catch (error) {
    console.log("Error in getAllProducts controller ", error.message);
    return res.status(500).json({error: "Internal server error."});
  }
};

export const getAllBookings = async (req, res) => {
  try {
    const bookings=await Booking.find().populate('product');
    const bookingCount=bookings.length; 
    res.status(200).json({
      success: true,
      bookingCount,
      bookings,
    });
  } catch (error) {
    console.log("Error in getAllBookings controller ", error.message);
    return res.status(500).json({error: "Internal server error."});
  }
};

export const getAdminBookings = async (req, res) => {
  const userId = req.user._id;

  try {
    const user = await User.findById(userId);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized access.' });
    }

    const { filter } = req.query;
    let query = {};

    if (filter === 'completed') {
      query = { status: 'completed' };
    }

    const bookings = await Booking.find(query).sort({ startDate: 1 }).populate('product user');

    res.status(200).json({ success: true, bookings });
  } catch (error) {
    console.log('Error in getAdminBookings:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const getAdminAnalytics = async (req, res) => {
  try {
    const totalOrders = await Booking.countDocuments();
    const totalProducts = await Product.countDocuments();
    const totalSellers = await User.countDocuments({ role: 'seller' });
    const totalUsers = await User.countDocuments({ role: 'user' });

    res.json({
      totalOrders,
      totalProducts,
      totalSellers,
      totalUsers,
    });
  } catch (error) {
    console.error('Error fetching analytics data:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

export const getAdminProfile = async (req, res) => {
  try {
    const admin = await User.findById(req.user._id).select('-password');
    if (!admin) {
      return res.status(404).json({ error: 'Admin not found' });
    }
    res.json(admin);
  } catch (error) {
    console.error('Error fetching admin profile:', error.message);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};


export const getStores = async (req, res) => {
  try {
    const sellers = await Seller.find();
    const storesWithCounts = sellers.map(seller => ({
      _id: seller._id,
      owner:seller.owner_name,
      shopname: seller.shop_name,
      description: seller.about,
      image: seller.image,
      productListed: seller.products_listed.length // Count of products in the array
    }));
    res.status(200).json({ success: true, stores:storesWithCounts });
  } catch (error) {
    console.log("Error in getStores controller ", error.message);
    res.status(500).json({ error: "Internal Server error." });
  }
};