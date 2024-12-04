import { useEffect } from "react";
import { useProductStore } from "../stores/useProductStore";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import ProductCard from "../components/ProductCard";
import { MapPin } from "lucide-react";

const ShopPage = () => {
  
  const { store } = useParams();
  const { fetchProductsByStore, products } = useProductStore();

  useEffect(() => {
    if (store) {
      fetchProductsByStore(store);
    }
  }, [store, fetchProductsByStore]);
  const shopAddress = store || "Unknown address";
  const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(shopAddress)}`;
  return (
    <div className="min-h-screen">
      <div className="relative z-10 max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="relative w-full max-w-full bg-emerald-100 rounded-lg shadow-md p-6 mb-6">
          {/* Profile Picture */}
          {/* <ProfilePage /> */}
          <div className="absolute -top-16 left-6">
            <img
              src={store.logo || "/shoes.jpg"}
              alt={store.name}
              className="w-32 h-32 rounded-full border-4 border-emerald-400 shadow-md"
            />
          </div>
          
          <div className="ml-40 m-8">
            <motion.h1
              className="text-4xl sm:text-5xl font-bold text-emerald-400 "
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              {store.charAt(0).toUpperCase() + store.slice(1)}
            
            </motion.h1>
            <p className="text-gray-500">Explore {store}</p>
            <a
            href={mapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center text-blue-500 hover:underline"
          >
            <MapPin size={22} className="mr-2" />
          </a>
          </div>
        </div>

        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 justify-items-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          {products?.length === 0 && (
            <h2 className="text-3xl font-semibold text-gray-300 text-center col-span-full">
              No products found
            </h2>
          )}

          {products?.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </motion.div>
      </div>
    </div>
  );
};
export default ShopPage;

