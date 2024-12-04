import Product from "../../models/product.model.js";
export const blockDates = async (productId, startDate, endDate, orderId, qty) => {
    const product = await Product.findById(productId);
  
    if (!product) {
      throw new Error('Product not found');
    }
  
    if (!Array.isArray(product.bookedSlot)) {
      product.bookedSlot = [];
    }
  
    // Check for overlapping dates
    const overlappingDates = product.bookedSlot.filter(slot => 
      (new Date(startDate) <= slot.to && new Date(endDate) >= slot.from)
    );
  
    // Reduce available quantity based on existing bookings
    let availableQty = product.stock;
    overlappingDates.forEach(slot => {
      availableQty -= slot.qty;
    });
  
    if (availableQty < qty) {
      throw new Error('Insufficient quantity available for the selected dates');
    }
  
    product.bookedSlot.push({
      from: new Date(startDate),
      to: new Date(endDate),
      qty,
      orderId
    });
  
    await product.save();
  };