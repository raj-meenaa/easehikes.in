import Coupon from "../models/coupon.model.js";

export const createCoupon = async (req, res) => {
	try {
		const { code, discountPercentage, expirationDate, userId } = req.body;

		// Check if the coupon code already exists
		const existingCoupon = await Coupon.findOne({ code });
		if (existingCoupon) {
			return res.status(400).json({ message: "Coupon code already exists." });
		}

		// Create the new coupon
		const coupon = new Coupon({
			code,
			discountPercentage,
			expirationDate,
			userId,
		});

		// Save the coupon to the database
		const savedCoupon = await coupon.save();

		res.status(201).json({
			message: "Coupon created successfully!",
			coupon: savedCoupon,
		});
	} catch (error) {
		console.log("Error in createCoupon controller", error.message);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

export const getCoupon = async (req, res) => {
	try {
		const coupon = await Coupon.findOne({ userId: req.user._id, isActive: true });
		res.json(coupon || null);
	} catch (error) {
		console.log("Error in getCoupon controller", error.message);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

export const validateCoupon = async (req, res) => {
	try {
		const { code } = req.body;
		const coupon = await Coupon.findOne({ code: code, userId: req.user._id, isActive: true });

		if (!coupon) {
			return res.status(404).json({ message: "Coupon not found" });
		}

		if (coupon.expirationDate < new Date()) {
			coupon.isActive = false;
			await coupon.save();
			return res.status(404).json({ message: "Coupon expired" });
		}

		res.json({
			message: "Coupon is valid",
			code: coupon.code,
			discountPercentage: coupon.discountPercentage,
		});
	} catch (error) {
		console.log("Error in validateCoupon controller", error.message);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};
