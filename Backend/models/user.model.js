import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, "Please Enter Your Full Name"],
    maxLength: [30, "Name cannot exceed 30 characters"],
  },
  email: {
    type: String,
    required: [true, "Please Enter Your Email"],
    unique: true,
  },
  number: {
    type: Number,
    required: [true, "Please Enter Your Phone Number"],
    // unique: true,
    validate: {
      validator: function (v) {
        return /\d{10}/.test(v);
      },
      message: (props) =>
        `${props.value} is not a valid 10-digit mobile number!`,
    },
  },
  password: {
    type: String,
    // required: [true, "Please Enter Your Password"],
    minLength: [8, "Password should be greater than 8 characters"],
    // select: false,
  },
  avatar: {
    type: String,
    default: "",
  },
  // googleId: {
  //   type: String,
  //   // required: true,
  // },
  role: {
    type: String,
    default: "user",
    enum: ["user", "admin", "seller", "delivery"],
  },
  cart: [
    {
      quantity: {
        type: Number,
        default: 1,
      },
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    },
  ],
  // trailCart: {
  //     type: Array,
  //     default: [],
  // },
  // is_Deleted: {
  //     type: Boolean,
  //     required: true,
  //     default: false
  // },
  // wishlist: { type: mongoose.Schema.Types.ObjectId, ref: "Wishlist" },
  // // address: [{ type: mongoose.Schema.Types.ObjectId, ref: "Address" }], //if update then new created
  // address: { type: mongoose.Schema.Types.ObjectId, ref: "Address" },
  // orderId: [{ type: mongoose.Schema.Types.ObjectId, ref: "Order" }],
  // pending_orders: [{ type: mongoose.Schema.Types.ObjectId, ref: "Order" }],
  // delivered_orders: [{ type: mongoose.Schema.Types.ObjectId, ref: "Order" }],
  // orderedProduct: [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
  sellerId: { type: mongoose.Schema.Types.ObjectId, ref: "Seller" },
  // // deliveryId: [{ type: mongoose.Schema.Types.ObjectId, ref: "Delivery" }],
  // similarProduct : [{ type: mongoose.Schema.Types.ObjectId, ref: "Product" }],
  // createdAt: {
  //     type: Date,
  //     default: Date.now,
  // },

  // is_Verified: {
  //     type: Boolean,
  //     required: true,
  //     default: false
  // },
  // resetPasswordToken: String,
  // resetPasswordExpire: Date,
});

// userSchema.pre("save", async function (next) {
//     if (!this.isModified("password")) {
//         next();
//     }

//     this.password = await bcrypt.hash(this.password, 10);
// });

// // JWT TOKEN
// userSchema.methods.getJWTToken = function () {
//     return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
//         expiresIn: Date.now() + process.env.JWT_EXPIRE * 24 * 60 * 60 * 1000,
//     });
// };

// // Compare Password

// userSchema.methods.comparePassword = async function (password) {
//     return await bcrypt.compare(password, this.password);
// };

// // Generating Password Reset Token
// userSchema.methods.getResetPasswordToken = function () {
//     // Generating Token
//     const resetToken = crypto.randomBytes(20).toString("hex");

//     // Hashing and adding resetPasswordToken to userSchema
//     this.resetPasswordToken = crypto
//         .createHash("sha256")
//         .update(resetToken)
//         .digest("hex");

//     this.resetPasswordExpire = Date.now() + 15 * 60 * 1000;

//     return resetToken;
// };
const User = mongoose.model("User", userSchema);
export default User;
