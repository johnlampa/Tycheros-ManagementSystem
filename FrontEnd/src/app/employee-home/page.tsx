import React from "react";
import Header from "@/components/Header";
import Link from "next/link";
import { GiHamburgerMenu } from "react-icons/gi";

export default function EmployeeHome() {
  return (
    <>
      <div className="w-full flex justify-center items-center min-h-screen">
        <div className="flex flex-col items-center w-full h-screen relative bg-white">
          {/* Header with the GiHamburgerMenu included */}
          <Header text="Employee Home" color="tealGreen" type="home">
            <Link
              href={{
                pathname: "/",
              }}
            >
              <button className="mr-3 flex items-center justify-center">
                {/* Add the icon next to the header text */}
                <GiHamburgerMenu style={{ fontSize: "5vh", color: "white" }} />
              </button>
            </Link>
          </Header>

          {/* Center content vertically */}
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
              <Link href="/inventory-management">
                <div className="w-[220px] h-[100px] text-[25px] font-bold rounded-3xl border border-2 bg-tealGreen flex justify-center items-center mb-[15px]">
                  Inventory
                </div>
              </Link>

              <Link href="/employee-management">
                <div className="w-[220px] h-[100px] text-[25px] font-bold rounded-3xl border border-2 bg-tealGreen flex justify-center items-center mb-[15px]">
                  Employees
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
