"use client";
import React, { useEffect, useState } from "react";

import MenuCard from "@/components/ui/MenuCard";
import QuantityModal from "@/components/QuantityModal";

import { CategoriesDataTypes } from "../../../lib/types/CategoriesDataTypes";
import { ProductDataTypes } from "../../../lib/types/ProductDataTypes";
import Link from "next/link";
import MenuHeaderSection from "@/components/section/MenuHeaderSection";
import Image from "next/image";

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
    fetch("http://localhost:8081/ordering/getCategoriesBySystem/Bar")
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

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("previousPage", "/bar-menu");
    }
  }, []);

  return (
    <>
      <div className="w-full min-h-screen mx-auto relative bg-white text-black">
        {/* Parent container has relative positioning */}
        <div className="z-50">
          <MenuHeaderSection
            menuType="bar"
            categories={categories}
          ></MenuHeaderSection>
        </div>

        <div className="p-6 flex flex-col justify-center items-center">
          {categories
            .filter((category) => category.status === 1) // Only include active categories
            .map((category) => {
              // Get menu items for this category
              const categoryMenuItems = menuData.filter(
                (item) => item.categoryName === category.categoryName
              );

              // Only render the category if it has menu items
              if (categoryMenuItems.length === 0) {
                return null; // Skip this category
              }

              return (
                <div
                  key={category.categoryName}
                  id={category.categoryName}
                  className="mb-8"
                >
                  <p className="font-pattaya text-2xl mb-3 align-left">
                    {category.categoryName}
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 sm:gap-12 content-center duration-150">
                    {categoryMenuItems.map((item, index) => (
                      <div key={index}>
                        <MenuCard
                          product={item}
                          setProductToAdd={setProductToAdd}
                          quantityModalIsVisible={quantityModalVisibility}
                          setQuantityModalVisibility={
                            setQuantityModalVisibility
                          }
                        />
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
        </div>

        {/* Check Order Button with a smaller circle containing a larger image */}
        <Link
          href={{
            pathname: "/order-summary",
          }}
        >
          <Link href={{ pathname: "/order-summary" }}>
            <div className="fixed bottom-4 right-5 w-min h-min flex flex-col items-center">
              <div className="mt-[3px] flex justify-center items-center">
                <span className="w-[200px] uppercase text-lg py-2 px-5 text-center font-semibold bg-cream border-2 border-white rounded-full text-primaryBrown">
                  Check Order
                </span>
              </div>
            </div>
          </Link>
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
