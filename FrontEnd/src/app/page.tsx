import React from "react";
import Header from "@/components/Header";
import Link from "next/link";
import { GiHamburgerMenu } from "react-icons/gi";

import Image from "next/image";

export default function Home() {
  return (
    <>
      <div className="w-full flex justify-center items-center min-h-screen">
        <div className="flex flex-col items-center w-full min-h-screen relative bg-white">
          <Header text="Tycheros World Cafe" color={"tealGreen"} type={"home"}>
            <Link
              href={{
                pathname: "/login",
              }}
            >
              <div className="underline font-semibold">Login</div>
            </Link>
          </Header>

          {/* Image or Background Section */}
          <div
            className="xsm:h-[222px] sm:h-[282px] md:h-[395px] lg:h-screen w-full bg-black xsm:rounded-full md:rounded-none xsm:mt-[20px] md:mt-0 xsm:mb-[30px] lg:mb-0 xsm:overflow-hidden lg:bg-cover lg:bg-center lg:bg-no-repeat"
            style={{
              backgroundImage: "url('/assets/images/TycherosHeader.jpg')",
            }}
          >
            {/* Only show <img> on small screens */}
            <Image
              src="/assets/images/TycherosHeader.jpg"
              alt="Tycheros Header"
              className="h-full w-full object-cover lg:hidden"
              width={2048}
              height={1536}
            />

            {/* Overlay container for buttons only on large screens */}
            <div className="hidden lg:flex lg:flex-col lg:justify-center lg:items-end mr-32 lg:space-y-6 lg:absolute lg:inset-0">
              <Link href="/food-menu">
                <div className="w-[220px] h-[100px] text-[25px] font-bold rounded-3xl text-white bg-tealGreen flex justify-center items-center mb-[15px]">
                  Food Menu
                </div>
              </Link>
              <Link href="/bar-menu">
                <div className="w-[220px] h-[100px] text-[25px] font-bold rounded-3xl text-white bg-tealGreen flex justify-center items-center">
                  Bar Menu
                </div>
              </Link>
            </div>
          </div>

          {/* Buttons for small and medium screens (outside of the background image div) */}
          <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-8 md:space-x-16 mt-4 lg:hidden">
            <Link href="/food-menu">
              <div className="w-[220px] h-[100px] text-[25px] font-bold rounded-3xl text-white bg-tealGreen flex justify-center items-center mb-[15px] sm:mb-0">
                Food Menu
              </div>
            </Link>
            <Link href="/bar-menu">
              <div className="w-[220px] h-[100px] text-[25px] font-bold rounded-3xl text-white bg-tealGreen flex justify-center items-center">
                Bar Menu
              </div>
            </Link>
          </div>

          {/* Check Order Button */}
          <Link href={{ pathname: "/order-summary" }}>
            <div className="fixed bottom-4 right-5 w-min h-min flex flex-col items-center">
              <button className="border border-black rounded-full h-[62px] w-[62px] bg-blue-500 shadow-lg hover:bg-blue-600 flex items-center justify-center overflow-hidden">
                <Image
                  src="/assets/images/CheckOrder.png" // Replace with your image path
                  alt="Check Order"
                  className="h-full w-full object-cover"
                  width={3600}
                  height={3534}
                />
              </button>
              <div className="mt-[3px] flex justify-center items-center">
                <span className="text-[10px] text-center font-semibold bg-lightTealGreen border w-[70px] rounded border text-black">
                  Check Order
                </span>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </>
  );
}
