"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { FaArrowLeft } from "react-icons/fa";
import { useRouter } from "next/navigation";

export default function Login() {
  const [employeeID, setEmployeeID] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const router = useRouter();

  // Redirect if the user is already logged in
  useEffect(() => {
    if (typeof window !== "undefined") {
      const loggedInEmployeeID = localStorage.getItem("loggedInEmployeeID");
      if (loggedInEmployeeID) {
        router.push("/order-management"); // Redirect to employee home if logged in
      }
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage(null);

    try {
      const response = await fetch("http://localhost:8081/login/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ employeeID, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setErrorMessage(errorData.message || "Login failed. Please try again.");
        return;
      }

      const data = await response.json();

      // Store logged in user data in localStorage
      localStorage.setItem("loggedInEmployeeID", employeeID);
      localStorage.setItem("designation", data.employee.designation);

      // Redirect to employee home page after successful login
      router.push("/order-management");
    } catch (error) {
      setErrorMessage("An error occurred while logging in. Please try again.");
    }
  };

  return (
    <div className="w-full flex justify-center items-center min-h-screen">
      {/* Main Container */}
      <div className="flex flex-col items-center w-full min-h-screen bg-white">
        {/* Header with Back Button */}
        <div className="w-full">
          <div className="w-full h-[90px] flex justify-center items-center bg-[#59988D] text-white">
            <Link href="/">
              <button className="left-4 relative border border-white rounded-full h-[40px] w-[40px] bg-white shadow-lg flex items-center justify-center overflow-hidden hover:bg-[#59988D] group">
                <FaArrowLeft className="text-[#59988D] group-hover:text-white transition-colors duration-300" />
              </button>
            </Link>
            <h1 className="text-3xl font-bold text-center flex-grow right-2">
              Administrator Login
            </h1>
          </div>
        </div>

        <div className="flex justify-center items-center mt-10">
          <div className="bg-white p-8 rounded w-[360px] relative">
            <form onSubmit={handleSubmit}>
              <label htmlFor="employeeID" className="text-tealGreen block mb-2">
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
      </div>
    </div>
  );
}
