import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ProductCategory',
    required: true,
  },
  rent: {
    type: Number,
    required: [true, "Please enter product rent"],
    maxLength: [8, "Rent cannot exceed 8 characters"],
  },
  securityDeposit: {
    type: Number,
    required: [true, "Please enter product security deposit"],
    maxLength: [8, "Security deposit cannot exceed 8 characters"],
  },
  rentDay: [
    {
      day: {
        type: Number,
      },
      rent: {
        type: Number,
      },
    },
  ],
  bookedSlot: [
    {
      from: {
        type: Date,
        required: true,
      },
      to: {
        type: Date,
        required: true,
      },
      qty: {
        type: Number,
        required: true,
      },
      orderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Order",
        required: true,
      },
    },
  ],
  description: {
    type: String,
    required: [true, "Please enter product description"],
  },
  
  image: {
			type: String,
			required: [true, "Image is required"],
		},
  stock: {
    type: Number,
    required: [true, "Please enter product stock"],
    min: [0, "Stock cannot be less than 0"],
    maxLength: [4, "Stock cannot exceed 4 characters"],
    default: 1,
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Seller",
    required: true,
  },
  is_verified: {
    type: Boolean,
    required: true,
    default: false,
  },
  is_Deleted: {
    type: Boolean,
    required: true,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Product = mongoose.model("Product", productSchema);
export default Product;
