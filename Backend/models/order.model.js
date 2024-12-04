import mongoose from "mongoose";
const orderSchema = new mongoose.Schema({
    // shippingInfo: {
    //     name: {
    //         type: String,
    //         required: true,
    //     },
    //     houseNo: {
    //         type: String,
    //         required: true,
    //     },
    //     address: {
    //         type: String,
    //         required: true,
    //     },
    //     landMark: {
    //         type: String,
    //         required: true,
    //     },
    //     city: {
    //         type: String,
    //         required: true,
    //     },

    //     state: {
    //         type: String,
    //         required: true,
    //     },
    //     pinCode: {
    //         type: Number,
    //         required: true,
    //     },
    //     number: {
    //         type: Number,
    //         required: true,
    //     },
    // },
    orderItems: [
        {
            name: {
                type: String,
                required: true,
            },
            rent: {
                type: Number,
                required: true,
            },
            mrp: {
                type: Number,
                required: true,
            },
            quantity: {
                type: Number,
                required: true,
            },
            image: {
                type: String,
            },
            colour: {
                type: String,
                required: true,
            },
            securityDeposit: {
                type: String,
                required: true,
            },
            size: {
                type: String,
                required: true,
            },
           
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Product",
                required: true,
            },
            startingDate: {
                type: String,
                required: true,
                default: 0,
            },
            endingDate: {
                type: String,
                required: true,
                default: 0,
            },
            seller: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Seller",
                required: true,
            },
            orderStatus: {
                type: String,
                required: true,
                default: "orderconfirmed",
                // enum: [
                //     "orderconfirmed",
                //     "shipped",
                //     "outofdelivery",
                //     "delivered",
                //     "cancelled",
                // ],
            },
            sellerStatus: {
                type: String,
                required: true,
                default: "orderconfirmed",
                // enum: [
                //     "orderconfirmed",
                //     "shipped",
                //     "outofdelivery",
                //     "delivered",
                //     "reveived",
                //     "drycleaning",
                //     "done",
                //     "cancelled",
                // ],
            },
            date: Date,

        },
    ],
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    paymentIntent: {
        type: String,
        required: true,
        default: "upi",
        enum: [
            "cod",
            "upi",
        ],
    },
    // taxPrice: {
    //     type: Number,
    //     required: true,
    //     default: 0,
    // },
    // shippingPrice: {
    //     type: Number,
    //     required: true,
    //     default: 0,
    // },
    totalPrice: {
        type: Number,
        required: true,
        default: 0,
    },
    // deliveredAt: Date,

    createdAt: {
        type: Date,
        default: Date.now(),
    }, 
   
});

const Order = mongoose.model("Order", orderSchema);
export default Order;