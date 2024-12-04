const OrderItem = ({ item }) => {
	return (
		<div className='rounded-lg border p-4 shadow-sm border-gray-700 bg-gray-800 md:p-6'>
			<div className='space-y-4 md:flex md:items-center md:justify-between md:gap-6 md:space-y-0'>
				{/* Product Image */}
				<div className='shrink-0 md:order-1'>
					<img className='h-20 md:h-32 rounded object-cover' src={item.product.image || "/bags.jpg"} alt={item.product.name} />
				</div>

				{/* Payment Details */}
				<div className='flex items-center justify-between md:order-3 md:justify-end'>
					<div className='text-end md:order-4 md:w-32'>
						<p className='text-base font-bold text-emerald-400'>₹{item.amountPaid}</p>
						<p className='text-sm text-gray-400'>Status: {item.status}</p>
					</div>
				</div>

				{/* Product and Order Details */}
				<div className='w-full min-w-0 flex-1 space-y-4 md:order-2 md:max-w-md'>
					<p className='text-base font-medium text-white hover:text-emerald-400 hover:underline'>
						{item.product.name}
					</p>
					<p className='text-sm text-gray-400'>{item.product.description}</p>
					
					{/* Rental Period */}
					<div className='flex items-center gap-4 text-sm text-gray-400'>
						<p>Start: {new Date(item.startDate).toLocaleDateString()}</p>
						<p>End: {new Date(item.endDate).toLocaleDateString()}</p>
					</div>
				</div>
			</div>
		</div>
	);
};

export default OrderItem;
