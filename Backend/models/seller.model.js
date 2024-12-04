import mongoose from "mongoose";
const sellerSchema = new mongoose.Schema({
    shop_name: {
        type: String,
        required: true,
    },
    shop_number: {
        type: Number,
        required: true,
    },
    about: {
        type: String,
        required: true,
    },
    // logo: {
    //     type: String,
    //     // required: true,
    // },

    logo: {
        type: String,
		required: [true, "Logo is required"],
    },
    shop_image: {
        type: String,
        // required: true,
    },
    GSTIN: {
        type: String,
        required: true,
    },
    owner_name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        // required: true,
    },
    owner_number: {
        type: Number,
        required: true,
    },
    shop_address: {
        type: String,
        required: true,
    },
    shop_city: {
        type: String,
        required: true,
    },
    // domains: {
    //     type: String,
    //     required: true,
    // },
    products_listed: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
    total_orders: [{ type: mongoose.Schema.Types.ObjectId, ref: "Booking" }],
    pending_orders: [{ type: mongoose.Schema.Types.ObjectId, ref: "Booking" }],
    orders_delivered: [{ type: mongoose.Schema.Types.ObjectId, ref: "Booking" }],

    workingDays: [{
        type: String,
        required: true,
    }
    ],
    workingTime: {
        opening: {
            type: String,
            // required: true,
        },
        closing: {
            type: String,
            // required: true,
        }
    },


    // is_verified: {
    //     type: Boolean,
    //     required: true,
    //     default: false
    // },
    // is_Deleted: {
    //     type: Boolean,
    //     required: true,
    //     default: false
    // },


    createdAt: {
        type: Date,
        default: Date.now,
    },
});
const Seller=mongoose.model("Seller", sellerSchema);
export default Seller;
