"use client";
import React, { useEffect, useState } from "react";

import MenuCard from "@/components/ui/MenuCard";
import QuantityModal from "@/components/QuantityModal";

import { CategoriesDataTypes } from "../../../lib/types/CategoriesDataTypes";
import { Order } from "../../../lib/types/OrderDataTypes";
import { ProductDataTypes } from "../../../lib/types/ProductDataTypes";
import Link from "next/link";
import MenuHeaderSection from "@/components/section/MenuHeaderSection";

export default function Page() {
  const [categories, setCategories] = useState<CategoriesDataTypes[]>([]);
  const [menuData, setMenuData] = useState<ProductDataTypes[]>([]);

  useEffect(() => {
    fetch("http://localhost:8081/ordering/getCustomerMenu")
      .then((response) => response.json())
      .then((data) => setMenuData(data))
      .catch((error) => console.error("Error fetching menu data:", error));
  }, []);

  useEffect(() => {
    fetch("http://localhost:8081/menuManagement/getCategoriesBySystem/Bar")
      .then((response) => response.json())
      .then((data) => setCategories(data))
      .catch((error) => console.error("Error fetching menu data:", error));
  }, []);

  const [loggedInEmployeeID, setLoggedInEmployeeID] = useState(1);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const loggedInEmployeeID = localStorage.getItem("loggedInEmployeeID");
      if (loggedInEmployeeID) {
        setLoggedInEmployeeID(parseInt(loggedInEmployeeID));
      }
    }
  }, [loggedInEmployeeID]);

  const [productToAdd, setProductToAdd] = useState<ProductDataTypes>({
    productID: 1,
    productName: "Matcha",
    categoryName: "Milk Tea",
    categoryID: 7,
    sellingPrice: 90.0,
    imageUrl: "/assets/images/MilkTea.jpg",
    status: 1,
    employeeID: loggedInEmployeeID,
  });

  const [quantityModalVisibility, setQuantityModalVisibility] = useState(false);

  // Set previous page in localStorage when the component mounts
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("previousPage", "/bar-menu");
    }
  }, []); // Runs only on component mount

  return (
    <>
      <div className="w-full min-h-screen border border-black mx-auto relative bg-white text-black">
        <div className="z-50">
          <MenuHeaderSection
            menuType="bar"
            categories={categories}
          ></MenuHeaderSection>
        </div>
        <div className="p-6 flex flex-col justify-center items-center">
          {categories.map((category) => (
            <div
              key={category.categoryName}
              id={category.categoryName}
              className="mb-8 text-black"
            >
              <p className="font-pattaya text-2xl mb-3 align-left">
                {category.categoryName}
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 sm:gap-12 content-center duration-150">
                {menuData
                  .filter((item) => item.categoryName === category.categoryName)
                  .map((item, index) => (
                    <div key={index}>
                      <MenuCard
                        product={item}
                        setProductToAdd={setProductToAdd}
                        quantityModalIsVisible={quantityModalVisibility}
                        setQuantityModalVisibility={setQuantityModalVisibility}
                      />
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
        <Link
          href={{
            pathname: "/order-summary",
          }}
        >
          <div className="sticky bottom-4 right-0 mr-5 ml-auto w-min h-min flex flex-col items-center">
            <button className="border border-black rounded-full h-[62px] w-[62px] bg-blue-500 text-white shadow-lg hover:bg-blue-600 flex items-center justify-center overflow-hidden">
              <img
                src="/assets/images/CheckOrder.png" // Replace with your image path
                alt="Check Order"
                className="h-full w-full object-cover"
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
      <div className="w-[312px] p-4">
        <QuantityModal
          productToAdd={productToAdd}
          quantityModalIsVisible={quantityModalVisibility}
          setQuantityModalVisibility={setQuantityModalVisibility}
        ></QuantityModal>
      </div>
    </>
  );
}
