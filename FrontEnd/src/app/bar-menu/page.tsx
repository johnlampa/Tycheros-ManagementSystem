"use client";
import React, { useEffect, useState } from "react";
import { useCartContext } from "../../../lib/context/CartContext";

import MenuCard from "@/components/ui/MenuCard";
import QuantityModal from "@/components/QuantityModal";

import { CategoriesDataTypes } from "../../../lib/types/CategoriesDataTypes";
import { Order } from "../../../lib/types/OrderDataTypes";
import { ProductDataTypes } from "../../../lib/types/ProductDataTypes";
import Link from "next/link";
import MenuHeaderSection from "@/components/section/MenuHeaderSection";

const categories: CategoriesDataTypes[] = [
  {
    categoryID: 7,
    categoryName: "Milk Tea",
  },
  {
    categoryID: 8,
    categoryName: "Beer",
  },
  {
    categoryID: 9,
    categoryName: "Coffee",
  },
  {
    categoryID: 10,
    categoryName: "Whiskey",
  },
  {
    categoryID: 11,
    categoryName: "Frappe",
  },
  {
    categoryID: 12,
    categoryName: "Tea",
  },
];

export default function Page() {
  const [menuData, setMenuData] = useState<ProductDataTypes[]>([]);

  useEffect(() => {
    fetch("http://localhost:8081/ordering/getCustomerMenu")
      .then((response) => response.json())
      .then((data) => setMenuData(data))
      .catch((error) => console.error("Error fetching menu data:", error));
  }, []);

  const [productToAdd, setProductToAdd] = useState<ProductDataTypes>({
    productID: 1,
    productName: "Matcha",
    categoryName: "Milk Tea",
    categoryID: 7,
    sellingPrice: 90.0,
    imageUrl: "/assets/images/MilkTea.jpg",
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
      <div className="w-[362px] min-h-screen border border-black mx-auto relative bg-white text-black">
        <div className="z-50 w-[360px]">
          <MenuHeaderSection
            menuType="bar"
            categories={categories}
          ></MenuHeaderSection>
        </div>
        <div className="p-6">
          {categories.map((category) => (
            <div
              key={category.categoryName}
              id={category.categoryName}
              className="mb-8 text-black"
            >
              <p className="font-pattaya text-2xl mb-3">
                {category.categoryName}
              </p>
              <div className="grid grid-cols-2 gap-x-6 gap-y-3 content-center">
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
