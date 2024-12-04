import mongoose from "mongoose";
var productcategorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String },
  image: {
			type: String,
			required: [true, "Image is required"],
		},
    products: [
    {
      quantity: {
        type: Number,
        default: 0,
      },
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    },
  ],
});

const ProductCategory = mongoose.model("ProductCategory", productcategorySchema);
export default ProductCategory;
