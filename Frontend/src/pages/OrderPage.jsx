import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useProductStore } from "../stores/useProductStore";
import { motion } from "framer-motion";
import { ShoppingCart } from "lucide-react";
import OrderItem from "../components/OrderItem";

const OrderPage = () => {
	const { fetchAllOrders, orders = [] } = useProductStore();

	useEffect(() => {
		fetchAllOrders(); // Fetch orders when component mounts
	}, [fetchAllOrders]); // No need for 'orders' in the dependency array

	return (
		<div className='py-8 md:py-16'>
			<div className='mx-auto max-w-screen-xl px-4 2xl:px-0'>
				<div className='mt-6 sm:mt-8 md:gap-6 lg:flex lg:items-start xl:gap-8'>
					<motion.div
						className='mx-auto w-full flex-none lg:max-w-2xl xl:max-w-4xl'
						initial={{ opacity: 0, x: -20 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ duration: 0.5, delay: 0.2 }}
					>
						{orders.length === 0 ? (
							<EmptyCartUI />
						) : (
							<div className='space-y-6'>
								{orders.map((item) => (
									<OrderItem key={item._id} item={item} />
								))}
							</div>
						)}
					</motion.div>
					{orders.length > 0 && (
						<motion.div
							className='mx-auto mt-6 max-w-4xl flex-1 space-y-6 lg:mt-0 lg:w-full'
							initial={{ opacity: 0, x: 20 }}
							animate={{ opacity: 1, x: 0 }}
							transition={{ duration: 0.5, delay: 0.4 }}
						></motion.div>
					)}
				</div>
			</div>
		</div>
	);
};

export default OrderPage;

const EmptyCartUI = () => (
	<motion.div
		className='flex flex-col items-center justify-center space-y-4 py-16'
		initial={{ opacity: 0, y: 20 }}
		animate={{ opacity: 1, y: 0 }}
		transition={{ duration: 0.5 }}
	>
		<ShoppingCart className='h-24 w-24 text-gray-300' />
		<p className='text-gray-400'>Looks like you {"haven't"} ordered anything yet.</p>
		<Link
			className='mt-4 rounded-md bg-emerald-500 px-6 py-2 text-white transition-colors hover:bg-emerald-600'
			to='/'
		>
			Start Shopping
		</Link>
	</motion.div>
);
