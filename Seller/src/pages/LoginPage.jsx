import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const LoginPage = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [isPending, setIsPending] = useState(false);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsPending(true);
    setIsError(false);

    try {
      const response = await axios.post(
        "http://localhost:5001/api/seller/login",
        {
          email: formData.email,
          password: formData.password,
        }
      );

      if (response.status === 201) {
        // Redirect to a protected route
        localStorage.setItem("token", response.data.token);
        navigate("/");
        window.location.reload();
      } else {
        throw new Error("Login failed");
      }
    } catch (err) {
      setError(err.response?.data?.error || "An error occurred during login");
      setIsError(true);
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="flex h-screen items-center justify-center relative z-10 w-full">
      {/* Form container */}
      <div className="bg-gray-800 bg-opacity-90 p-12 rounded-lg shadow-lg max-w-md">
        <form className="flex gap-4 flex-col" onSubmit={handleSubmit}>
          <h1 className="text-4xl font-extrabold text-white text-center mb-4">{"Let's"} go.</h1>
          
          {/* Email input */}
          <label className="input input-bordered rounded flex items-center gap-2">
            <input
              type="email"
              className="grow text-gray-900 p-2 rounded"
              placeholder="Email"
              name="email"
              id="email"
              onChange={handleInputChange}
              value={formData.email}
              required
              autoComplete="email"
            />
          </label>

          {/* Password input */}
          <label className="input input-bordered rounded flex items-center gap-2">
            <input
              type="password"
              className="grow text-gray-900 p-2 rounded"
              placeholder="Password"
              name="password"
              id="password"
              onChange={handleInputChange}
              value={formData.password}
              required
              autoComplete="current-password"
            />
          </label>

          {/* Submit button */}
          <button
            className="btn rounded-full btn-primary text-white bg-neutral-900 hover:bg-neutral-800 py-2 transition-all"
            disabled={isPending}
          >
            {isPending ? "Loading..." : "Login"}
          </button>

          {/* Error message */}
          {isError && <p className="text-red-500 text-center">{error}</p>}
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
