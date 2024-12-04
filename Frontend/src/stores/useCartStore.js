import { create } from "zustand";
import axios from "../lib/axios";
import { toast } from "react-hot-toast";
export const useCartStore = create((set, get) => ({
	cart: [],
	coupon: null,
	total: 0,
	subtotal: 0,
	securuty:0,
	isCouponApplied: false,
	dayDifference: 1,
	getMyCoupon: async () => {
		try {
			const response = await axios.get("/coupons");
			set({ coupon: response.data });
		} catch (error) {
			console.error("Error fetching coupon:", error);
		}
	},
	applyCoupon: async (code) => {
		try {
			const response = await axios.post("/coupons/validate", { code });
			set({ coupon: response.data, isCouponApplied: true });
			get().calculateTotals();
			toast.success("Coupon applied successfully");
		} catch (error) {
			toast.error(error.response?.data?.message || "Failed to apply coupon");
		}
	},
	removeCoupon: () => {
		set({ coupon: null, isCouponApplied: false });
		get().calculateTotals();
		toast.success("Coupon removed");
	},

	getCartItems: async () => {
		try {
			const res = await axios.get("/cart");
			set({ cart: res.data });
			get().calculateTotals();
		} catch (error) {
			set({ cart: [] });
			toast.error(error.response.data.message || "An error occurred");
		}
	},
	clearCart: async () => {
		set({ cart: [], coupon: null, total: 0, subtotal: 0 });
	},
	addToCart: async (product) => {
		try {
			await axios.post("/cart", { productId: product._id });
			toast.success("Product added to cart");

			set((prevState) => {
				const existingItem = prevState.cart.find((item) => item._id === product._id);
				const newCart = existingItem
					? prevState.cart.map((item) =>
							item._id === product._id ? { ...item, quantity: item.quantity + 1 } : item
					  )
					: [...prevState.cart, { ...product, quantity: 1 }];
				return { cart: newCart };
			});
			get().calculateTotals();
		} catch (error) {
			toast.error(error.response.data.message || "An error occurred");
		}
	},
	removeFromCart: async (productId) => {
		await axios.delete(`/cart`, { data: { productId } });
		set((prevState) => ({ cart: prevState.cart.filter((item) => item._id !== productId) }));
		get().calculateTotals();
	},
	updateQuantity: async (productId, quantity) => {
		if (quantity === 0) {
			get().removeFromCart(productId);
			return;
		}

		await axios.put(`/cart/${productId}`, { quantity });
		set((prevState) => ({
			cart: prevState.cart.map((item) => (item._id === productId ? { ...item, quantity } : item)),
		}));
		get().calculateTotals();
	},

	setDayDifference: (startDate, endDate) => {
        const dayDifference = Math.max(1, (endDate - startDate) / (1000 * 60 * 60 * 24));
        set({ dayDifference });
        get().calculateTotals();
    },

	calculateTotals: () => {
		const { cart, coupon, dayDifference } = get();
		// const subtotal = cart.reduce((sum, item) => sum+item.securityDeposit +item.rent * item.quantity, 0);
		const subtotal = cart.reduce((sum, item) => sum+item.rent * item.quantity*dayDifference, 0);
		const totalsecurity= cart.reduce((sum, item) => sum+item.securityDeposit, 0);
		let total = subtotal+totalsecurity;
		let security=totalsecurity;
		if (coupon) {
			const discount = subtotal * (coupon.discountPercentage / 100);
			total = subtotal+totalsecurity - discount;
		}

		set({ subtotal, total, security });
	},
}));
