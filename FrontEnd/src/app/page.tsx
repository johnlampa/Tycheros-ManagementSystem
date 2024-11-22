import React from "react";
import Header from "@/components/Header";
import Link from "next/link";
import { GiHamburgerMenu } from "react-icons/gi";
import { FaHamburger } from "react-icons/fa";
import { RiDrinks2Fill } from "react-icons/ri";
import Image from "next/image";

export default function Home() {
  return (
    <>
      <div className="w-full flex justify-center items-center min-h-screen">
        <div className="flex flex-col items-center w-full min-h-screen relative bg-white">
          <div className="fixed z-50 w-full">
            <Header
              text="Tycheros World Cafe"
              color={"tealGreen"}
              type={"home"}
            >
              <Link
                href={{
                  pathname: "/login",
                }}
              >
                <div className="underline font-semibold">Login</div>
              </Link>
            </Header>
          </div>

          {/* Image or Background Section */}
          <div
            className="hidden md:block relative lg:h-screen w-full lg:mb-0 xsm:overflow-hidden lg:bg-cover lg:bg-center lg:bg-no-repeat"
            style={{
              backgroundImage: "url('/assets/images/TycherosHeader.jpg')",
            }}
          >
            {/* Gradient Blur Overlay for Large Screens Only */}
            <div
              className="hidden lg:block absolute inset-0 pointer-events-none"
              style={{
                backdropFilter: "blur(16px)",
                maskImage:
                  "linear-gradient(to left, rgba(0, 0, 0, 1), rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0))",
                WebkitMaskImage:
                  "linear-gradient(to left, rgba(0, 0, 0, 1), rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0))",
              }}
            ></div>

            {/* Overlay container for buttons only on large screens */}
            <div className="hidden lg:flex lg:flex-col lg:justify-center lg:items-end mr-32 lg:space-y-6 lg:absolute lg:inset-0">
              <Link href="/food-menu">
                <div className="w-[250px] h-[120px] text-[25px] font-bold rounded-3xl text-white bg-tealGreen border-4 border-cream flex justify-center items-center mb-[15px]">
                  <FaHamburger style={{ fontSize: "5vh", color: "white" }} />
                  <div className="ml-5">Food Menu</div>
                </div>
              </Link>
              <Link href="/bar-menu">
                <div className="w-[250px] h-[120px] text-[25px] font-bold rounded-3xl text-white bg-tealGreen border-4 border-cream flex justify-center items-center">
                  <RiDrinks2Fill style={{ fontSize: "6vh", color: "white" }} />
                  <div className="ml-4">Bar Menu</div>
                </div>
              </Link>
            </div>
          </div>

          {/* Only show <img> on small screens */}
          <div className="block lg:hidden rounded-full overflow-hidden mt-[91px]">
            <Image
              src="/assets/images/TycherosHeader.jpg"
              alt="Tycheros Header"
              className="h-full w-full object-cover lg:hidden"
              width={2048}
              height={1536}
            />
          </div>

          {/* Buttons for small and medium screens (outside of the background image div) */}
          <div className="flex flex-col sm:mt-10 sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-8 md:space-x-16 mt-4 lg:hidden">
            <Link href="/food-menu">
              <div className="w-[250px] h-[120px] text-[25px] font-bold rounded-3xl text-white bg-tealGreen border-4 border-cream flex justify-center items-center">
                <FaHamburger style={{ fontSize: "5vh", color: "white" }} />
                <div className="ml-5">Food Menu</div>
              </div>
            </Link>
            <Link href="/bar-menu">
              <div className="w-[250px] h-[120px] text-[25px] font-bold rounded-3xl text-white bg-tealGreen border-4 border-cream flex justify-center items-center">
                <RiDrinks2Fill style={{ fontSize: "6vh", color: "white" }} />
                <div className="ml-4">Bar Menu</div>
              </div>
            </Link>
          </div>

          {/* Check Order Button */}
          <Link href={{ pathname: "/order-summary" }}>
            <div className="fixed bottom-4 right-5 w-min h-min flex flex-col items-center">
              <div className="mt-[3px] flex justify-center items-center">
                <span className="w-[200px] uppercase text-lg py-2 px-5 text-center font-semibold bg-cream border-2 border-white rounded-full text-primaryBrown">
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
