import { motion } from "framer-motion";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { useState, useEffect } from "react";
import axios from "axios";

const COLORS = ["#6366F1", "#8B5CF6", "#EC4899", "#10B981", "#F59E0B"];

const CategoryDistributionChart = () => {
	const [categoryData, setCategoryData] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		const fetchCategories = async () => {
			const token = localStorage.getItem("token"); // Retrieve token from localStorage
			if (!token) {
				setError("User not authenticated. Please log in.");
				setLoading(false);
				return;
			}

			try {
				const response = await axios.get("http://localhost:5001/api/admin/categories", {
					headers: {
						Authorization: `Bearer ${token}`, // Pass the token in the Authorization header
					},
				});
				if (response.data.success) {
					// Map the backend data to the required format for the chart
					const formattedData = response.data.categories.map((category) => ({
						name: category.name,
						value: category.productCount,
					}));
					setCategoryData(formattedData);
				} else {
					setError("Failed to fetch categories.");
				}
			} catch (err) {
				console.error("Error fetching category data:", err);
				setError("Error fetching category data.");
			} finally {
				setLoading(false);
			}
		};

		fetchCategories();
	}, []);

	if (loading) return <p className='text-gray-400 text-center'>Loading...</p>;

	if (error) return <p className='text-red-500 text-center'>{error}</p>;

	return (
		<motion.div
			className='bg-gray-800 bg-opacity-50 backdrop-blur-md shadow-lg rounded-xl p-6 border border-gray-700'
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ delay: 0.3 }}
		>
			<h2 className='text-lg font-medium mb-4 text-gray-100'>Category Distribution</h2>
			<div className='h-80'>
				<ResponsiveContainer width={"100%"} height={"100%"}>
					{categoryData.length > 0 ? (
						<PieChart>
							<Pie
								data={categoryData}
								cx={"50%"}
								cy={"50%"}
								labelLine={false}
								outerRadius={80}
								fill='#8884d8'
								dataKey='value'
								label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
							>
								{categoryData.map((entry, index) => (
									<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
								))}
							</Pie>
							<Tooltip
								contentStyle={{
									backgroundColor: "rgba(31, 41, 55, 0.8)",
									borderColor: "#4B5563",
								}}
								itemStyle={{ color: "#E5E7EB" }}
							/>
							<Legend />
						</PieChart>
					) : (
						<p className='text-gray-400 text-center'>No category data available</p>
					)}
				</ResponsiveContainer>
			</div>
		</motion.div>
	);
};

export default CategoryDistributionChart;
