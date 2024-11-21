"use client";
import React, { useEffect } from "react";
import Header from "@/components/Header";
import Link from "next/link";
import { FaArrowLeft } from "react-icons/fa"; // Import the FaArrowLeft icon
import { useRouter } from "next/navigation";

export default function MenuSelection() {
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const loggedInEmployeeID = localStorage.getItem("loggedInEmployeeID");
      if (!loggedInEmployeeID) {
        router.push("/login"); // Redirect to login page if not logged in
      }
    }
  }, [router]);

  return (
    <>
      <div className="w-full flex justify-center items-center min-h-screen">
        <div className="flex flex-col items-center w-full h-screen relative bg-white">
          {/* Header with the FaArrowLeft button included */}
          <Header text="Menu" color="tealGreen" type="orders">
            <Link href={"/employee-home"} className="absolute left-[29px] mb-1">
              <button className="border border-white rounded-full h-[40px] w-[40px] bg-white shadow-lg flex items-center justify-center overflow-hidden hover:bg-tealGreen group">
                <FaArrowLeft
                  style={{ fontSize: "24px" }}
                  className="text-tealGreen group-hover:text-white transition-colors duration-300"
                />
              </button>
            </Link>
          </Header>

          {/* Center content vertically */}
          <div className="flex flex-col justify-center flex-grow sm:gap-8">
            <Link href="/food-menu-management">
              <div className="w-[220px] h-[100px] text-[25px] font-bold rounded-3xl border border-2 bg-tealGreen flex justify-center items-center mb-[15px]">
                Food Menu
              </div>
            </Link>

            <Link href="/bar-menu-management">
              <div className="w-[220px] h-[100px] text-[25px] font-bold rounded-3xl border border-2 bg-tealGreen flex justify-center items-center mb-[15px]">
                Bar Menu
              </div>
            </Link>

            {/* Add more menu options here if needed */}
          </div>
        </div>
      </div>
    </>
  );
}
