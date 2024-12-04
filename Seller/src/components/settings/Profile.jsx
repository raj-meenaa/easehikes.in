import { useEffect, useState } from "react";
import { User } from "lucide-react";
import SettingSection from "./SettingSection";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Fetch user details from the backend
  useEffect(() => {
    async function fetchUserData() {
      try {
        const token = localStorage.getItem("token");

        if (token) {
          const response = await axios.get(
            "http://localhost:5001/api/auth/me",
            {
              headers: {
                Authorization: `Bearer ${token}`, // Pass token in headers
              },
            }
          );

          setUserData(response.data); // Set the fetched user data
        } else {
          setUserData(null); // No token, set userData to null
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setIsLoading(false); // Loading completed
      }
    }

    fetchUserData();
  }, []);

  // Handle logout
  const handleLogout = async () => {
    try {
      // Call the backend logout endpoint
      await axios.get("http://localhost:5001/api/auth/logout");
    } catch (error) {
      console.error("Error logging out:", error);
    } finally {
      // Clear token from localStorage
      localStorage.removeItem("token");

      // Redirect to the login page regardless of the request's outcome
      navigate("/login", { replace: true });
      window.location.reload();
    }
  };

  if (isLoading) {
    return <p>Loading...</p>;
  }

  if (!userData) {
    return <p>No user data found.</p>;
  }

  return (
    <SettingSection icon={User} title={"Profile"}>
      <div className="flex flex-col sm:flex-row items-center mb-6">
        <img
          src={
            userData.profilePicture ||
            "https://randomuser.me/api/portraits/men/3.jpg"
          }
          alt="Profile"
          className="rounded-full w-20 h-20 object-cover mr-4"
        />

        <div>
          <h3 className="text-lg font-semibold text-gray-100">
            {userData.fullName || "Seller"}
          </h3>
          <p className="text-gray-400">{userData.email || "seller@gmail.com"}</p>
        </div>
      </div>

      <button
        className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition duration-200 w-full sm:w-auto"
        onClick={handleLogout}
      >
        Logout
      </button>
    </SettingSection>
  );
};

export default Profile;
