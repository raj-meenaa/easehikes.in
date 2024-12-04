import { Link } from "react-router-dom";

const ShopItem = ({ store }) => {
	return (
		<div className='flex flex-col items-center'>
			<Link to={"product/shop/" + store.shopname} className='w-full'>
				<div className='relative overflow-hidden h-40 w-40  rounded-full group mx-auto'>
					<div className='w-full h-full cursor-pointer'>
						<img
							src={store.logo || "/bags.jpg"}
							alt={store.shopname}
							className='w-full h-full object-cover rounded-full transition-transform duration-500 ease-out group-hover:scale-110'
							loading='lazy'
						/>
					</div>
				</div>
			</Link>
			{/* Category name displayed below the image, centered */}
			<h3 className='text-white text-2xl font-bold mt-4 text-center'>
				{store.shopname.charAt(0).toUpperCase() + store.shopname.slice(1)}
			</h3>
		</div>
	);
};

export default ShopItem;
