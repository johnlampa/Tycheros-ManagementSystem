"use client";
import React, { useEffect, useState } from "react";
import Header from "@/components/Header";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { GiHamburgerMenu } from "react-icons/gi";

export default function EmployeeHome() {
  const [designation, setDesignation] = useState("");
  const router = useRouter();

  useEffect(() => {
    const loggedInEmployeeID = localStorage.getItem("loggedInEmployeeID");
    const loggedInDesignation = localStorage.getItem("designation");

    if (!loggedInEmployeeID) {
      router.push("/login"); // Redirect to login if not logged in
      return;
    }

    setDesignation(loggedInDesignation || "");
  }, [router]);

  const handleLogout = async () => {
    try {
      const response = await fetch("http://localhost:8081/login/logout", {
        method: "POST",
        credentials: "include", // Ensure cookies are sent
      });
  
      if (response.ok) {
        alert("Logout successful");
        localStorage.removeItem("loggedInEmployeeID");
        localStorage.removeItem("designation");
        window.location.href = "/login"; // Redirect to the login page
      } else {
        const errorData = await response.json();
        alert(`Logout failed: ${errorData.message}`);
      }
    } catch (error) {
      console.error("Error during logout:", error);
      alert("Logout failed. Please try again later.");
    }
  };
  
  return (
    <div className="w-full flex justify-center items-center min-h-screen">
      <div className="flex flex-col items-center w-full h-screen relative bg-white">
        {/* Header */}
        <Header text="Employee Home" color="tealGreen" type="home">
          <Link href="/">
            <button className="mr-3 flex items-center justify-center">
              <GiHamburgerMenu style={{ fontSize: "5vh", color: "white" }} />
            </button>
          </Link>
        </Header>

        {/* Main Content */}
<div className="flex flex-col justify-center flex-grow md:gap-7">
  <div className="md:flex gap-7">
    <Link href="/order-management">
      <div className="w-[220px] h-[100px] text-[25px] font-bold rounded-3xl border border-2 bg-tealGreen flex justify-center items-center mb-[15px]">
        Orders
      </div>
    </Link>

    <Link href="/menu-selection">
      <div className="w-[220px] h-[100px] text-[25px] font-bold rounded-3xl border border-2 bg-tealGreen flex justify-center items-center mb-[15px]">
        Menu
      </div>
    </Link>
  </div>

  <div className="md:flex gap-7">
    {designation !== "Cashier" && designation !== "Kitchen Staff" && (
      <Link href="/inventory-management">
        <div className="w-[220px] h-[100px] text-[25px] font-bold rounded-3xl border border-2 bg-tealGreen flex justify-center items-center mb-[15px]">
          Inventory
        </div>
      </Link>
    )}

    {designation === "Owner" || designation === "Manager" ? (
      <Link href="/employee-management">
        <div className="w-[220px] h-[100px] text-[25px] font-bold rounded-3xl border border-2 bg-tealGreen flex justify-center items-center mb-[15px]">
          Employees
        </div>
      </Link>
    ) : null}
  </div>

  {/* Logout Button */}
  <div className="flex justify-center mt-10">
    <button
      onClick={handleLogout}
      className="w-[220px] h-[50px] text-[18px] font-bold rounded-3xl border border-2 bg-red-500 text-tealGreen"
    >
      Logout
    </button>
  </div>
</div>
</div>
</div>
  );
}
