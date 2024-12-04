import User from "../models/user.model.js";
import bcrypt from "bcrypt";
import { generateTokenAndSetCookie } from "../lib/utils/generateToken.js";

export const signup = async (req, res) => {
  try {
    const { fullName, email, password, number } = req.body;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    const existingNumber = await User.findOne({ number });
    if (existingNumber) {
      return res.status(400).json({ error: "Already have an account by this Number" });
    }
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res
        .status(400)
        .json({ error: "Already have an account by this email" });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: "Password must be at least 8 characters long." });
    }
    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);
    const newUser = new User({
      fullName,
      email,
      number,
      password: hashPassword,
    });
    if (newUser) {
      const token=generateTokenAndSetCookie(newUser._id, res);
      await newUser.save();
      return res.status(201).json({
        _id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
        number: newUser.number,
        avatar: newUser.avatar,
        cart: newUser.cart,
        role: newUser.role,
        token,
      });
    } else {
      return res.status(400).json({ error: "Invalid user data." });
    }
  } catch (error) {
    console.log("error in controller signup", error.message);
    return res.status(500).json({ error: "Internal server error." });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ error: "User not found by this email" });
    }
    const isPasswordCorrect = await bcrypt.compare(password, user.password || "");
    if (!user || !isPasswordCorrect) {
      return res.status(400).json({ error: "Incorrect email or password" });
    }
    
    const token = generateTokenAndSetCookie(user._id, res); // Ensure this returns the token
    return res.status(201).json({
      _id: user._id,
      fullname: user.fullName,
      number: user.number,
      avatar: user.avatar,
      cart: user.cart,
      role: user.role,
      email: user.email,
      token,
    });
  } catch (error) {
    console.log("Error in login controller:", error.message);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const logout = async (req, res) => {
  try {
    res.cookie("jwt", "", { maxAge: 0 });
    res.status(200).json({ message: "Logged out successfully." });
  } catch (error) {
    console.log("error in logout controller", error.message);
    return res.status(500).json({ error: "Internal server error." });
  }
};

export const getMe = async (req, res) => {
	try {
		const user = await User.findById(req.user._id).select("-password");
		res.status(200).json(user);
	} catch (error) {
		console.log("Error in getMe controller", error.message);
		res.status(500).json({ error: "Internal Server Error" });
	}
};
