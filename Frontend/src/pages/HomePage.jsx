import { useEffect, useState } from "react";
import CategoryItem from "../components/CategoryItem";
import ShopItem from "../components/shopItem";
import { useProductStore } from "../stores/useProductStore";
import FeaturedProducts from "../components/FeaturedProducts";
import axios from "../lib/axios";

const HomePage = () => {
	const { fetchFeaturedProducts, products, isLoading } = useProductStore();
	const [categories, setCategories] = useState([]);
	const [stores, setStores] = useState([]);
	useEffect(() => {
    // Fetch categories and featured products
    const fetchCategories = async () => {
        try {
            const response = await axios.get(
                "/admin/categories",
            );

            setCategories(response.data.categories);
        } catch (error) {
            // Log detailed error information
            console.error("Error fetching categories:", error.message);
            if (error.response) {
                console.error("Response data:", error.response.data);
                console.error("Response status:", error.response.status);
                console.error("Response headers:", error.response.headers);
            } else if (error.request) {
                console.error("No response received:", error.request);
            } else {
                console.error("Error:", error.message);
            }
        }
    };
    // Fetch Stores and featured products
    const fetchStores = async () => {
        try {
            const response = await axios.get(
                "http://localhost:5001/api/admin/store",
            );

            setStores(response.data.stores); // Assuming stores are in the response
        } catch (error) {
            // Log detailed error information
            console.error("Error fetching Store:", error.message);
            if (error.response) {
                console.error("Response data:", error.response.data);
                console.error("Response status:", error.response.status);
                console.error("Response headers:", error.response.headers);
            } else if (error.request) {
                console.error("No response received:", error.request);
            } else {
                console.error("Error:", error.message);
            }
        }
    };
    // Fetch featured products after fetching categories
    const fetchAllData = async () => {
        await fetchCategories();
        await fetchStores();
        fetchFeaturedProducts(); // Assuming this doesn't rely on the categories
    };

    fetchAllData();
}, [fetchFeaturedProducts]);

	return (
		<div className='relative min-h-screen text-white overflow-hidden'>
			<div className='relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16'>
				<h1 className='text-center text-5xl sm:text-6xl font-bold text-emerald-400 mb-4'>
					Explore Our Categories
				</h1>
				<p className='text-center text-xl text-gray-300 mb-12'>
				Discover sustainable gear for your next outdoor escapade
				</p>

				<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
					{categories.map((category) => (
						<CategoryItem category={category} key={category.name} />
					))}
				</div>
			</div>
            <div className='relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16'>
				<h1 className='text-center text-5xl sm:text-6xl font-bold text-emerald-400 mb-4'>
					Explore Top Rentals
				</h1>
				<p className='text-center text-xl text-gray-300 mb-12'>
				Discover sustainable gear for your next outdoor escapade
				</p>

				<div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4'>
					{stores.map((store) => (
						<ShopItem store={store} key={store.shopname} />
					))}
				</div>

				{!isLoading && products.length > 0 && <FeaturedProducts featuredProducts={products} />}
			</div>
		</div>
	);
};
export default HomePage;
