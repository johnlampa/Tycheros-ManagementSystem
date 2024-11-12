"use client";
import React, { useState } from "react";
import Link from "next/link";
import { FaArrowLeft } from "react-icons/fa";
import { useRouter } from "next/navigation";

export default function Login() {
  const [showOverlay, setShowOverlay] = useState(false);
  const [employeeID, setEmployeeID] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const router = useRouter();

  const handleLoginClick = () => {
    setShowOverlay(true);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(null);

    try {
      const response = await fetch("http://localhost:8081/login/login", {
        // Replace with backend URL in production
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ employeeID, password }),
      });

      if (!response.ok) {
        const errorData = await response.json(); // Parse error response (if JSON)
        setErrorMessage(errorData.message || "Login failed. Please try again.");
        return;
      }

      const data = await response.json(); // Parse successful response

      localStorage.setItem("loggedInEmployeeID", employeeID);

      router.push("/employee-home"); // Redirect to employee-home on success
    } catch (error) {
      setErrorMessage(
        "text-red An error occurred while logging in. Please try again."
      );
    }
  };

  return (
    <div className="w-full flex justify-center items-center min-h-screen">
      {/* Main Container */}
      <div className="flex flex-col items-center w-[360px] min-h-screen bg-white">
        {/* Header with Back Button */}
        <div className="w-full">
          <div className="w-full h-[90px] flex justify-center items-center bg-[#59988D] text-white">
            <Link href="/">
              <button className="left-4 relative border border-white rounded-full h-[40px] w-[40px] bg-white shadow-lg flex items-center justify-center overflow-hidden hover:bg-[#59988D] group">
                <FaArrowLeft className="text-[#59988D] group-hover:text-white transition-colors duration-300" />
              </button>
            </Link>
            <h1 className="text-3xl font-bold text-center flex-grow right-2">
              Admin Login
            </h1>
          </div>
        </div>

        {/* Initial Login Button */}
        {!showOverlay && (
          <div className="mt-10">
            <button
              onClick={handleLoginClick}
              className="text-white bg-tealGreen hover:bg-teal-700 font-bold py-3 px-8 rounded-full"
            >
              Login
            </button>
          </div>
        )}

        {/* Login Overlay */}
        {showOverlay && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
            <div className="bg-white p-8 rounded shadow-md w-[360px] relative">
              <button
                onClick={() => setShowOverlay(false)} // Close overlay when clicked
                className="absolute top-7 left-4 border border-white rounded-full h-[40px] w-[40px] bg-white shadow-lg flex items-center justify-center overflow-hidden hover:bg-tealGreen group"
              >
                <FaArrowLeft className="text-tealGreen group-hover:text-white transition-colors duration-300" />
              </button>

              <h2 className="text-2xl font-bold text-tealGreen mb-6 text-center">
                Admin Login
              </h2>
              <form onSubmit={handleSubmit}>
                <label
                  htmlFor="employeeID"
                  className="text-tealGreen block mb-2"
                >
                  Employee ID
                </label>
                <input
                  type="text"
                  name="employeeID"
                  value={employeeID}
                  onChange={(e) => setEmployeeID(e.target.value)}
                  className="w-full mb-4 p-2 border border-gray-300 rounded text-tealGreen"
                  required
                />
                <label htmlFor="password" className="text-tealGreen block mb-2">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full mb-4 p-2 border border-gray-300 rounded text-tealGreen"
                  required
                />

                {errorMessage && (
                  <p className="text-red-500 text-sm">{errorMessage}</p>
                )}

                <button
                  type="submit"
                  className="w-full py-2 mt-4 text-white bg-tealGreen rounded hover:bg-teal-700"
                >
                  LOGIN
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
