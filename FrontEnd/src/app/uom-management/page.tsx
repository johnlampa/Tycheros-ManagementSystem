"use client";

import React, { useEffect, useState } from "react";
import Header from "@/components/Header";
import { FaArrowLeft } from "react-icons/fa";
import Link from "next/link";
import AddUOMCategoryModal from "@/components/AddUOMCategoryModal";
import { UOM, UOMCategory } from "../../../lib/types/UOMDataTypes";
import UOMManagementCard from "@/components/ui/UOMManagementCard";
import axios from "axios";
import EditUOMCategoryModal from "@/components/EditUOMCategoryModal";
import { CategoriesDataTypes } from "../../../lib/types/CategoriesDataTypes";
import AddUOMModal from "@/components/AddUOMModal";
import EditUOMModal from "@/components/EditUOMModal";

export default function Page() {
  const [addUOMCategoryModalIsVisible, setAddUOMCategoryModalIsVisible] =
    useState<boolean>(false);

  const [editUOMCategoryModalIsVisible, setEditUOMCategoryModalIsVisible] =
    useState<boolean>(false);
  const [categoryToEdit, setCategoryToEdit] = useState<
    UOMCategory | undefined
  >();

  const [addUOMModalIsVisible, setAddUOMModalIsVisible] =
    useState<boolean>(false);

  const [editUOMModalIsVisible, setEditUOMModalIsVisible] =
    useState<boolean>(false);
  const [UOMToEdit, setUOMToEdit] = useState<UOM | undefined>();

  const [UOMCategory, setUOMCategory] = useState<UOMCategory[]>([]);
  const [UOM, setUOM] = useState<UOM[]>([]);

  useEffect(() => {
    axios
      .get("http://localhost:8081/inventoryManagement/getCategoriesBySystem/UoM")
      .then((response) => {
        setUOMCategory(response.data);
      })
      .catch((error) => {
        console.error("Error fetching UOM categories:", error);
      });

      // Fetch UOMs with categories
    axios
      .get("http://localhost:8081/inventoryManagement/getUoMsWithCategories")
      .then((response) => {
        setUOM(response.data);
      })
      .catch((error) => {
        console.error("Error fetching UOMs with categories:", error);
    });
  }, []);

  const groupUOMsByCategory = () => {
    const grouped: { [key: number]: UOM[] } = {};
    UOM.forEach((uom) => {
      if (!grouped[uom.categoryID]) {
        grouped[uom.categoryID] = [];
      }
      grouped[uom.categoryID].push(uom);
    });
    return grouped;
  };
  
  const groupedUOMs = groupUOMsByCategory();  

  const [expandedRow, setExpandedRow] = useState<number | null>(null); // Track the expanded row
  const [detailedData, setDetailedData] = useState<{ [key: number]: any }>({}); // Store details for each categoryID

  const toggleRow = (categoryID: number) => {
    if (expandedRow === categoryID) {
      // Collapse the currently expanded row
      setExpandedRow(null);
    } else {
      // Expand the selected row
      setExpandedRow(categoryID);
      setDetailedData((prev) => ({
        ...prev,
        [categoryID]: groupedUOMs[categoryID] || [],
      }));
    }
  };

  const [selectedCategoryID, setSelectedCategoryID] = useState<number | null>(null);
  const handleAddUOMModal = (isVisible: boolean, categoryID: number) => {
    setAddUOMModalIsVisible(isVisible); // Pass boolean here
    setSelectedCategoryID(categoryID); // Set the categoryID
  };
    
  return (
    <div className="flex justify-center items-center w-full min-h-screen">
      <div className="w-full flex flex-col items-center bg-white min-h-screen shadow-md pb-7">
        <Header text="Units of Measurement" color={"tealGreen"} type={"orders"}>
          <Link href={"/inventory-management"} className="z-10">
            <button className="border border-white rounded-full h-[40px] w-[40px] bg-white text-white shadow-lg flex items-center justify-center overflow-hidden hover:bg-tealGreen group">
              <FaArrowLeft className="text-tealGreen group-hover:text-white transition-colors duration-300" />
            </button>
          </Link>
        </Header>

        <button
          onClick={() => setAddUOMCategoryModalIsVisible(true)}
          className="bg-tealGreen text-white py-2 px-3 text-sm font-semibold rounded w-[360px] mt-4"
        >
          Add Category
        </button>

        {UOMCategory.length === 0 ? (
          <p className="text-sm text-black">No UOM Categories found</p>
        ) : (
          <div className="md:grid md:grid-cols-2 xl:grid-cols-3 md:gap-9 md:mt-5">
            {UOMCategory.map((category) => (
              <div key={category.categoryID} className="mt-8 md:mt-0">
                <UOMManagementCard
                  category={category}
                  UOM={UOM}
                  toggleRow={toggleRow}
                  expandedRow={expandedRow}
                  setExpandedRow={setExpandedRow}
                  detailedData={detailedData}
                  setDetailedData={setDetailedData}
                  setEditUOMCategoryModalIsVisible={setEditUOMCategoryModalIsVisible}
                  setCategoryToEdit={setCategoryToEdit}
                  setAddUOMModalIsVisible={(isVisible) =>
                    handleAddUOMModal(!!isVisible, category.categoryID) // Ensure `isVisible` is a boolean
                  }
                  setEditUOMModalIsVisible={setEditUOMModalIsVisible}
                  setUOMToEdit={setUOMToEdit}
                />;
              </div>
            ))}
          </div>
        )}

        <AddUOMCategoryModal
          addUOMCategoryModalIsVisible={addUOMCategoryModalIsVisible}
          setAddUOMCategoryModalVisibility={setAddUOMCategoryModalIsVisible}
          modalTitle="Add UOM Category"
          systemName="UoM"
        ></AddUOMCategoryModal>
        <EditUOMCategoryModal
          editUOMCategoryModalIsVisible={editUOMCategoryModalIsVisible}
          setEditUOMCategoryModalVisibility={setEditUOMCategoryModalIsVisible}
          modalTitle="Edit UOM Category"
          categoryToEdit={categoryToEdit}
          UOM={UOM}
        ></EditUOMCategoryModal>

        <AddUOMModal
          addUOMModalIsVisible={addUOMModalIsVisible}
          setAddUOMModalVisibility={setAddUOMModalIsVisible}
          modalTitle="Add UOM"
          categoryID={selectedCategoryID || 0} // Pass the selected categoryID
        />
        <EditUOMModal
          editUOMModalIsVisible={editUOMModalIsVisible}
          setEditUOMModalVisibility={setEditUOMModalIsVisible}
          modalTitle="Edit UOM"
          UOMToEdit={UOMToEdit}
        ></EditUOMModal>
      </div>
    </div>
  );
}
