import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  // product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  // qty: { type: Number, required: true },
  product:[
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
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  amountPaid: { type: Number, required: true },
  rentAmount: { type: Number, required: true },
  securityAmount: { type: Number, required: true },
  totalAmount: { type: Number, required: true },
  status: { type: String, enum: ['Pending', 'Partially Paid', 'Paid', 'Delivered', 'Completed'], default: 'Pending' },
  adminApproval: { type: Boolean, default: false },
  sellerApproval: { type: Boolean, default: false },
  isProductDamaged: { type: Boolean, default: false },
  damageFee: { type: Number, default: 0 },
  customerName: { type: String, required: true },
  customerEmail: { type: String, required: true },
  customerMobile: { type: String, required: true },

},{ timestamps: true });

const Booking = mongoose.model('Booking', bookingSchema);
export default Booking;
