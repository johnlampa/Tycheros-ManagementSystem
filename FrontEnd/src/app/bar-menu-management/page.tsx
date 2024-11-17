"use client";
import React, { useState, useEffect } from "react";
import MenuManagementCard from "@/components/MenuManagementCard";
import { ProductDataTypes } from "../../../lib/types/ProductDataTypes";
import { InventoryDataTypes } from "../../../lib/types/InventoryDataTypes";
import { CategoriesDataTypes } from "../../../lib/types/CategoriesDataTypes";
import axios from "axios";
import Link from "next/link";
import { FaArrowLeft } from "react-icons/fa";
import Header from "@/components/Header";
import EditCategoryModal from "@/components/EditCategoryModal";
import AddCategoryModal from "@/components/AddCategoryModal";

import PriceRecordsModal from "@/components/PriceRecordsModal";

export default function Page() {
  const [MenuData, setMenuData] = useState<ProductDataTypes[]>([]);
  const [menuProductHolder, setMenuProductHolder] =
    useState<ProductDataTypes | null>(null);
  const [InventoryData, setInventoryData] = useState<InventoryDataTypes[]>([]);

  //@adgramirez - add useeffect to fetch categories and populate this categories array
  const [categories, setCategories] = useState<CategoriesDataTypes[]>([]);

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

    // Fetch Menu Data (you might need to implement this endpoint)
    axios
      .get("http://localhost:8081/menuManagement/getProduct")
      .then((response) => {
        setMenuData(response.data);
      })
      .catch((error) => {
        console.error("Error fetching menu data:", error);
      });

    // Fetch Categories for Bar
    axios 
      .get("http://localhost:8081/menuManagement/getCategoriesBySystem/Bar")
      .then((response) => {
        setCategories(response.data);
      })
      .catch((error) => {
        console.error("Error fetching categories for Food system:", error);
      });
  }, []);

  return (
    <>
      <div className="flex justify-center items-center w-full pb-7 min-h-screen">
        <div className="w-full flex flex-col items-center justify-center bg-white min-h-screen text-black">
          <Header text="Bar Menu" color={"tealGreen"} type={"orders"}>
            <Link href={"/menu-selection"} className="z-100">
              <button className="border border-white rounded-full h-[40px] w-[40px] bg-white text-white shadow-lg flex items-center justify-center overflow-hidden hover:bg-tealGreen group">
                <FaArrowLeft className="text-tealGreen group-hover:text-white transition-colors duration-300" />
              </button>
            </Link>
          </Header>

          <div className="mt-5">
            <div className="lg:grid lg:grid-cols-2 lg:gap-x-28 xl:gap-x-36 lg:gap-y-14 lg:mt-5">
              {categories.map((category, categoryIndex) => (
                <div key={categoryIndex} className="mt-5 lg:mt-0">
                  <p className="font-semibold text-lg mb-2">
                    {category.categoryName}
                  </p>
                  <div>
                    <MenuManagementCard
                      categoryName={category.categoryName}
                      menuData={MenuData}
                      setMenuData={setMenuData}
                      inventoryData={InventoryData}
                      setInventoryData={setInventoryData}
                      menuProductHolder={menuProductHolder}
                      setMenuProductHolder={setMenuProductHolder}
                      setProductIDForPriceRecords={setProductIDForPriceRecords}
                      setPriceRecordsModalIsVisible={
                        setPriceRecordsModalIsVisible
                      }
                    />
                  </div>
                </div>
              ))}
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
            systemName="Bar"
          />

          <PriceRecordsModal
            productID={productIDForPriceRecords}
            priceRecordsModalIsVisible={priceRecordsModalIsVisible}
            setPriceRecordsModalIsVisible={setPriceRecordsModalIsVisible}
          ></PriceRecordsModal>
        </div>
      </div>
    </>
  );
}
