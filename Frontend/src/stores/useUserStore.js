import { create } from "zustand";
import axios from "../lib/axios";
import { toast } from "react-hot-toast";

export const useUserStore = create((set) => ({
	user: null,
	loading: false,
	checkingAuth: true,

	signup: async ({ fullName, email, number, password, confirmPassword }) => {
		set({ loading: true });
	
		if (password !== confirmPassword) {
			set({ loading: false });
			return toast.error("Passwords do not match");
		}
	
		try {
			// Sending signup request
			const res = await axios.post("/auth/signup", {
				fullName, // ensure matching field names with backend
				email,
				number,
				password,
			});
			
			// Storing the token in localStorage
			localStorage.setItem("token", res.data.token);
	
			// Setting the user data in the store
			set({ user: res.data, loading: false });
	
			// Success message
			toast.success("Signup successful!");
		} catch (error) {
			set({ loading: false });
			// Handle the response error from the server
			const errorMessage = error.response?.data?.message || "An error occurred during signup";
			toast.error(errorMessage);
		}
	},

	login: async (email, password) => {
		set({ loading: true });

		try {
			const res = await axios.post("/auth/login", { email, password });
			localStorage.setItem("token", res.data.token);
			set({ user: res.data, loading: false });
			toast.success("Login successful!");
		} catch (error) {
			set({ loading: false });
			toast.error(error.response.data.message || "An error occurred");
		}
	},

	logout: async () => {
		try {
			await axios.post("/auth/logout");
			set({ user: null });
			// toast.success("Logout successful!");
		} catch (error) {
			toast.error(error.response?.data?.message || "An error occurred during logout");
		}
	},
	
	checkAuth: async () => {
		set({ checkingAuth: true });
		try {
			const response = await axios.get("/auth/me");
			set({ user: response.data, checkingAuth: false });
		} catch (error) {
			console.log(error.message);
			set({ checkingAuth: false, user: null });
		}
	},
}));

// Axios interceptor for handling unauthorized errors
axios.interceptors.response.use(
	(response) => response,
	async (error) => {
		const originalRequest = error.config;
		if (error.response?.status === 401 && !originalRequest._retry) {
			originalRequest._retry = true;
			try {
				// If the user is unauthorized, log them out
				useUserStore.getState().logout();
				return Promise.reject(error);
			} catch (err) {
				return Promise.reject(err);
			}
		}
		return Promise.reject(error);
	}
);
