"use client";

import React, { useState, useEffect } from "react";
import MenuManagementCard from "@/components/MenuManagementCard";
import { ProductDataTypes } from "../../../lib/types/ProductDataTypes";
import { InventoryDataTypes } from "../../../lib/types/InventoryDataTypes";
import { CategoriesDataTypes } from "../../../lib/types/CategoriesDataTypes";
import axios from "axios";
import { FaArrowLeft } from "react-icons/fa";
import Link from "next/link";
import Header from "@/components/Header";
import AddCategoryModal from "@/components/AddCategoryModal";
import EditCategoryModal from "@/components/EditCategoryModal";
import PriceRecordsModal from "@/components/PriceRecordsModal";
import { useRouter } from "next/navigation";
import { GiHamburgerMenu } from "react-icons/gi";
import FlowBiteSideBar from "@/components/FlowBiteSideBar";

export default function Page() {
  const [MenuData, setMenuData] = useState<ProductDataTypes[]>([]);
  const [menuProductHolder, setMenuProductHolder] =
    useState<ProductDataTypes | null>(null);
  const [InventoryData, setInventoryData] = useState<InventoryDataTypes[]>([]);

  const [categories, setCategories] = useState<CategoriesDataTypes[]>([]);

  const [sideBarVisibility, setSideBarVisibility] = useState(false);

  const [addCategoryModalIsVisible, setAddCategoryModalIsVisible] =
    useState(false);
  const [editCategoryModalIsVisible, setEditCategoryModalIsVisible] =
    useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState<
    CategoriesDataTypes | undefined
  >(undefined);

  const [priceRecordsModalIsVisible, setPriceRecordsModalIsVisible] =
    useState(false);

  const [productIDForPriceRecords, setProductIDForPriceRecords] = useState<
    number | undefined
  >(0);

  const router = useRouter(); // Initialize the router

  // Check if the user is logged in
  useEffect(() => {
    if (typeof window !== "undefined") {
      const loggedInEmployeeID = localStorage.getItem("loggedInEmployeeID");
      if (!loggedInEmployeeID) {
        router.push("/login"); // Redirect to login page if not logged in
      }
    }
  }, [router]);

  useEffect(() => {
    // Fetch Inventory Data
    axios
      .get("http://localhost:8081/menuManagement/getAllInventoryItems")
      .then((response) => {
        setInventoryData(response.data);
      })
      .catch((error) => {
        console.error("Error fetching inventory data:", error);
      });

    // Fetch Menu Data
    axios
      .get("http://localhost:8081/menuManagement/getProduct")
      .then((response) => {
        setMenuData(response.data);
      })
      .catch((error) => {
        console.error("Error fetching menu data:", error);
      });

    // Fetch Categories for Food
    axios
      .get("http://localhost:8081/menuManagement/getCategoriesBySystem/Food")
      .then((response) => {
        setCategories(response.data);
      })
      .catch((error) => {
        console.error("Error fetching categories for Food system:", error);
      });
  }, []);
  return (
    <div className="flex flex-col min-h-screen">
      <Header text="Food Menu" color={"tealGreen"} type={"orders"}>
        <button
          className="mr-3 flex items-center justify-center"
          onClick={() => {
            setSideBarVisibility(true);
          }}
        >
          <GiHamburgerMenu style={{ fontSize: "5vh", color: "white" }} />
        </button>
      </Header>
      {sideBarVisibility && (
        <FlowBiteSideBar
          setSideBarVisibility={setSideBarVisibility}
        ></FlowBiteSideBar>
      )}

      <div className="flex-grow flex flex-col items-center bg-white text-black">
        <button
          onClick={() => setAddCategoryModalIsVisible(true)}
          className="bg-tealGreen text-white py-2 px-3 text-sm font-semibold rounded w-[360px] mt-4"
        >
          Add Category
        </button>

        <div className="my-5">
          <div className="lg:grid lg:grid-cols-2 lg:gap-x-28 xl:gap-x-36 lg:gap-y-14 lg:mt-5">
            {categories.map((category, categoryIndex) => (
              <div key={categoryIndex} className="mt-5 lg:mt-0 w-[310px]">
                <div className="flex justify-between items-center mb-2 gap-x-4">
                  <div className="flex items-center gap-x-4">
                    <p className="font-semibold text-lg ">
                      {category.categoryName}
                    </p>
                    {category?.status === 1 ? (
                      <div className="py-1 px-2 rounded-md bg-tealGreen w-min text-xs text-white">
                        Active
                      </div>
                    ) : (
                      <div className="py-1 px-2 rounded-md bg-gray w-min text-xs text-white">
                        Inactive
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      setCategoryToEdit(category);
                      setEditCategoryModalIsVisible(true);
                    }}
                    className="text-black px-2 py-1 text-xs rounded-full border border-black"
                  >
                    Edit Category
                  </button>
                </div>

                <MenuManagementCard
                  categoryName={category.categoryName}
                  menuData={MenuData}
                  setMenuData={setMenuData}
                  inventoryData={InventoryData}
                  setInventoryData={setInventoryData}
                  menuProductHolder={menuProductHolder}
                  setMenuProductHolder={setMenuProductHolder}
                  setProductIDForPriceRecords={setProductIDForPriceRecords}
                  setPriceRecordsModalIsVisible={setPriceRecordsModalIsVisible}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      <EditCategoryModal
        editCategoryModalIsVisible={editCategoryModalIsVisible}
        setEditCategoryModalIsVisible={setEditCategoryModalIsVisible}
        modalTitle={"Edit Category"}
        categoryToEdit={categoryToEdit}
      />

      <AddCategoryModal
        addCategoryModalIsVisible={addCategoryModalIsVisible}
        setAddCategoryModalVisibility={setAddCategoryModalIsVisible}
        modalTitle="Add Category"
        systemName="Food"
      />

      <PriceRecordsModal
        productID={productIDForPriceRecords}
        priceRecordsModalIsVisible={priceRecordsModalIsVisible}
        setPriceRecordsModalIsVisible={setPriceRecordsModalIsVisible}
      />
    </div>
  );
}
