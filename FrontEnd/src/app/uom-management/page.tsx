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

  //@adgramirez add a useEffect to populate this array with ALL the UOM Categories
  const [UOMCategory, setUOMCategory] = useState<UOMCategory[]>([
    {
      categoryID: 1,
      categoryName: "Weight",
      status: 1,
    },
    {
      categoryID: 2,
      categoryName: "Pieces",
      status: 1,
    },
  ]);

  //@adgramirez add a useEffect to populate this array with ALL the UOM
  const [UOM, setUOM] = useState<UOM[]>([
    {
      UOMID: 1,
      categoryID: 1,
      UOMName: "g",
      ratio: 1.0,
      status: 1,
    },
    {
      UOMID: 2,
      categoryID: 1,
      UOMName: "kg",
      ratio: 1000,
      status: 1,
    },
    {
      UOMID: 3,
      categoryID: 2,
      UOMName: "pc/s",
      ratio: 1,
      status: 1,
    },
  ]);

  const [expandedRow, setExpandedRow] = useState<number | null>(null); // Track the expanded row
  const [detailedData, setDetailedData] = useState<{ [key: number]: any }>({}); // Store details for each categoryID

  const toggleRow = async (categoryID: number) => {
    if (expandedRow === categoryID) {
      // Collapse the currently expanded row
      setExpandedRow(null);
    } else {
      // Expand the selected row and fetch details if not already fetched
      if (!detailedData[categoryID]) {
        // Filter UOM array based on categoryID
        const UOMUnderCategoryID = UOM.filter(
          (uom) => uom.categoryID === categoryID
        );

        console.log("Filtered UOMs: ", UOMUnderCategoryID);

        // You can now store or use UOMUnderCategoryID as needed
        // For example, updating detailedData
        setDetailedData((prev) => ({
          ...prev,
          [categoryID]: UOMUnderCategoryID,
        }));
      }
      setExpandedRow(categoryID); // Set the clicked row as the expanded one
    }
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
                  setEditUOMCategoryModalIsVisible={
                    setEditUOMCategoryModalIsVisible
                  }
                  setCategoryToEdit={setCategoryToEdit}
                  setAddUOMModalIsVisible={setAddUOMModalIsVisible}
                  setEditUOMModalIsVisible={setEditUOMModalIsVisible}
                  setUOMToEdit={setUOMToEdit}
                />
              </div>
            ))}
          </div>
        )}

        <AddUOMCategoryModal
          addUOMCategoryModalIsVisible={addUOMCategoryModalIsVisible}
          setAddUOMCategoryModalVisibility={setAddUOMCategoryModalIsVisible}
          modalTitle="Add UOM Category"
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
        ></AddUOMModal>
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
