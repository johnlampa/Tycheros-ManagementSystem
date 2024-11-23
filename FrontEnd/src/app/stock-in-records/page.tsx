"use client";

import React, { useEffect, useState } from "react";
import Header from "@/components/Header";
import StockInRecordCard from "@/components/ui/StockInRecordCard";
import { GiHamburgerMenu } from "react-icons/gi";
import FlowBiteSideBar from "@/components/FlowBiteSideBar";

export type StockIn = {
  purchaseOrderID: number;
  stockInDateTime: string;
  employeeFirstName: string;
  employeeLastName: string;
  supplierName: string;
  purchaseOrderItems: {
    purchaseOrderItemName: string;
    pricePerPOUoM: number;
    unitOfMeasurement: string;
    expiryDate: string;
    quantityOrdered: number;
  }[];
};

export default function InventoryManagementPage() {
  const [stockInData, setStockInData] = useState<StockIn[]>([]);
  const [sideBarVisibility, setSideBarVisibility] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12; // Adjust this as needed

  // Fetch data
  useEffect(() => {
    fetch("http://localhost:8081/inventoryManagement/getStockInRecords")
      .then((response) => response.json())
      .then((data) => setStockInData(data))
      .catch((error) => console.error("Error fetching menu data:", error));
  }, []);

  // Calculate the data for the current page
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = stockInData.slice(startIndex, endIndex);

  // Calculate total pages
  const totalPages = Math.ceil(stockInData.length / itemsPerPage);

  // Handle page navigation
  const goToPreviousPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  return (
    <div className="flex justify-center items-center w-full min-h-screen">
      <div className="w-full flex flex-col items-center bg-white min-h-screen shadow-md pb-7">
        <Header text="Stock In Records" color={"tealGreen"} type={"orders"}>
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

        <div className="flex justify-center items-center md:mt-6 lg:mt-12">
          {stockInData.length === 0 ? (
            <p className="text-sm text-black">No data found</p>
          ) : (
            <div>
              <div className="md:grid md:grid-cols-2 xl:grid-cols-3 md:gap-9 md:mt-5">
                {currentData.map((item, index) => (
                  <div key={index} className="mt-8 md:mt-0">
                    <StockInRecordCard stockInData={item}></StockInRecordCard>
                  </div>
                ))}
              </div>

              {/* Pagination Controls */}
              <div className="flex justify-center items-center mt-6 space-x-4">
                <button
                  onClick={goToPreviousPage}
                  disabled={currentPage === 1}
                  className={`px-4 py-2 text-sm w-[65px] ${
                    currentPage === 1 ? "text-white" : "underline"
                  }`}
                >
                  Back
                </button>
                <span className="text-sm">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={goToNextPage}
                  disabled={currentPage === totalPages}
                  className={`px-4 py-2 text-sm w-[65px] ${
                    currentPage === totalPages ? "text-white" : "underline"
                  }`}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
