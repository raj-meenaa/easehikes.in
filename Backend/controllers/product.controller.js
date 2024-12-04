import User from "../models/user.model.js";
import Product from "../models/product.model.js";
import cloudinary from "../lib/utils/cloudinary.js";

import Seller from "../models/seller.model.js";
import ProductCategory from "../models/productCategory.model.js";


export const registerProduct = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user)
      return res.status(404).json({ error: "User not found by this email" });

    const seller = await Seller.findOne({
      _id: user.sellerId,
    });
    if (!seller) return res.status(400).json({ error: "Invalid Action" });

    const productBody = req.body;
    if (!req.file) {
      return res.status(400).json({ error: "Image is required." });
    }

    const file = req.file.buffer;
    const cloudinaryResponse = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: "products" },
        (error, result) => {
          if (error) {
            return reject(error);
          }
          resolve(result);
        }
      );
      stream.end(file);
    });

    const category = await ProductCategory.findById(productBody.categoryId);
    
    if (!category)
      return res.status(400).json({ error: "Invalid CategoryId." });

    // Validate other product fields
    if (!productBody.name)
      return res.status(400).json({ error: "Product name is required." });
    if (!productBody.rent)
      return res.status(400).json({ error: "Rent is required." });
    if (!productBody.description)
      return res.status(400).json({ error: "Product Description is required." });
    if (!productBody.securityDeposit)
      return res.status(400).json({ error: "Security Deposit is required." });
    if (!productBody.stock)
      return res.status(400).json({ error: "Product Stock is required." });

    // Create the new product
    const newProduct = await Product.create({
      name: productBody.name,
      category: productBody.categoryId,
      rent: productBody.rent,
      securityDeposit: productBody.securityDeposit,
      description: productBody.description,
      stock: productBody.stock,
      seller: user.sellerId,
      image: cloudinaryResponse?.secure_url,
    });

    if (newProduct) {
      seller.products_listed.push(newProduct._id);
      await seller.save({ validateBeforeSave: false });
    }

    category.products.push({
      product: newProduct._id,
      quantity: newProduct.stock,
    });
    await category.save({ validateBeforeSave: false });

    res.status(201).json({
      success: true,
      newProduct,
      message: "New Product Added",
    });
  } catch (error) {
    console.log("Error in registerProduct controller :", error.message);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ error: "User not found by this email" });

    const seller = await Seller.findOne({ _id: user.sellerId });
    if (!seller) return res.status(400).json({ error: "Invalid Action" });

    const productId = req.params.productId;
    const productUpdates = req.body;

    const product = await Product.findOne({
      _id: productId,
      seller: user.sellerId,
    });
    if (!product) return res.status(404).json({ error: "Product not found or you don't have permission to update it." });

    // Update fields only if they're provided in the request
    product.name = productUpdates.name || product.name;
    product.rent = productUpdates.rent || product.rent;
    product.securityDeposit = productUpdates.securityDeposit || product.securityDeposit;
    product.description = productUpdates.description || product.description;
    product.stock = productUpdates.stock || product.stock;
    
    // Update category if provided and different
    if (productUpdates.categoryId && productUpdates.categoryId !== product.category.toString()) {
      const newCategory = await ProductCategory.findById(productUpdates.categoryId);
      if (!newCategory) return res.status(400).json({ error: "Invalid CategoryId." });

      const oldCategory = await ProductCategory.findById(product.category);
      if (oldCategory) {
        oldCategory.products = oldCategory.products.filter(
          (item) => item.product.toString() !== product._id.toString()
        );
        await oldCategory.save({ validateBeforeSave: false });
      }

      product.category = productUpdates.categoryId;
      newCategory.products.push({ product: product._id, quantity: product.stock });
      await newCategory.save({ validateBeforeSave: false });
    }

    // Handle image update if new image is uploaded
    if (req.file) {
      const file = req.file.buffer;

      // Delete old image from Cloudinary
      const publicId = product.image.match(/\/([^\/]*)$/)[1].split('.')[0];
      await cloudinary.uploader.destroy(`products/${publicId}`);

      // Upload new image to Cloudinary
      const cloudinaryResponse = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "products" },
          (error, result) => {
            if (error) {
              return reject(error);
            }
            resolve(result);
          }
        );
        stream.end(file);
      });
      
      product.image = cloudinaryResponse.secure_url;
    }

    // Save updated product
    await product.save();

    res.status(200).json({
      success: true,
      product,
      message: "Product updated successfully",
    });
  } catch (error) {
    console.error("Error in updateProduct controller:", error.message);
    return res.status(500).json({ error: "Internal server error" });
  }
};


export const getAllProduct = async (req, res) => {
  try {
    let products;
    if (req.user.role === "seller") {
      // If the user is a seller, get only the products uploaded by the seller
      products = await Product.find({ seller: req.user.sellerId })
        .sort({ createdAt: -1 })
        .populate({ path: "seller category", select: "-password"});
    } else {
      // If the user is an admin or a user, get all products
      products = await Product.find()
        .sort({ createdAt: -1 }).populate({ path: "seller", select: "-password" });
    }
    res.status(200).json(products);
  } catch (error) {
    console.log("Error in getAllProduct controller:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};



export const deleteProduct = async (req, res) => {
  try {
    // Find the product by ID
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: "Product not found." });
    }

    // Delete image from Cloudinary if it exists
    if (product.image) {
      const publicId = product.image.split("/").pop().split(".")[0];
      try {
        await cloudinary.uploader.destroy(`products/${publicId}`);
      } catch (error) {
        console.log("Error deleting image from Cloudinary:", error);
      }
    }

    // Find the user and check if they are the seller or an admin
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    const isSeller = product.seller.toString() === user.sellerId?.toString();
    const isAdmin = req.user.role === "admin";

    if (!isSeller && !isAdmin) {
      return res
        .status(401)
        .json({ error: "You are not authorized to delete this product." });
    }

    // Find the seller and category associated with the product
    const seller = await Seller.findById(product.seller);
    const category = await ProductCategory.findById(product.category);

    if (seller) {
      // Remove the product from the seller's products_listed array
      seller.products_listed = seller.products_listed.filter(
        (id) => id.toString() !== product._id.toString()
      );
      await seller.save({ validateBeforeSave: false });
    }

    if (category) {
      // Remove the product from the category's products array
      category.products = category.products.filter(
        (prod) => prod.product.toString() !== product._id.toString()
      );
      await category.save({ validateBeforeSave: false });
    }

    
    

    // Delete the product from the database
    await Product.findByIdAndDelete(req.params.id);

    return res.status(200).json({ message: "Product deleted successfully." });
  } catch (error) {
    console.log("Error in deleteProduct controller:", error.message);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};


export const getProductByCategory = async (req, res) => {
  try {
    const categoryName = req.params.category;

    // Check if category exists by name
    const categoryExists = await ProductCategory.findOne({ name: categoryName });

    if (!categoryExists) {
      return res.status(404).json({ error: "Category not found." });
    }

    // Find products based on category name (populate category if necessary)
    const products = await Product.find({ category: categoryExists._id }).populate("category").populate("seller");
    const productCount = products.length;

    // Return the response with product count and products
    res.status(200).json({
      success: true,
      productCount,
      products,
    });
  } catch (error) {
    // Handle any errors that occur
    console.log("Error in getProductByCategory controller:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getProductByStore = async (req, res) => {
  try {
    const storeName = req.params.store;

    // Check if category exists by name
    const storeExists = await Seller.findOne({ shop_name: storeName });

    if (!storeExists) {
      return res.status(404).json({ error: "Store not found." });
    }

    // Find products based on store name (populate category if necessary)
    const products = await Product.find({ seller: storeExists._id }).populate("seller");
    const productCount = products.length;

    // Return the response with product count and products
    res.status(200).json({
      success: true,
      productCount,
      products,
    });
  } catch (error) {
    // Handle any errors that occur
    console.log("Error in getProductByStore controller:", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// export const getFeaturedProducts = async (req, res) => {
// 	try {
// 		let featuredProducts = await redis.get("featured_products");
// 		if (featuredProducts) {
// 			return res.json(JSON.parse(featuredProducts));
// 		}

// 		// if not in redis, fetch from mongodb
// 		// .lean() is gonna return a plain javascript object instead of a mongodb document
// 		// which is good for performance
// 		featuredProducts = await Product.find({ isFeatured: true }).lean();

// 		if (!featuredProducts) {
// 			return res.status(404).json({ message: "No featured products found" });
// 		}

// 		// store in redis for future quick access

// 		await redis.set("featured_products", JSON.stringify(featuredProducts));

// 		res.json(featuredProducts);
// 	} catch (error) {
// 		console.log("Error in getFeaturedProducts controller", error.message);
// 		res.status(500).json({ message: "Server error", error: error.message });
// 	}
// };

export const getProductById = async (req, res) => {
  try {
    // Find the product by ID
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: "Product not found." });
    }
    return res.status(200).json({product});
  } catch (error) {
    console.log("Error in getProductById controller:", error.message);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};




export const getRecommendedProducts = async (req, res) => {
	try {
		const products = await Product.aggregate([
			{
				$sample: { size: 4 },
			},
			{
				$project: {
					_id: 1,
					name: 1,
					description: 1,
					image: 1,
					rent: 1,
				},
			},
		]);

		res.status(200).json({ success: true, products });
	} catch (error) {
		console.log("Error in getRecommendedProducts controller", error.message);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};


